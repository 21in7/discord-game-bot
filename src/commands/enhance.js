// /강화 명령어 처리

import { InteractionResponseType } from 'discord-interactions';
import { jsonResponse } from '../utils/responses.js';
import { getWeaponImageUrl, getRandomWeapon, getWeaponDescription } from '../modules/weapons.js';
import { getDestroyRate } from '../modules/user.js';
import { processAIResponseInBackground } from '../utils/ai.js';

export async function handleEnhanceCommand(interaction, env, user, request, ctx) {
  const userId = interaction.member.user.id;
  const username = interaction.member.user.username;
  
  const cost = user.level * 1000 + 500;
  if (user.money < cost) {
    return jsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: `❌ 돈이 부족합니다. (필요: ${cost.toLocaleString()}원, 보유: ${user.money.toLocaleString()}원)`, flags: 64 }
    });
  }
  
  // 중복 요청 방지: 원래 값 저장
  const originalMoney = user.money;
  const originalLevel = user.level;
  const originalWeapon = user.weapon_name;
  
  const successRate = Math.max(10, 100 - (user.level * 5));
  const destroyRate = getDestroyRate(user.level);
  const failRate = 100 - successRate - destroyRate;
  const random = Math.random() * 100;
  const isSuccess = random < successRate;
  const isDestroyed = !isSuccess && random < (successRate + destroyRate);
  const remainingMoney = user.money - cost;

  // R2 Public URL 가져오기 (환경 변수 또는 기본값)
  const r2PublicUrl = env.R2_PUBLIC_URL || env.R2_IMAGE_BASE_URL;

  if (isSuccess) {
      // WHERE 조건에 원래 값 확인 추가로 중복 요청 방지
      const result = await env.game_db.prepare("UPDATE users SET level = level + 1, money = money - ? WHERE id = ? AND money = ? AND level = ?").bind(cost, userId, originalMoney, originalLevel).run();
      if (result.meta.changes === 0) {
        // 데이터가 변경되어 업데이트 실패 (다른 요청이 이미 처리함)
        return jsonResponse({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: '⏳ 강화 처리 중입니다. 잠시 후 다시 시도해주세요.', flags: 64 }
        });
      }
      
    // 먼저 기본 응답을 보냄 (Discord 3초 타임아웃 대응)
    const embedData = {
      title: `✨ ${username}님의 강화 성공!`,
      description: `⚔️ ${user.weapon_name} +${user.level}강 ➡️ +${user.level + 1}강\n💰 사용 금액: ${cost.toLocaleString()}원\n💵 남은 돈: ${remainingMoney.toLocaleString()}원\n\n📊 강화 확률:\n✅ 성공: ${successRate}%\n❌ 실패: ${failRate}%\n💥 파괴: ${destroyRate.toFixed(1)}%`,
      color: 0x00ff00 // 초록색
    };
    
    const imageUrl = await getWeaponImageUrl(user.weapon_name, r2PublicUrl, request.url, env);
    if (imageUrl) {
      embedData.image = { url: imageUrl };
    }
    
    const response = jsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { 
        embeds: [embedData],
        components: [{
          type: 1, // Action Row
          components: [{
            type: 2, // Button
            style: 3, // Success (초록색)
            label: '✨ 다시 강화',
            custom_id: 'enhance_button'
          }]
        }]
      }
    });
    
    // AI 응답을 백그라운드에서 처리
    processAIResponseInBackground(
      ctx, env, userId, 'success', user.weapon_name, user.level + 1, username,
      embedData, interaction.token, interaction.application_id || env.DISCORD_APPLICATION_ID,
      [{ type: 1, components: [{ type: 2, style: 3, label: '✨ 다시 강화', custom_id: 'enhance_button' }] }]
    );
    
    return response;
  } else if (isDestroyed) {
      // 무기 터짐 - 새 무기 생성
      const newWeapon = await getRandomWeapon(env);
      if (!newWeapon) {
        return jsonResponse({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: '❌ 무기 조회에 실패했습니다.', flags: 64 }
        });
      }
      
      const newWeaponDesc = await getWeaponDescription(newWeapon.name, env);
      // WHERE 조건에 원래 값 확인 추가로 중복 요청 방지
      const result = await env.game_db.prepare("UPDATE users SET level = 0, money = money - ?, weapon_name = ? WHERE id = ? AND money = ? AND level = ? AND weapon_name = ?").bind(cost, newWeapon.name, userId, originalMoney, originalLevel, originalWeapon).run();
      if (result.meta.changes === 0) {
        // 데이터가 변경되어 업데이트 실패 (다른 요청이 이미 처리함)
        return jsonResponse({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: '⏳ 강화 처리 중입니다. 잠시 후 다시 시도해주세요.', flags: 64 }
        });
      }
      
      // 먼저 기본 응답을 보냄 (Discord 3초 타임아웃 대응)
      const embedData = {
        title: `💥 ${username}님의 무기 파괴!`,
        description: `⚔️ ${user.weapon_name} +${user.level}강이 파괴되었습니다!\n💰 사용 금액: ${cost.toLocaleString()}원\n💵 남은 돈: ${remainingMoney.toLocaleString()}원\n🎁 새 무기 획득: ${newWeapon.name} +0강\n📝 ${newWeaponDesc}\n\n📊 강화 확률:\n✅ 성공: ${successRate}%\n❌ 실패: ${failRate}%\n💥 파괴: ${destroyRate.toFixed(1)}%`,
        color: 0xff0000 // 빨간색
      };
      
      // 파괴된 무기 이미지 표시
      const imageUrl = await getWeaponImageUrl(user.weapon_name, r2PublicUrl, request.url, env);
      if (imageUrl) {
        embedData.image = { url: imageUrl };
      }
      
      const response = jsonResponse({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { 
          embeds: [embedData],
          components: [{
            type: 1, // Action Row
            components: [
              {
                type: 2, // Button
                style: 2, // Secondary (회색)
                label: '🙏 묵념',
                custom_id: `mourn_${userId}`
              },
              {
                type: 2, // Button
                style: 3, // Success (초록색)
                label: '✨ 다시 강화',
                custom_id: 'enhance_button'
              }
            ]
          }]
        }
      });
      
      // AI 응답을 백그라운드에서 처리
      processAIResponseInBackground(
        ctx, env, userId, 'destroyed', user.weapon_name, user.level, username,
        embedData, interaction.token, interaction.application_id || env.DISCORD_APPLICATION_ID,
        [{ type: 1, components: [
          { type: 2, style: 2, label: '🙏 묵념', custom_id: `mourn_${userId}` },
          { type: 2, style: 3, label: '✨ 다시 강화', custom_id: 'enhance_button' }
        ]}]
      );
      
      return response;
  } else {
      // WHERE 조건에 원래 값 확인 추가로 중복 요청 방지
      const result = await env.game_db.prepare("UPDATE users SET money = money - ? WHERE id = ? AND money = ? AND level = ?").bind(cost, userId, originalMoney, originalLevel).run();
      if (result.meta.changes === 0) {
        // 데이터가 변경되어 업데이트 실패 (다른 요청이 이미 처리함)
        return jsonResponse({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: '⏳ 강화 처리 중입니다. 잠시 후 다시 시도해주세요.', flags: 64 }
        });
      }
      
      // 먼저 기본 응답을 보냄 (Discord 3초 타임아웃 대응)
      const embedData = {
        title: `❌ ${username}님의 강화 실패...`,
        description: `⚔️ ${user.weapon_name} +${user.level}강 (유지)\n💰 사용 금액: ${cost.toLocaleString()}원\n💵 남은 돈: ${remainingMoney.toLocaleString()}원\n\n📊 강화 확률:\n✅ 성공: ${successRate}%\n❌ 실패: ${failRate}%\n💥 파괴: ${destroyRate.toFixed(1)}%`,
        color: 0xffaa00 // 주황색
      };
      
      const imageUrl = await getWeaponImageUrl(user.weapon_name, r2PublicUrl, request.url, env);
      if (imageUrl) {
        embedData.image = { url: imageUrl };
      }
      
      const response = jsonResponse({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { 
          embeds: [embedData],
          components: [{
            type: 1, // Action Row
            components: [{
              type: 2, // Button
              style: 3, // Success (초록색)
              label: '✨ 다시 강화',
              custom_id: 'enhance_button'
            }]
          }]
        }
      });
      
      // AI 응답을 백그라운드에서 처리
      processAIResponseInBackground(
        ctx, env, userId, 'failure', user.weapon_name, user.level, username,
        embedData, interaction.token, interaction.application_id || env.DISCORD_APPLICATION_ID,
        [{ type: 1, components: [{ type: 2, style: 3, label: '✨ 다시 강화', custom_id: 'enhance_button' }] }]
      );
    
    return response;
  }
}
