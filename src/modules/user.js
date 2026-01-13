// 유저 관련 함수들

import { getRandomWeapon } from './weapons.js';

/**
 * 유저 정보 가져오기 (없으면 생성)
 * @param {string} userId - 유저 ID
 * @param {string} username - 유저 이름
 * @param {object} env - 환경 변수 (game_db 포함)
 * @returns {Promise<object>} 유저 정보
 */
export async function getUserOrCreate(userId, username, env) {
  let user = await env.game_db.prepare(
    "SELECT level, money, wins, last_daily, weapon_name FROM users WHERE id = ?"
  ).bind(userId).first();
  
  if (!user) {
    const newWeapon = await getRandomWeapon(env);
    if (newWeapon) {
      await env.game_db.prepare("INSERT INTO users (id, username, weapon_name) VALUES (?, ?, ?)")
        .bind(userId, username, newWeapon.name).run();
      user = { level: 0, money: 200000, wins: 0, last_daily: null, weapon_name: newWeapon.name };
    } else {
      // 무기 조회 실패 시 기본값
      await env.game_db.prepare("INSERT INTO users (id, username, weapon_name) VALUES (?, ?, ?)")
        .bind(userId, username, '나무 검').run();
      user = { level: 0, money: 200000, wins: 0, last_daily: null, weapon_name: '나무 검' };
    }
  }
  
  // 무기 이름이 없으면 랜덤 생성
  if (!user.weapon_name) {
    const newWeapon = await getRandomWeapon(env);
    if (newWeapon) {
      await env.game_db.prepare("UPDATE users SET weapon_name = ? WHERE id = ?")
        .bind(newWeapon.name, userId).run();
      user.weapon_name = newWeapon.name;
    } else {
      await env.game_db.prepare("UPDATE users SET weapon_name = ? WHERE id = ?")
        .bind('나무 검', userId).run();
      user.weapon_name = '나무 검';
    }
  }
  
  return user;
}

/**
 * 파괴 확률 계산 (강화 단계별 구간 관리)
 * @param {number} level - 강화 레벨
 * @returns {number} 파괴 확률 (%)
 */
export function getDestroyRate(level) {
  if (level <= 5) {
    // 0~5강: 0~6% (5강일 때 6%)
    return (level / 5) * 6;
  } else if (level <= 10) {
    // 6~10강: 7~13% (10강일 때 13%)
    return 7 + ((level - 5) / 5) * 6;
  } else if (level <= 15) {
    // 11~15강: 14~21% (15강일 때 21%)
    return 14 + ((level - 10) / 5) * 7;
  } else if (level <= 20) {
    // 16~20강: 22~28% (20강일 때 28%)
    return 22 + ((level - 15) / 5) * 6;
  } else {
    // 21강 이상: 28% (최대)
    return 28;
  }
}
