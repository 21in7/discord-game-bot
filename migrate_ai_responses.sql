-- AI 응답 저장 테이블
CREATE TABLE IF NOT EXISTS ai_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    result_type TEXT NOT NULL, -- 'success', 'failure', 'destroyed'
    response TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);

-- 인덱스 추가 (빠른 조회를 위해)
CREATE INDEX IF NOT EXISTS idx_result_type ON ai_responses(result_type);
