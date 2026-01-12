const fs = require('fs');

// 파일 읽기
const content = fs.readFileSync('templates_example.sql', 'utf8');
const lines = content.split('\n').filter(l => l.trim() && !l.trim().startsWith('--'));

// 중복 제거: 플레이스홀더를 {}로 정규화하여 비교
const seen = new Set();
const unique = [];

lines.forEach(line => {
  // 플레이스홀더를 {}로 정규화하고 소문자로 변환하여 비교
  const normalized = line
    .replace(/\{[^}]+\}/g, '{}')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim();
  
  if (!seen.has(normalized)) {
    seen.add(normalized);
    unique.push(line);
  }
});

console.log(`원본: ${lines.length}개`);
console.log(`중복 제거 후: ${unique.length}개`);
console.log(`제거된 중복: ${lines.length - unique.length}개`);

// 결과 저장
fs.writeFileSync('templates_example.sql', unique.join('\n'));

console.log('\n✅ templates_example.sql 파일이 업데이트되었습니다.');
