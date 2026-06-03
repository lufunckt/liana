export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function normalizeStatusSlug(status: string): string {
  if (!status) return 'novo-lead';
  const clean = status.trim().toLowerCase();
  if (clean === 'novo' || clean === 'novo lead' || clean === 'novo-lead') return 'novo-lead';
  if (clean === 'contato feito' || clean === 'contato-feito') return 'contato-feito';
  if (clean === 'respondeu') return 'respondeu';
  if (clean === 'em qualificação' || clean === 'em-qualificacao' || clean === 'em qualificacao') return 'em-qualificacao';
  if (clean === 'em negociação' || clean === 'em-negociacao' || clean === 'em negociacao') return 'em-negociacao';
  if (clean === 'aguardando pagamento' || clean === 'aguardando-pagamento') return 'aguardando-pagamento';
  if (clean === 'comprou' || clean === 'comprou / fechado') return 'comprou';
  if (clean === 'sem interesse' || clean === 'sem-interesse') return 'sem-interesse';
  if (clean === 'retomar depois' || clean === 'retomar-depois') return 'retomar-depois';
  if (clean === 'perdido') return 'perdido';
  
  return clean.replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

export function getStatusLabel(status: string): string {
  const norm = normalizeStatusSlug(status);
  const labels: Record<string, string> = {
    'novo-lead': 'Novo lead',
    'contato-feito': 'Contato feito',
    'respondeu': 'Respondeu',
    'em-qualificacao': 'Em qualificação',
    'em-negociacao': 'Em negociação',
    'aguardando-pagamento': 'Aguardando pagamento',
    'comprou': 'Comprou / Fechado',
    'sem-interesse': 'Sem interesse',
    'retomar-depois': 'Retomar depois',
    'perdido': 'Perdido',
  };
  return labels[norm] || status;
}

export function normalizeOnboardingSlug(status: string): string {
  if (!status) return 'acesso-ok';
  const clean = status.trim().toLowerCase();
  if (clean === 'aguardando boas-vindas' || clean === 'aguardando boas vindas' || clean === 'aguardando-boas-vindas') return 'aguardando-boas-vindas';
  if (clean === 'aguardando formulário' || clean === 'aguardando formulario' || clean === 'aguardando-formulario') return 'aguardando-formulario';
  if (clean === 'aguardando grupo' || clean === 'aguardando-grupo') return 'aguardando-grupo';
  if (clean === 'aguardando nutror' || clean === 'aguardando-nutror') return 'aguardando-nutror';
  if (clean === 'aguardando mrp' || clean === 'aguardando-mrp') return 'aguardando-mrp';
  if (clean === 'bônus pendente' || clean === 'bonus pendente' || clean === 'bonus-pendente') return 'bonus-pendente';
  if (clean === 'acesso ok' || clean === 'acesso-ok') return 'acesso-ok';
  if (clean === 'com pendência' || clean === 'com pendencia' || clean === 'com-pendencia') return 'com-pendencia';
  if (clean === 'em acompanhamento' || clean === 'em-acompanhamento') return 'em-acompanhamento';
  if (clean === 'conclído' || clean === 'concluído' || clean === 'concluido') return 'concluido';
  
  return clean.replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

export function getOnboardingLabel(status: string): string {
  const norm = normalizeOnboardingSlug(status);
  const labels: Record<string, string> = {
    'aguardando-boas-vindas': 'Aguardando boas-vindas',
    'aguardando-formulario': 'Aguardando formulário',
    'aguardando-grupo': 'Aguardando grupo',
    'aguardando-nutror': 'Aguardando Nutror',
    'aguardando-mrp': 'Aguardando MRP',
    'bonus-pendente': 'Bônus pendente',
    'acesso-ok': 'Acesso OK',
    'com-pendencia': 'Com pendência',
    'em-acompanhamento': 'Em acompanhamento',
    'concluido': 'Concluído'
  };
  return labels[norm] || status;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
  window.dispatchEvent(new CustomEvent('ilg_show_toast', { detail: { message, type } }));
}

// Intercept window.alert for modern non-blocking toasts seamlessly
if (typeof window !== 'undefined') {
  (window as any).alert = (message: string) => {
    // If it's an error message template, show error toast
    const lower = String(message).toLowerCase();
    const type = lower.includes('erro') || lower.includes('falha') || lower.includes('failed') ? 'error' : 'success';
    showToast(message, type);
  };
}

