// /정보 명령어 처리

import { InteractionResponseType } from 'discord-interactions';
import { jsonResponse } from '../utils/responses.js';
import { getWeaponSellPrice, getWeaponDescription, getWeaponImageUrl, getRandomWeapon } from '../modules/weapons.js';

export async function handleInfoCommand(interaction, env, user, request) {
  const userId = interaction.member.user.id;
  const username = interaction.member.user.username;
  
  // 옵션에서 유저 지정 확인
  const targetOption = interaction.data.options?.find(opt => opt.name === '유저');
  const targetUserId = targetOption?.value;
  
  let targetUser = user;
  let targetUsername = username;
  let isOwnProfile = true;
  
  // 다른 유저 정보 조회
  if (targetUserId) {
    isOwnProfile = String(targetUserId) === String(userId);
    
    if (!isOwnProfile) {
      const targetUserData = await env.game_db.prepare("SELECT level, money, wins, weapon_name FROM users WHERE id = ?").bind(targetUserId).first();
      
      if (!targetUserData) {
        return jsonResponse({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: '❌ 해당 유저가 게임에 등록되어 있지 않습니다!\n`/정보` 명령어로 먼저 등록해주세요.', flags: 64 }
        });
      }
      
      // 유저 이름 가져오기 (interaction에서 resolved users 확인)
      const targetUserInfo = interaction.data.resolved?.users?.[targetUserId];
      targetUsername = targetUserInfo?.username || '알 수 없음';
      targetUser = targetUserData;
      
      // 무기 이름이 없으면 랜덤 생성
      if (!targetUser.weapon_name) {
        const newWeapon = await getRandomWeapon(env);
        if (newWeapon) {
          await env.game_db.prepare("UPDATE users SET weapon_name = ? WHERE id = ?").bind(newWeapon.name, targetUserId).run();
          targetUser.weapon_name = newWeapon.name;
        }
      }
    }
  }
  
  const sellPrice = await getWeaponSellPrice(targetUser.weapon_name, targetUser.level, env);
  const weaponDesc = await getWeaponDescription(targetUser.weapon_name, env);
  
  // Embed 데이터 구성
  const embedData = {
    title: `📊 ${targetUsername}님의 프로필`,
    description: `- ⚔️ 무기: ${targetUser.weapon_name} +${targetUser.level}강 (판매가: ${sellPrice.toLocaleString()}원)\n  📝 ${weaponDesc}\n- 💰 자금: ${targetUser.money.toLocaleString()}원\n- 🏆 승리: ${targetUser.wins}회`,
    color: 0x00ff00 // 초록색
  };
  
  // R2 Public URL 가져오기 (환경 변수 또는 기본값)
  const r2PublicUrl = env.R2_PUBLIC_URL || env.R2_IMAGE_BASE_URL;
  const imageUrl = await getWeaponImageUrl(targetUser.weapon_name, r2PublicUrl, request?.url || null, env);
  if (imageUrl) {
    embedData.image = { url: imageUrl };
  }
  
  return jsonResponse({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      embeds: [embedData]
    }
  });
}
