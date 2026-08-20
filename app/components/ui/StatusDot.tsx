const STATUS_CONFIG = {
  REGISTERED: { color: "var(--ink-faint)", label: "Registered" },
  IN_TRANSIT: { color: "var(--mustard)", label: "In transit" },
  DELIVERED: { color: "var(--terracotta)", label: "Awaiting weigh-in" },
  RESOLVED: { color: "var(--mustard-deep)", label: "Settled" },
  DISPUTED: { color: "var(--terracotta-deep)", label: "Disputed" },
  REFUNDED: { color: "var(--ink-soft)", label: "Refunded" },
} as const;

export type BatchStatusKey = keyof typeof STATUS_CONFIG;

export function StatusDot({ status, className = "" }: { status: BatchStatusKey; className?: string }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="status-dot" style={{ backgroundColor: config.color }} />
      <span className="text-sm">{config.label}</span>
    </span>
  );
}
