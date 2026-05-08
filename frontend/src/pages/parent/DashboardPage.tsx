import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, UserCheck, MessageSquare } from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card';
import { useAuthStore } from '../../store/authStore';

export default function ParentDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // For MVP, show links to grades and absences
  const cards = [
    { label: 'Notes des enfants', icon: ClipboardList, color: 'text-blue-600 bg-blue-100', path: '/parent/grades' },
    { label: 'Absences', icon: UserCheck, color: 'text-orange-600 bg-orange-100', path: '/parent/absences' },
    { label: 'Messages', icon: MessageSquare, color: 'text-purple-600 bg-purple-100', path: '/parent/messages', disabled: true },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Bonjour, {user?.first_name}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Card key={c.label} onClick={c.disabled ? undefined : () => navigate(c.path)}>
            <CardBody>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${c.color}`}>
                  <c.icon className="h-6 w-6" />
                </div>
                <p className="text-lg font-semibold">{c.label}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}