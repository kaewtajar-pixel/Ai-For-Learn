interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  change?: string;
}

export default function StatCard({ label, value, icon, color = 'blue', change }: StatCardProps) {
  const colorMap: Record<string, string> = {
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/20',
    green: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/20',
    orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/20',
    pink: 'from-pink-500/20 to-pink-600/10 border-pink-500/20',
  };

  const iconColorMap: Record<string, string> = {
    blue: 'text-blue-400 bg-blue-500/20',
    green: 'text-emerald-400 bg-emerald-500/20',
    purple: 'text-purple-400 bg-purple-500/20',
    orange: 'text-orange-400 bg-orange-500/20',
    pink: 'text-pink-400 bg-pink-500/20',
  };

  return (
    <div className={`glass-card bg-gradient-to-br ${colorMap[color] || colorMap.blue} p-6 animate-fade-in`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${iconColorMap[color] || iconColorMap.blue} flex items-center justify-center`}>
          {icon}
        </div>
        {change && (
          <span className="badge badge-green text-xs">{change}</span>
        )}
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-slate-400 text-sm">{label}</div>
    </div>
  );
}
