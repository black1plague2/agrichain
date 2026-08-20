const STATUS_CONFIG = {
  REGISTERED: { classes: "bg-layer text-text-secondary", label: "Registered" },
  IN_TRANSIT: { classes: "bg-info-tint text-info", label: "In Transit" },
  DELIVERED: { classes: "bg-warning-tint text-text-primary", label: "Awaiting Weigh-In" },
  RESOLVED: { classes: "bg-success-tint text-success", label: "Settled" },
  DISPUTED: { classes: "bg-danger-tint text-danger", label: "Disputed" },
  REFUNDED: { classes: "bg-layer text-text-secondary", label: "Refunded" },
} as const;

export type BatchStatusKey = keyof typeof STATUS_CONFIG;

/** Carbon-style status tag — a colored pill, not a dot-plus-label. */
export function StatusDot({ status, className = "" }: { status: BatchStatusKey; className?: string }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium ${config.classes} ${className}`}>
      {config.label}
    </span>
  );
}
