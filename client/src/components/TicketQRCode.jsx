import React from 'react'
import QRCode from 'react-qr-code'
import { DEFAULT_THEATRE_NAME } from '../constants/cinema'

/**
 * TicketQRCode Component
 * Generates an SVG QR Code containing essential ticket metadata:
 * - bookingId
 * - movie title
 * - theatre
 * - date
 * - time
 * - seats
 */
const TicketQRCode = ({
  bookingId = '',
  movieTitle = '',
  theatre = DEFAULT_THEATRE_NAME,
  date = '',
  time = '',
  seats = [],
  size = 110,
  id = ''
}) => {
  // Construct structured JSON payload for encoding inside QR code
  const payload = JSON.stringify({
    bookingId,
    movie: movieTitle,
    theatre,
    date,
    time,
    seats: Array.isArray(seats) ? seats.join(', ') : seats
  })

  return (
    <div className="flex flex-col items-center justify-center p-2.5 bg-white rounded-2xl shadow-md border border-white/20 shrink-0">
      <QRCode
        id={id || `qr-${bookingId}`}
        value={payload}
        size={size}
        bgColor="#FFFFFF"
        fgColor="#09090B"
        level="M"
      />
    </div>
  )
}

export default TicketQRCode
