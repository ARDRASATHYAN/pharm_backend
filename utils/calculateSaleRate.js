'use strict';

module.exports = function calculateSaleRate({ mrp, discount_percent = 0 }) {
  const mrpNum = Number(mrp || 0);
  const disc = Number(discount_percent || 0);

  if (mrpNum <= 0) return 0;

  // OPTIONAL: apply sales discount at stock time
  if (disc > 0) {
    const discountAmount = (mrpNum * disc) / 100;
    return Number((mrpNum - discountAmount).toFixed(2));
  }

  // DEFAULT: sell at MRP
  return mrpNum;
};
