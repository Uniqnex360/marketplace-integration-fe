const formatCurrency = (value) =>
  (value !== undefined && value !== null)
    ? value.toLocaleString("en-US", { style: "currency", currency: "USD" })
    : "$0.00";