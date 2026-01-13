-- weapons 테이블 생성
CREATE TABLE IF NOT EXISTS weapons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    base_price INTEGER NOT NULL,
    description TEXT NOT NULL,
    weapon_type TEXT NOT NULL,
    tier TEXT NOT NULL,
    image_filename TEXT
);

-- 무기 데이터 삽입
INSERT INTO weapons (name, base_price, description, weapon_type, tier, image_filename) VALUES
-- 검 타입
('나무 검', 100, '초보자용 나무로 만든 검. 가볍고 다루기 쉽다.', '검', '일반', 'wood_sword.png'),
('철 검', 500, '일반적인 철제 검. 기본적인 전투에 적합하다.', '검', '고급', 'iron_sword.png'),
('강철 검', 1000, '단단한 강철로 만든 검. 내구성이 뛰어나다.', '검', '강철', 'steel_sword.png'),
('미스릴 검', 2000, '희귀한 미스릴로 제작된 검. 마법 저항력이 있다.', '검', '미스릴', 'mithril_sword.png'),
('다이아몬드 검', 5000, '다이아몬드로 장식된 고급 검. 예리한 날을 자랑한다.', '검', '다이아몬드', 'diamond_sword.png'),
('드래곤 슬레이어', 10000, '드래곤을 처치한 용사가 사용하던 전설의 검.', '검', '드래곤', 'dragon_slayer.png'),
('신의 검', 20000, '신이 내려준 성스러운 검. 악을 물리치는 힘이 있다.', '검', '신', 'divine_sword.png'),
('전설의 검', 50000, '세계에서 가장 강력한 검. 그 힘은 상상을 초월한다.', '검', '전설', 'legendary_sword.png'),

-- 도끼 타입
('나무 도끼', 150, '나무로 만든 단순한 도끼. 벌목용으로도 사용된다.', '도끼', '일반', 'wood_axe.png'),
('철 도끼', 600, '무거운 철제 도끼. 강력한 일격을 가할 수 있다.', '도끼', '고급', 'iron_axe.png'),
('강철 도끼', 1200, '단단한 강철 도끼. 방어구를 찢어버리는 위력이 있다.', '도끼', '강철', 'steel_axe.png'),
('미스릴 도끼', 2500, '미스릴로 만든 도끼. 마법의 힘이 깃들어 있다.', '도끼', '미스릴', 'mithril_axe.png'),
('다이아몬드 도끼', 6000, '다이아몬드 날을 가진 도끼. 어떤 것도 부술 수 있다.', '도끼', '다이아몬드', 'diamond_axe.png'),
('드래곤 도끼', 12000, '드래곤의 비늘로 만든 도끼. 불꽃의 힘을 담고 있다.', '도끼', '드래곤', 'dragon_axe.png'),
('신의 도끼', 25000, '신이 사용하던 거대한 도끼. 천둥의 힘이 깃들어 있다.', '도끼', '신', 'divine_axe.png'),
('전설의 도끼', 60000, '세계를 양분했다는 전설의 도끼. 그 위력은 무시무시하다.', '도끼', '전설', 'legendary_axe.png'),

-- 지팡이 타입
('나무 지팡이', 200, '마법사의 첫 지팡이. 기본적인 마법을 구사할 수 있다.', '지팡이', '일반', 'wood_staff.png'),
('마법 지팡이', 800, '마법이 깃든 지팡이. 강력한 주문을 시전할 수 있다.', '지팡이', '고급', 'magic_staff.png'),
('고대 지팡이', 1500, '고대 마법사가 사용하던 지팡이. 오래된 힘이 깃들어 있다.', '지팡이', '강철', 'old_staff.png'),
('신의 지팡이', 3000, '신이 내려준 지팡이. 창조의 힘을 다룰 수 있다.', '지팡이', '신', 'divine_staff.png'),
('전설의 지팡이', 8000, '세계의 마법을 지배하는 전설의 지팡이. 모든 주문을 마스터했다.', '지팡이', '전설', 'legendary_staff.png');
