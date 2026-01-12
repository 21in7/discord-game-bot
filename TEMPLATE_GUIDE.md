# 템플릿 기반 AI 응답 시스템 가이드

## 개요
이제 Gemini API를 호출하지 않고, 미리 생성한 템플릿에서 유저명과 무기명만 치환하여 사용합니다.

## 장점
- ✅ **API 호출 제한 없음**: Gemini API를 전혀 호출하지 않음
- ✅ **초고속 응답**: 데이터베이스 조회만 하므로 매우 빠름
- ✅ **비용 절감**: API 비용이 전혀 들지 않음
- ✅ **일관된 톤**: 미리 작성한 템플릿으로 일관된 대장장이 말투 유지

## 템플릿 형식
템플릿은 다음 플레이스홀더를 사용합니다:
- `{username}`: 유저명으로 자동 치환
- `{weaponName}`: 무기명으로 자동 치환
- `{level}`: 강화 레벨로 자동 치환 (선택사항)

### 예시
```
{username}님, {weaponName} +{level}강 달성 축하하네! 잘 써보게.
```

실제 사용 시:
```
철수님, 신의 검 +5강 달성 축하하네! 잘 써보게.
```

## 템플릿 추가 방법

### 1. 로컬 모델로 템플릿 생성
로컬 모델(LM Studio, Ollama 등)을 사용하여 템플릿을 생성하세요.

**프롬프트 예시:**
```
다음 형식으로 강화 성공 메시지를 20개 생성해줘:
- {username}: 유저명
- {weaponName}: 무기명  
- {level}: 강화 레벨

형식: "{username}님, {weaponName} +{level}강 달성 축하하네! 잘 써보게."
대장장이 말투로 2줄 이내, 반말, 한국어로 작성.
각 메시지는 다른 표현으로 작성.
```

### 2. SQL 파일 생성
생성된 템플릿을 SQL 형식으로 변환:

```sql
INSERT INTO ai_responses (result_type, response) VALUES 
('success', '{username}님, {weaponName} +{level}강 달성 축하하네! 잘 써보게.'),
('success', '오오, {weaponName}이 +{level}강이 되었구나! {username}님 실력이 대단하시네.'),
('failure', '{username}님, {weaponName} 강화가 실패했네. 다음엔 성공할 거야.'),
('destroyed', '{username}님... {weaponName}이 파괴되었네. 정말 죄송하네.');
```

### 3. 데이터베이스에 삽입

**로컬 데이터베이스:**
```bash
npx wrangler d1 execute game-db --file=./templates_example.sql
```

**원격 데이터베이스:**
```bash
npx wrangler d1 execute game-db --remote --file=./templates_example.sql
```

또는 직접 SQL 실행:
```bash
npx wrangler d1 execute game-db --remote --command="INSERT INTO ai_responses (result_type, response) VALUES ('success', '{username}님, {weaponName} +{level}강 달성!');"
```

## 템플릿 타입
- `success`: 강화 성공 시
- `failure`: 강화 실패 시  
- `destroyed`: 무기 파괴 시

## 템플릿 확인
```bash
# 성공 템플릿 확인
npx wrangler d1 execute game-db --remote --command="SELECT * FROM ai_responses WHERE result_type = 'success' LIMIT 5;"

# 전체 템플릿 개수 확인
npx wrangler d1 execute game-db --remote --command="SELECT result_type, COUNT(*) as count FROM ai_responses GROUP BY result_type;"
```

## 권장 템플릿 개수
- 각 타입당 최소 10개 이상 권장
- 많을수록 다양성 증가
- 50개 이상이면 충분히 다양한 응답 가능

## 주의사항
- 템플릿에 `{username}`, `{weaponName}`, `{level}` 플레이스홀더를 정확히 사용해야 함
- SQL 이스케이프 처리: 작은따옴표(`'`)는 `''`로 변환 필요
- 템플릿은 2줄 이내로 작성 권장 (Discord 메시지 길이 제한)
