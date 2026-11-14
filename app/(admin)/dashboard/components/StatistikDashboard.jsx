const Icon = ({ children }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

export default function StatistikDashboard({ stats }) {
  return (
    <section className="m-stats">
      {stats.map((s) => (
        <div className="m-stat" key={s.label}>
          <Icon>{s.icon}</Icon>
          <b>{s.label}</b>
          <span>{s.value}</span>
        </div>
      ))}
    </section>
  );
}