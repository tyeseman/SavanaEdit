function getOpenAIKey() {
  return String(process.env.SAVANAEDIT_OPENAI_API_KEY || process.env.OPENAI_API_KEY || '').trim();
}
function isOpenAIConfigured() { return Boolean(getOpenAIKey()); }
async function testOpenAIConnection() {
  const key = getOpenAIKey();
  if (!key) return { ok: false, configured: false, message: 'No OpenAI API key is configured.' };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch('https://api.openai.com/v1/models', { headers: { Authorization: `Bearer ${key}` }, signal: controller.signal });
    if (!response.ok) return { ok: false, configured: true, message: `OpenAI rejected the key (${response.status}).` };
    return { ok: true, configured: true, message: 'OpenAI connection verified.' };
  } catch (error) {
    return { ok: false, configured: true, message: error?.name === 'AbortError' ? 'OpenAI connection timed out.' : 'Could not reach OpenAI.' };
  } finally { clearTimeout(timer); }
}
module.exports = { getOpenAIKey, isOpenAIConfigured, testOpenAIConnection };
