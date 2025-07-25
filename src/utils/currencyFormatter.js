export function formatCurrency(value) {
  if (value === undefined || value === null || isNaN(value)) return "$0.00";
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}