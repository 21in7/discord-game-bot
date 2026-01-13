// 묵념 버튼 핸들러

import { InteractionResponseType } from 'discord-interactions';
import { jsonResponse } from '../utils/responses.js';
import { getRandomWeapon } from '../modules/weapons.js';
import { getUserOrCreate } from '../modules/user.js';

export async function handleMournButton(interaction, env) {
  const userId = interaction.member?.user?.id || interaction.user?.id;
  const username = interaction.member?.user?.username || interaction.user?.username;
  
  // 유저 존재 여부만 확인 (money는 UPDATE에서 직접 증가)
  const user = await env.game_db.prepare("SELECT id FROM users WHERE id = ?").bind(userId).first();
  if (!user) {
    const newWeapon = await getRandomWeapon(env);
    if (newWeapon) {
      await env.game_db.prepare("INSERT INTO users (id, username, weapon_name) VALUES (?, ?, ?)").bind(userId, username, newWeapon.name).run();
    }
  }

  const found = Math.floor(Math.random() * 100) + 10;
  await env.game_db.prepare("UPDATE users SET money = money + ? WHERE id = ?").bind(found, userId).run();
  
  // 새 메시지 생성
  return jsonResponse({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: `🙏 ${username}님이 묵념하며 ${found}원을 주웠습니다.`
    }
  });
}
