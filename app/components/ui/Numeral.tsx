export function Numeral({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={`tabular ${className}`}>{children}</span>;
}

/** Formats a bigint of 18-decimal AGRI wei into a plain "1,234" string with 2 decimals dropped for demo readability. */
export function formatAgri(amountWei: bigint): string {
  const whole = amountWei / 10n ** 18n;
  return whole.toLocaleString("en-IN");
}

export function formatKg(kg: bigint | number): string {
  return Number(kg).toLocaleString("en-IN");
}
