export default function Stars({ value }: { value: number }) {
  const r = Math.round(value || 0);
  return (
    <span className="a-stars" aria-label={`${r} dari 5`}>
      {"★".repeat(r)}
      <span className="off">{"★".repeat(5 - r)}</span>
    </span>
  );
}
