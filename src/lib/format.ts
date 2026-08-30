const rp = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const num = new Intl.NumberFormat("id-ID");

export function formatRupiah(n: number): string {
  return rp.format(n);
}

export function formatRupiahCompact(n: number): string {
  return "Rp" + num.format(n);
}

export function formatNumber(n: number): string {
  return num.format(n);
}
