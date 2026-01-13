// Discord 응답 생성 유틸리티

/**
 * JSON 응답 생성 헬퍼 함수
 * @param {object} body - 응답 본문
 * @returns {Response} JSON 응답
 */
export function jsonResponse(body) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 
      'Content-Type': 'application/json'
    },
  });
}
