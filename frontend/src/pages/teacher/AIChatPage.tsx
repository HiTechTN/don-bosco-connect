import AIChat from '../../components/AIChat/AIChat';
import { useTranslation } from 'react-i18next';

export default function TeacherAI() {
  const { t } = useTranslation();
  return <AIChat title={t('teacher_ai.title')} placeholder={t('teacher_ai.placeholder')} />;
}
