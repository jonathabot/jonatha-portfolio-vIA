export function SectionHeading({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
      <h2 className="m-0 text-[15px] font-bold">{children}</h2>
      {right}
    </div>
  );
}
