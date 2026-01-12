# R2로 이미지 전환 가이드

## R2 사용의 장점

1. **Workers CPU 시간 절약** - 이미지 요청이 Workers를 거치지 않음 (무료 플랜에서 중요)
2. **배포 시간 단축** - 이미지가 Workers 배포에 포함되지 않음
3. **이미지 독립 업데이트** - 코드 배포 없이 이미지만 업데이트 가능
4. **무료 플랜**: 10GB 스토리지, 월 100만 읽기

## 전환 단계

### 1. R2 버킷 생성

```bash
wrangler r2 bucket create weapon-images
```

### 2. 이미지 업로드

```bash
# 모든 이미지 업로드
for file in image/*.png; do
  filename=$(basename "$file")
  wrangler r2 object put weapon-images/$filename --file="$file"
done
```

또는 개별 업로드:
```bash
wrangler r2 object put weapon-images/wood_sword.png --file=./image/wood_sword.png
wrangler r2 object put weapon-images/iron_sword.png --file=./image/iron_sword.png
wrangler r2 object put weapon-images/steel_sword.png --file=./image/steel_sword.png
wrangler r2 object put weapon-images/mithril_sword.png --file=./image/mithril_sword.png
wrangler r2 object put weapon-images/diamond_sword.png --file=./image/diamond_sword.png
wrangler r2 object put weapon-images/dragon_slayer.png --file=./image/dragon_slayer.png
wrangler r2 object put weapon-images/divine_sword.png --file=./image/divine_sword.png
wrangler r2 object put weapon-images/legendary_sword.png --file=./image/legendary_sword.png
wrangler r2 object put weapon-images/wood_axe.png --file=./image/wood_axe.png
```

### 3. R2 Public URL 설정

Cloudflare Dashboard에서:
1. R2 버킷 선택
2. Settings > Public Access 설정
3. Public URL 복사 (예: `https://<account-id>.r2.cloudflarestorage.com/weapon-images`)

또는 Custom Domain 사용 (권장):
- 더 나은 URL (예: `https://images.yourdomain.com`)

### 4. wrangler.jsonc 수정

```jsonc
{
  // ... 기존 설정 ...
  "r2_buckets": [
    {
      "binding": "WEAPON_IMAGES",
      "bucket_name": "weapon-images"
    }
  ],
  // "assets" 설정은 제거하거나 주석 처리
  // "assets": { "directory": "./image/", "binding": "ASSETS" },
}
```

### 5. 코드 수정

이미지 URL을 R2 URL로 변경:

```javascript
// R2 Public URL (환경 변수로 설정하거나 하드코딩)
const R2_IMAGE_BASE_URL = "https://<account-id>.r2.cloudflarestorage.com/weapon-images";
// 또는 Custom Domain 사용 시
// const R2_IMAGE_BASE_URL = "https://images.yourdomain.com";

// 무기 이미지 URL 생성 함수 수정
function getWeaponImageUrl(weaponName) {
  const weaponImageFilename = getWeaponImageFilename(weaponName);
  if (weaponImageFilename) {
    return `${R2_IMAGE_BASE_URL}/${weaponImageFilename}`;
  }
  return null;
}
```

### 6. GET 요청 처리 제거 (선택사항)

이미지가 R2에서 직접 제공되므로 Workers의 GET 요청 처리는 불필요합니다:

```javascript
// GET 요청 처리 부분 제거 또는 최소화
if (request.method === 'GET') {
  return new Response('Not found', { status: 404 });
}
```

## 비용 비교

### Static Assets (현재)
- Workers 배포 크기 증가
- Workers CPU 시간 사용 (이미지 요청마다)
- 무료 플랜: 100,000 요청/일

### R2
- Workers 배포 크기 감소
- Workers CPU 시간 절약
- 무료 플랜: 10GB 스토리지, 100만 읽기/월

## 결론

**R2 사용을 권장합니다:**
- 무료 플랜에서 Workers CPU 시간 절약 (중요!)
- 배포 시간 단축
- 이미지 관리 용이

속도는 둘 다 Cloudflare CDN을 사용하므로 비슷하지만, R2는 Workers를 거치지 않아 약간 빠를 수 있습니다.
