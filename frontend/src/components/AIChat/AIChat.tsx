import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../../lib/api';
import { Button } from '../ui/Button';
import { Card, CardBody } from '../ui/Card';

interface Message {
  role: string;
  content: string;
}

export default function AIChat({ title = 'Assistant IA', placeholder = 'Ta question...' }: { title?: string; placeholder?: string }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [convId, setConvId] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const createConv = useMutation({
    mutationFn: () => api.post('/ai/conversations', {}, { params: { title: 'Chat IA' } }),
    onSuccess: (res) => setConvId(res.data.id),
  });

  const sendMsg = async () => {
    if (!input.trim() || streaming) return;
    const cid = convId || (await createConv.mutateAsync()).id;
    const userMsg = input;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setStreaming(true);

    const token = sessionStorage.getItem('access_token');
    try {
      const response = await fetch(`/api/v1/ai/conversations/${cid}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: userMsg }),
      });

      if (!response.ok) throw new Error('API error');
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assistantMsg = '';

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.token) {
                assistantMsg += data.token;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: 'assistant', content: assistantMsg };
                  return updated;
                });
              }
            } catch { /* skip malformed */ }
          }
        }
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: "Erreur de communication avec l'assistant" }]);
    } finally {
      setStreaming(false);
    }
  };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
      <Card className="flex-1 flex flex-col">
        <CardBody className="flex-1 overflow-y-auto space-y-3">
          {messages.length === 0 && (
            <p className="text-gray-400 text-center py-12">Pose une question sur tes cours !</p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] px-4 py-2 rounded-xl text-sm ${
                m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'
              }`}>
                {m.role === 'assistant' && m.content === '' && streaming ? (
                  <span className="inline-flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                ) : m.content}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </CardBody>
        <div className="px-6 py-4 border-t flex gap-2">
          <input
            className="flex-1 border rounded-lg px-3 py-2 text-sm"
            placeholder={placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMsg()}
            disabled={streaming}
          />
          <Button onClick={sendMsg} disabled={streaming}>{streaming ? '...' : 'Envoyer'}</Button>
        </div>
      </Card>
    </div>
  );
}
