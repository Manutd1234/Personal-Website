export default function SectionKicker({ number, label }) {
  return (
    <div className="section-kicker">
      <span>{number}</span>
      <p>{label}</p>
    </div>
  );
}
