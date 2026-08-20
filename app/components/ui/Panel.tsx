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
    <div className={`relative border border-border-subtle bg-bg ${className}`}>
      {title && (
        <div className="flex items-center justify-between border-b border-border-subtle bg-layer px-4 py-3">
          <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
          {stamp && <span className="text-xs text-text-secondary">{stamp}</span>}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}
