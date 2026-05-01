interface SectionHeaderProps {
  label: string;
  heading: React.ReactNode;
  display?: boolean;
}

export function SectionHeader({ label, heading, display = false }: SectionHeaderProps) {
  return (
    <div className="text-center">
      <span className="section-label">{label}</span>
      <h2 className={`mt-4 ${display ? "display-heading" : "section-heading"}`}>{heading}</h2>
    </div>
  );
}
