const NumberFormat = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

// Formats whole Naira amounts, e.g. 25000 -> "₦25,000".
const formatCurrency = (value: number): string => NumberFormat.format(value);

export default formatCurrency;
