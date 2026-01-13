// /랭킹 명령어 처리

import { InteractionResponseType } from 'discord-interactions';
import { jsonResponse } from '../utils/responses.js';

export async function handleRankingCommand(interaction, env, user) {
  const { results } = await env.game_db.prepare("SELECT username, level, money FROM users ORDER BY level DESC, money DESC LIMIT 5").all();
  const rankText = results.map((u, i) => `${i + 1}위: **${u.username}** (+${u.level}강 | ${u.money.toLocaleString()}원)`).join('\n');
  return jsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: `🏆 **서버 랭킹 TOP 5**\n\n${rankText}` }
  });
}
