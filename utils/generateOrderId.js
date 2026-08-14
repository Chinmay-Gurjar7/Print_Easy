function generateOrderId() {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `QP-${random}`;
}

module.exports = generateOrderId;