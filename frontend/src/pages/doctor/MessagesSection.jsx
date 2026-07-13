import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Loader2 } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';
import axios from 'axios';

export default function MessagesSection({ user, token }) {
  const [patientId, setPatientId] = useState('');
  const [activePatientId, setActivePatientId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const {
    joinRoom,
    sendMessage,
    onReceiveMessage,
    emitTyping,
    emitStopTyping,
    onUserTyping,
    onUserStopTyping,
  } = useSocket(user?.id);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!activePatientId) return;
    const cleanup = onReceiveMessage((message) => {
      setMessages((prev) => {
        const exists = prev.find(m => m.id === message.id);
        if (exists) return prev;
        return [...prev, message];
      });
    });
    return cleanup;
  }, [activePatientId, onReceiveMessage]);

  useEffect(() => {
    if (!activePatientId) return;
    const cleanupTyping = onUserTyping(() => setIsTyping(true));
    const cleanupStopTyping = onUserStopTyping(() => setIsTyping(false));
    return () => { cleanupTyping(); cleanupStopTyping(); };
  }, [activePatientId, onUserTyping, onUserStopTyping]);

  const handleLoadConversation = async () => {
    if (!patientId) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/doctors/messages/${patientId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(res.data.messages);
      setActivePatientId(parseInt(patientId));
      joinRoom(parseInt(patientId));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !activePatientId) return;
    sendMessage(activePatientId, messageInput);
    emitStopTyping(activePatientId);
    setMessageInput('');
  };

  const handleTyping = (e) => {
    setMessageInput(e.target.value);
    if (activePatientId) {
      emitTyping(activePatientId);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        emitStopTyping(activePatientId);
      }, 1000);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
        <p className="text-slate-500 mt-1">Chat en temps réel avec vos patients</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Panel gauche */}
        <Card className="border-slate-100 shadow-none p-4 col-span-1">
          <div className="space-y-3">
            <div>
              <Label className="mb-2 block text-slate-700">ID du patient</Label>
              <Input
                placeholder="ex: 3"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLoadConversation()}
                className="border-slate-200"
              />
            </div>
            <Button
              onClick={handleLoadConversation}
              disabled={!patientId || loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Chargement...</>
              ) : (
                'Ouvrir la conversation'
              )}
            </Button>

            {activePatientId && (
              <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-emerald-600 font-medium">
                    Connecté — Patient #{activePatientId}
                  </span>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Panel droit — chat */}
        <Card className="border-slate-100 shadow-none col-span-2 flex flex-col" style={{ height: '550px' }}>
          <div className="p-4 border-b border-slate-100 flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                {activePatientId ? 'P' : '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-slate-800">
                {activePatientId ? `Patient #${activePatientId}` : 'Sélectionnez un patient'}
              </p>
              {isTyping && (
                <p className="text-xs text-emerald-500 animate-pulse">en train d'écrire...</p>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {!activePatientId ? (
              <div className="h-full flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                  <Send className="w-5 h-5 text-slate-300" />
                </div>
                <p className="text-slate-400 text-sm">Entrez l'ID du patient pour commencer</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-3">
                <p className="text-slate-400 text-sm">Aucun message — commencez la conversation !</p>
              </div>
            ) : (
              <>
                {messages.map((m, i) => (
                  <div key={m.id || i} className={`flex ${m.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex flex-col gap-1 max-w-xs ${m.senderId === user.id ? 'items-end' : 'items-start'}`}>
                      <div className={`px-4 py-2 rounded-2xl text-sm ${
                        m.senderId === user.id
                          ? 'bg-emerald-500 text-white rounded-br-sm'
                          : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                      }`}>
                        {m.content}
                      </div>
                      <span className="text-xs text-slate-400">
                        {m.createdAt ? formatTime(m.createdAt) : ''}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <div className="p-4 border-t border-slate-100">
            <div className="flex gap-2">
              <Input
                placeholder={activePatientId ? "Écrire un message..." : "Sélectionnez d'abord un patient"}
                value={messageInput}
                onChange={handleTyping}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={!activePatientId}
                className="border-slate-200"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!activePatientId || !messageInput.trim()}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}