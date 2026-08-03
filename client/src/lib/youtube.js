/**
 * Robust YouTube Video ID extractor.
 * Supports watch?v=, youtu.be/, embed/, shorts/, and URL query parameters.
 */
export const getYouTubeVideoId = (url) => {
  if (!url || typeof url !== 'string') return null

  const trimmed = url.trim()
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = trimmed.match(regExp)

  if (match && match[2] && match[2].length === 11) {
    return match[2]
  }

  // Fallback: If raw 11-char ID passed directly
  if (trimmed.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed
  }

  return null
}

export default getYouTubeVideoId
