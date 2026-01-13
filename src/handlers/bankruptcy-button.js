// 파산 버튼 핸들러

import { InteractionResponseType } from 'discord-interactions';
import { jsonResponse } from '../utils/responses.js';
import { getRandomWeapon } from '../modules/weapons.js';

export async function handleBankruptcyConfirm(interaction, env) {
  const userId = interaction.member?.user?.id || interaction.user?.id;
  const customId = interaction.data.custom_id;
  const buttonUserId = customId.replace('bankruptcy_confirm_', '');
  
  // 버튼을 누른 사람만 처리 가능하도록 확인
  if (buttonUserId !== userId) {
    return jsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: '❌ 본인만 파산 신청할 수 있습니다.', flags: 64 }
    });
  }
  
  // 유저 정보 초기화
  const newWeapon = await getRandomWeapon(env);
  if (!newWeapon) {
    return jsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: '❌ 무기 조회에 실패했습니다.', flags: 64 }
    });
  }
  
  await env.game_db.prepare("UPDATE users SET level = 0, money = 200000, wins = 0, weapon_name = ?, last_daily = NULL WHERE id = ?")
    .bind(newWeapon.name, userId).run();
  
  return jsonResponse({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: { 
      content: `💸 **파산 처리 완료!**\n\n모든 정보가 초기화되었습니다.\n\n🎁 새 무기: ${newWeapon.name} +0강\n💰 초기 자금: 200,000원\n\n처음부터 다시 시작하세요!`,
      flags: 64
    }
  });
}

export async function handleBankruptcyCancel(interaction, env) {
  const userId = interaction.member?.user?.id || interaction.user?.id;
  const customId = interaction.data.custom_id;
  const buttonUserId = customId.replace('bankruptcy_cancel_', '');
  
  // 버튼을 누른 사람만 처리 가능하도록 확인
  if (buttonUserId !== userId) {
    return jsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: '❌ 본인만 취소할 수 있습니다.', flags: 64 }
    });
  }
  
  return jsonResponse({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: { 
      content: '✅ 파산 신청이 취소되었습니다.',
      flags: 64
    }
  });
}
