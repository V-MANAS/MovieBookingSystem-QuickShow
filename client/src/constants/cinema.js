/**
 * Centralized Cinema & Theatre Constants and Helpers
 */

export const DEFAULT_THEATRE_NAME = 'QuickShow Cineplex'
export const DEFAULT_SCREEN_NAME = 'Screen 1 (IMAX 2D)'

/**
 * Extracts theatre and screen information dynamically from show/booking data.
 * Falls back to default reusable constant if show-specific theatre data is omitted.
 */
export const getTheatreInfo = (showData) => {
  if (!showData) return `${DEFAULT_THEATRE_NAME} - ${DEFAULT_SCREEN_NAME}`

  const theatre = showData.theatre || showData.movie?.theatre || showData.cinema
  const screen = showData.screen || showData.screenName || showData.movie?.screen

  if (theatre && screen) {
    return `${theatre} - ${screen}`
  }

  if (theatre) {
    return theatre
  }

  return `${DEFAULT_THEATRE_NAME} - ${DEFAULT_SCREEN_NAME}`
}

export default getTheatreInfo
