// /묵념 명령어 처리

import { InteractionResponseType } from 'discord-interactions';
import { jsonResponse } from '../utils/responses.js';

export async function handleMournCommand(interaction, env, user) {
  const userId = interaction.member.user.id;
  
  const found = Math.floor(Math.random() * 100) + 10;
  await env.game_db.prepare("UPDATE users SET money = money + ? WHERE id = ?").bind(found, userId).run();
  return jsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: `🙏 마음을 비우고 바닥에서 ${found}원을 주웠습니다.` }
  });
}
