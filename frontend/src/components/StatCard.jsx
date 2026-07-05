export default function StatCard({ label, value, icon: Icon, accent, iconBg }) {
  return (
    <div
      className="stat-card"
      style={{ "--stat-accent": accent, "--stat-icon-bg": iconBg }}
    >
      <div>
        <p className="label">{label}</p>
        <p className="value">{value}</p>
      </div>
      <div className="stat-icon">
        <Icon size={18} />
      </div>
    </div>
  );
}
