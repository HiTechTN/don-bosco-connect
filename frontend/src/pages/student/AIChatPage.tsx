import AIChat from '../../components/AIChat/AIChat';
import { useTranslation } from 'react-i18next';

export default function StudentAIChat() {
  const { t } = useTranslation();
  return <AIChat title={t('student_ai.title')} placeholder={t('student_ai.placeholder')} />;
}
