// /판매 명령어 처리

import { InteractionResponseType } from 'discord-interactions';
import { jsonResponse } from '../utils/responses.js';
import { getWeaponSellPrice, getWeaponDescription, getRandomWeapon } from '../modules/weapons.js';

export async function handleSellCommand(interaction, env, user) {
  const userId = interaction.member.user.id;
  const username = interaction.member.user.username;
  
  const sellPrice = await getWeaponSellPrice(user.weapon_name, user.level, env);
  const newWeapon = await getRandomWeapon(env);
  if (!newWeapon) {
    return jsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: '❌ 무기 조회에 실패했습니다.', flags: 64 }
    });
  }
  
  await env.game_db.prepare("UPDATE users SET money = money + ?, level = 0, weapon_name = ? WHERE id = ?").bind(sellPrice, newWeapon.name, userId).run();
  const newWeaponDesc = await getWeaponDescription(newWeapon.name, env);
  return jsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: `💰 **${username}님의 무기 판매 완료!**\n⚔️ ${user.weapon_name} +${user.level}강을 ${sellPrice.toLocaleString()}원에 판매했습니다.\n💵 현재 자금: ${(user.money + sellPrice).toLocaleString()}원\n🎁 새 무기 획득: ${newWeapon.name} +0강\n📝 ${newWeaponDesc}` }
  });
}
