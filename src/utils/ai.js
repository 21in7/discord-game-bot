// AI 응답 관련 유틸리티

/**
 * 템플릿 기반 AI 응답 생성 (Gemini API 호출 없음)
 * @param {string} resultType - 결과 타입 (success, failure, destroyed)
 * @param {string} weaponName - 무기 이름
 * @param {number} level - 강화 레벨
 * @param {string} username - 유저 이름
 * @param {object} env - 환경 변수 (game_db 포함)
 * @returns {Promise<string|null>} AI 응답 또는 null
 */
export async function generateAIResponse(resultType, weaponName, level, username, env) {
  try {
    // 데이터베이스에서 랜덤 템플릿 가져오기
    const { results } = await env.game_db.prepare(
      "SELECT response FROM ai_responses WHERE result_type = ? ORDER BY RANDOM() LIMIT 1"
    ).bind(resultType).all();
    
    if (!results || results.length === 0) {
      // 템플릿이 없으면 기본 메시지 반환
      return null;
    }
    
    // 템플릿에서 플레이스홀더 치환
    let template = results[0].response;
    
    // {username} 플레이스홀더 치환
    template = template.replace(/\{username\}/g, username);
    
    // {weaponName} 플레이스홀더 치환
    template = template.replace(/\{weaponName\}/g, weaponName);
    
    // {level} 플레이스홀더 치환 (있는 경우)
    template = template.replace(/\{level\}/g, level.toString());
    
    return template.trim();
  } catch {
    return null;
  }
}

/**
 * 백그라운드 AI 응답 처리 (템플릿 기반 - 빠르고 API 호출 없음)
 * @param {object} ctx - ExecutionContext
 * @param {object} env - 환경 변수
 * @param {string} userId - 유저 ID
 * @param {string} resultType - 결과 타입
 * @param {string} weaponName - 무기 이름
 * @param {number} level - 강화 레벨
 * @param {string} username - 유저 이름
 * @param {object} embedData - Embed 데이터
 * @param {string} interactionToken - Interaction 토큰
 * @param {string} applicationId - Application ID
 * @param {array} components - 컴포넌트 배열
 */
export async function processAIResponseInBackground(ctx, env, userId, resultType, weaponName, level, username, embedData, interactionToken, applicationId, components) {
  if (!interactionToken || !applicationId) return;
  
  // 템플릿 기반이므로 쿨다운/확률 제한 없이 바로 처리 (매우 빠름)
  ctx.waitUntil((async () => {
    try {
      const aiResponse = await generateAIResponse(resultType, weaponName, level, username, env);
      
      if (aiResponse) {
        await fetch(`https://discord.com/api/v10/webhooks/${applicationId}/${interactionToken}/messages/@original`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            embeds: [{ ...embedData, description: embedData.description + `\n\n💬 ${aiResponse}` }],
            components
          })
        });
      }
    } catch { /* 무시 */ }
  })());
}
