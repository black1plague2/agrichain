"use client";

export type StepState = "pending" | "active" | "done" | "error";
export type Step = { label: string; state: StepState; txHash?: string; error?: string };

const AMOY_EXPLORER = "https://amoy.polygonscan.com";

/**
 * Shows every step of a multi-transaction flow live, in-app — not left to MetaMask's own popups,
 * which only show one step at a time with no memory of what already happened. Built because
 * "approve then open escrow" felt opaque with just a changing button label.
 */
export function TransactionSteps({ steps }: { steps: Step[] }) {
  if (steps.length === 0) return null;

  return (
    <ul className="flex flex-col gap-2 border border-border-subtle bg-layer p-3">
      {steps.map((step, i) => (
        <li key={i} className="flex items-center gap-2.5 text-sm">
          <span
            className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[11px] ${
              step.state === "done"
                ? "bg-success text-text-on-color"
                : step.state === "active"
                  ? "animate-pulse-ring bg-accent text-text-on-color"
                  : step.state === "error"
                    ? "bg-danger text-text-on-color"
                    : "bg-bg text-text-placeholder border border-border-subtle"
            }`}
          >
            {step.state === "done" ? "✓" : step.state === "error" ? "!" : i + 1}
          </span>
          <span
            className={
              step.state === "pending"
                ? "text-text-placeholder"
                : step.state === "error"
                  ? "text-danger"
                  : "text-text-primary"
            }
          >
            {step.label}
          </span>
          {step.txHash && (
            <a
              href={`${AMOY_EXPLORER}/tx/${step.txHash}`}
              target="_blank"
              rel="noreferrer"
              className="ml-auto flex-shrink-0 text-xs text-accent underline"
            >
              view tx ↗
            </a>
          )}
          {step.error && <span className="ml-auto flex-shrink-0 text-xs text-danger">{step.error}</span>}
        </li>
      ))}
    </ul>
  );
}
