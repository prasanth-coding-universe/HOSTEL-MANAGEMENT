function StatCard({ label, value, accent }) {
  return (
    <div className="stat-card">
      <div className={`stat-accent ${accent}`} />
      <div>
        <p>{label}</p>
        <h3>{value}</h3>
      </div>
    </div>
  );
}

export default StatCard;
