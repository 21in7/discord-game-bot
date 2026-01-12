# AI 응답 기능 설정 가이드

## 완료된 작업

✅ AI 응답 저장 테이블 생성 (`ai_responses`)
✅ AI API 호출 함수 구현 (Google Gemini Flash)
✅ 강화 결과에 AI 응답 추가
✅ 항상 새로 생성 (유저명/무기명이 매번 다르므로)

## 동작 방식

1. **강화 결과에 따라 AI 응답 생성**
   - 성공: 축하하는 반응
   - 실패: 위로하는 반응
   - 파괴: 공감하는 반응

2. **응답 생성 전략**
   - 항상 새로 AI에게 요청하여 생성 (유저명/무기명이 매번 다르므로)
   - 생성된 응답은 데이터베이스에 저장 (참고용)

3. **응답 저장**
   - 새로 생성된 응답은 자동으로 데이터베이스에 저장
   - 현재는 사용하지 않지만, 향후 통계나 분석에 활용 가능

## 환경 변수 설정 (필수)

Google Gemini Flash API를 사용합니다. API 키가 필요합니다:

```bash
# Google Gemini API 키 설정 (필수)
npx wrangler secret put GEMINI_API_KEY
```

### API 키 발급 방법

1. [Google AI Studio](https://makersuite.google.com/app/apikey) 접속
2. "Create API Key" 클릭
3. API 키 복사
4. 위 명령어 실행 후 API 키 입력

### 무료 티어 제한

- 분당 15회 요청
- 일일 1,500회 요청
- 일반적인 사용에는 충분합니다!

## AI API 형식

Google Gemini Flash API를 사용합니다:

**요청 형식:**
```json
{
  "contents": [
    {
      "parts": [
        { "text": "시스템 프롬프트 + 사용자 메시지" }
      ]
    }
  ],
  "generationConfig": {
    "maxOutputTokens": 100,
    "temperature": 0.8
  }
}
```

**응답 형식:**
```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "AI 응답 내용"
          }
        ]
      }
    }
  ]
}
```

## 타임아웃

AI 응답 생성은 5초 타임아웃이 설정되어 있습니다. 5초 내에 응답이 오지 않으면 기본 메시지만 표시됩니다.

## 배포

```bash
npx wrangler deploy
```

배포 후 강화 명령어를 사용하면 AI 응답이 포함된 메시지를 볼 수 있습니다.
