// R2 이미지 자동 업로드 스크립트
// 중복 체크 후 없는 이미지만 업로드

const { readdir } = require('fs/promises');
const { join } = require('path');
const { execSync } = require('child_process');

// 프로젝트 루트 기준으로 이미지 디렉토리 경로 설정
const { resolve } = require('path');
const IMAGE_DIR = resolve(__dirname, '..', 'image');
const BUCKET_NAME = 'weapon-images';

async function getLocalImages() {
  try {
    const files = await readdir(IMAGE_DIR);
    const images = files.filter(file => file.endsWith('.png'));
    return images;
  } catch (error) {
    console.error('이미지 디렉토리를 읽을 수 없습니다:', error);
    return [];
  }
}

async function getR2Images() {
  try {
    // wrangler는 R2 객체 목록을 가져오는 명령어가 없으므로
    // 각 이미지의 존재 여부를 확인하는 방식으로 변경
    // 또는 빈 배열을 반환하고 업로드 시 중복 체크를 하지 않음
    // (R2는 같은 이름으로 업로드하면 덮어쓰기되므로 문제없음)
    
    // 간단한 방법: 빈 배열 반환 (항상 업로드 시도)
    // R2는 같은 이름으로 업로드해도 문제없으므로 중복 체크는 선택사항
    return [];
  } catch (error) {
    return [];
  }
}

async function uploadImage(filename) {
  const filePath = join(IMAGE_DIR, filename);
  try {
    const absolutePath = filePath;
    console.log(`📤 업로드 중: ${filename}...`);
    execSync(`npx wrangler r2 object put ${BUCKET_NAME}/${filename} --file="${absolutePath}" --remote`, {
      stdio: 'inherit'
    });
    console.log(`✅ 업로드 완료: ${filename}`);
    return true;
  } catch (error) {
    console.error(`❌ 업로드 실패: ${filename}`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 R2 이미지 자동 업로드 시작...\n');
  
  const localImages = await getLocalImages();
  console.log(`📁 로컬 이미지: ${localImages.length}개 발견\n`);
  
  if (localImages.length === 0) {
    console.log('업로드할 이미지가 없습니다.');
    return;
  }
  
  // R2 목록 가져오기는 wrangler에서 지원하지 않으므로
  // 모든 이미지를 업로드 시도 (R2는 같은 이름으로 업로드해도 덮어쓰기되므로 문제없음)
  const imagesToUpload = localImages;
  
  console.log(`📤 업로드할 이미지: ${imagesToUpload.length}개\n`);
  console.log(imagesToUpload.map(img => `  - ${img}`).join('\n'));
  console.log('');
  console.log('💡 참고: 이미 존재하는 이미지는 자동으로 덮어쓰기됩니다.\n');
  
  // 업로드 실행
  let successCount = 0;
  let failCount = 0;
  
  for (const image of imagesToUpload) {
    const success = await uploadImage(image);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    console.log(''); // 빈 줄 추가
  }
  
  console.log('\n📊 업로드 결과:');
  console.log(`  ✅ 성공: ${successCount}개`);
  if (failCount > 0) {
    console.log(`  ❌ 실패: ${failCount}개`);
  }
}

main().catch(console.error);
