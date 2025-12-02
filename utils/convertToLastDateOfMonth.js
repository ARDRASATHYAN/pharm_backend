exports.convertToLastDateOfMonth = function (expiry) {
  if (!expiry) return null; // safety

  // formats allowed: "MM/YYYY" or "MM-YYYY"
  const [month, year] = expiry.includes('/') 
    ? expiry.split('/') 
    : expiry.split('-');

  const y = Number(year);
  const m = Number(month);

  if (!y || !m) return null;

  // Get last day of month
  const lastDay = new Date(y, m, 0).getDate();

  return `${y}-${String(m).padStart(2, "0")}-${lastDay}`;
};
