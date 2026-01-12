# R2 설정 가이드

## 완료된 작업

✅ R2 버킷 생성: `weapon-images`
✅ 모든 이미지 파일 업로드 완료
✅ 코드 수정 완료 (R2 URL 사용)
✅ wrangler.jsonc에 R2 binding 추가

## 다음 단계: R2 Public URL 설정

### 1. Cloudflare Dashboard에서 R2 Public URL 설정

1. Cloudflare Dashboard 접속
2. R2 > weapon-images 버킷 선택
3. Settings 탭으로 이동
4. **Public Access** 섹션에서:
   - "Allow Access" 활성화
   - Public URL 복사 (예: `https://<account-id>.r2.cloudflarestorage.com/weapon-images`)

### 2. 환경 변수 설정

R2 Public URL을 환경 변수로 설정해야 합니다:

```bash
# Wrangler를 사용하여 환경 변수 설정
npx wrangler secret put R2_PUBLIC_URL
# 또는
npx wrangler secret put R2_IMAGE_BASE_URL
```

프롬프트가 나타나면 R2 Public URL을 입력하세요.

예:
```
https://<account-id>.r2.cloudflarestorage.com/weapon-images
```

### 3. 배포

```bash
npx wrangler deploy
```

## 확인

배포 후 Discord 봇에서 `/정보` 명령어를 사용하여 이미지가 제대로 표시되는지 확인하세요.

## 문제 해결

### 이미지가 표시되지 않는 경우

1. R2 Public URL이 올바르게 설정되었는지 확인
2. 환경 변수가 올바르게 설정되었는지 확인:
   ```bash
   npx wrangler secret list
   ```
3. R2 버킷의 Public Access가 활성화되어 있는지 확인
4. 이미지 파일이 R2에 올바르게 업로드되었는지 확인:
   ```bash
   npx wrangler r2 object list weapon-images --remote
   ```

## Custom Domain 설정 (선택사항)

더 나은 URL을 원한다면 Custom Domain을 설정할 수 있습니다:

1. R2 버킷 Settings > Custom Domain
2. 도메인 추가 (예: `images.yourdomain.com`)
3. DNS 설정 (CNAME 레코드 추가)
4. 환경 변수를 Custom Domain URL로 업데이트
