// /출석 명령어 처리

import { InteractionResponseType } from 'discord-interactions';
import { jsonResponse } from '../utils/responses.js';

export async function handleDailyCommand(interaction, env, user) {
  const userId = interaction.member.user.id;
  
  const today = new Date().toISOString().split('T')[0];
  if (user.last_daily === today) {
    return jsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: "❌ 오늘은 이미 출석했습니다.", flags: 64 } // flags: 64는 나만 보이기
    });
  }
  await env.game_db.prepare("UPDATE users SET money = money + 200000, last_daily = ? WHERE id = ?").bind(today, userId).run();
  return jsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: `✅ **출석 완료!** 200,000원을 받았습니다.` }
  });
}
