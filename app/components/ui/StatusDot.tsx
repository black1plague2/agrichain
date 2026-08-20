import { dict } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";

const STATUS_CLASSES = {
  REGISTERED: "bg-layer text-text-secondary",
  IN_TRANSIT: "bg-info-tint text-info",
  DELIVERED: "bg-warning-tint text-text-primary",
  RESOLVED: "bg-success-tint text-success",
  DISPUTED: "bg-danger-tint text-danger",
  REFUNDED: "bg-layer text-text-secondary",
} as const;

export type BatchStatusKey = keyof typeof STATUS_CLASSES;

/** Carbon-style status tag — a colored pill, not a dot-plus-label. */
export function StatusDot({
  status,
  locale,
  className = "",
}: {
  status: BatchStatusKey;
  locale: Locale;
  className?: string;
}) {
  const t = dict(locale).status;
  const labels: Record<BatchStatusKey, string> = {
    REGISTERED: t.registered,
    IN_TRANSIT: t.inTransit,
    DELIVERED: t.awaitingWeighIn,
    RESOLVED: t.settled,
    DISPUTED: t.disputed,
    REFUNDED: t.refunded,
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium ${STATUS_CLASSES[status]} ${className}`}>
      {labels[status]}
    </span>
  );
}
