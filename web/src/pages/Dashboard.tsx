import { useAuthStore } from '../stores/authStore';
import {
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Award,
} from 'lucide-react';
import './Dashboard.css';

export function Dashboard() {
  const { user, dashboard } = useAuthStore();
  const d = dashboard;

  if (user?.role === 'admin') {
    return <AdminDashboard stats={d?.stats} />;
  }
  if (user?.role === 'prof') {
    return <ProfDashboard subjects={d?.subjects} classes={d?.classes} />;
  }
  if (user?.role === 'student') {
    return (
      <StudentDashboard
        profile={d?.profile}
        classe={d?.classe}
      />
    );
  }
  return <ParentDashboard children={d?.children} />;
}

function AdminDashboard({ stats }: { stats?: any }) {
  return (
    <div className="dashboard">
      <h1>Dashboard Administrateur</h1>
      <div className="stats-grid">
        <StatCard
          icon={Users}
          label="Total Élèves"
          value={stats?.total_students || 0}
          color="#3b82f6"
        />
        <StatCard
          icon={GraduationCap}
          label="Professeurs"
          value={stats?.total_profs || 0}
          color="#10b981"
        />
        <StatCard
          icon={BookOpen}
          label="Classes"
          value={stats?.total_classes || 0}
          color="#8b5cf6"
        />
        <StatCard
          icon={TrendingUp}
          label="Matières"
          value={stats?.total_subjects || 0}
          color="#f59e0b"
        />
      </div>
    </div>
  );
}

function ProfDashboard({ subjects, classes }: { subjects?: any[]; classes?: any[] }) {
  return (
    <div className="dashboard">
      <h1>Dashboard Professeur</h1>
      <div className="stats-grid">
        <StatCard
          icon={BookOpen}
          label="Mes Cours"
          value={subjects?.length || 0}
          color="#3b82f6"
        />
        <StatCard
          icon={Users}
          label="Mes Classes"
          value={classes?.length || 0}
          color="#10b981"
        />
      </div>
    </div>
  );
}

function StudentDashboard({ profile, classe }: { profile?: any; classe?: any }) {
  return (
    <div className="dashboard">
      <h1>Bienvenue, {profile?.user?.first_name || 'Élève'}!</h1>
      <div className="welcome-card">
        <div className="level-display">
          <Award size={32} />
          <span>Niveau {profile?.level || 1}</span>
        </div>
        <div className="xp-display">
          <span>{profile?.xp_points || 0} XP</span>
        </div>
      </div>
      <div className="stats-grid">
        <StatCard
          icon={BookOpen}
          label="Ma Classe"
          value={classe?.name || '-'}
          color="#3b82f6"
        />
        <StatCard
          icon={Award}
          label="Badges"
          value={profile?.badges?.length || 0}
          color="#f59e0b"
        />
      </div>
    </div>
  );
}

function ParentDashboard({ children }: { children?: any[] }) {
  return (
    <div className="dashboard">
      <h1>Dashboard Parent</h1>
      <div className="dashboard-section">
        <h2>Mes Enfants</h2>
        {children?.map((child: any) => (
          <div key={child.id} className="child-card">
            {child.first_name} {child.last_name}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: color }}>
        <Icon size={24} />
      </div>
      <div className="stat-info">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
      </div>
    </div>
  );
}