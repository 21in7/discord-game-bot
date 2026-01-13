import { InteractionType, InteractionResponseType, verifyKey } from 'discord-interactions';

// 명령어 핸들러
import { handleInfoCommand } from './commands/info.js';
import { handleDailyCommand } from './commands/daily.js';
import { handleEnhanceCommand } from './commands/enhance.js';
import { handleBattleCommand } from './commands/battle.js';
import { handleMournCommand } from './commands/mourn.js';
import { handleSellCommand } from './commands/sell.js';
import { handleRankingCommand } from './commands/ranking.js';
import { handleBankruptcyCommand } from './commands/bankruptcy.js';

// 버튼 핸들러
import { handleMournButton } from './handlers/mourn-button.js';
import { handleBankruptcyConfirm, handleBankruptcyCancel } from './handlers/bankruptcy-button.js';
import { handleBattleButton } from './handlers/battle-button.js';
import { handleEnhanceButton } from './handlers/enhance-button.js';

// 유틸리티
import { getUserOrCreate } from './modules/user.js';

export default {
  async fetch(request, env, ctx) {
    // GET 요청 처리 (이미지 파일 서빙 - R2 binding 사용)
    if (request.method === 'GET') {
      const pathname = new URL(request.url).pathname;
      
      if (pathname.startsWith('/image/') && env.WEAPON_IMAGES) {
        const filename = pathname.slice(7); // '/image/'.length
        try {
          const object = await env.WEAPON_IMAGES.get(filename);
          if (object) {
            const headers = new Headers();
            object.writeHttpMetadata(headers);
            headers.set('etag', object.httpEtag);
            headers.set('cache-control', 'public, max-age=86400'); // 24시간 캐시
            return new Response(object.body, { headers });
          }
        } catch { /* 무시 */ }
      }
      
      return new Response('Not found', { status: 404 });
    }
    
    // POST 요청만 처리
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // 1. 디스코드 요청 서명 검증 (보안 필수)
    const signature = request.headers.get('x-signature-ed25519');
    const timestamp = request.headers.get('x-signature-timestamp');
    
    if (!signature || !timestamp) {
      return new Response('Missing signature headers', { status: 401 });
    }

    const body = await request.text();
    
    if (!env.DISCORD_PUBLIC_KEY) {
      return new Response('Server configuration error', { status: 500 });
    }

    const isValidRequest = await verifyKey(body, signature, timestamp, env.DISCORD_PUBLIC_KEY);

    if (!isValidRequest) {
      return new Response('Bad request signature', { status: 401 });
    }

    let interaction;
    try {
      interaction = JSON.parse(body);
    } catch {
      return new Response('Invalid JSON', { status: 400 });
    }

    // 2. PING 처리 (디스코드가 봇 상태 확인용 - 엔드포인트 인증에 필수)
    if (interaction.type === InteractionType.PING) {
      // Discord는 정확히 {"type":1} 형식을 요구함 (공백 없이)
      return new Response('{"type":1}', {
        status: 200,
        headers: { 
          'Content-Type': 'application/json'
        }
      });
    }

    // 3. 버튼 클릭 처리 (MESSAGE_COMPONENT)
    if (interaction.type === InteractionType.MESSAGE_COMPONENT) {
      const userId = interaction.member?.user?.id || interaction.user?.id;
      const username = interaction.member?.user?.username || interaction.user?.username;
      const customId = interaction.data.custom_id;

      // 묵념 버튼 처리
      if (customId && customId.startsWith('mourn_')) {
        return await handleMournButton(interaction, env);
      }

      // 파산 확인/취소 버튼 처리
      if (customId && customId.startsWith('bankruptcy_confirm_')) {
        return await handleBankruptcyConfirm(interaction, env);
      }

      if (customId && customId.startsWith('bankruptcy_cancel_')) {
        return await handleBankruptcyCancel(interaction, env);
      }

      // 배틀 버튼 처리 (다시 전투)
      if (customId === 'battle_button' || (customId && customId.startsWith('battle_user_'))) {
        return await handleBattleButton(interaction, env);
      }

      // 강화 버튼 처리 (다시 강화)
      if (customId && customId.startsWith('enhance_')) {
        return await handleEnhanceButton(interaction, env, request, ctx);
      }
    }

    // 4. 명령어 처리
    if (interaction.type === InteractionType.APPLICATION_COMMAND) {
      const { name } = interaction.data;
      const userId = interaction.member.user.id;
      const username = interaction.member.user.username;

      // 유저 데이터 가져오기 (없으면 생성)
      const user = await getUserOrCreate(userId, username, env);

      // 명령어 라우팅
      switch (name) {
        case '정보':
          return await handleInfoCommand(interaction, env, user, request);
        
        case '출석':
          return await handleDailyCommand(interaction, env, user);
        
        case '강화':
          return await handleEnhanceCommand(interaction, env, user, request, ctx);
        
        case '배틀':
          return await handleBattleCommand(interaction, env, user, request);
        
        case '묵념':
          return await handleMournCommand(interaction, env, user);
        
        case '판매':
          return await handleSellCommand(interaction, env, user);
        
        case '랭킹':
          return await handleRankingCommand(interaction, env, user);
        
        case '파산':
          return await handleBankruptcyCommand(interaction, env, user);
        
        default:
          return new Response('Unknown Command', { status: 404 });
      }
    }

    return new Response('Unknown Command', { status: 404 });
  },
};
