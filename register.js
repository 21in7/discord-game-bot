// register.js
// 실행 전: npm install dotenv node-fetch
require('dotenv').config(); 

const token = process.env.DISCORD_TOKEN;
const applicationId = process.env.DISCORD_APPLICATION_ID;

const commands = [
  { name: '정보', description: '내 정보를 확인합니다.' },
  { name: '출석', description: '매일 지원금을 받습니다.' },
  { name: '강화', description: '무기를 강화합니다.' },
  { name: '판매', description: '현재 무기를 판매하고 새 무기를 받습니다.' },
  { 
    name: '배틀', 
    description: '몬스터 또는 다른 유저와 싸웁니다.',
    options: [
      {
        name: '상대',
        description: '대결할 상대를 지정합니다. (미지정 시 랜덤)',
        type: 6, // USER type
        required: false
      }
    ]
  },
  { name: '묵념', description: '소소한 돈을 줍습니다.' },
  { name: '랭킹', description: 'TOP 5 랭킹을 봅니다.' },
  { name: '파산', description: '모든 정보를 초기화하고 처음부터 시작합니다.' },
];

async function registerCommands() {
  const url = `https://discord.com/api/v10/applications/${applicationId}/commands`;
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bot ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
  });

  if (response.ok) {
    console.log('명령어 등록 성공!');
  } else {
    const data = await response.json();
    console.error('실패:', data);
  }
}

registerCommands();