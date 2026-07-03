export function Chip({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: 'ink' | 'faint';
}) {
  const cls =
    variant === 'ink'
      ? 'border border-ink px-[10px] py-[2px] text-[13px]'
      : 'border border-faint text-body px-2 py-[1px] text-[12px]';
  return <span className={cls}>{children}</span>;
}
