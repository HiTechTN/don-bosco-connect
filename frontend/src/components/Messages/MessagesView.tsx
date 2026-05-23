import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { Button } from '../ui/Button';
import { Card, CardBody } from '../ui/Card';
import type { MessageThread } from '../../types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function MessagesView(_props: { role: string }) {
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [newMsg, setNewMsg] = useState('');
  const queryClient = useQueryClient();

  const { data: threads } = useQuery({
    queryKey: ['threads'],
    queryFn: () => api.get('/messages/threads').then(r => r.data),
  });

  const { data: messages } = useQuery({
    queryKey: ['messages', selectedThread],
    queryFn: () => api.get(`/messages/threads/${selectedThread}`).then(r => r.data),
    enabled: !!selectedThread,
    refetchInterval: 5000,
  });

  const sendMsg = useMutation({
    mutationFn: (content: string) =>
      api.post(`/messages/threads/${selectedThread}`, { content }),
    onSuccess: () => {
      setNewMsg('');
      queryClient.invalidateQueries({ queryKey: ['messages', selectedThread] });
    },
  });

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      <div className="w-80 flex-shrink-0">
        <h2 className="text-lg font-semibold mb-3">Messages</h2>
        <div className="space-y-2">
          {threads?.map((t: MessageThread) => (
            <button
              key={t.id}
              onClick={() => setSelectedThread(t.id)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-colors ${
                selectedThread === t.id ? 'bg-blue-100 border border-blue-300' : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="font-medium truncate">{t.subject || 'Sans sujet'}</div>
              <div className="text-gray-500 text-xs mt-1">{t.last_message_at || ''}</div>
            </button>
          ))}
          {(!threads || threads.length === 0) && (
            <p className="text-gray-400 text-sm text-center py-8">Aucune conversation</p>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedThread ? (
          <>
            <Card className="flex-1 flex flex-col">
              <CardBody className="flex-1 overflow-y-auto space-y-3">
                {messages?.map((m: Record<string, unknown>) => (
                  <div key={m.id} className={`flex ${m.is_mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-4 py-2 rounded-xl text-sm ${
                      m.is_mine ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'
                    }`}>{m.content}</div>
                  </div>
                ))}
              </CardBody>
            </Card>
            <div className="flex gap-2 mt-3">
              <input
                className="flex-1 border rounded-lg px-3 py-2 text-sm"
                placeholder="Écrire un message..."
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && newMsg.trim() && sendMsg.mutate(newMsg)}
              />
              <Button onClick={() => newMsg.trim() && sendMsg.mutate(newMsg)} disabled={sendMsg.isPending}>
                Envoyer
              </Button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Sélectionne une conversation
          </div>
        )}
      </div>
    </div>
  );
}
