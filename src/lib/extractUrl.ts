export function extractUrl(text: string): string {
  if (!text) return ''
  const trimmed = text.trim()
  if (/^https?:\/\//.test(trimmed)) return trimmed
  const m = trimmed.match(/https?:\/\/[^\s)）]+/)
  return m ? m[0] : trimmed
}
