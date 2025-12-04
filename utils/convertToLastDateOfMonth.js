exports.convertToLastDateOfMonth = function (expiry) {
  if (!expiry) return null;

  let [month, year] = expiry.includes("/")
    ? expiry.split("/")
    : expiry.split("-");

  let m = Number(month);
  let y = Number(year);

  // If year is in two-digit format like 25 => convert to 2025
  if (y < 100) {
    y = 2000 + y;  // you can change to 1900 if needed
  }

  if (!m || !y) return null;

  const lastDay = new Date(y, m, 0).getDate();

  return `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
};
