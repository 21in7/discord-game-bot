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

// 무기 판매 가격 계산 (기본 가격 + 강화 레벨 * 100)
function getWeaponSellPrice(weaponName, level) {
  const weapon = WEAPONS.find(w => w.name === weaponName);
  if (!weapon) return 0;
  return weapon.basePrice + (level * 100);
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
	'미스릴 지팡이': 'mithril_staff',
	'다이아몬드 검': 'diamond_sword',
	'다이아몬드 도끼': 'diamond_axe',
	'다이아몬드 지팡이': 'diamond_staff',
	'드래곤 슬레이어': 'dragon_slayer',
	'드래곤 도끼': 'dragon_axe',
	'드래곤 지팡이': 'dragon_staff',
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

// 몬스터 레벨 생성 (플레이어 레벨 기준으로 랜덤 생성)
function generateMonsterLevel(playerLevel) {
  // 플레이어 레벨의 -5 ~ +10 범위로 몬스터 레벨 생성
  const minLevel = Math.max(0, playerLevel - 5);
  const maxLevel = playerLevel + 10;
  return Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;
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
    // GET 요청 처리 (이미지 파일 서빙)
    if (request.method === 'GET') {
      const url = new URL(request.url);
      const pathname = url.pathname;
      
      // 이미지 파일 요청 처리
      if (pathname.startsWith('/image/')) {
        const filename = pathname.replace('/image/', '');
        
        // 모든 무기의 이미지 파일명 생성하여 확인
        const allWeaponImageFilenames = WEAPONS.map(weapon => 
          weaponNameToImageFilename(weapon.name)
        ).filter(Boolean); // null 제거
        
        // 요청한 파일명이 무기 이미지 파일명 목록에 있는지 확인
        if (allWeaponImageFilenames.includes(filename) && env.ASSETS) {
          try {
            // Static Assets는 루트 경로에서 파일을 찾으므로 파일명만 사용
            const file = await env.ASSETS.fetch(new URL(`/${filename}`, request.url));
            if (file && file.status === 200) {
              return file;
            }
          } catch (e) {
            console.error('Image fetch error:', e);
          }
        }
      }
      
      return new Response('Not found', { status: 404 });
    }
    
    // POST 요청만 처리 (Discord는 POST만 사용)
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // 1. 디스코드 요청 서명 검증 (보안 필수)
    const signature = request.headers.get('x-signature-ed25519');
    const timestamp = request.headers.get('x-signature-timestamp');
    
    // 서명 헤더가 없으면 401 반환
    if (!signature || !timestamp) {
      console.error('Missing signature headers', { signature: !!signature, timestamp: !!timestamp });
      return new Response('Missing signature headers', { 
        status: 401,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    const body = await request.text();
    
    // 공개 키가 없으면 500 반환
    if (!env.DISCORD_PUBLIC_KEY) {
      console.error('DISCORD_PUBLIC_KEY is not set');
      return new Response('Server configuration error', { 
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    const isValidRequest = await verifyKey(body, signature, timestamp, env.DISCORD_PUBLIC_KEY);

    if (!isValidRequest) {
      return new Response('Bad request signature', { 
        status: 401,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    let interaction;
    try {
      interaction = JSON.parse(body);
    } catch (e) {
      return new Response('Invalid JSON', { 
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      });
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
        // 유저 데이터 가져오기 (없으면 생성)
        let user = await env.game_db.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first();
        if (!user) {
          const newWeapon = generateRandomWeapon();
          await env.game_db.prepare("INSERT INTO users (id, username, weapon_name) VALUES (?, ?, ?)").bind(userId, username, newWeapon.name).run();
          user = { id: userId, username: username, level: 0, money: 1000, wins: 0, last_daily: null, weapon_name: newWeapon.name };
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

      // 강화 버튼 처리 (다시 강화)
      if (customId && customId.startsWith('enhance_')) {
        // 유저 데이터 가져오기 (없으면 생성)
        let user = await env.game_db.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first();
        if (!user) {
          const newWeapon = generateRandomWeapon();
          await env.game_db.prepare("INSERT INTO users (id, username, weapon_name) VALUES (?, ?, ?)").bind(userId, username, newWeapon.name).run();
          user = { id: userId, username: username, level: 0, money: 1000, wins: 0, last_daily: null, weapon_name: newWeapon.name };
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
        
        const successRate = Math.max(10, 100 - (user.level * 5));
        const destroyRate = Math.min(30, user.level * 2);
        const random = Math.random() * 100;
        const isSuccess = random < successRate;
        const isDestroyed = !isSuccess && random < (successRate + destroyRate);
        const remainingMoney = user.money - cost;

        // 무기 이미지 URL 생성 헬퍼 함수
        const getWeaponImageUrl = (weaponName) => {
          const weaponImageFilename = getWeaponImageFilename(weaponName);
          if (weaponImageFilename) {
            const baseUrl = new URL(request.url);
            return `${baseUrl.origin}/image/${weaponImageFilename}`;
          }
          return null;
        };

        if (isSuccess) {
          await env.game_db.prepare("UPDATE users SET level = level + 1, money = money - ? WHERE id = ?").bind(cost, userId).run();
          
          const embedData = {
            title: `✨ ${username}님의 강화 성공!`,
            description: `⚔️ ${user.weapon_name} +${user.level}강 ➡️ +${user.level + 1}강\n💰 사용 금액: ${cost.toLocaleString()}원\n💵 남은 돈: ${remainingMoney.toLocaleString()}원`,
            color: 0x00ff00
          };
          
          const imageUrl = getWeaponImageUrl(user.weapon_name);
          if (imageUrl) {
            embedData.image = { url: imageUrl };
          }
          
          return jsonResponse({
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
        } else if (isDestroyed) {
          const newWeapon = generateRandomWeapon();
          const newWeaponDesc = getWeaponDescription(newWeapon.name);
          await env.game_db.prepare("UPDATE users SET level = 0, money = money - ?, weapon_name = ? WHERE id = ?").bind(cost, newWeapon.name, userId).run();
          
          const embedData = {
            title: `💥 ${username}님의 무기 파괴!`,
            description: `⚔️ ${user.weapon_name} +${user.level}강이 파괴되었습니다!\n💰 사용 금액: ${cost.toLocaleString()}원\n💵 남은 돈: ${remainingMoney.toLocaleString()}원\n🎁 새 무기 획득: ${newWeapon.name} +0강\n📝 ${newWeaponDesc}`,
            color: 0xff0000
          };
          
          const imageUrl = getWeaponImageUrl(user.weapon_name);
          if (imageUrl) {
            embedData.image = { url: imageUrl };
          }
          
          return jsonResponse({
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
        } else {
          await env.game_db.prepare("UPDATE users SET money = money - ? WHERE id = ?").bind(cost, userId).run();
          
          const embedData = {
            title: `❌ ${username}님의 강화 실패...`,
            description: `⚔️ ${user.weapon_name} +${user.level}강 (유지)\n💰 사용 금액: ${cost.toLocaleString()}원\n💵 남은 돈: ${remainingMoney.toLocaleString()}원\n⚠️ 터질 확률: ${destroyRate}%`,
            color: 0xffaa00
          };
          
          const imageUrl = getWeaponImageUrl(user.weapon_name);
          if (imageUrl) {
            embedData.image = { url: imageUrl };
          }
          
          return jsonResponse({
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
        }
      }
    }

    // 4. 명령어 처리
    if (interaction.type === InteractionType.APPLICATION_COMMAND) {
      const { name } = interaction.data;
      const userId = interaction.member.user.id;
      const username = interaction.member.user.username;

      // 유저 데이터 가져오기 (없으면 생성)
      let user = await env.game_db.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first();
      if (!user) {
        const newWeapon = generateRandomWeapon();
        await env.game_db.prepare("INSERT INTO users (id, username, weapon_name) VALUES (?, ?, ?)").bind(userId, username, newWeapon.name).run();
        user = { id: userId, username: username, level: 0, money: 1000, wins: 0, last_daily: null, weapon_name: newWeapon.name };
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
        const sellPrice = getWeaponSellPrice(user.weapon_name, user.level);
        const weaponDesc = getWeaponDescription(user.weapon_name);
        const weaponImageFilename = getWeaponImageFilename(user.weapon_name);
        
        // Embed 데이터 구성
        const embedData = {
          title: `📊 ${username}님의 프로필`,
          description: `- ⚔️ 무기: ${user.weapon_name} +${user.level}강 (판매가: ${sellPrice.toLocaleString()}원)\n  📝 ${weaponDesc}\n- 💰 자금: ${user.money.toLocaleString()}원\n- 🏆 승리: ${user.wins}회`,
          color: 0x00ff00 // 초록색
        };
        
        // 무기 이미지가 있으면 추가
        if (weaponImageFilename) {
          // Worker의 실제 URL 생성 (request.url의 origin 사용)
          const baseUrl = new URL(request.url);
          const imageUrl = `${baseUrl.origin}/image/${weaponImageFilename}`;
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
        
        const successRate = Math.max(10, 100 - (user.level * 5));
        const destroyRate = Math.min(30, user.level * 2); // 터질 확률 (최대 30%)
        const random = Math.random() * 100;
        const isSuccess = random < successRate;
        const isDestroyed = !isSuccess && random < (successRate + destroyRate);
        const remainingMoney = user.money - cost;

        // 무기 이미지 URL 생성 헬퍼 함수
        const getWeaponImageUrl = (weaponName) => {
          const weaponImageFilename = getWeaponImageFilename(weaponName);
          if (weaponImageFilename) {
            const baseUrl = new URL(request.url);
            return `${baseUrl.origin}/image/${weaponImageFilename}`;
          }
          return null;
        };

        if (isSuccess) {
            await env.game_db.prepare("UPDATE users SET level = level + 1, money = money - ? WHERE id = ?").bind(cost, userId).run();
            
            const embedData = {
              title: `✨ ${username}님의 강화 성공!`,
              description: `⚔️ ${user.weapon_name} +${user.level}강 ➡️ +${user.level + 1}강\n💰 사용 금액: ${cost.toLocaleString()}원\n💵 남은 돈: ${remainingMoney.toLocaleString()}원`,
              color: 0x00ff00 // 초록색
            };
            
            const imageUrl = getWeaponImageUrl(user.weapon_name);
            if (imageUrl) {
              embedData.image = { url: imageUrl };
            }
            
            return jsonResponse({
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
        } else if (isDestroyed) {
            // 무기 터짐 - 새 무기 생성
            const newWeapon = generateRandomWeapon();
            const newWeaponDesc = getWeaponDescription(newWeapon.name);
            await env.game_db.prepare("UPDATE users SET level = 0, money = money - ?, weapon_name = ? WHERE id = ?").bind(cost, newWeapon.name, userId).run();
            
            const embedData = {
              title: `💥 ${username}님의 무기 파괴!`,
              description: `⚔️ ${user.weapon_name} +${user.level}강이 파괴되었습니다!\n💰 사용 금액: ${cost.toLocaleString()}원\n💵 남은 돈: ${remainingMoney.toLocaleString()}원\n🎁 새 무기 획득: ${newWeapon.name} +0강\n📝 ${newWeaponDesc}`,
              color: 0xff0000 // 빨간색
            };
            
            // 파괴된 무기 이미지 표시
            const imageUrl = getWeaponImageUrl(user.weapon_name);
            if (imageUrl) {
              embedData.image = { url: imageUrl };
            }
            
            return jsonResponse({
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
        } else {
            await env.game_db.prepare("UPDATE users SET money = money - ? WHERE id = ?").bind(cost, userId).run();
            
            const embedData = {
              title: `❌ ${username}님의 강화 실패...`,
              description: `⚔️ ${user.weapon_name} +${user.level}강 (유지)\n💰 사용 금액: ${cost.toLocaleString()}원\n💵 남은 돈: ${remainingMoney.toLocaleString()}원\n⚠️ 터질 확률: ${destroyRate}%`,
              color: 0xffaa00 // 주황색
            };
            
            const imageUrl = getWeaponImageUrl(user.weapon_name);
            if (imageUrl) {
              embedData.image = { url: imageUrl };
            }
            
            return jsonResponse({
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
        }
      }

      // [배틀]
      if (name === '배틀') {
        // 랜덤하게 몬스터 또는 유저와 배틀 (50% 확률)
        const isVsUser = Math.random() < 0.5;
        
        if (isVsUser) {
          // 다른 유저와 배틀
          const { results: allUsers } = await env.game_db.prepare("SELECT * FROM users WHERE id != ?").bind(userId).all();
          
          if (allUsers.length === 0) {
            // 다른 유저가 없으면 몬스터와 배틀
            const monsterLevel = generateMonsterLevel(user.level);
            const monsterPower = Math.floor(Math.random() * (monsterLevel * 5 + 50));
            const myPower = Math.floor(Math.random() * (user.level * 10 + 30));
            
            if (myPower > monsterPower) {
              const reward = calculateReward(user.level, monsterLevel);
              await env.game_db.prepare("UPDATE users SET money = money + ?, wins = wins + 1 WHERE id = ?").bind(reward, userId).run();
              const levelDiff = monsterLevel - user.level;
              const diffText = levelDiff > 0 ? `(+${levelDiff}강)` : levelDiff < 0 ? `(${levelDiff}강)` : '(동일)';
              return jsonResponse({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: { content: `⚔️ **승리!**\n**${username}** (${user.weapon_name} +${user.level}강): ${myPower} 전투력\n**몬스터** (레벨 ${monsterLevel} ${diffText}): ${monsterPower} 전투력\n\n💰 ${reward.toLocaleString()}원을 획득했습니다!` }
              });
            } else {
              const levelDiff = monsterLevel - user.level;
              const diffText = levelDiff > 0 ? `(+${levelDiff}강)` : levelDiff < 0 ? `(${levelDiff}강)` : '(동일)';
              return jsonResponse({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: { content: `💀 **패배...**\n**${username}** (${user.weapon_name} +${user.level}강): ${myPower} 전투력\n**몬스터** (레벨 ${monsterLevel} ${diffText}): ${monsterPower} 전투력\n\n도망쳤습니다.` }
              });
            }
          }
          
          // 랜덤 유저 선택
          const opponent = allUsers[Math.floor(Math.random() * allUsers.length)];
          const opponentPower = Math.floor(Math.random() * ((opponent.level || 0) * 10 + 30));
          const myPower = Math.floor(Math.random() * (user.level * 10 + 30));
          
          if (myPower > opponentPower) {
            const reward = 2000; // 유저와 배틀 승리 시 더 많은 보상
            await env.game_db.prepare("UPDATE users SET money = money + ?, wins = wins + 1 WHERE id = ?").bind(reward, userId).run();
            return jsonResponse({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: { 
                content: `⚔️ **${username}님의 승리!**\n\n**${username}** (${user.weapon_name} +${user.level}강): ${myPower} 전투력\n**${opponent.username}** (${opponent.weapon_name || '무기 없음'} +${opponent.level || 0}강): ${opponentPower} 전투력\n\n💰 2,000원을 획득했습니다!` 
              }
            });
          } else {
            const penalty = 500; // 패배 시 패널티
            const finalMoney = Math.max(0, user.money - penalty);
            await env.game_db.prepare("UPDATE users SET money = ? WHERE id = ?").bind(finalMoney, userId).run();
            return jsonResponse({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: { 
                content: `💀 **${username}님의 패배...**\n\n**${username}** (${user.weapon_name} +${user.level}강): ${myPower} 전투력\n**${opponent.username}** (${opponent.weapon_name || '무기 없음'} +${opponent.level || 0}강): ${opponentPower} 전투력\n\n💸 ${penalty}원을 잃었습니다.` 
              }
            });
          }
        } else {
          // 몬스터와 배틀
          const monsterLevel = generateMonsterLevel(user.level);
          const monsterPower = Math.floor(Math.random() * (monsterLevel * 5 + 50));
          const myPower = Math.floor(Math.random() * (user.level * 10 + 30));
          
          if (myPower > monsterPower) {
            const reward = calculateReward(user.level, monsterLevel);
            await env.game_db.prepare("UPDATE users SET money = money + ?, wins = wins + 1 WHERE id = ?").bind(reward, userId).run();
            const levelDiff = monsterLevel - user.level;
            const diffText = levelDiff > 0 ? `(+${levelDiff}강)` : levelDiff < 0 ? `(${levelDiff}강)` : '(동일)';
            return jsonResponse({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: { content: `⚔️ **${username}님의 승리!**\n\n**${username}** (${user.weapon_name} +${user.level}강): ${myPower} 전투력\n**몬스터** (레벨 ${monsterLevel} ${diffText}): ${monsterPower} 전투력\n\n💰 ${reward.toLocaleString()}원을 획득했습니다!` }
            });
          } else {
            const levelDiff = monsterLevel - user.level;
            const diffText = levelDiff > 0 ? `(+${levelDiff}강)` : levelDiff < 0 ? `(${levelDiff}강)` : '(동일)';
            return jsonResponse({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: { content: `💀 **${username}님의 패배...**\n\n**${username}** (${user.weapon_name} +${user.level}강): ${myPower} 전투력\n**몬스터** (레벨 ${monsterLevel} ${diffText}): ${monsterPower} 전투력\n\n도망쳤습니다.` }
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