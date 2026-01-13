// 배틀 버튼 핸들러

import { InteractionResponseType } from 'discord-interactions';
import { jsonResponse } from '../utils/responses.js';
import { calculatePower, generateMonsterLevel, calculateReward, handleWeaponDamage } from '../modules/battle.js';
import { getRandomWeapon } from '../modules/weapons.js';
import { getUserOrCreate } from '../modules/user.js';

export async function handleBattleButton(interaction, env) {
  const userId = interaction.member?.user?.id || interaction.user?.id;
  const username = interaction.member?.user?.username || interaction.user?.username;
  const customId = interaction.data.custom_id;
  
  // 유저 정보 가져오기
  let user = await env.game_db.prepare("SELECT level, money, weapon_name FROM users WHERE id = ?").bind(userId).first();
  if (!user) {
    user = await getUserOrCreate(userId, username, env);
  }
  
  // 특정 유저와 배틀 (battle_user_{userId})
  if (customId && customId.startsWith('battle_user_')) {
    const targetUserId = customId.replace('battle_user_', '');
    
    // 자기 자신과는 배틀 불가
    if (String(targetUserId) === String(userId)) {
      return jsonResponse({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: '❌ 자기 자신과는 배틀할 수 없습니다! 상대방만 "다시 전투" 버튼을 사용할 수 있습니다.', flags: 64 }
      });
    }
    
    const targetUser = await env.game_db.prepare("SELECT id, username, level, weapon_name FROM users WHERE id = ?").bind(targetUserId).first();
    
    if (!targetUser) {
      return jsonResponse({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: '❌ 상대방이 게임에서 탈퇴했습니다.', flags: 64 }
      });
    }
    
    const opponentPower = calculatePower(targetUser.level || 0);
    const myPower = calculatePower(user.level);
    
    if (myPower > opponentPower) {
      const reward = 2000;
      await env.game_db.prepare("UPDATE users SET money = money + ?, wins = wins + 1 WHERE id = ?").bind(reward, userId).run();
      
      const opponentWeaponDamage = await handleWeaponDamage(targetUser.id, opponentPower, myPower, targetUser.weapon_name || '나무 검', targetUser.level || 0, env);
      
      return jsonResponse({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { 
          content: `⚔️ **${username}님의 승리!**\n\n**${username}** (${user.weapon_name} +${user.level}강): ${myPower} 전투력\n**${targetUser.username}** (${targetUser.weapon_name || '무기 없음'} +${targetUser.level || 0}강): ${opponentPower} 전투력\n\n💰 2,000원을 획득했습니다!${opponentWeaponDamage.message ? `\n\n🎯 **상대방 피해:**${opponentWeaponDamage.message.replace('\n\n', '\n')}` : ''}`,
          components: [{
            type: 1,
            components: [
              { type: 2, style: 3, label: '⚔️ 다시 전투', custom_id: `battle_user_${targetUserId}` },
              { type: 2, style: 1, label: '✨ 강화', custom_id: 'enhance_button' }
            ]
          }]
        }
      });
    } else {
      const penalty = 500;
      const finalMoney = Math.max(0, user.money - penalty);
      await env.game_db.prepare("UPDATE users SET money = ? WHERE id = ?").bind(finalMoney, userId).run();
      
      const weaponDamage = await handleWeaponDamage(userId, myPower, opponentPower, user.weapon_name, user.level, env);
      
      return jsonResponse({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { 
          content: `💀 **${username}님의 패배...**\n\n**${username}** (${user.weapon_name} +${user.level}강): ${myPower} 전투력\n**${targetUser.username}** (${targetUser.weapon_name || '무기 없음'} +${targetUser.level || 0}강): ${opponentPower} 전투력\n\n💸 ${penalty}원을 잃었습니다.${weaponDamage.message}${weaponDamage.destroyed || weaponDamage.damaged ? `\n\n현재 무기: ${weaponDamage.updatedWeaponName} +${weaponDamage.updatedLevel}강` : ''}`,
          components: [{
            type: 1,
            components: [
              { type: 2, style: 3, label: '⚔️ 다시 전투', custom_id: `battle_user_${targetUserId}` },
              { type: 2, style: 1, label: '✨ 강화', custom_id: 'enhance_button' }
            ]
          }]
        }
      });
    }
  }
  
  // 랜덤 배틀 (battle_button)
  // 배틀 로직 실행 (기존 배틀 명령어와 동일)
  const isVsUser = Math.random() < 0.5;
  
  if (isVsUser) {
    // 다른 유저와 배틀
    const opponent = await env.game_db.prepare("SELECT id, username, level, weapon_name FROM users WHERE id != ? ORDER BY RANDOM() LIMIT 1").bind(userId).first();
    
    if (!opponent) {
      // 다른 유저가 없으면 몬스터와 배틀
      const monsterLevel = generateMonsterLevel(user.level);
      const monsterPower = Math.floor(Math.random() * (monsterLevel * 5 + 50));
      const myPower = calculatePower(user.level);
      
      if (myPower > monsterPower) {
        const reward = calculateReward(user.level, monsterLevel);
        await env.game_db.prepare("UPDATE users SET money = money + ?, wins = wins + 1 WHERE id = ?").bind(reward, userId).run();
        const levelDiff = monsterLevel - user.level;
        const diffText = levelDiff > 0 ? `(+${levelDiff}강)` : levelDiff < 0 ? `(${levelDiff}강)` : '(동일)';
        return jsonResponse({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { 
            content: `⚔️ **승리!**\n**${username}** (${user.weapon_name} +${user.level}강): ${myPower} 전투력\n**몬스터** (레벨 ${monsterLevel} ${diffText}): ${monsterPower} 전투력\n\n💰 ${reward.toLocaleString()}원을 획득했습니다!`,
            components: [{
              type: 1,
              components: [
                { type: 2, style: 3, label: '⚔️ 다시 전투', custom_id: 'battle_button' },
                { type: 2, style: 1, label: '✨ 강화', custom_id: 'enhance_button' }
              ]
            }]
          }
        });
      } else {
        const levelDiff = monsterLevel - user.level;
        const diffText = levelDiff > 0 ? `(+${levelDiff}강)` : levelDiff < 0 ? `(${levelDiff}강)` : '(동일)';
        
        // 무기 손상/파괴 처리
        const weaponDamage = await handleWeaponDamage(userId, myPower, monsterPower, user.weapon_name, user.level, env);
        
        return jsonResponse({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { 
            content: `💀 **패배...**\n**${username}** (${user.weapon_name} +${user.level}강): ${myPower} 전투력\n**몬스터** (레벨 ${monsterLevel} ${diffText}): ${monsterPower} 전투력\n\n도망쳤습니다.${weaponDamage.message}${weaponDamage.destroyed || weaponDamage.damaged ? `\n\n현재 무기: ${weaponDamage.updatedWeaponName} +${weaponDamage.updatedLevel}강` : ''}`,
            components: [{
              type: 1,
              components: [
                { type: 2, style: 3, label: '⚔️ 다시 전투', custom_id: 'battle_button' },
                { type: 2, style: 1, label: '✨ 강화', custom_id: 'enhance_button' }
              ]
            }]
          }
        });
      }
    }
    
    // opponent는 이미 랜덤으로 선택됨
    const opponentPower = calculatePower(opponent.level || 0);
    const myPower = calculatePower(user.level);
    
    if (myPower > opponentPower) {
      const reward = 2000;
      await env.game_db.prepare("UPDATE users SET money = money + ?, wins = wins + 1 WHERE id = ?").bind(reward, userId).run();
      
      // 승리 시 상대방 무기 손상/파괴 처리 (전투력 차이에 따라)
      const opponentWeaponDamage = await handleWeaponDamage(opponent.id, opponentPower, myPower, opponent.weapon_name || '나무 검', opponent.level || 0, env);
      
      return jsonResponse({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { 
          content: `⚔️ **${username}님의 승리!**\n\n**${username}** (${user.weapon_name} +${user.level}강): ${myPower} 전투력\n**${opponent.username}** (${opponent.weapon_name || '무기 없음'} +${opponent.level || 0}강): ${opponentPower} 전투력\n\n💰 2,000원을 획득했습니다!${opponentWeaponDamage.message ? `\n\n🎯 **상대방 피해:**${opponentWeaponDamage.message.replace('\n\n', '\n')}` : ''}`,
          components: [{
            type: 1,
            components: [
              { type: 2, style: 3, label: '⚔️ 다시 전투', custom_id: 'battle_button' },
              { type: 2, style: 1, label: '✨ 강화', custom_id: 'enhance_button' }
            ]
          }]
        }
      });
    } else {
      const penalty = 500;
      const finalMoney = Math.max(0, user.money - penalty);
      await env.game_db.prepare("UPDATE users SET money = ? WHERE id = ?").bind(finalMoney, userId).run();
      
      // 무기 손상/파괴 처리
      const weaponDamage = await handleWeaponDamage(userId, myPower, opponentPower, user.weapon_name, user.level, env);
      
      return jsonResponse({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { 
          content: `💀 **${username}님의 패배...**\n\n**${username}** (${user.weapon_name} +${user.level}강): ${myPower} 전투력\n**${opponent.username}** (${opponent.weapon_name || '무기 없음'} +${opponent.level || 0}강): ${opponentPower} 전투력\n\n💸 ${penalty}원을 잃었습니다.${weaponDamage.message}${weaponDamage.destroyed || weaponDamage.damaged ? `\n\n현재 무기: ${weaponDamage.updatedWeaponName} +${weaponDamage.updatedLevel}강` : ''}`,
          components: [{
            type: 1,
            components: [
              { type: 2, style: 3, label: '⚔️ 다시 전투', custom_id: 'battle_button' },
              { type: 2, style: 1, label: '✨ 강화', custom_id: 'enhance_button' }
            ]
          }]
        }
      });
    }
  } else {
    // 몬스터와 배틀
    const monsterLevel = generateMonsterLevel(user.level);
    const monsterPower = Math.floor(Math.random() * (monsterLevel * 5 + 50));
    const myPower = calculatePower(user.level);
    
    if (myPower > monsterPower) {
      const reward = calculateReward(user.level, monsterLevel);
      await env.game_db.prepare("UPDATE users SET money = money + ?, wins = wins + 1 WHERE id = ?").bind(reward, userId).run();
      const levelDiff = monsterLevel - user.level;
      const diffText = levelDiff > 0 ? `(+${levelDiff}강)` : levelDiff < 0 ? `(${levelDiff}강)` : '(동일)';
      return jsonResponse({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { 
          content: `⚔️ **${username}님의 승리!**\n\n**${username}** (${user.weapon_name} +${user.level}강): ${myPower} 전투력\n**몬스터** (레벨 ${monsterLevel} ${diffText}): ${monsterPower} 전투력\n\n💰 ${reward.toLocaleString()}원을 획득했습니다!`,
          components: [{
            type: 1,
            components: [
              { type: 2, style: 3, label: '⚔️ 다시 전투', custom_id: 'battle_button' },
              { type: 2, style: 1, label: '✨ 강화', custom_id: 'enhance_button' }
            ]
          }]
        }
      });
    } else {
      const levelDiff = monsterLevel - user.level;
      const diffText = levelDiff > 0 ? `(+${levelDiff}강)` : levelDiff < 0 ? `(${levelDiff}강)` : '(동일)';
      
      // 무기 손상/파괴 처리 (최적화: user 정보 전달하여 중복 쿼리 제거)
      const weaponDamage = await handleWeaponDamage(userId, myPower, monsterPower, user.weapon_name, user.level, env);
      
      return jsonResponse({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { 
          content: `💀 **${username}님의 패배...**\n\n**${username}** (${user.weapon_name} +${user.level}강): ${myPower} 전투력\n**몬스터** (레벨 ${monsterLevel} ${diffText}): ${monsterPower} 전투력\n\n도망쳤습니다.${weaponDamage.message}${weaponDamage.destroyed || weaponDamage.damaged ? `\n\n현재 무기: ${weaponDamage.updatedWeaponName} +${weaponDamage.updatedLevel}강` : ''}`,
          components: [{
            type: 1,
            components: [
              { type: 2, style: 3, label: '⚔️ 다시 전투', custom_id: 'battle_button' },
              { type: 2, style: 1, label: '✨ 강화', custom_id: 'enhance_button' }
            ]
          }]
        }
      });
    }
  }
}
