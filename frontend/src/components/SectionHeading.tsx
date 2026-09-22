type SectionHeadingProps = {
  label?: string;
  title: string;
  description?: string;
  subtitle?: string;
};

export default function SectionHeading({ label, title, description, subtitle }: SectionHeadingProps) {
  const text = description ?? subtitle;

  return (
    <div className="mb-8 max-w-3xl">
      {label ? (
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-600">{label}</p>
      ) : null}
      <h2 className="mt-2 text-3xl font-semibold text-slate-900 sm:text-4xl">{title}</h2>
      {text ? <p className="mt-3 text-slate-600 sm:text-lg">{text}</p> : null}
    </div>
  );
}
