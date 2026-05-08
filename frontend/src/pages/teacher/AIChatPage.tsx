import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Card, CardBody } from '../../components/ui/Card';

export default function TeacherAI() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [convId, setConvId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const createConv = useMutation({
    mutationFn: () => api.post('/ai/conversations', {}, { params: { title: 'Chat enseignant' } }),
    onSuccess: (res) => setConvId(res.data.id),
  });

  const sendMsg = async () => {
    if (!input.trim()) return;
    const cid = convId || (await createConv.mutateAsync()).id;
    setMessages((prev) => [...prev, { role: 'user', content: input }]);
    setInput('');

    const token = sessionStorage.getItem('access_token');
    const evtSource = new EventSource(
      `/api/v1/ai/conversations/${cid}/messages?token=${token}`,
    );
    // SSE via form POST would need different setup; use axios POST with streaming
    try {
      const res = await api.post(`/ai/conversations/${cid}/messages`, { content: input });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data }]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Erreur de communication' }]);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Assistant IA</h1>
      <Card className="flex-1 flex flex-col">
        <CardBody className="flex-1 overflow-y-auto space-y-3">
          {messages.length === 0 && (
            <p className="text-gray-400 text-center py-12">
              Posez une question sur vos cours
            </p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[70%] px-4 py-2 rounded-xl text-sm ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </CardBody>
        <div className="px-6 py-4 border-t flex gap-2">
          <input
            className="flex-1 border rounded-lg px-3 py-2 text-sm"
            placeholder="Votre question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMsg()}
          />
          <Button onClick={sendMsg}>Envoyer</Button>
        </div>
      </Card>
    </div>
  );
}