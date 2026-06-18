
import { useEffect, useRef } from 'react';
import { useStore } from '../store';
import { showToast, getTodayString } from '../lib/utils';

export function NotificationWatcher() {
  const { data } = useStore();
  const tarefas = data.tarefas_suporte || [];
  const notifiedTasks = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Request permission on mount if not already granted/denied
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const today = getTodayString();
    
    tarefas.forEach(t => {
      const isCompleted = t.status === 'concluído' || t.status === 'resolvido' || t.status === 'feito';
      if (!isCompleted && t.prazo && t.prazo <= today && !notifiedTasks.current.has(t.id)) {
        
        const isOverdue = t.prazo < today;
        const msg = isOverdue ? `Tarefa atrasada: ${t.titulo}` : `Tarefa para hoje: ${t.titulo}`;

        // Toast
        showToast(msg, 'error');

        // Desktop Notification
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          new Notification('ALERTA DE PRAZO', {
            body: msg,
            icon: '/icon.png' // Ensure this exists or use valid icon
          });
        }

        notifiedTasks.current.add(t.id);
      }
    });

  }, [tarefas]);

  return null;
}
