const NumberFormat = new Intl.NumberFormat("ng-NG", {
  style: "currency",
  currency: "NGN",
});

const formatCurrency = (value: number): string =>
  NumberFormat.format(value).slice(0, -3).replace("NGN", "₦");

export default formatCurrency;
