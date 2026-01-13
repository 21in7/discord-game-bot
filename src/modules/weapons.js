// 무기 관련 함수들 (DB 기반)

/**
 * DB에서 무기 정보 조회
 * @param {string} name - 무기 이름
 * @param {object} env - 환경 변수 (game_db 포함)
 * @returns {Promise<object|null>} 무기 정보 또는 null
 */
export async function getWeaponByName(name, env) {
  try {
    const weapon = await env.game_db.prepare(
      "SELECT * FROM weapons WHERE name = ?"
    ).bind(name).first();
    return weapon || null;
  } catch {
    return null;
  }
}

/**
 * 랜덤 무기 조회
 * @param {object} env - 환경 변수 (game_db 포함)
 * @returns {Promise<object|null>} 랜덤 무기 정보 또는 null
 */
export async function getRandomWeapon(env) {
  try {
    const { results } = await env.game_db.prepare(
      "SELECT * FROM weapons ORDER BY RANDOM() LIMIT 1"
    ).all();
    
    if (!results || results.length === 0) {
      return null;
    }
    
    return results[0];
  } catch {
    return null;
  }
}

/**
 * 무기 판매 가격 계산 (등급별 차등 적용)
 * @param {string} weaponName - 무기 이름
 * @param {number} level - 강화 레벨
 * @param {object} env - 환경 변수 (game_db 포함)
 * @returns {Promise<number>} 판매 가격
 */
export async function getWeaponSellPrice(weaponName, level, env) {
  const weapon = await getWeaponByName(weaponName, env);
  if (!weapon) return 0;
  
  const basePrice = weapon.base_price;
  const tier = weapon.tier;
  
  // 전설급 무기
  if (tier === '전설') {
    // basePrice * (20 + level * 5) - 예: 전설의 지팡이 13강 = 8000 * (20 + 13*5) = 8000 * 85 = 680,000원
    return basePrice * (20 + level * 5);
  }
  
  // 신급 무기
  if (tier === '신') {
    // basePrice * (10 + level * 2) - 예: 신의 지팡이 13강 = 3000 * (10 + 13*2) = 3000 * 36 = 108,000원
    return basePrice * (10 + level * 2);
  }
  
  // 드래곤급 무기
  if (tier === '드래곤') {
    // basePrice * (5 + level) - 예: 드래곤 슬레이어 13강 = 10000 * 18 = 180,000원
    return basePrice * (5 + level);
  }
  
  // 다이아몬드급 무기
  if (tier === '다이아몬드') {
    // basePrice * (3 + level * 0.5) - 예: 다이아몬드 검 13강 = 5000 * 9.5 = 47,500원
    return Math.floor(basePrice * (3 + level * 0.5));
  }
  
  // 미스릴급 무기
  if (tier === '미스릴') {
    // basePrice * (2 + level * 0.3) - 예: 미스릴 검 13강 = 2000 * 5.9 = 11,800원
    return Math.floor(basePrice * (2 + level * 0.3));
  }
  
  // 일반/고급/강철 무기 (나무, 철, 강철, 마법, 고대)
  // basePrice + (level * 1000) - 예: 강철 검 13강 = 1000 + 13000 = 14,000원
  return basePrice + (level * 1000);
}

/**
 * 무기 설명 가져오기
 * @param {string} weaponName - 무기 이름
 * @param {object} env - 환경 변수 (game_db 포함)
 * @returns {Promise<string>} 무기 설명
 */
export async function getWeaponDescription(weaponName, env) {
  const weapon = await getWeaponByName(weaponName, env);
  return weapon ? weapon.description : '알 수 없는 무기';
}

/**
 * 무기 이미지 파일명 가져오기
 * @param {string} weaponName - 무기 이름
 * @param {object} env - 환경 변수 (game_db 포함)
 * @returns {Promise<string|null>} 이미지 파일명 또는 null
 */
export async function getWeaponImageFilename(weaponName, env) {
  const weapon = await getWeaponByName(weaponName, env);
  if (!weapon || !weapon.image_filename) {
    return null;
  }
  return weapon.image_filename;
}

/**
 * R2 이미지 URL 생성 함수
 * 우선순위: 1. R2 Public URL (가장 빠름) > 2. Workers를 통한 R2 binding (fallback)
 * @param {string} weaponName - 무기 이름
 * @param {string} r2PublicUrl - R2 Public URL
 * @param {string|null} requestUrl - 요청 URL (fallback용)
 * @param {object} env - 환경 변수 (game_db 포함)
 * @returns {Promise<string|null>} 이미지 URL 또는 null
 */
export async function getWeaponImageUrl(weaponName, r2PublicUrl, requestUrl = null, env) {
  const weaponImageFilename = await getWeaponImageFilename(weaponName, env);
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
