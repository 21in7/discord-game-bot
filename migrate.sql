-- 기존 users 테이블에 weapon_name 컬럼 추가
ALTER TABLE users ADD COLUMN weapon_name TEXT;

-- 기존 유저들에게 랜덤 무기 부여 (실제로는 코드에서 처리)
-- 이 스크립트는 컬럼 추가만 수행합니다.
