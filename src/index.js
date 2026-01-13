import { InteractionType, InteractionResponseType, verifyKey } from 'discord-interactions';

// 무기 이름 리스트 (무기 종류별 판매 가격 다르게 설정)
const WEAPONS = [
  { name: '나무 검', basePrice: 100, description: '초보자용 나무로 만든 검. 가볍고 다루기 쉽다.' },
  { name: '철 검', basePrice: 500, description: '일반적인 철제 검. 기본적인 전투에 적합하다.' },
  { name: '강철 검', basePrice: 1000, description: '단단한 강철로 만든 검. 내구성이 뛰어나다.' },
  { name: '미스릴 검', basePrice: 2000, description: '희귀한 미스릴로 제작된 검. 마법 저항력이 있다.' },
  { name: '다이아몬드 검', basePrice: 5000, description: '다이아몬드로 장식된 고급 검. 예리한 날을 자랑한다.' },
  { name: '드래곤 슬레이어', basePrice: 10000, description: '드래곤을 처치한 용사가 사용하던 전설의 검.' },
  { name: '신의 검', basePrice: 20000, description: '신이 내려준 성스러운 검. 악을 물리치는 힘이 있다.' },
  { name: '전설의 검', basePrice: 50000, description: '세계에서 가장 강력한 검. 그 힘은 상상을 초월한다.' },
  { name: '나무 도끼', basePrice: 150, description: '나무로 만든 단순한 도끼. 벌목용으로도 사용된다.' },
  { name: '철 도끼', basePrice: 600, description: '무거운 철제 도끼. 강력한 일격을 가할 수 있다.' },
  { name: '강철 도끼', basePrice: 1200, description: '단단한 강철 도끼. 방어구를 찢어버리는 위력이 있다.' },
  { name: '미스릴 도끼', basePrice: 2500, description: '미스릴로 만든 도끼. 마법의 힘이 깃들어 있다.' },
  { name: '다이아몬드 도끼', basePrice: 6000, description: '다이아몬드 날을 가진 도끼. 어떤 것도 부술 수 있다.' },
  { name: '드래곤 도끼', basePrice: 12000, description: '드래곤의 비늘로 만든 도끼. 불꽃의 힘을 담고 있다.' },
  { name: '신의 도끼', basePrice: 25000, description: '신이 사용하던 거대한 도끼. 천둥의 힘이 깃들어 있다.' },
  { name: '전설의 도끼', basePrice: 60000, description: '세계를 양분했다는 전설의 도끼. 그 위력은 무시무시하다.' },
  { name: '나무 지팡이', basePrice: 200, description: '마법사의 첫 지팡이. 기본적인 마법을 구사할 수 있다.' },
  { name: '마법 지팡이', basePrice: 800, description: '마법이 깃든 지팡이. 강력한 주문을 시전할 수 있다.' },
  { name: '고대 지팡이', basePrice: 1500, description: '고대 마법사가 사용하던 지팡이. 오래된 힘이 깃들어 있다.' },
  { name: '신의 지팡이', basePrice: 3000, description: '신이 내려준 지팡이. 창조의 힘을 다룰 수 있다.' },
  { name: '전설의 지팡이', basePrice: 8000, description: '세계의 마법을 지배하는 전설의 지팡이. 모든 주문을 마스터했다.' },
];

// 랜덤 무기 생성
function generateRandomWeapon() {
  return WEAPONS[Math.floor(Math.random() * WEAPONS.length)];
}

// 무기 판매 가격 계산 (등급별 차등 적용)
function getWeaponSellPrice(weaponName, level) {
  const weapon = WEAPONS.find(w => w.name === weaponName);
  if (!weapon) return 0;
  
  const basePrice = weapon.basePrice;
  
  // 전설급 무기 (전설의 검/도끼/지팡이)
  if (weaponName.includes('전설의')) {
    // basePrice * (20 + level * 5) - 예: 전설의 지팡이 13강 = 8000 * (20 + 13*5) = 8000 * 85 = 680,000원
    return basePrice * (20 + level * 5);
  }
  
  // 신급 무기 (신의 검/도끼/지팡이)
  if (weaponName.includes('신의')) {
    // basePrice * (10 + level * 2) - 예: 신의 지팡이 13강 = 3000 * (10 + 13*2) = 3000 * 36 = 108,000원
    return basePrice * (10 + level * 2);
  }
  
  // 드래곤급 무기 (드래곤 슬레이어/도끼)
  if (weaponName.includes('드래곤')) {
    // basePrice * (5 + level) - 예: 드래곤 슬레이어 13강 = 10000 * 18 = 180,000원
    return basePrice * (5 + level);
  }
  
  // 다이아몬드급 무기
  if (weaponName.includes('다이아몬드')) {
    // basePrice * (3 + level * 0.5) - 예: 다이아몬드 검 13강 = 5000 * 9.5 = 47,500원
    return Math.floor(basePrice * (3 + level * 0.5));
  }
  
  // 미스릴급 무기
  if (weaponName.includes('미스릴')) {
    // basePrice * (2 + level * 0.3) - 예: 미스릴 검 13강 = 2000 * 5.9 = 11,800원
    return Math.floor(basePrice * (2 + level * 0.3));
  }
  
  // 일반/고급 무기 (나무, 철, 강철, 마법, 고대)
  // basePrice + (level * 1000) - 예: 강철 검 13강 = 1000 + 13000 = 14,000원
  return basePrice + (level * 1000);
}

// 무기 설명 가져오기
function getWeaponDescription(weaponName) {
  const weapon = WEAPONS.find(w => w.name === weaponName);
  return weapon ? weapon.description : '알 수 없는 무기';
}

// 무기 이름을 이미지 파일명으로 변환하는 규칙
function weaponNameToImageFilename(weaponName) {
  // 무기 이름을 소문자 영문 파일명으로 변환하는 규칙
  const nameMapping = {
    '나무 검': 'wood_sword',
    '철 검': 'iron_sword',
    '강철 검': 'steel_sword',
    '나무 도끼': 'wood_axe',
    '철 도끼': 'iron_axe',
    '강철 도끼': 'steel_axe',
    '나무 지팡이': 'wood_staff',
    '마법 지팡이': 'magic_staff',
	'미스릴 검': 'mithril_sword',
	'미스릴 도끼': 'mithril_axe',
	'다이아몬드 검': 'diamond_sword',
	'다이아몬드 도끼': 'diamond_axe',
	'드래곤 슬레이어': 'dragon_slayer',
	'드래곤 도끼': 'dragon_axe',
	'고대 지팡이': 'old_staff',
	'신의 검': 'divine_sword',
	'신의 도끼': 'divine_axe',
	'신의 지팡이': 'divine_staff',
	'전설의 검': 'legendary_sword',
	'전설의 도끼': 'legendary_axe',
	'전설의 지팡이': 'legendary_staff',
	'전설의 무기': 'legendary_weapon',
    // 추가 무기들은 여기에 규칙을 추가하거나, 자동 변환 규칙을 사용
  };
  
  // 직접 매핑이 있으면 사용
  if (nameMapping[weaponName]) {
    return `${nameMapping[weaponName]}.png`;
  }
  
  // 자동 변환 규칙 (한글 -> 영문 변환)
  // 예: "나무 검" -> "wood_sword.png"
  // 이 부분은 필요에 따라 확장 가능
  
  return null;
}

// 무기 이미지 파일명 가져오기
function getWeaponImageFilename(weaponName) {
  return weaponNameToImageFilename(weaponName);
}

// R2 이미지 URL 생성 함수
// 우선순위: 1. R2 Public URL (가장 빠름) > 2. Workers를 통한 R2 binding (fallback)
function getWeaponImageUrl(weaponName, r2PublicUrl, requestUrl = null) {
  const weaponImageFilename = getWeaponImageFilename(weaponName);
  if (!weaponImageFilename) {
    return null;
  }
  
  // R2 Public URL이 설정되어 있으면 사용 (가장 빠름)
  if (r2PublicUrl) {
    // R2 Public URL 끝에 슬래시가 없으면 추가
    const baseUrl = r2PublicUrl.endsWith('/') ? r2PublicUrl : `${r2PublicUrl}/`;
    return `${baseUrl}${weaponImageFilename}`;
  }
  
  // R2 Public URL이 없으면 Workers를 통해 제공 (fallback)
  // 이 경우 R2 binding을 사용하여 이미지를 제공
  if (requestUrl) {
    const baseUrl = new URL(requestUrl);
    return `${baseUrl.origin}/image/${weaponImageFilename}`;
  }
  
  return null;
}

// 템플릿 기반 AI 응답 생성 (Gemini API 호출 없음)
async function generateAIResponse(resultType, weaponName, level, username, env) {
  try {
    // 데이터베이스에서 랜덤 템플릿 가져오기
    const { results } = await env.game_db.prepare(
      "SELECT response FROM ai_responses WHERE result_type = ? ORDER BY RANDOM() LIMIT 1"
    ).bind(resultType).all();
    
    if (!results || results.length === 0) {
      // 템플릿이 없으면 기본 메시지 반환
      return null;
    }
    
    // 템플릿에서 플레이스홀더 치환
    let template = results[0].response;
    
    // {username} 플레이스홀더 치환
    template = template.replace(/\{username\}/g, username);
    
    // {weaponName} 플레이스홀더 치환
    template = template.replace(/\{weaponName\}/g, weaponName);
    
    // {level} 플레이스홀더 치환 (있는 경우)
    template = template.replace(/\{level\}/g, level.toString());
    
    return template.trim();
  } catch {
    return null;
  }
}

// AI 응답 생성 (템플릿 기반)
const getAIResponse = generateAIResponse;

// 백그라운드 AI 응답 처리 (템플릿 기반 - 빠르고 API 호출 없음)
async function processAIResponseInBackground(ctx, env, userId, resultType, weaponName, level, username, embedData, interactionToken, applicationId, components) {
  if (!interactionToken || !applicationId) return;
  
  // 템플릿 기반이므로 쿨다운/확률 제한 없이 바로 처리 (매우 빠름)
  ctx.waitUntil((async () => {
    try {
      const aiResponse = await generateAIResponse(resultType, weaponName, level, username, env);
      
      if (aiResponse) {
        await fetch(`https://discord.com/api/v10/webhooks/${applicationId}/${interactionToken}/messages/@original`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            embeds: [{ ...embedData, description: embedData.description + `\n\n💬 ${aiResponse}` }],
            components
          })
        });
      }
    } catch { /* 무시 */ }
  })());
}

// 몬스터 레벨 생성 (플레이어 레벨 기준으로 랜덤 생성)
function generateMonsterLevel(playerLevel) {
  // 플레이어 레벨의 -5 ~ +10 범위로 몬스터 레벨 생성
  const minLevel = Math.max(0, playerLevel - 5);
  const maxLevel = playerLevel + 10;
  return Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;
}

// 전투력 계산 (강화 수치에 비례하여 더 정확하게)
function calculatePower(level) {
  // 기본 전투력 = level * 15 + 40 (강화 수치에 비례하지만 과도하지 않게)
  const basePower = level * 15 + 40;
  // 랜덤 변동 = ±20% (적당한 변동성 유지)
  const variance = basePower * 0.2;
  const minPower = Math.floor(basePower - variance);
  const maxPower = Math.floor(basePower + variance);
  return Math.floor(Math.random() * (maxPower - minPower + 1)) + minPower;
}

// 전투력 차이에 따른 무기 손상/파괴 처리 (최적화: user 정보를 파라미터로 받아 중복 쿼리 제거)
async function handleWeaponDamage(userId, myPower, opponentPower, currentWeaponName, currentLevel, env) {
  // 전투력 차이 계산 (상대가 얼마나 강한지)
  const powerDiff = opponentPower - myPower;
  
  // 전투력 차이가 음수면 (내가 더 강함) 손상 없음 - 패배 시에만 호출되므로 이 경우는 거의 없음
  if (powerDiff < 0) {
    return { damaged: false, destroyed: false, message: '', updatedWeaponName: currentWeaponName, updatedLevel: currentLevel };
  }
  
  // 내 전투력을 기준으로 차이 비율 계산 (더 정확함)
  const powerDiffPercent = myPower > 0 ? (powerDiff / myPower) * 100 : 100;
  
  // 전투력 차이에 따른 확률 계산 (패배 시 항상 손상/파괴 가능성 존재)
  let damageChance = 0;
  let destroyChance = 0;
  
  if (powerDiffPercent <= 30) {
    // 차이가 작음 (30% 이내): 낮은 확률로 손상/파괴 (패배했으니 손상 가능)
    damageChance = 0.15;
    destroyChance = 0.03;
  } else if (powerDiffPercent <= 80) {
    // 차이가 보통 (30-80%): 중간 확률로 손상, 낮은 확률로 파괴
    damageChance = 0.25;
    destroyChance = 0.05;
  } else if (powerDiffPercent <= 150) {
    // 차이가 큼 (80-150%): 높은 확률로 손상, 중간 확률로 파괴
    damageChance = 0.4;
    destroyChance = 0.12;
  } else {
    // 차이가 매우 큼 (150% 이상): 매우 높은 확률로 손상, 높은 확률로 파괴
    damageChance = 0.6;
    destroyChance = 0.25;
  }
  
  // 무기 파괴 확인 (파괴가 우선)
  if (Math.random() < destroyChance) {
    // 기본 무기로 변경
    const newWeapon = generateRandomWeapon();
    await env.game_db.prepare("UPDATE users SET weapon_name = ?, level = 0 WHERE id = ?")
      .bind(newWeapon.name, userId).run();
    return { 
      damaged: false, 
      destroyed: true, 
      message: `\n\n💥 **무기 파괴!**\n${newWeapon.name}으로 교체되었습니다.`,
      updatedWeaponName: newWeapon.name,
      updatedLevel: 0
    };
  }
  
  // 무기 손상 확인
  if (Math.random() < damageChance) {
    if (currentLevel > 0) {
      const newLevel = currentLevel - 1;
      await env.game_db.prepare("UPDATE users SET level = ? WHERE id = ?")
        .bind(newLevel, userId).run();
      return { 
        damaged: true, 
        destroyed: false, 
        message: `\n\n⚙️ **무기 손상!**\n${currentWeaponName} +${currentLevel}강 → +${newLevel}강`,
        updatedWeaponName: currentWeaponName,
        updatedLevel: newLevel
      };
    }
  }
  
  return { damaged: false, destroyed: false, message: '', updatedWeaponName: currentWeaponName, updatedLevel: currentLevel };
}

// 격차에 따른 골드 보상 계산
function calculateReward(playerLevel, monsterLevel) {
  const levelDiff = monsterLevel - playerLevel; // 격차 (양수면 몬스터가 더 강함)
  
  // 기본 보상
  let baseReward = 5000;
  
  // 격차에 따른 보상 조정
  if (levelDiff > 0) {
    // 몬스터가 더 강할 때: 격차만큼 보너스 (격차 * 200원)
    baseReward = 1000 + (levelDiff * 200);
  } else if (levelDiff < 0) {
    // 몬스터가 더 약할 때: 격차만큼 감소 (격차 * 100원, 최소 200원)
    baseReward = Math.max(200, 1000 + (levelDiff * 100));
  }
  // levelDiff === 0이면 기본 보상 1000원 유지
  
  return baseReward;
}

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
        // 유저 존재 여부만 확인 (money는 UPDATE에서 직접 증가)
        const user = await env.game_db.prepare("SELECT id FROM users WHERE id = ?").bind(userId).first();
        if (!user) {
          const newWeapon = generateRandomWeapon();
          await env.game_db.prepare("INSERT INTO users (id, username, weapon_name) VALUES (?, ?, ?)").bind(userId, username, newWeapon.name).run();
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

      // 파산 확인/취소 버튼 처리
      if (customId && customId.startsWith('bankruptcy_confirm_')) {
        const buttonUserId = customId.replace('bankruptcy_confirm_', '');
        // 버튼을 누른 사람만 처리 가능하도록 확인
        if (buttonUserId !== userId) {
          return jsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: '❌ 본인만 파산 신청할 수 있습니다.', flags: 64 }
          });
        }
        
        // 유저 정보 초기화
        const newWeapon = generateRandomWeapon();
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

      if (customId && customId.startsWith('bankruptcy_cancel_')) {
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

      // 배틀 버튼 처리 (다시 전투)
      if (customId === 'battle_button') {
        // 필요한 컬럼만 선택하여 최적화
        let user = await env.game_db.prepare("SELECT level, money, weapon_name FROM users WHERE id = ?").bind(userId).first();
        if (!user) {
          const newWeapon = generateRandomWeapon();
          await env.game_db.prepare("INSERT INTO users (id, username, weapon_name) VALUES (?, ?, ?)").bind(userId, username, newWeapon.name).run();
          user = { level: 0, money: 200000, weapon_name: newWeapon.name };
        }
        
        // 배틀 로직 실행 (기존 배틀 명령어와 동일)
        const isVsUser = Math.random() < 0.5;
        
        if (isVsUser) {
          // 다른 유저와 배틀
          const opponent = await env.game_db.prepare("SELECT id, username, level, weapon_name FROM users WHERE id != ? ORDER BY RANDOM() LIMIT 1").bind(userId).first();
          
          if (!opponent) {
            // 다른 유저가 없으면 몬스터와 배틀
            const monsterLevel = generateMonsterLevel(user.level);
            const monsterPower = Math.floor(Math.random() * (monsterLevel * 5 + 50));
            const myPower = calculatePower(user.level);
            
            if (myPower > monsterPower) {
              const reward = calculateReward(user.level, monsterLevel);
              await env.game_db.prepare("UPDATE users SET money = money + ?, wins = wins + 1 WHERE id = ?").bind(reward, userId).run();
              const levelDiff = monsterLevel - user.level;
              const diffText = levelDiff > 0 ? `(+${levelDiff}강)` : levelDiff < 0 ? `(${levelDiff}강)` : '(동일)';
              return jsonResponse({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: { 
                  content: `⚔️ **승리!**\n**${username}** (${user.weapon_name} +${user.level}강): ${myPower} 전투력\n**몬스터** (레벨 ${monsterLevel} ${diffText}): ${monsterPower} 전투력\n\n💰 ${reward.toLocaleString()}원을 획득했습니다!`,
                  components: [{
                    type: 1,
                    components: [
                      { type: 2, style: 3, label: '⚔️ 다시 전투', custom_id: 'battle_button' },
                      { type: 2, style: 1, label: '✨ 강화', custom_id: 'enhance_button' }
                    ]
                  }]
                }
              });
            } else {
              const levelDiff = monsterLevel - user.level;
              const diffText = levelDiff > 0 ? `(+${levelDiff}강)` : levelDiff < 0 ? `(${levelDiff}강)` : '(동일)';
              
              // 무기 손상/파괴 처리
              const weaponDamage = await handleWeaponDamage(userId, myPower, monsterPower, user.weapon_name, user.level, env);
              
              return jsonResponse({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: { 
                  content: `💀 **패배...**\n**${username}** (${user.weapon_name} +${user.level}강): ${myPower} 전투력\n**몬스터** (레벨 ${monsterLevel} ${diffText}): ${monsterPower} 전투력\n\n도망쳤습니다.${weaponDamage.message}${weaponDamage.destroyed || weaponDamage.damaged ? `\n\n현재 무기: ${weaponDamage.updatedWeaponName} +${weaponDamage.updatedLevel}강` : ''}`,
                  components: [{
                    type: 1,
                    components: [
                      { type: 2, style: 3, label: '⚔️ 다시 전투', custom_id: 'battle_button' },
                      { type: 2, style: 1, label: '✨ 강화', custom_id: 'enhance_button' }
                    ]
                  }]
                }
              });
            }
          }
          
          // opponent는 이미 랜덤으로 선택됨
          const opponentPower = calculatePower(opponent.level || 0);
          const myPower = calculatePower(user.level);
          
          if (myPower > opponentPower) {
            const reward = 2000;
            await env.game_db.prepare("UPDATE users SET money = money + ?, wins = wins + 1 WHERE id = ?").bind(reward, userId).run();
            
            // 승리 시 상대방 무기 손상/파괴 처리 (전투력 차이에 따라)
            const opponentWeaponDamage = await handleWeaponDamage(opponent.id, opponentPower, myPower, opponent.weapon_name || '나무 검', opponent.level || 0, env);
            
            return jsonResponse({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: { 
                content: `⚔️ **${username}님의 승리!**\n\n**${username}** (${user.weapon_name} +${user.level}강): ${myPower} 전투력\n**${opponent.username}** (${opponent.weapon_name || '무기 없음'} +${opponent.level || 0}강): ${opponentPower} 전투력\n\n💰 2,000원을 획득했습니다!${opponentWeaponDamage.message ? `\n\n🎯 **상대방 피해:**${opponentWeaponDamage.message.replace('\n\n', '\n')}` : ''}`,
                components: [{
                  type: 1,
                  components: [
                    { type: 2, style: 3, label: '⚔️ 다시 전투', custom_id: 'battle_button' },
                    { type: 2, style: 1, label: '✨ 강화', custom_id: 'enhance_button' }
                  ]
                }]
              }
            });
          } else {
            const penalty = 500;
            const finalMoney = Math.max(0, user.money - penalty);
            await env.game_db.prepare("UPDATE users SET money = ? WHERE id = ?").bind(finalMoney, userId).run();
            
            // 무기 손상/파괴 처리
            const weaponDamage = await handleWeaponDamage(userId, myPower, opponentPower, user.weapon_name, user.level, env);
            
            return jsonResponse({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: { 
                content: `💀 **${username}님의 패배...**\n\n**${username}** (${user.weapon_name} +${user.level}강): ${myPower} 전투력\n**${opponent.username}** (${opponent.weapon_name || '무기 없음'} +${opponent.level || 0}강): ${opponentPower} 전투력\n\n💸 ${penalty}원을 잃었습니다.${weaponDamage.message}${weaponDamage.destroyed || weaponDamage.damaged ? `\n\n현재 무기: ${weaponDamage.updatedWeaponName} +${weaponDamage.updatedLevel}강` : ''}`,
                components: [{
                  type: 1,
                  components: [
                    { type: 2, style: 3, label: '⚔️ 다시 전투', custom_id: 'battle_button' },
                    { type: 2, style: 1, label: '✨ 강화', custom_id: 'enhance_button' }
                  ]
                }]
              }
            });
          }
        } else {
          // 몬스터와 배틀
          const monsterLevel = generateMonsterLevel(user.level);
          const monsterPower = Math.floor(Math.random() * (monsterLevel * 5 + 50));
          const myPower = calculatePower(user.level);
          
          if (myPower > monsterPower) {
            const reward = calculateReward(user.level, monsterLevel);
            await env.game_db.prepare("UPDATE users SET money = money + ?, wins = wins + 1 WHERE id = ?").bind(reward, userId).run();
            const levelDiff = monsterLevel - user.level;
            const diffText = levelDiff > 0 ? `(+${levelDiff}강)` : levelDiff < 0 ? `(${levelDiff}강)` : '(동일)';
            return jsonResponse({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: { 
                content: `⚔️ **${username}님의 승리!**\n\n**${username}** (${user.weapon_name} +${user.level}강): ${myPower} 전투력\n**몬스터** (레벨 ${monsterLevel} ${diffText}): ${monsterPower} 전투력\n\n💰 ${reward.toLocaleString()}원을 획득했습니다!`,
                components: [{
                  type: 1,
                  components: [
                    { type: 2, style: 3, label: '⚔️ 다시 전투', custom_id: 'battle_button' },
                    { type: 2, style: 1, label: '✨ 강화', custom_id: 'enhance_button' }
                  ]
                }]
              }
            });
          } else {
            const levelDiff = monsterLevel - user.level;
            const diffText = levelDiff > 0 ? `(+${levelDiff}강)` : levelDiff < 0 ? `(${levelDiff}강)` : '(동일)';
            
            // 무기 손상/파괴 처리 (최적화: user 정보 전달하여 중복 쿼리 제거)
            const weaponDamage = await handleWeaponDamage(userId, myPower, monsterPower, user.weapon_name, user.level, env);
            
            return jsonResponse({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: { 
                content: `💀 **${username}님의 패배...**\n\n**${username}** (${user.weapon_name} +${user.level}강): ${myPower} 전투력\n**몬스터** (레벨 ${monsterLevel} ${diffText}): ${monsterPower} 전투력\n\n도망쳤습니다.${weaponDamage.message}${weaponDamage.destroyed || weaponDamage.damaged ? `\n\n현재 무기: ${weaponDamage.updatedWeaponName} +${weaponDamage.updatedLevel}강` : ''}`,
                components: [{
                  type: 1,
                  components: [
                    { type: 2, style: 3, label: '⚔️ 다시 전투', custom_id: 'battle_button' },
                    { type: 2, style: 1, label: '✨ 강화', custom_id: 'enhance_button' }
                  ]
                }]
              }
            });
          }
        }
      }

      // 특정 유저와 다시 배틀 버튼 처리
      if (customId && customId.startsWith('battle_user_')) {
        const targetUserId = customId.replace('battle_user_', '');
        
        // 자기 자신과는 배틀 불가
        if (String(targetUserId) === String(userId)) {
          return jsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: '❌ 자기 자신과는 배틀할 수 없습니다! 상대방만 "다시 전투" 버튼을 사용할 수 있습니다.', flags: 64 }
          });
        }
        
        let user = await env.game_db.prepare("SELECT level, money, weapon_name FROM users WHERE id = ?").bind(userId).first();
        if (!user) {
          const newWeapon = generateRandomWeapon();
          await env.game_db.prepare("INSERT INTO users (id, username, weapon_name) VALUES (?, ?, ?)").bind(userId, username, newWeapon.name).run();
          user = { level: 0, money: 200000, weapon_name: newWeapon.name };
        }
        
        const targetUser = await env.game_db.prepare("SELECT id, username, level, weapon_name FROM users WHERE id = ?").bind(targetUserId).first();
        
        if (!targetUser) {
          return jsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: '❌ 상대방이 게임에서 탈퇴했습니다.', flags: 64 }
          });
        }
        
        const opponentPower = calculatePower(targetUser.level || 0);
        const myPower = calculatePower(user.level);
        
        if (myPower > opponentPower) {
          const reward = 2000;
          await env.game_db.prepare("UPDATE users SET money = money + ?, wins = wins + 1 WHERE id = ?").bind(reward, userId).run();
          
          const opponentWeaponDamage = await handleWeaponDamage(targetUser.id, opponentPower, myPower, targetUser.weapon_name || '나무 검', targetUser.level || 0, env);
          
          return jsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { 
              content: `⚔️ **${username}님의 승리!**\n\n**${username}** (${user.weapon_name} +${user.level}강): ${myPower} 전투력\n**${targetUser.username}** (${targetUser.weapon_name || '무기 없음'} +${targetUser.level || 0}강): ${opponentPower} 전투력\n\n💰 2,000원을 획득했습니다!${opponentWeaponDamage.message ? `\n\n🎯 **상대방 피해:**${opponentWeaponDamage.message.replace('\n\n', '\n')}` : ''}`,
              components: [{
                type: 1,
                components: [
                  { type: 2, style: 3, label: '⚔️ 다시 전투', custom_id: `battle_user_${targetUserId}` },
                  { type: 2, style: 1, label: '✨ 강화', custom_id: 'enhance_button' }
                ]
              }]
            }
          });
        } else {
          const penalty = 500;
          const finalMoney = Math.max(0, user.money - penalty);
          await env.game_db.prepare("UPDATE users SET money = ? WHERE id = ?").bind(finalMoney, userId).run();
          
          const weaponDamage = await handleWeaponDamage(userId, myPower, opponentPower, user.weapon_name, user.level, env);
          
          return jsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { 
              content: `💀 **${username}님의 패배...**\n\n**${username}** (${user.weapon_name} +${user.level}강): ${myPower} 전투력\n**${targetUser.username}** (${targetUser.weapon_name || '무기 없음'} +${targetUser.level || 0}강): ${opponentPower} 전투력\n\n💸 ${penalty}원을 잃었습니다.${weaponDamage.message}${weaponDamage.destroyed || weaponDamage.damaged ? `\n\n현재 무기: ${weaponDamage.updatedWeaponName} +${weaponDamage.updatedLevel}강` : ''}`,
              components: [{
                type: 1,
                components: [
                  { type: 2, style: 3, label: '⚔️ 다시 전투', custom_id: `battle_user_${targetUserId}` },
                  { type: 2, style: 1, label: '✨ 강화', custom_id: 'enhance_button' }
                ]
              }]
            }
          });
        }
      }

      // 강화 버튼 처리 (다시 강화)
      if (customId && customId.startsWith('enhance_')) {
        // 필요한 컬럼만 선택하여 최적화
        let user = await env.game_db.prepare("SELECT level, money, weapon_name FROM users WHERE id = ?").bind(userId).first();
        if (!user) {
          const newWeapon = generateRandomWeapon();
          await env.game_db.prepare("INSERT INTO users (id, username, weapon_name) VALUES (?, ?, ?)").bind(userId, username, newWeapon.name).run();
          user = { level: 0, money: 200000, weapon_name: newWeapon.name };
        }
        // 무기 이름이 없으면 랜덤 생성
        if (!user.weapon_name) {
          const newWeapon = generateRandomWeapon();
          await env.game_db.prepare("UPDATE users SET weapon_name = ? WHERE id = ?").bind(newWeapon.name, userId).run();
          user.weapon_name = newWeapon.name;
        }

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
        const destroyRate = Math.min(30, user.level * 2);
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
            description: `⚔️ ${user.weapon_name} +${user.level}강 ➡️ +${user.level + 1}강\n💰 사용 금액: ${cost.toLocaleString()}원\n💵 남은 돈: ${remainingMoney.toLocaleString()}원\n\n📊 강화 확률:\n✅ 성공: ${successRate}%\n❌ 실패: ${failRate}%\n💥 파괴: ${destroyRate}%`,
            color: 0x00ff00
          };
          
          const imageUrl = getWeaponImageUrl(user.weapon_name, r2PublicUrl, request.url);
          if (imageUrl) {
            embedData.image = { url: imageUrl };
          }
          
          const response = jsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { 
              embeds: [embedData],
              components: [{
                type: 1,
                components: [{
                  type: 2,
                  style: 3,
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
          const newWeapon = generateRandomWeapon();
          const newWeaponDesc = getWeaponDescription(newWeapon.name);
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
            description: `⚔️ ${user.weapon_name} +${user.level}강이 파괴되었습니다!\n💰 사용 금액: ${cost.toLocaleString()}원\n💵 남은 돈: ${remainingMoney.toLocaleString()}원\n🎁 새 무기 획득: ${newWeapon.name} +0강\n📝 ${newWeaponDesc}\n\n📊 강화 확률:\n✅ 성공: ${successRate}%\n❌ 실패: ${failRate}%\n💥 파괴: ${destroyRate}%`,
            color: 0xff0000
          };
          
          const imageUrl = getWeaponImageUrl(user.weapon_name, r2PublicUrl, request.url);
          if (imageUrl) {
            embedData.image = { url: imageUrl };
          }
          
          const response = jsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { 
              embeds: [embedData],
              components: [{
                type: 1,
                components: [
                  {
                    type: 2,
                    style: 2,
                    label: '🙏 묵념',
                    custom_id: `mourn_${userId}`
                  },
                  {
                    type: 2,
                    style: 3,
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
            description: `⚔️ ${user.weapon_name} +${user.level}강 (유지)\n💰 사용 금액: ${cost.toLocaleString()}원\n💵 남은 돈: ${remainingMoney.toLocaleString()}원\n\n📊 강화 확률:\n✅ 성공: ${successRate}%\n❌ 실패: ${failRate}%\n💥 파괴: ${destroyRate}%`,
            color: 0xffaa00
          };
          
          const imageUrl = getWeaponImageUrl(user.weapon_name, r2PublicUrl, request.url);
          if (imageUrl) {
            embedData.image = { url: imageUrl };
          }
          
          const response = jsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { 
              embeds: [embedData],
              components: [{
                type: 1,
                components: [{
                  type: 2,
                  style: 3,
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
    }

    // 4. 명령어 처리
    if (interaction.type === InteractionType.APPLICATION_COMMAND) {
      const { name } = interaction.data;
      const userId = interaction.member.user.id;
      const username = interaction.member.user.username;

      // 유저 데이터 가져오기 (없으면 생성) - 필요한 컬럼만 선택하여 최적화
      let user = await env.game_db.prepare("SELECT level, money, wins, last_daily, weapon_name FROM users WHERE id = ?").bind(userId).first();
      if (!user) {
        const newWeapon = generateRandomWeapon();
        await env.game_db.prepare("INSERT INTO users (id, username, weapon_name) VALUES (?, ?, ?)").bind(userId, username, newWeapon.name).run();
        user = { level: 0, money: 200000, wins: 0, last_daily: null, weapon_name: newWeapon.name };
      }
      // 무기 이름이 없으면 랜덤 생성
      if (!user.weapon_name) {
        const newWeapon = generateRandomWeapon();
        await env.game_db.prepare("UPDATE users SET weapon_name = ? WHERE id = ?").bind(newWeapon.name, userId).run();
        user.weapon_name = newWeapon.name;
      }

      // --- 명령어 로직 ---
      
      // [정보]
      if (name === '정보') {
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
              const newWeapon = generateRandomWeapon();
              await env.game_db.prepare("UPDATE users SET weapon_name = ? WHERE id = ?").bind(newWeapon.name, targetUserId).run();
              targetUser.weapon_name = newWeapon.name;
            }
          }
        }
        
        const sellPrice = getWeaponSellPrice(targetUser.weapon_name, targetUser.level);
        const weaponDesc = getWeaponDescription(targetUser.weapon_name);
        const weaponImageFilename = getWeaponImageFilename(targetUser.weapon_name);
        
        // Embed 데이터 구성
        const embedData = {
          title: `📊 ${targetUsername}님의 프로필`,
          description: `- ⚔️ 무기: ${targetUser.weapon_name} +${targetUser.level}강 (판매가: ${sellPrice.toLocaleString()}원)\n  📝 ${weaponDesc}\n- 💰 자금: ${targetUser.money.toLocaleString()}원\n- 🏆 승리: ${targetUser.wins}회`,
          color: 0x00ff00 // 초록색
        };
        
        // R2 Public URL 가져오기 (환경 변수 또는 기본값)
        const r2PublicUrl = env.R2_PUBLIC_URL || env.R2_IMAGE_BASE_URL;
        const imageUrl = getWeaponImageUrl(targetUser.weapon_name, r2PublicUrl, request.url);
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

      // [출석]
      if (name === '출석') {
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

      // [강화]
      if (name === '강화') {
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
        const destroyRate = Math.min(30, user.level * 2); // 터질 확률 (최대 30%)
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
            description: `⚔️ ${user.weapon_name} +${user.level}강 ➡️ +${user.level + 1}강\n💰 사용 금액: ${cost.toLocaleString()}원\n💵 남은 돈: ${remainingMoney.toLocaleString()}원\n\n📊 강화 확률:\n✅ 성공: ${successRate}%\n❌ 실패: ${failRate}%\n💥 파괴: ${destroyRate}%`,
            color: 0x00ff00 // 초록색
          };
          
          const imageUrl = getWeaponImageUrl(user.weapon_name, r2PublicUrl, request.url);
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
            const newWeapon = generateRandomWeapon();
            const newWeaponDesc = getWeaponDescription(newWeapon.name);
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
              description: `⚔️ ${user.weapon_name} +${user.level}강이 파괴되었습니다!\n💰 사용 금액: ${cost.toLocaleString()}원\n💵 남은 돈: ${remainingMoney.toLocaleString()}원\n🎁 새 무기 획득: ${newWeapon.name} +0강\n📝 ${newWeaponDesc}\n\n📊 강화 확률:\n✅ 성공: ${successRate}%\n❌ 실패: ${failRate}%\n💥 파괴: ${destroyRate}%`,
              color: 0xff0000 // 빨간색
            };
            
            // 파괴된 무기 이미지 표시
            const r2PublicUrlDestroyed = env.R2_PUBLIC_URL || env.R2_IMAGE_BASE_URL;
            const imageUrl = getWeaponImageUrl(user.weapon_name, r2PublicUrlDestroyed, request.url);
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
              ctx, env, 'destroyed', user.weapon_name, user.level, username,
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
              description: `⚔️ ${user.weapon_name} +${user.level}강 (유지)\n💰 사용 금액: ${cost.toLocaleString()}원\n💵 남은 돈: ${remainingMoney.toLocaleString()}원\n\n📊 강화 확률:\n✅ 성공: ${successRate}%\n❌ 실패: ${failRate}%\n💥 파괴: ${destroyRate}%`,
              color: 0xffaa00 // 주황색
            };
            
            const imageUrl = getWeaponImageUrl(user.weapon_name, r2PublicUrl, request.url);
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
              ctx, env, 'failure', user.weapon_name, user.level, username,
              embedData, interaction.token, interaction.application_id || env.DISCORD_APPLICATION_ID,
              [{ type: 1, components: [{ type: 2, style: 3, label: '✨ 다시 강화', custom_id: 'enhance_button' }] }]
            );
          
          return response;
        }
      }

      // [배틀]
      if (name === '배틀') {
        // 옵션에서 상대방 지정 확인
        const targetOption = interaction.data.options?.find(opt => opt.name === '상대');
        const targetUserId = targetOption?.value;
        
        // 특정 유저 지정 시 해당 유저와 배틀
        if (targetUserId) {
          // 자기 자신과는 배틀 불가 (문자열로 변환하여 비교)
          if (String(targetUserId) === String(userId)) {
            return jsonResponse({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: { content: '❌ 자기 자신과는 배틀할 수 없습니다!', flags: 64 }
            });
          }
          
          const targetUser = await env.game_db.prepare("SELECT id, username, level, weapon_name FROM users WHERE id = ?").bind(targetUserId).first();
          
          if (!targetUser) {
            return jsonResponse({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: { content: '❌ 해당 유저가 게임에 등록되어 있지 않습니다!\n`/정보` 명령어로 먼저 등록해주세요.', flags: 64 }
            });
          }
          
          // 지정된 유저와 배틀
          const opponentPower = calculatePower(targetUser.level || 0);
          const myPower = calculatePower(user.level);
          
          if (myPower > opponentPower) {
            const reward = 2000;
            await env.game_db.prepare("UPDATE users SET money = money + ?, wins = wins + 1 WHERE id = ?").bind(reward, userId).run();
            
            // 승리 시 상대방 무기 손상/파괴 처리
            const opponentWeaponDamage = await handleWeaponDamage(targetUser.id, opponentPower, myPower, targetUser.weapon_name || '나무 검', targetUser.level || 0, env);
            
            return jsonResponse({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: { 
                content: `⚔️ **${username}님의 승리!**\n\n**${username}** (${user.weapon_name} +${user.level}강): ${myPower} 전투력\n**${targetUser.username}** (${targetUser.weapon_name || '무기 없음'} +${targetUser.level || 0}강): ${opponentPower} 전투력\n\n💰 2,000원을 획득했습니다!${opponentWeaponDamage.message ? `\n\n🎯 **상대방 피해:**${opponentWeaponDamage.message.replace('\n\n', '\n')}` : ''}`,
                components: [{
                  type: 1,
                  components: [
                    { type: 2, style: 3, label: '⚔️ 다시 전투', custom_id: `battle_user_${targetUserId}` },
                    { type: 2, style: 1, label: '✨ 강화', custom_id: 'enhance_button' }
                  ]
                }]
              }
            });
          } else {
            const penalty = 500;
            const finalMoney = Math.max(0, user.money - penalty);
            await env.game_db.prepare("UPDATE users SET money = ? WHERE id = ?").bind(finalMoney, userId).run();
            
            // 무기 손상/파괴 처리
            const weaponDamage = await handleWeaponDamage(userId, myPower, opponentPower, user.weapon_name, user.level, env);
            
            return jsonResponse({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: { 
                content: `💀 **${username}님의 패배...**\n\n**${username}** (${user.weapon_name} +${user.level}강): ${myPower} 전투력\n**${targetUser.username}** (${targetUser.weapon_name || '무기 없음'} +${targetUser.level || 0}강): ${opponentPower} 전투력\n\n💸 ${penalty}원을 잃었습니다.${weaponDamage.message}${weaponDamage.destroyed || weaponDamage.damaged ? `\n\n현재 무기: ${weaponDamage.updatedWeaponName} +${weaponDamage.updatedLevel}강` : ''}`,
                components: [{
                  type: 1,
                  components: [
                    { type: 2, style: 3, label: '⚔️ 다시 전투', custom_id: `battle_user_${targetUserId}` },
                    { type: 2, style: 1, label: '✨ 강화', custom_id: 'enhance_button' }
                  ]
                }]
              }
            });
          }
        }
        
        // 상대 미지정 시 랜덤하게 몬스터 또는 유저와 배틀 (50% 확률)
        const isVsUser = Math.random() < 0.5;
        
        if (isVsUser) {
          // 다른 유저와 배틀 (랜덤)
          const opponent = await env.game_db.prepare("SELECT id, username, level, weapon_name FROM users WHERE id != ? ORDER BY RANDOM() LIMIT 1").bind(userId).first();
          
          if (!opponent) {
            // 다른 유저가 없으면 몬스터와 배틀
            const monsterLevel = generateMonsterLevel(user.level);
            const monsterPower = Math.floor(Math.random() * (monsterLevel * 5 + 50));
            const myPower = calculatePower(user.level);
            
            if (myPower > monsterPower) {
              const reward = calculateReward(user.level, monsterLevel);
              await env.game_db.prepare("UPDATE users SET money = money + ?, wins = wins + 1 WHERE id = ?").bind(reward, userId).run();
              const levelDiff = monsterLevel - user.level;
              const diffText = levelDiff > 0 ? `(+${levelDiff}강)` : levelDiff < 0 ? `(${levelDiff}강)` : '(동일)';
              return jsonResponse({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: { 
                  content: `⚔️ **승리!**\n**${username}** (${user.weapon_name} +${user.level}강): ${myPower} 전투력\n**몬스터** (레벨 ${monsterLevel} ${diffText}): ${monsterPower} 전투력\n\n💰 ${reward.toLocaleString()}원을 획득했습니다!`,
                  components: [{
                    type: 1,
                    components: [
                      { type: 2, style: 3, label: '⚔️ 다시 전투', custom_id: 'battle_button' },
                      { type: 2, style: 1, label: '✨ 강화', custom_id: 'enhance_button' }
                    ]
                  }]
                }
              });
            } else {
              const levelDiff = monsterLevel - user.level;
              const diffText = levelDiff > 0 ? `(+${levelDiff}강)` : levelDiff < 0 ? `(${levelDiff}강)` : '(동일)';
              
              // 무기 손상/파괴 처리
              const weaponDamage = await handleWeaponDamage(userId, myPower, monsterPower, user.weapon_name, user.level, env);
              
              return jsonResponse({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: { 
                  content: `💀 **패배...**\n**${username}** (${user.weapon_name} +${user.level}강): ${myPower} 전투력\n**몬스터** (레벨 ${monsterLevel} ${diffText}): ${monsterPower} 전투력\n\n도망쳤습니다.${weaponDamage.message}${weaponDamage.destroyed || weaponDamage.damaged ? `\n\n현재 무기: ${weaponDamage.updatedWeaponName} +${weaponDamage.updatedLevel}강` : ''}`,
                  components: [{
                    type: 1,
                    components: [
                      { type: 2, style: 3, label: '⚔️ 다시 전투', custom_id: 'battle_button' },
                      { type: 2, style: 1, label: '✨ 강화', custom_id: 'enhance_button' }
                    ]
                  }]
                }
              });
            }
          }
          
          // opponent는 이미 랜덤으로 선택됨
          const opponentPower = calculatePower(opponent.level || 0);
          const myPower = calculatePower(user.level);
          
          if (myPower > opponentPower) {
            const reward = 2000; // 유저와 배틀 승리 시 더 많은 보상
            await env.game_db.prepare("UPDATE users SET money = money + ?, wins = wins + 1 WHERE id = ?").bind(reward, userId).run();
            
            // 승리 시 상대방 무기 손상/파괴 처리 (전투력 차이에 따라)
            const opponentWeaponDamage = await handleWeaponDamage(opponent.id, opponentPower, myPower, opponent.weapon_name || '나무 검', opponent.level || 0, env);
            
            return jsonResponse({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: { 
                content: `⚔️ **${username}님의 승리!**\n\n**${username}** (${user.weapon_name} +${user.level}강): ${myPower} 전투력\n**${opponent.username}** (${opponent.weapon_name || '무기 없음'} +${opponent.level || 0}강): ${opponentPower} 전투력\n\n💰 2,000원을 획득했습니다!${opponentWeaponDamage.message ? `\n\n🎯 **상대방 피해:**${opponentWeaponDamage.message.replace('\n\n', '\n')}` : ''}`,
                components: [{
                  type: 1,
                  components: [
                    { type: 2, style: 3, label: '⚔️ 다시 전투', custom_id: 'battle_button' },
                    { type: 2, style: 1, label: '✨ 강화', custom_id: 'enhance_button' }
                  ]
                }]
              }
            });
          } else {
            const penalty = 500; // 패배 시 패널티
            const finalMoney = Math.max(0, user.money - penalty);
            await env.game_db.prepare("UPDATE users SET money = ? WHERE id = ?").bind(finalMoney, userId).run();
            
            // 무기 손상/파괴 처리 (최적화: user 정보 전달하여 중복 쿼리 제거)
            const weaponDamage = await handleWeaponDamage(userId, myPower, opponentPower, user.weapon_name, user.level, env);
            
            return jsonResponse({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: { 
                content: `💀 **${username}님의 패배...**\n\n**${username}** (${user.weapon_name} +${user.level}강): ${myPower} 전투력\n**${opponent.username}** (${opponent.weapon_name || '무기 없음'} +${opponent.level || 0}강): ${opponentPower} 전투력\n\n💸 ${penalty}원을 잃었습니다.${weaponDamage.message}${weaponDamage.destroyed || weaponDamage.damaged ? `\n\n현재 무기: ${weaponDamage.updatedWeaponName} +${weaponDamage.updatedLevel}강` : ''}`,
                components: [{
                  type: 1,
                  components: [
                    { type: 2, style: 3, label: '⚔️ 다시 전투', custom_id: 'battle_button' },
                    { type: 2, style: 1, label: '✨ 강화', custom_id: 'enhance_button' }
                  ]
                }]
              }
            });
          }
        } else {
          // 몬스터와 배틀
          const monsterLevel = generateMonsterLevel(user.level);
          const monsterPower = Math.floor(Math.random() * (monsterLevel * 5 + 50));
          const myPower = calculatePower(user.level);
          
          if (myPower > monsterPower) {
            const reward = calculateReward(user.level, monsterLevel);
            await env.game_db.prepare("UPDATE users SET money = money + ?, wins = wins + 1 WHERE id = ?").bind(reward, userId).run();
            const levelDiff = monsterLevel - user.level;
            const diffText = levelDiff > 0 ? `(+${levelDiff}강)` : levelDiff < 0 ? `(${levelDiff}강)` : '(동일)';
            return jsonResponse({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: { 
                content: `⚔️ **${username}님의 승리!**\n\n**${username}** (${user.weapon_name} +${user.level}강): ${myPower} 전투력\n**몬스터** (레벨 ${monsterLevel} ${diffText}): ${monsterPower} 전투력\n\n💰 ${reward.toLocaleString()}원을 획득했습니다!`,
                components: [{
                  type: 1,
                  components: [
                    { type: 2, style: 3, label: '⚔️ 다시 전투', custom_id: 'battle_button' },
                    { type: 2, style: 1, label: '✨ 강화', custom_id: 'enhance_button' }
                  ]
                }]
              }
            });
          } else {
            const levelDiff = monsterLevel - user.level;
            const diffText = levelDiff > 0 ? `(+${levelDiff}강)` : levelDiff < 0 ? `(${levelDiff}강)` : '(동일)';
            
            // 무기 손상/파괴 처리 (최적화: user 정보 전달하여 중복 쿼리 제거)
            const weaponDamage = await handleWeaponDamage(userId, myPower, monsterPower, user.weapon_name, user.level, env);
            
            return jsonResponse({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: { 
                content: `💀 **${username}님의 패배...**\n\n**${username}** (${user.weapon_name} +${user.level}강): ${myPower} 전투력\n**몬스터** (레벨 ${monsterLevel} ${diffText}): ${monsterPower} 전투력\n\n도망쳤습니다.${weaponDamage.message}${weaponDamage.destroyed || weaponDamage.damaged ? `\n\n현재 무기: ${weaponDamage.updatedWeaponName} +${weaponDamage.updatedLevel}강` : ''}`,
                components: [{
                  type: 1,
                  components: [
                    { type: 2, style: 3, label: '⚔️ 다시 전투', custom_id: 'battle_button' },
                    { type: 2, style: 1, label: '✨ 강화', custom_id: 'enhance_button' }
                  ]
                }]
              }
            });
          }
        }
      }

      // [묵념]
      if (name === '묵념') {
        const found = Math.floor(Math.random() * 100) + 10;
        await env.game_db.prepare("UPDATE users SET money = money + ? WHERE id = ?").bind(found, userId).run();
        return jsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: `🙏 마음을 비우고 바닥에서 ${found}원을 주웠습니다.` }
        });
      }

      // [판매]
      if (name === '판매') {
        const sellPrice = getWeaponSellPrice(user.weapon_name, user.level);
        const newWeapon = generateRandomWeapon();
        await env.game_db.prepare("UPDATE users SET money = money + ?, level = 0, weapon_name = ? WHERE id = ?").bind(sellPrice, newWeapon.name, userId).run();
        const newWeaponDesc = getWeaponDescription(newWeapon.name);
        return jsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: `💰 **${username}님의 무기 판매 완료!**\n⚔️ ${user.weapon_name} +${user.level}강을 ${sellPrice.toLocaleString()}원에 판매했습니다.\n💵 현재 자금: ${(user.money + sellPrice).toLocaleString()}원\n🎁 새 무기 획득: ${newWeapon.name} +0강\n📝 ${newWeaponDesc}` }
        });
      }

      // [랭킹]
      if (name === '랭킹') {
        const { results } = await env.game_db.prepare("SELECT username, level, money FROM users ORDER BY level DESC, money DESC LIMIT 5").all();
        const rankText = results.map((u, i) => `${i + 1}위: **${u.username}** (+${u.level}강 | ${u.money.toLocaleString()}원)`).join('\n');
        return jsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: `🏆 **서버 랭킹 TOP 5**\n\n${rankText}` }
        });
      }

      // [파산]
      if (name === '파산') {
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
    }

    return new Response('Unknown Command', { status: 404 });
  },
};

// 헬퍼 함수: JSON 응답 생성
function jsonResponse(body) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 
      'Content-Type': 'application/json'
    },
  });
}