import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, UserCircle } from 'lucide-react';
import { useStore } from '../store';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const { data } = useStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const q = query(collection(db, 'chat_geral'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    await addDoc(collection(db, 'chat_geral'), {
      text: newMessage,
      sender: data.selectedProfile || 'Visitante',
      createdAt: serverTimestamp(),
    });
    setNewMessage('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-[#0A192F] text-white p-4 rounded-full shadow-xl hover:bg-[#D4AF37] transition-all transform hover:scale-105"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      ) : (
        <div className="bg-white w-80 h-96 rounded-2xl shadow-2xl flex flex-col border border-slate-200 animate-in slide-in-from-bottom-4 duration-200">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl">
            <h3 className="font-bold text-slate-800">Chat da Equipe</h3>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m) => (
              <div key={m.id} className={`flex flex-col ${m.sender === (data.selectedProfile || 'Visitante') ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] font-bold text-slate-400 mb-0.5">{m.sender}</span>
                <div className={`text-sm p-3 rounded-2xl ${m.sender === (data.selectedProfile || 'Visitante') ? 'bg-[#0A192F] text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-3 border-t border-slate-100 flex items-center gap-2">
            <input 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none"
              placeholder="Digite sua mensagem..."
            />
            <button onClick={sendMessage} className="p-2 bg-[#D4AF37] text-[#0A192F] rounded-lg">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
