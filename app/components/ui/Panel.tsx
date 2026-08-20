export function Panel({
  children,
  title,
  stamp,
  className = "",
}: {
  children: React.ReactNode;
  title?: string;
  stamp?: string;
  className?: string;
}) {
  return (
    <div className={`relative border-[1.5px] border-ink bg-paper-raised ${className}`}>
      {title && (
        <div className="flex items-center justify-between border-b-[1.5px] border-ink px-4 py-2.5">
          <h3 className="font-display text-sm uppercase tracking-[0.12em] text-ink-soft">{title}</h3>
          {stamp && (
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">{stamp}</span>
          )}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}
