 
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Card, CardBody } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { useTranslation } from 'react-i18next';

export default function StudentQuizzes() {
  const { t } = useTranslation();
  const [selectedQuiz, setSelectedQuiz] = useState<Record<string, unknown> | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ score: number; max_score: number } | null>(null);

  const { data: quizzes } = useQuery({
    queryKey: ['quizzes'],
    queryFn: () => api.get('/ai/quizzes').then(r => r.data),
  });

  const { data: questions } = useQuery({
    queryKey: ['quiz-questions', selectedQuiz?.id],
    queryFn: () => api.get(`/ai/quizzes/${selectedQuiz.id}`).then(r => r.data),
    enabled: !!selectedQuiz,
  });

  const submitQuiz = async () => {
    try {
      const res = await api.post(`/ai/quizzes/${selectedQuiz.id}/attempt`, {
        answers: Object.entries(answers).map(([k, v]) => ({ question_id: k, answer: v })),
      });
      setResult(res.data);
    } catch {
      alert(t('student_quizzes.error_submit'));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('student_quizzes.title')}</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {quizzes?.map((q: Record<string, unknown>) => (
          <Card key={q.id} onClick={() => { setSelectedQuiz(q); setResult(null); setAnswers({}); }}>
            <CardBody>
              <h3 className="font-semibold">{q.title}</h3>
              <p className="text-sm text-gray-500">{t('student_quizzes.difficulty')} : {q.difficulty}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <Modal open={!!selectedQuiz} onClose={() => setSelectedQuiz(null)} title={selectedQuiz?.title || 'Quiz'} size="lg">
        {result ? (
          <div className="text-center py-8">
            <p className="text-3xl font-bold text-blue-600">{result.score}/{result.max_score}</p>
            <p className="text-gray-500 mt-2">{t('student_quizzes.score')}</p>
            <Button className="mt-4" onClick={() => { setSelectedQuiz(null); setResult(null); }}>
              {t('student_quizzes.close')}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {questions?.options?.map((opt: Record<string, unknown>, i: number) => (
              <div key={i} className="border rounded-lg p-4">
                <p className="font-medium mb-2">{String(opt.question_text || `${t('student_quizzes.question')} ${i + 1}`)}</p>
                {(opt.options as Array<Record<string, unknown>> | undefined)?.map((o, j) => (
                  <label key={j} className="flex items-center gap-2 py-1 cursor-pointer">
                    <input
                      type="radio"
                      name={`q-${i}`}
                      value={o.text}
                      onChange={(e) => setAnswers({ ...answers, [i]: e.target.value })}
                    />
                    <span className="text-sm">{o.text}</span>
                  </label>
                ))}
              </div>
            ))}
            <Button className="w-full" onClick={submitQuiz}>{t('student_quizzes.submit')}</Button>
          </div>
        )}
      </Modal>
    </div>
  );
}