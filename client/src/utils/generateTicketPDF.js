import { jsPDF } from 'jspdf'
import { DEFAULT_THEATRE_NAME } from '../constants/cinema'

/**
 * Helper to convert SVG QR code element into a PNG DataURL for jsPDF embedding
 */
const getQrDataUrl = async (qrElementId) => {
  try {
    const svgElement = document.getElementById(qrElementId)
    if (!svgElement) return null

    const svgData = new XMLSerializer().serializeToString(svgElement)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = window.URL || window.webkitURL || window
    const blobUrl = url.createObjectURL(svgBlob)

    const img = new Image()
    return new Promise((resolve) => {
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = 240
        canvas.height = 240
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, 240, 240)
        ctx.drawImage(img, 0, 0, 240, 240)
        url.revokeObjectURL(blobUrl)
        resolve(canvas.toDataURL('image/png'))
      }
      img.onerror = () => resolve(null)
      img.src = blobUrl
    })
  } catch (error) {
    console.error('QR DataURL conversion error:', error)
    return null
  }
}

/**
 * Helper to load an image URL into a DataURL for jsPDF
 */
const getImageDataUrl = async (imageUrl) => {
  if (!imageUrl) return null
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        resolve(canvas.toDataURL('image/jpeg'))
      } catch (e) {
        resolve(null)
      }
    }
    img.onerror = () => resolve(null)
    img.src = imageUrl
  })
}

/**
 * Generates and downloads a cinema-style PDF ticket using jsPDF
 */
export const generateTicketPDF = async ({
  bookingId = 'N/A',
  movieTitle = 'Movie Ticket',
  theatre = DEFAULT_THEATRE_NAME,
  showDate = 'N/A',
  showTime = 'N/A',
  seats = [],
  amount = 0,
  isPaid = true,
  posterUrl = '',
  qrElementId = ''
}) => {
  // Create jsPDF document (Width: 120mm, Height: 180mm)
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: [120, 180]
  })

  const seatsString = Array.isArray(seats) ? seats.join(', ') : seats

  // 1. Ticket Outer Dark Background Card
  doc.setFillColor(18, 18, 22) // #121216
  doc.rect(0, 0, 120, 180, 'F')

  // 2. Top Header Accent Banner
  doc.setFillColor(248, 69, 101) // #F84565 (Primary)
  doc.rect(0, 0, 120, 18, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(255, 255, 255)
  doc.text('QUICKSHOW • CINEMA PASS', 60, 11, { align: 'center' })

  // 3. Movie Poster (if loaded) or Styled Box
  const posterData = posterUrl ? await getImageDataUrl(posterUrl) : null
  if (posterData) {
    try {
      doc.addImage(posterData, 'JPEG', 10, 24, 30, 45)
    } catch (e) {
      doc.setFillColor(30, 30, 38)
      doc.rect(10, 24, 30, 45, 'F')
    }
  } else {
    doc.setFillColor(30, 30, 38)
    doc.rect(10, 24, 30, 45, 'F')
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text('POSTER', 25, 48, { align: 'center' })
  }

  // 4. Movie Title & Subheader
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(255, 255, 255)
  
  // Wrap title if too long
  const splitTitle = doc.splitTextToSize(movieTitle.toUpperCase(), 70)
  doc.text(splitTitle, 46, 32)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(248, 69, 101)
  doc.text(theatre, 46, 32 + (splitTitle.length * 5))

  doc.setFontSize(8)
  doc.setTextColor(160, 160, 170)
  doc.text(`TICKET ID: #${bookingId}`, 46, 38 + (splitTitle.length * 5))

  // 5. Divider Line (Perforated Coupon Line)
  doc.setDrawColor(248, 69, 101)
  doc.setLineWidth(0.4)
  doc.line(10, 75, 110, 75)

  // 6. Ticket Details Section
  let y = 85

  // Date & Time Box
  doc.setFillColor(25, 25, 32)
  doc.roundedRect(10, y, 100, 16, 2, 2, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(160, 160, 170)
  doc.text('DATE & SHOWTIME', 15, y + 6)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(255, 255, 255)
  doc.text(`${showDate}  •  ${showTime}`, 15, y + 12)

  y += 22

  // Seats Box
  doc.setFillColor(25, 25, 32)
  doc.roundedRect(10, y, 100, 16, 2, 2, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(160, 160, 170)
  doc.text('SEAT NUMBERS', 15, y + 6)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(248, 69, 101)
  doc.text(seatsString || 'Standard', 15, y + 12)

  y += 22

  // Amount & Status Row
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(160, 160, 170)
  doc.text('TOTAL AMOUNT:', 10, y + 4)

  doc.setFontSize(12)
  doc.setTextColor(255, 255, 255)
  doc.text(`Rs. ${Number(amount || 0).toLocaleString('en-IN')}`, 45, y + 4)

  doc.setFontSize(9)
  doc.setTextColor(isPaid ? 34 : 245, isPaid ? 197 : 158, isPaid ? 94 : 11) // Green / Amber
  doc.text(isPaid ? '• CONFIRMED & PAID' : '• PENDING PAYMENT', 110, y + 4, { align: 'right' })

  // 7. QR Code Embedding Section
  y += 12
  const qrDataUrl = qrElementId ? await getQrDataUrl(qrElementId) : null
  if (qrDataUrl) {
    try {
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(42, y, 36, 36, 2, 2, 'F')
      doc.addImage(qrDataUrl, 'PNG', 44, y + 2, 32, 32)
    } catch (e) {
      console.warn('QR PDF embed failed:', e)
    }
  }

  // Footer Instructions
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(130, 130, 140)
  doc.text('Please present this digital pass or QR code at cinema entrance.', 60, 172, { align: 'center' })

  // Save PDF file
  const filename = `QuickShow_Ticket_${bookingId}.pdf`
  doc.save(filename)
}

export default generateTicketPDF
