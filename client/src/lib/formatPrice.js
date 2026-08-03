/**
 * Indian Rupee (₹) Price Formatter
 * Formats numeric amounts consistently into Indian currency format (e.g. ₹250, ₹775, ₹1,250)
 */
export const formatPrice = (amount) => {
  const num = Number(amount) || 0
  return '₹' + num.toLocaleString('en-IN')
}

export default formatPrice
