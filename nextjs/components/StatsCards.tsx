import { BarChart3, Users, Zap } from 'lucide-react';

export function StatsCards({ stats }: { stats: { total: number; active: number; community: number } }) {
 const items = [['TOTAL MEMBERS', stats.total, Users, 'registered identities'], ['TOTAL ACTIVE MEMBERS', stats.active, Zap, 'online right now'], ['ACTIVE IN COMMUNITY', stats.community, BarChart3, 'posting identities']] as const;
 return <section className="stats-grid">{items.map(([label, value, Icon, caption]) => <div className="stat-card" key={label}><span>{label}</span><strong>{value.toLocaleString()}</strong><small><Icon/> {caption}</small></div>)}</section>;
}