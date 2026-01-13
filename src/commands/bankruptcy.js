// /파산 명령어 처리

import { InteractionResponseType } from 'discord-interactions';
import { jsonResponse } from '../utils/responses.js';

export async function handleBankruptcyCommand(interaction, env, user) {
  const userId = interaction.member.user.id;
  
  return jsonResponse({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: `⚠️ **파산 신청 확인**\n\n정말로 파산하시겠습니까?\n\n파산 시 다음 정보가 모두 초기화됩니다:\n- 💰 자금: 200,000원으로 초기화\n- ⚔️ 무기: 랜덤 무기로 변경 (+0강)\n- 📊 강화 레벨: 0으로 초기화\n- 🏆 승리 횟수: 0으로 초기화\n- 📅 출석 정보: 초기화\n\n**이 작업은 되돌릴 수 없습니다!**`,
      flags: 64, // 나만 보이기
      components: [{
        type: 1, // Action Row
        components: [
          {
            type: 2, // Button
            style: 4, // Danger (빨간색)
            label: '✅ 예, 파산합니다',
            custom_id: `bankruptcy_confirm_${userId}`
          },
          {
            type: 2, // Button
            style: 2, // Secondary (회색)
            label: '❌ 아니오, 취소합니다',
            custom_id: `bankruptcy_cancel_${userId}`
          }
        ]
      }]
    }
  });
}
