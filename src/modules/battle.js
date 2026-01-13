// 전투 관련 함수들

import { getRandomWeapon } from './weapons.js';

/**
 * 몬스터 레벨 생성 (플레이어 레벨 기준으로 랜덤 생성)
 * @param {number} playerLevel - 플레이어 레벨
 * @returns {number} 몬스터 레벨
 */
export function generateMonsterLevel(playerLevel) {
  // 플레이어 레벨의 -5 ~ +10 범위로 몬스터 레벨 생성
  const minLevel = Math.max(0, playerLevel - 5);
  const maxLevel = playerLevel + 10;
  return Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;
}

/**
 * 전투력 계산 (강화 수치에 비례하여 더 정확하게)
 * @param {number} level - 강화 레벨
 * @returns {number} 전투력
 */
export function calculatePower(level) {
  // 기본 전투력 = level * 15 + 40 (강화 수치에 비례하지만 과도하지 않게)
  const basePower = level * 15 + 40;
  // 랜덤 변동 = ±20% (적당한 변동성 유지)
  const variance = basePower * 0.2;
  const minPower = Math.floor(basePower - variance);
  const maxPower = Math.floor(basePower + variance);
  return Math.floor(Math.random() * (maxPower - minPower + 1)) + minPower;
}

/**
 * 격차에 따른 골드 보상 계산
 * @param {number} playerLevel - 플레이어 레벨
 * @param {number} monsterLevel - 몬스터 레벨
 * @returns {number} 보상 금액
 */
export function calculateReward(playerLevel, monsterLevel) {
  const levelDiff = monsterLevel - playerLevel; // 격차 (양수면 몬스터가 더 강함)
  
  // 기본 보상
  let baseReward = 5000;
  
  // 격차에 따른 보상 조정
  if (levelDiff > 0) {
    // 몬스터가 더 강할 때: 격차만큼 보너스 (격차 * 200원)
    baseReward = 1000 + (levelDiff * 200);
  } else if (levelDiff < 0) {
    // 몬스터가 더 약할 때: 격차만큼 감소 (격차 * 100원, 최소 200원)
    baseReward = Math.max(200, 1000 + (levelDiff * 100));
  }
  // levelDiff === 0이면 기본 보상 1000원 유지
  
  return baseReward;
}

/**
 * 전투력 차이에 따른 무기 손상/파괴 처리
 * @param {string} userId - 유저 ID
 * @param {number} myPower - 내 전투력
 * @param {number} opponentPower - 상대 전투력
 * @param {string} currentWeaponName - 현재 무기 이름
 * @param {number} currentLevel - 현재 강화 레벨
 * @param {object} env - 환경 변수 (game_db 포함)
 * @returns {Promise<object>} 손상/파괴 결과
 */
export async function handleWeaponDamage(userId, myPower, opponentPower, currentWeaponName, currentLevel, env) {
  // 전투력 차이 계산 (상대가 얼마나 강한지)
  const powerDiff = opponentPower - myPower;
  
  // 전투력 차이가 음수면 (내가 더 강함) 손상 없음 - 패배 시에만 호출되므로 이 경우는 거의 없음
  if (powerDiff < 0) {
    return { damaged: false, destroyed: false, message: '', updatedWeaponName: currentWeaponName, updatedLevel: currentLevel };
  }
  
  // 내 전투력을 기준으로 차이 비율 계산 (더 정확함)
  const powerDiffPercent = myPower > 0 ? (powerDiff / myPower) * 100 : 100;
  
  // 전투력 차이에 따른 확률 계산 (패배 시 항상 손상/파괴 가능성 존재)
  let damageChance = 0;
  let destroyChance = 0;
  
  if (powerDiffPercent <= 30) {
    // 차이가 작음 (30% 이내): 낮은 확률로 손상/파괴 (패배했으니 손상 가능)
    damageChance = 0.15;
    destroyChance = 0.03;
  } else if (powerDiffPercent <= 80) {
    // 차이가 보통 (30-80%): 중간 확률로 손상, 낮은 확률로 파괴
    damageChance = 0.25;
    destroyChance = 0.05;
  } else if (powerDiffPercent <= 150) {
    // 차이가 큼 (80-150%): 높은 확률로 손상, 중간 확률로 파괴
    damageChance = 0.4;
    destroyChance = 0.12;
  } else {
    // 차이가 매우 큼 (150% 이상): 매우 높은 확률로 손상, 높은 확률로 파괴
    damageChance = 0.6;
    destroyChance = 0.25;
  }
  
  // 무기 파괴 확인 (파괴가 우선)
  if (Math.random() < destroyChance) {
    // 기본 무기로 변경
    const newWeapon = await getRandomWeapon(env);
    if (newWeapon) {
      await env.game_db.prepare("UPDATE users SET weapon_name = ?, level = 0 WHERE id = ?")
        .bind(newWeapon.name, userId).run();
      return { 
        damaged: false, 
        destroyed: true, 
        message: `\n\n💥 **무기 파괴!**\n${newWeapon.name}으로 교체되었습니다.`,
        updatedWeaponName: newWeapon.name,
        updatedLevel: 0
      };
    }
  }
  
  // 무기 손상 확인
  if (Math.random() < damageChance) {
    if (currentLevel > 0) {
      const newLevel = currentLevel - 1;
      await env.game_db.prepare("UPDATE users SET level = ? WHERE id = ?")
        .bind(newLevel, userId).run();
      return { 
        damaged: true, 
        destroyed: false, 
        message: `\n\n⚙️ **무기 손상!**\n${currentWeaponName} +${currentLevel}강 → +${newLevel}강`,
        updatedWeaponName: currentWeaponName,
        updatedLevel: newLevel
      };
    }
  }
  
  return { damaged: false, destroyed: false, message: '', updatedWeaponName: currentWeaponName, updatedLevel: currentLevel };
}
