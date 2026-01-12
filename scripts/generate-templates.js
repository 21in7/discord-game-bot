/**
 * 로컬 모델로 템플릿 생성 가이드
 * 
 * 이 스크립트는 템플릿 생성 예시를 보여줍니다.
 * 실제로는 로컬 모델(LM Studio, Ollama 등)을 사용하여 템플릿을 생성하세요.
 */

// 템플릿 생성 프롬프트 예시
const prompts = {
  success: `다음 형식으로 강화 성공 메시지를 10개 생성해줘:
- {username}: 유저명 (예: "철수", "영희")
- {weaponName}: 무기명 (예: "신의 검", "나무 도끼")
- {level}: 강화 레벨 (예: "5", "10")

형식: "{username}님, {weaponName} +{level}강 달성 축하하네! 잘 써보게."
대장장이 말투로 2줄 이내, 반말, 한국어로 작성.
각 메시지는 다른 표현으로 작성.`,

  failure: `다음 형식으로 강화 실패 메시지를 10개 생성해줘:
- {username}: 유저명
- {weaponName}: 무기명

형식: "{username}님, {weaponName} 강화가 실패했네. 다음엔 성공할 거야."
대장장이 말투로 2줄 이내, 반말, 한국어로 작성.
각 메시지는 다른 표현으로 작성.`,

  destroyed: `다음 형식으로 무기 파괴 메시지를 10개 생성해줘:
- {username}: 유저명
- {weaponName}: 무기명

형식: "{username}님... {weaponName}이 파괴되었네. 정말 죄송하네."
대장장이 말투로 2줄 이내, 반말, 한국어로 작성.
각 메시지는 다른 표현으로 작성.`
};

// 생성된 템플릿을 SQL 형식으로 변환하는 함수
function convertToSQL(templates, resultType) {
  return templates.map(template => {
    // SQL 이스케이프 처리
    const escaped = template.replace(/'/g, "''");
    return `INSERT INTO ai_responses (result_type, response) VALUES ('${resultType}', '${escaped}');`;
  }).join('\n');
}

console.log('템플릿 생성 가이드:');
console.log('1. 로컬 모델(LM Studio, Ollama 등)에 위 프롬프트를 입력');
console.log('2. 생성된 메시지를 복사');
console.log('3. templates_example.sql 파일에 추가하거나 직접 D1에 삽입');
console.log('\n프롬프트 예시:');
console.log(JSON.stringify(prompts, null, 2));
