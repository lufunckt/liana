import React, { useState, useEffect } from 'react';
import { 
  X, Save, MessageSquare, Plus, Check, MessageCircle, Send, 
  Phone, Mail, User, Info, Tag, Layers, CheckSquare, Award, 
  Printer, Trash2, Edit3, Sparkles, Building, Calendar, DollarSign,
  HelpCircle, CheckCircle, ShieldAlert, FileText, BadgeAlert
} from 'lucide-react';
import { useStore } from '../../store';
import { cn, showToast, normalizeStatusSlug, normalizeOnboardingSlug, getStatusLabel, getOnboardingLabel } from '../../lib/utils';
import { usePermissions } from '../../lib/permissions';
import { TagManagerModal } from '../TagManagerModal';
import { logAuditEvent } from '../../lib/audit';

const COMPANY_PIX_CNPJ = '51.533.488/0001-09';

export function PessoaFicha({ pessoa, onClose }: { pessoa: any, onClose: () => void }) {
  if (!pessoa) return null;

  const { data, updateSingleField, addSingleDocument } = useStore();
  const { isReadOnly, hasPermission } = usePermissions();

  useEffect(() => {
    logAuditEvent('view_ficha', pessoa.id, { nome: pessoa.nome });
  }, [pessoa.id, pessoa.nome]);
  const pessoas = data.pessoas || [];
  const tarefas = data.tarefas_suporte || [];

  // Active Sub-Tab
  const [activeSubTab, setActiveSubTab] = useState<'resumo' | 'comercial' | 'onboarding' | 'suporte' | 'financeiro' | 'certificados' | 'historico'>('resumo');

  // Contact Core
  const [nome, setNome] = useState(pessoa.nome || '');
  const [email, setEmail] = useState(pessoa.email || '');
  const [telefone, setTelefone] = useState(pessoa.telefone || '');
  const [tipoPessoa, setTipoPessoa] = useState(pessoa.tipoPessoa || 'lead');

  // Commercial Tab States
  const [origem, setOrigem] = useState(pessoa.origem || 'Tráfego Pago');
  const [status, setStatus] = useState(pessoa.status || 'Novo lead');
  const [produtoInteresse, setProdutoInteresse] = useState(pessoa.produtoInteresse || '');
  const [objecaoPrincipal, setObjecaoPrincipal] = useState(pessoa.objecaoPrincipal || 'Nenhuma');
  const [ultimaInteracao, setUltimaInteracao] = useState(pessoa.ultimaInteracao || '');
  const [proximoContato, setProximoContato] = useState(pessoa.proximoContato || '');
  const [responsavel, setResponsavel] = useState(pessoa.responsavel || 'Ana');
  const [temperatura, setTemperatura] = useState(pessoa.temperatura || 'frio');
  const [tags, setTags] = useState<string[]>(pessoa.tags || ['Interesse']);
  const [novaTag, setNovaTag] = useState('');
  const [observacoes, setObservacoes] = useState(pessoa.observacoes || '');

  // Student Onboarding Tab States
  const [formacao, setFormacao] = useState(pessoa.produtoComprado || pessoa.formacao || '');
  const [turma, setTurma] = useState(pessoa.turma || '');
  const [entrouGrupo, setEntrouGrupo] = useState(pessoa.entrouGrupo || false);
  const [respondeuInicial, setRespondeuInicial] = useState(pessoa.respondeuInicial || false);
  const [bonusEnviado, setBonusEnviado] = useState(pessoa.bonusEnviado || false);
  const [acessoNutror, setAcessoNutror] = useState(pessoa.acessoNutror || false);
  const [acessoMRP, setAcessoMRP] = useState(pessoa.acessoMRP || false);
  const [statusOnboarding, setStatusOnboarding] = useState(pessoa.statusOnboarding || 'Acesso OK');
  const [onboardingPendencias, setOnboardingPendencias] = useState(pessoa.onboardingPendencias || '');

  // Support Tab States - Dynamic list + Add quick ticket
  const [novoTicketTitle, setNovoTicketTitle] = useState('');
  const [novoTicketPrio, setNovoTicketPrio] = useState('alta');

  // Finance Tab States
  const [valorCombinado, setValorCombinado] = useState(pessoa.valorCombinado || '0');
  const [formaPagamento, setFormaPagamento] = useState(pessoa.formaPagamento || 'PIX');
  const [statusFinanceiro, setStatusFinanceiro] = useState(pessoa.statusFinanceiro || 'Pendente');
  const [parcelas, setParcelas] = useState(pessoa.parcelas || '1x');
  const [vencimentos, setVencimentos] = useState(pessoa.vencimentos || '');
  const [comprovantes, setComprovantes] = useState(pessoa.comprovantes || '');
  const [observacoesFinanceiras, setObservacoesFinanceiras] = useState(pessoa.observacoesFinanceiras || '');

  // Timeline logs and Team Discussion
  const [interacoes, setInteracoes] = useState<any[]>(pessoa.interacoes || [
    { text: `Registro inicializado como ${pessoa.tipoPessoa || 'lead'}`, date: 'Sistema', type: 'system' }
  ]);
  const [discussaoInterna, setDiscussaoInterna] = useState<any[]>(pessoa.discussaoInterna || [
    { id: 'disc_init', autorNome: 'Liana Gomes', autorId: 'liana', avatar: '👑', texto: 'Iniciamos o alinhamento de processos desse contato. Qualquer atualização de suporte ou cronograma comercial deve ser postada nesta área!', dataHora: '2026-05-24 10:00' }
  ]);
  const [novaDiscMsg, setNovaDiscMsg] = useState('');
  const [discAutor, setDiscAutor] = useState<'liana' | 'nuria' | 'ana' | 'luiza'>('luiza');

  // WhatsApp helper states
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [messageText, setMessageText] = useState('');
  const [customPhone, setCustomPhone] = useState(pessoa.telefone || '');

  // Onboarding Checklist Guided dialog state
  const [showOnboardingGuideModal, setShowOnboardingGuideModal] = useState(false);

  // New interaction input states
  const [interactDate, setInteractDate] = useState(new Date().toISOString().split('T')[0]);
  const [interactType, setInteractType] = useState('telefone');
  const [interactResp, setInteractResp] = useState(pessoa.responsavel || 'Ana');
  const [interactResumo, setInteractResumo] = useState('');
  const [interactProximoPasso, setInteractProximoPasso] = useState('');
  const [showTagManager, setShowTagManager] = useState(false);

  const tagsList = data.tags_personalizaveis || [];

  const handleRegisterInteraction = () => {
    if (!interactResumo.trim()) {
      showToast('Por favor, informe o resumo da interação.', 'error');
      return;
    }
    const newEntry = {
      text: `[${interactType.toUpperCase()}] ${interactResumo.trim()}`,
      date: interactDate,
      type: interactType,
      responsavel: interactResp,
      resumo: interactResumo.trim(),
      proximoPasso: interactProximoPasso.trim()
    };
    setInteracoes([newEntry, ...interacoes]);
    setInteractResumo('');
    setInteractProximoPasso('');
    showToast('Ação registrada na timeline local! Lembre-se de clicar em "Salvar Alterações" no rodapé para sincronizar definitivo.', 'info');
  };

  // Read certificates dynamically from real-time database streamed state
  const studentCertificates = React.useMemo(() => {
    return (data.certificados_emitidos || []).filter(c => 
      (c.emailAluno && email && c.emailAluno.toLowerCase() === email.toLowerCase()) ||
      (c.nomeAluno && nome && c.nomeAluno.toLowerCase() === nome.toLowerCase())
    );
  }, [data.certificados_emitidos, email, nome]);

  // Intercepting Status change for "Comprou" automation trigger
  const handleStatusChangeAction = (newStatus: string) => {
    const slug = normalizeStatusSlug(newStatus);
    setStatus(slug);
    if (slug === 'comprou') {
      setShowOnboardingGuideModal(true);
    }
  };

  // Predefined message templates
  const templates = [
    {
      id: 'comercial_boas_vindas',
      label: '✨ Comercial: Apresentação & Boas-vistas',
      category: 'Lead',
      text: `Olá, {nome}! Tudo bem? 😊\n\nAqui é a {responsavel} do *Instituto Liana Gomes*.\n\nVi que você se cadastrou com interesse em saber mais sobre a nossa formação em *{produto}*. É um prazer enorme fazer contato!\n\nGostaria de entender melhor o seu momento profissional para explicar como as nossas mentorias funcionam. Você teria 10 minutinhos livres hoje?`
    },
    {
      id: 'comercial_followup',
      label: '💼 Comercial: Follow-up de Proposta',
      category: 'Lead',
      text: `Olá, {nome}! Como vai? 🌸\n\nEstou passando para saber se você conseguiu dar uma olhada nos detalhes e valores facilitados que conversamos sobre a formação em *{produto}*.\n\nComo nossa turma está com as últimas bolsas de estudo, eu gostaria muito de garantir seu nome conosco! Ficou com alguma dúvida? Me avise!`
    },
    {
      id: 'onboarding_nutror',
      label: '💻 Suporte: Boas-vindas + Acesso Nutror',
      category: 'Aluna',
      text: `Olá, {nome}! Seja muito bem-vinda ao *Instituto Liana Gomes*! 🎉💖\n\nAqui é a Núria, responsável pelo suporte de onboarding. É um privilégio enorme ter você conosco na formação em *{produto}*!\n\nPara iniciarmos os preparativos, segue o link de acesso imediato à nossa plataforma de aulas no Nutror:\n💻 Acesso: https://www.nutror.com\n\nQualquer dificuldade no login, basta me avisar por aqui!`
    },
    {
      id: 'onboarding_grupo',
      label: '💬 Suporte: link do Grupo de WhatsApp',
      category: 'Aluna',
      text: `Olá, {nome}! Tudo bem? 🥰\n\nPassando para enviar o convite de acesso ao nosso *Grupo Fechado de Alunas* no WhatsApp para a formação de *{produto}*.\n\nEste chat é essencial para networking, notificações de mentorias ao vivo e compartilhamento de materiais.\n\n👉 Para participar, clique no convite abaixo:\nhttps://chat.whatsapp.com/ExemploGrupoILG\n\nTe vejo lá! Beijo grande.`
    },
    {
      id: 'onboarding_diagnostico',
      label: '📝 Suporte: Formulário de Diagnóstico',
      category: 'Aluna',
      text: `Olá, {nome}! Tudo bem? ✨\n\nEstou acompanhando seu cronograma de onboarding e notei que ainda falta preencher nosso *Formulário de Diagnóstico Inicial*.\n\nEsse documento é crucial para que a Liana e as mentoras alinhem o direcionamento das aulas práticas com seus objetivos!\n\n👉 Responda de forma rápida pelo link:\nhttps://forms.gle/ExemploDiagnosticoILG\n\nObrigada!`
    },
    {
      id: 'financeiro_lembrete',
      label: '💵 Financeiro: Lembrete de Parcela',
      category: 'Geral',
      text: `Olá, {nome}! Espero que esteja super bem. ✨\n\nPassando para lembrar que temos uma parcela da sua formação em *{produto}* programada para vencer nos próximos dias.\n\n💳 Para facilitar seu acerto via PIX, nossa chave CNPJ oficial é:\n🔑 CNPJ: *${COMPANY_PIX_CNPJ}*\n\nAssim que realizar a transferência, compartilhe o comprovante aqui para atualizarmos seu status financeiro. Gratidão!`
    }
  ];

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (!templateId) {
      setMessageText('');
      return;
    }
    const tpl = templates.find(t => t.id === templateId);
    if (tpl) {
      const activeProd = tipoPessoa === 'aluna' ? (formacao || 'Formação Executiva') : (produtoInteresse || 'Formação Líder');
      const activeResp = responsavel || 'Ana';
      let processed = tpl.text
        .replace(/{nome}/g, nome)
        .replace(/{produto}/g, activeProd)
        .replace(/{responsavel}/g, activeResp);
      setMessageText(processed);
    }
  };

  const handleSendWhatsApp = () => {
    const targetPhone = customPhone || telefone;
    if (!targetPhone) {
      alert('Por favor, informe um número de telefone com DDD válido.');
      return;
    }
    let cleanPhone = String(targetPhone).replace(/\D/g, '');
    if (cleanPhone.length > 0 && !cleanPhone.startsWith('55') && cleanPhone.length <= 11) {
      cleanPhone = '55' + cleanPhone;
    }
    const encodedText = encodeURIComponent(messageText);
    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;

    // Record timeline log
    const templateName = templates.find(t => t.id === selectedTemplate)?.label || 'Mensagem Manual';
    setInteracoes(prev => [
      { text: `[Conversa WhatsApp] Mensagem enviada: "${templateName}" para +${targetPhone}`, date: 'Agora', type: 'whatsapp' },
      ...prev
    ]);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Add Discussion internal notes
  const handleAddDiscMsg = () => {
    if (!novaDiscMsg.trim()) return;
    const authorMap = {
      liana: { nome: 'Liana Gomes', avatar: '👑' },
      nuria: { nome: 'Núria Onboarding', avatar: '🌸' },
      ana: { nome: 'Ana Comercial', avatar: '💼' },
      luiza: { nome: 'Luiza Gestão', avatar: '⚡' }
    };
    const sel = authorMap[discAutor || 'luiza'];
    const newMsg = {
      id: 'disc_' + Date.now(),
      autorNome: sel.nome,
      autorId: discAutor,
      avatar: sel.avatar,
      texto: novaDiscMsg.trim(),
      dataHora: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setDiscussaoInterna(prev => [...prev, newMsg]);
    setNovaDiscMsg('');
  };

  // Quick Support Ticket Creation
  const handleAddNewSupportTicket = async () => {
    if (!novoTicketTitle.trim()) return;
    try {
      const ticketId = 'task_' + Date.now();
      const newTicket = {
        id: ticketId,
        titulo: novoTicketTitle.trim(),
        tipo: 'suporte',
        status: 'Aberto',
        prioridade: novoTicketPrio,
        responsavel: 'Núria',
        pessoaId: pessoa.id,
        email: email,
        pautaId: 'suporte',
        categoria: 'Suporte Técnico',
        prazo: '2026-06-05'
      };
      
      const currentList = data.tarefas_suporte || [];
      await addSingleDocument('tarefas_suporte', newTicket);
      
      setInteracoes(prev => [
        { text: `[Suporte Criado] Novo ticket aberto com o assunto: "${novoTicketTitle}" e prioridade ${novoTicketPrio}`, date: 'Agora', type: 'system' },
        ...prev
      ]);
      setNovoTicketTitle('');
      alert('Chamado de suporte registrado e vinculado a esta aluna no Firestore!');
    } catch (err: any) {
      alert('Erro ao criar ticket: ' + err.message);
    }
  };

  // Tag list helpers
  const handleAddTag = () => {
    if (!novaTag.trim()) return;
    if (!tags.includes(novaTag.trim())) {
      setTags([...tags, novaTag.trim()]);
    }
    setNovaTag('');
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter(tag => tag !== t));
  };

  // Print PDF helper (rebuilding previous print)
  const handlePrintCert = (cert: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor permita popups para imprimir.');
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Certificado - ${cert.nomeAluno}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Inter:wght@400;605&display=swap');
            body { 
              margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background: #e2e8f0; font-family: 'Inter', sans-serif;
            }
            .cert-card {
              position: relative; width: 1050px; height: 700px; background-color: #0A192F; color: white; border: 12px solid #D4AF37; box-shadow: 0 10px 40px rgba(0,0,0,0.2); padding: 50px; box-sizing: border-box; display: flex; flex-direction: column; text-align: center; border-image: linear-gradient(to bottom right, #D4AF37, #9B7C1D, #D4AF37) 12; justify-content: space-between;
            }
            .header h1 { font-family: 'Cinzel', serif; font-size: 40px; margin: 0; color: #D4AF37; letter-spacing: 3px; }
            .content { font-size: 22px; line-height: 1.8; margin: 40px auto; max-width: 820px; }
            .sig-block { border-top: 2px solid #D4AF37; padding-top: 8px; width: 240px; font-size: 13px; color: #cbd5e1; }
            .footer-info { display: flex; justify-content: space-between; align-items: flex-end; }
            .print-btn { position: fixed; bottom: 20px; right: 20px; background: #0A192F; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; }
            @media print { .print-btn { display: none; } body { background: white; } }
          </style>
        </head>
        <body>
          <button class="print-btn" onclick="window.print()">Imprimir / PDF</button>
          <div class="cert-card">
            <div class="header">
              <h1>CERTIFICADO ACADÊMICO</h1>
              <p style="font-size:12px; letter-spacing: 2px; color:#cbd5e1;">INSTITUTO LIANA GOMES</p>
            </div>
            <div class="content">
              Certificamos que o(a) aluno(a) <strong style="color:#D4AF37; font-size: 28px; display:block; margin:10px 0;">${cert.nomeAluno}</strong> concluiu com aproveitamento a formação <strong>${cert.nomeFormacao}</strong> com total de ${cert.cargaHoraria || '120h'} de treinamento prático e mentoria em ${cert.dataConclusao}.
            </div>
            <div class="footer-info">
              <div class="sig-block">
                <strong>Liana Gomes</strong><br>Fundadora do Instituto ILG
              </div>
              <div class="sig-block" style="border-top:2px solid #64748b;">
                Autenticidade: ${cert.id.toUpperCase()}<br>Selo de Emissão ILG
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Re-emit Cert email simulation
  const handleReemitCertMail = (cert: any) => {
    alert(`E-mail com PDF re-enviado com sucesso para ${email}!`);
    setInteracoes(prev => [
      { text: `[Certificado] Re-enviado e-mail de confirmação para ${email}`, date: 'Agora', type: 'system' },
      ...prev
    ]);
  };

  // Save all states back to Cloud Firestore
  const handleSaveAll = async () => {
    if (isReadOnly() || !hasPermission('edit_leads')) {
      showToast('Acesso Negado: Seu perfil atual possui restrição de leitura e não pode alterar cadastros do CRM.', 'error');
      return;
    }
    try {
      const updatedModel: any = {
        id: pessoa.id,
        nome,
        email,
        telefone: customPhone || telefone,
        tipoPessoa,
        status: normalizeStatusSlug(status),
        temperatura,
        responsavel,
        produtoInteresse,
        observacoes,
        interacoes,
        discussaoInterna,
        tags,

        // Student checklist and fields
        produtoComprado: formacao,
        formacao,
        turma,
        entrouGrupo,
        respondeuInicial,
        bonusEnviado,
        acessoNutror,
        acessoMRP,
        statusOnboarding: normalizeOnboardingSlug(statusOnboarding),
        onboardingPendencias,

        // Financial
        valorCombinado,
        formaPagamento,
        statusFinanceiro,
        parcelas,
        vencimentos,
        comprovantes,
        observacoesFinanceiras
      };

      await updateSingleField('pessoas', pessoa.id, updatedModel);
      
      if (normalizeStatusSlug(status) !== normalizeStatusSlug(pessoa.status || '')) {
        await logAuditEvent('status_update', pessoa.id, { 
          oldStatus: normalizeStatusSlug(pessoa.status || ''), 
          newStatus: normalizeStatusSlug(status) 
        });
      }
      
      showToast('Cadastro operacional salvo com sucesso no Firestore!', 'success');
      onClose();
    } catch (err: any) {
      showToast('Erro ao salvar no Firestore: ' + err.message, 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-stretch md:items-center justify-end md:justify-center bg-slate-950/40 backdrop-blur-xs">
      <div className="bg-white w-full md:w-11/12 max-w-6xl h-full md:h-[95vh] md:rounded-2xl shadow-2xl flex flex-col animate-in slide-in-from-right md:slide-in-from-bottom-4 overflow-hidden text-left">
        
        {/* TOP BAR INFORMATION PANEL */}
        <div className="bg-[#0A192F] text-white p-5 border-b border-slate-800 shrink-0 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#D4AF37]/10 text-[#D4AF37] rounded-xl flex items-center justify-center font-bold border border-[#D4AF37]/20">
              <User className="w-5 h-5" />
            </div>
            
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <input 
                  type="text" 
                  value={nome} 
                  onChange={(e) => setNome(e.target.value)} 
                  className="bg-transparent hover:bg-slate-800 transition text-lg font-black text-white focus:outline-none focus:bg-slate-800 rounded px-1.5 py-0.5 max-w-[280px]"
                />
                
                <select 
                  value={tipoPessoa} 
                  onChange={(e) => setTipoPessoa(e.target.value)}
                  className="px-2 py-0.5 text-[10px] font-black uppercase rounded bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 outline-none"
                >
                  <option className="bg-[#0A192F] text-white" value="lead">Lead / CRM</option>
                  <option className="bg-[#0A192F] text-white" value="aluna">Aluna Ativa</option>
                  <option className="bg-[#0A192F] text-white" value="ex-aluna">Ex-Aluna</option>
                </select>
              </div>

              <div className="flex items-center gap-4 text-[10px] text-slate-350 mt-1 font-bold">
                <span>E-mail: <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-transparent outline-none max-w-[170px] underline" /></span>
                <span>WhatsApp: <input type="text" value={customPhone} onChange={(e) => { setCustomPhone(e.target.value); setTelefone(e.target.value); }} className="bg-transparent outline-none w-[110px]" /></span>
              </div>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white bg-slate-850 p-2 rounded-full transition shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* COMPONENT SUB-TAB NAV BAR */}
        <div className="bg-slate-50 border-b border-slate-200 p-2.5 px-4 md:px-6 flex overflow-x-auto gap-2 shrink-0 select-none no-scrollbar whitespace-nowrap">
          <button onClick={() => setActiveSubTab('resumo')} className={cn("px-3.5 py-1.5 rounded-lg text-xs font-bold transition shrink-0", activeSubTab === 'resumo' ? 'bg-[#0A192F] text-white' : 'text-slate-505 hover:bg-slate-100')}>Resumo</button>
          <button onClick={() => setActiveSubTab('comercial')} className={cn("px-3.5 py-1.5 rounded-lg text-xs font-bold transition shrink-0", activeSubTab === 'comercial' ? 'bg-[#0A192F] text-white' : 'text-slate-505 hover:bg-slate-100')}>Comercial</button>
          <button onClick={() => setActiveSubTab('onboarding')} className={cn("px-3.5 py-1.5 rounded-lg text-xs font-bold transition shrink-0", activeSubTab === 'onboarding' ? 'bg-[#0A192F] text-white' : 'text-slate-505 hover:bg-slate-100')}>Aluna/Onboarding</button>
          <button onClick={() => setActiveSubTab('suporte')} className={cn("px-3.5 py-1.5 rounded-lg text-xs font-bold transition shrink-0", activeSubTab === 'suporte' ? 'bg-[#0A192F] text-white' : 'text-slate-505 hover:bg-slate-100')}>Suporte</button>
          <button onClick={() => setActiveSubTab('financeiro')} className={cn("px-3.5 py-1.5 rounded-lg text-xs font-bold transition shrink-0", activeSubTab === 'financeiro' ? 'bg-[#0A192F] text-white' : 'text-slate-505 hover:bg-slate-100')}>Financeiro</button>
          <button onClick={() => setActiveSubTab('certificados')} className={cn("px-3.5 py-1.5 rounded-lg text-xs font-bold transition shrink-0", activeSubTab === 'certificados' ? 'bg-[#0A192F] text-white' : 'text-slate-505 hover:bg-slate-100')}>Certificados</button>
          <button onClick={() => setActiveSubTab('historico')} className={cn("px-3.5 py-1.5 rounded-lg text-xs font-bold transition shrink-0", activeSubTab === 'historico' ? 'bg-[#0A192F] text-white' : 'text-slate-505 hover:bg-slate-100')}>Histórico Timeline</button>
        </div>

        {/* MODAL BODY (LEFT TABS - RIGHT COCKPIT) */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-stone-50/50">
          
          {/* LEFT CONTAINER (THE SECTOR SWITCHER) */}
          <div className="lg:col-span-7 bg-white border border-slate-205 rounded-xl p-5 shadow-inner">
            
            {/* TABS 1: RESUMO */}
            {activeSubTab === 'resumo' && (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-[#0A192F] uppercase border-b pb-2 tracking-tight">Painel Consolidado de Cadastro</h3>
                
                <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-700">
                  <div className="p-2.5 bg-slate-50 border rounded-lg">
                    <span className="text-slate-450 block uppercase text-[9px] font-extrabold leading-none">Tipo e Perfil</span>
                    <strong className="text-slate-800 text-sm block mt-1 uppercase">{tipoPessoa}</strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 border rounded-lg">
                    <span className="text-slate-450 block uppercase text-[9px] font-extrabold leading-none">Etapa do Funil</span>
                    <strong className="text-slate-800 text-sm block mt-1 uppercase">{status}</strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 border rounded-lg">
                    <span className="text-slate-450 block uppercase text-[9px] font-extrabold leading-none">Temperatura Lead</span>
                    <strong className="text-slate-800 text-sm block mt-1 uppercase">{temperatura === 'quente' ? '⚡ Quente' : temperatura === 'morno' ? '🔥 Morno' : '❄️ Frio'}</strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 border rounded-lg">
                    <span className="text-slate-450 block uppercase text-[9px] font-extrabold leading-none">Responsável Interno</span>
                    <strong className="text-slate-800 text-sm block mt-1 uppercase">{responsavel}</strong>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <p className="text-xs font-bold text-slate-500">Mais Detalhes Rápidos:</p>
                  <ul className="text-xs space-y-1 bg-stone-50 p-3 rounded-lg border text-slate-650">
                    <li>🎯 <strong>Interesse:</strong> {produtoInteresse || 'Não especificado'}</li>
                    <li>🎓 <strong>Formação:</strong> {formacao || 'Não especificada'}</li>
                    <li>👥 <strong>Turma vinculada:</strong> {turma || 'Sem turma cadastrada'}</li>
                    <li>💳 <strong>Status do onboarding:</strong> {statusOnboarding}</li>
                  </ul>
                </div>

                {/* TAGS */}
                <div className="space-y-3 pt-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-700 uppercase block">Tags Personalizáveis</label>
                    <button
                      type="button"
                      onClick={() => setShowTagManager(true)}
                      className="text-[10px] font-bold text-[#1D4E89] hover:underline flex items-center gap-1"
                    >
                      ⚙️ Gerenciar Tags
                    </button>
                  </div>
                  
                  {/* Active tags on the lead/student */}
                  <div className="flex flex-wrap gap-1">
                    {tags.map(t => {
                      const found = tagsList.find((g: any) => g.nome.toLowerCase() === t.toLowerCase() || g.id === t);
                      const tagCor = found ? found.cor : '#64748B';
                      const tagNome = found ? found.nome : t;

                      return (
                        <span 
                          key={t} 
                          style={{ backgroundColor: tagCor }}
                          className="px-2.5 py-0.5 text-[10px] font-black uppercase rounded text-white flex items-center gap-1.5 shadow-sm"
                        >
                          {tagNome}
                          <button 
                            type="button" 
                            onClick={() => handleRemoveTag(t)} 
                            className="bg-white/20 hover:bg-white/45 text-white font-black w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] leading-none transition-colors"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                    {tags.length === 0 && (
                      <span className="text-xs text-slate-400 italic">Nenhuma tag associada.</span>
                    )}
                  </div>

                  {/* Quick select tags list from global configuration pool */}
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                    <p className="text-[9px] font-black uppercase text-slate-400 mb-1.5">Clique para Associar/Dissociar Tag:</p>
                    <div className="flex flex-wrap gap-1">
                      {tagsList.map((tag: any) => {
                        const isAssociated = tags.some(t => t.toLowerCase() === tag.nome.toLowerCase() || t === tag.id);
                        
                        return (
                          <button
                            type="button"
                            key={tag.id}
                            onClick={() => {
                              if (isAssociated) {
                                handleRemoveTag(tag.nome);
                              } else {
                                setTags([...tags, tag.nome]);
                              }
                            }}
                            style={{ 
                              backgroundColor: isAssociated ? tag.cor : 'transparent',
                              borderColor: tag.cor,
                              color: isAssociated ? '#FFFFFF' : tag.cor
                            }}
                            className={cn(
                              "px-2 py-0.5 text-[9px] uppercase font-bold border rounded transition-all text-left flex items-center gap-1",
                              isAssociated ? 'shadow-xs border-transparent' : 'opacity-70 hover:opacity-100 hover:bg-slate-150'
                            )}
                          >
                            {isAssociated && <Check className="w-2.5 h-2.5 shrink-0" />}
                            {tag.nome}
                          </button>
                        );
                      })}
                      {tagsList.length === 0 && (
                        <p className="text-[10px] text-slate-400 italic">Crie ou gerencie tags pelo botão acima.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TABS 2: COMERCIAL */}
            {activeSubTab === 'comercial' && (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-[#0A192F] uppercase border-b pb-2 tracking-tight">Metadados da Jornada Comercial</h3>
                
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 block mb-1">Origem do Contato</label>
                    <select value={origem} onChange={(e) => setOrigem(e.target.value)} className="w-full text-xs border border-slate-350 bg-white rounded-lg px-2.5 py-1.5">
                      <option value="Tráfego Pago">Tráfego Pago</option>
                      <option value="Indicação">Indicação</option>
                      <option value="WhatsApp Direto">WhatsApp Direto</option>
                      <option value="Eventos">Eventos</option>
                      <option value="Organic Google">Organic Google</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 block mb-1">Status Comercial</label>
                    <select value={normalizeStatusSlug(status)} onChange={(e) => handleStatusChangeAction(e.target.value)} className="w-full text-xs border border-slate-350 bg-white rounded-lg px-2.5 py-1.5">
                      <option value="novo-lead">Novo lead</option>
                      <option value="contato-feito">Contato feito</option>
                      <option value="respondeu">Respondeu</option>
                      <option value="em-qualificacao">Em qualificação</option>
                      <option value="em-negociacao">Em negociação</option>
                      <option value="aguardando-pagamento">Aguardando pagamento</option>
                      <option value="comprou">Comprou / Fechado</option>
                      <option value="sem-interesse">Sem interesse</option>
                      <option value="retomar-depois">Retomar depois</option>
                      <option value="perdido">Perdido</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 block mb-1">Produto de Interesse</label>
                    <input type="text" value={produtoInteresse} onChange={(e) => setProdutoInteresse(e.target.value)} className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5" />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 block mb-1">Temperatura</label>
                    <select value={temperatura} onChange={(e) => setTemperatura(e.target.value)} className="w-full text-xs border border-slate-355 bg-white rounded-lg px-2.5 py-1.5">
                      <option value="frio">❄️ Frio</option>
                      <option value="morno">🔥 Morno</option>
                      <option value="quente">⚡ Quente</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 block mb-1">Objeção Principal</label>
                    <select value={objecaoPrincipal} onChange={(e) => setObjecaoPrincipal(e.target.value)} className="w-full text-xs border border-slate-350 bg-white rounded-lg px-2.5 py-1.5">
                      <option value="Nenhuma">Nenhuma objeção</option>
                      <option value="Preço / Caro">Preço / Caro</option>
                      <option value="Sem tempo">Sem tempo produtivo</option>
                      <option value="Precisa alinhar sócio/marido">Sócio / Família</option>
                      <option value="Dúvida de escopo">Formato / Escopo</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 block mb-1">Próximo Contato agendado</label>
                    <input type="date" value={proximoContato} onChange={(e) => setProximoContato(e.target.value)} className="w-full text-xs border border-slate-300 bg-white rounded-lg px-2.5 py-1.5" />
                  </div>

                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-slate-500 block mb-1">Responsável Comercial (SDR/Executiva)</label>
                    <select value={responsavel} onChange={(e) => setResponsavel(e.target.value)} className="w-full text-xs border border-slate-350 bg-white rounded-lg px-2.5 py-1.5">
                      <option value="Ana">Ana (Comercial)</option>
                      <option value="Liana">Liana (Geral)</option>
                      <option value="Núria">Núria (Suporte)</option>
                      <option value="Luiza">Luiza (Tech)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TABS 3: ALUNA/ONBOARDING */}
            {activeSubTab === 'onboarding' && (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-[#0A192F] uppercase border-b pb-2 tracking-tight">Controle de Aluna & Onboarding</h3>
                
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 block mb-1">Formação / Produto</label>
                    <input type="text" value={formacao} onChange={(e) => setFormacao(e.target.value)} className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 block mb-1">Turma Cadastrada</label>
                    <input type="text" value={turma} onChange={(e) => setTurma(e.target.value)} className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5" />
                  </div>

                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-slate-500 block mb-1">Status Onboarding</label>
                    <select value={normalizeOnboardingSlug(statusOnboarding)} onChange={(e) => setStatusOnboarding(e.target.value)} className="w-full text-xs border border-slate-350 bg-white rounded-lg px-2.5 py-1.5">
                      <option value="aguardando-boas-vindas">Aguardando boas-vindas</option>
                      <option value="aguardando-formulario">Aguardando formulário</option>
                      <option value="aguardando-grupo">Aguardando grupo</option>
                      <option value="aguardando-nutror">Aguardando Nutror</option>
                      <option value="aguardando-mrp">Aguardando MRP</option>
                      <option value="bonus-pendente">Bônus pendente</option>
                      <option value="acesso-ok">Acesso OK</option>
                      <option value="com-pendencia">Com pendência</option>
                      <option value="em-acompanhamento">Em acompanhamento</option>
                      <option value="concluido">Concluído</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <label className="flex items-center gap-2 p-2 border rounded-lg bg-stone-50 cursor-pointer text-xs">
                    <input type="checkbox" checked={entrouGrupo} onChange={(e) => setEntrouGrupo(e.target.checked)} className="rounded text-[#0A192F]" />
                    <span>Incluso no Grupo Whats</span>
                  </label>
                  <label className="flex items-center gap-2 p-1.5 border rounded-lg bg-stone-50 cursor-pointer text-xs">
                    <input type="checkbox" checked={respondeuInicial} onChange={(e) => setRespondeuInicial(e.target.checked)} className="rounded text-[#0A192F]" />
                    <span>Diagnóstico Inicial Respondido</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 border rounded-lg bg-stone-50 cursor-pointer text-xs">
                    <input type="checkbox" checked={acessoNutror} onChange={(e) => setAcessoNutror(e.target.checked)} className="rounded text-[#0A192F]" />
                    <span>Acesso ao Nutror Liberado</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 border rounded-lg bg-stone-50 cursor-pointer text-xs">
                    <input type="checkbox" checked={acessoMRP} onChange={(e) => setAcessoMRP(e.target.checked)} className="rounded text-[#0A192F]" />
                    <span>Acesso Planilha MRP</span>
                  </label>
                  <label className="col-span-2 flex items-center gap-2 p-2 border rounded-lg bg-stone-50 cursor-pointer text-xs">
                    <input type="checkbox" checked={bonusEnviado} onChange={(e) => setBonusEnviado(e.target.checked)} className="rounded text-[#0A192F]" />
                    <span>Bônus Físico / Digital Enviado</span>
                  </label>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 block mb-1">Anotações e Pendências de Onboarding</label>
                  <textarea rows={2} value={onboardingPendencias} onChange={(e) => setOnboardingPendencias(e.target.value)} placeholder="Descreva pautas urgentes do onboarding deste contato..." className="w-full text-xs border border-slate-350 rounded-lg p-2 resize-none" />
                </div>
              </div>
            )}

            {/* TABS 4: SUPORTE */}
            {activeSubTab === 'suporte' && (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-[#0A192F] uppercase border-b pb-2 tracking-tight">Chamados e Tickets Vinculados</h3>
                
                {/* Tickets list associated with person */}
                <div className="space-y-2 max-h-[180px] overflow-y-auto">
                  {tarefas.filter(t => t.pessoaId === pessoa.id || (email && t.email && t.email.toLowerCase() === email.toLowerCase())).map(t => (
                    <div key={t.id} className="p-3 bg-slate-50 border rounded-lg flex justify-between items-center text-xs">
                      <div>
                        <strong className="text-slate-800">{t.titulo}</strong>
                        <p className="text-[10px] text-slate-450 mt-0.5">Status: <strong className="uppercase">{t.status}</strong> • Prio: {t.prioridade}</p>
                      </div>
                      <span className="p-1 text-[9px] font-black uppercase text-amber-800 bg-amber-50 rounded">Suporte</span>
                    </div>
                  ))}
                  {tarefas.filter(t => t.pessoaId === pessoa.id || (email && t.email && t.email.toLowerCase() === email.toLowerCase())).length === 0 && (
                    <p className="text-xs text-slate-400 italic py-4">Nenhum chamado de suporte aberto em nome deste contato.</p>
                  )}
                </div>

                {/* Add dynamic ticket */}
                <div className="bg-[#0A192F]/5 p-4 rounded-xl border border-slate-200 space-y-3 pt-3 text-xs">
                  <span className="font-extrabold text-[#0A192F] uppercase text-[10px] tracking-wider block">Abrir Novo Chamado de Suporte</span>
                  
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Ex: Dificuldade de acesso ao login Nutror" 
                      value={novoTicketTitle}
                      onChange={(e) => setNovoTicketTitle(e.target.value)}
                      className="border border-slate-300 py-1.5 px-3 rounded-lg flex-1 outline-none text-slate-800 bg-white"
                    />
                    <select value={novoTicketPrio} onChange={(e) => setNovoTicketPrio(e.target.value)} className="border border-slate-300 bg-white rounded-lg px-2 font-bold text-[#0A192F]">
                      <option value="alta">🚨 Alta</option>
                      <option value="média">⚠️ Média</option>
                      <option value="baixa">☕ Baixa</option>
                    </select>
                    <button type="button" onClick={handleAddNewSupportTicket} className="px-3 py-1.5 bg-[#0A192F] hover:bg-emerald-600 font-bold rounded-lg text-white transition whitespace-nowrap">Abrir Ticket</button>
                  </div>
                </div>
              </div>
            )}

            {/* TABS 5: FINANCEIRO */}
            {activeSubTab === 'financeiro' && (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-[#0A192F] uppercase border-b pb-2 tracking-tight">Histórico Financeiro & Parcelas</h3>
                
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[10px] font-black text-slate-50 block mb-1">Valor Combinado (Total)</label>
                    <input type="text" value={valorCombinado} onChange={(e) => setValorCombinado(e.target.value)} className="w-full text-xs border border-slate-350 rounded-lg px-2.5 py-1.5" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-50 block mb-1">Forma de Pagamento</label>
                    <select value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)} className="w-full text-xs border border-slate-350 bg-white rounded-lg px-2.5 py-1.5">
                      <option value="PIX">PIX</option>
                      <option value="Cartão de Crédito">Cartão de Crédito</option>
                      <option value="Boleto Bancário">Boleto Bancário</option>
                      <option value="Link de Pagamento">Link de Pagamento</option>
                      <option value="Doação / Cortesia">Doação / Cortesia</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-50 block mb-1">Status Financeiro</label>
                    <select value={statusFinanceiro} onChange={(e) => setStatusFinanceiro(e.target.value)} className="w-full text-xs border border-slate-[#0A192F] bg-white rounded-lg px-2.5 py-1.5">
                      <option value="Pago">Pago</option>
                      <option value="Parcial">Parcial</option>
                      <option value="Pendente">Pendente</option>
                      <option value="Atrasado">Atrasado</option>
                      <option value="Isento">Isento</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-50 block mb-1">Parcelamento</label>
                    <input type="text" value={parcelas} onChange={(e) => setParcelas(e.target.value)} className="w-full text-xs border border-slate-350 rounded-lg px-2.5 py-1.5" />
                  </div>

                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-slate-50 block mb-1">Próximos Vencimentos agendados</label>
                    <input type="text" value={vencimentos} onChange={(e) => setVencimentos(e.target.value)} placeholder="Ex: Dia 10/Set, Dia 10/Out..." className="w-full text-xs border border-slate-350 rounded-lg px-2.5 py-1.5" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-slate-50 block mb-1">Link de Comprovantes / Notas Fiscais</label>
                    <input type="text" value={comprovantes} onChange={(e) => setComprovantes(e.target.value)} placeholder="Coloque links do Drive contendo Recibo ou PDF de contrato" className="w-full text-xs border border-slate-350 rounded-lg px-2.5 py-1.5" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-50 block mb-1">Observações Gerais de Contrato</label>
                  <textarea rows={2} value={observacoesFinanceiras} onChange={(e) => setObservacoesFinanceiras(e.target.value)} className="w-full text-xs border border-slate-350 rounded-lg p-2 resize-none" />
                </div>
              </div>
            )}

            {/* TABS 6: CERTIFICADOS */}
            {activeSubTab === 'certificados' && (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-[#0A192F] uppercase border-b pb-2 tracking-tight flex justify-between items-center">
                  <span>Certificados Emitidos</span>
                  <button
                    type="button"
                    onClick={() => {
                      const tabEvent = new CustomEvent('change_active_tab', { detail: 'certificados' });
                      window.dispatchEvent(tabEvent);
                      setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('trigger_new_certificate', { detail: { aluno: pessoa } }));
                      }, 100);
                      onClose();
                    }}
                    className="p-1 px-2.5 bg-[#0a192f] text-[#d4af37] font-bold text-[10px] uppercase rounded-lg border border-[#D4AF37]/30 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Lançar Novo</span>
                  </button>
                </h3>

                <div className="space-y-2 max-h-[220px] overflow-y-auto">
                  {studentCertificates.map(cert => (
                    <div key={cert.id} className="p-3 bg-slate-50 border rounded-lg flex justify-between items-center text-xs">
                      <div>
                        <strong className="text-slate-800 block">{cert.nomeFormacao}</strong>
                        <span className="text-[10px] text-slate-450">Código: {cert.id.toUpperCase()} • {cert.dataGeracao}</span>
                        {cert.status === 'enviado' && (
                          <p className="text-[9px] text-[#0A192F] font-bold mt-1 bg-amber-50 rounded w-fit px-1">Enviado por e-mail ({cert.dataEnvio?.split(' ')[0]})</p>
                        )}
                      </div>
                      <div className="flex gap-1.5">
                        <button type="button" onClick={() => handlePrintCert(cert)} className="p-1 px-2 bg-white hover:bg-slate-100 rounded text-[10px] font-bold border">Imprimir</button>
                        <button type="button" onClick={() => handleReemitCertMail(cert)} className="p-1 px-2 bg-white hover:bg-amber-100 rounded text-[10px] text-[#0A192F] border font-bold">Re-enviar</button>
                      </div>
                    </div>
                  ))}
                  {studentCertificates.length === 0 && (
                    <p className="text-xs text-slate-400 italic py-4">Nenhum certificado emitido para esta aluna ainda.</p>
                  )}
                </div>
              </div>
            )}

            {/* TABS 7: HISTÓRICO TIMELINE */}
            {activeSubTab === 'historico' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-sm font-black text-[#0A192F] uppercase tracking-tight">Timeline & Histórico Detalhado</h3>
                  <span className="text-[10px] font-bold text-slate-550 bg-slate-100 px-2 py-0.5 rounded-full">{interacoes.length} Entrada(s)</span>
                </div>

                {/* LOG NEW INTERACTION FORM */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-3 text-slate-700">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    📝 Registrar Nova Interação
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase">Data do Contato</label>
                      <input 
                        type="date" 
                        value={interactDate}
                        onChange={e => setInteractDate(e.target.value)}
                        className="w-full text-xs border border-slate-305 rounded px-2 py-1 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase">Canal / Meio</label>
                      <select
                        value={interactType}
                        onChange={e => setInteractType(e.target.value)}
                        className="w-full text-xs border border-slate-305 bg-white rounded px-2 py-1 outline-none"
                      >
                        <option value="telefone">📞 Telefone</option>
                        <option value="e-mail">📧 E-mail</option>
                        <option value="reunião">👥 Reunião</option>
                        <option value="whatsapp">💬 WhatsApp</option>
                        <option value="outro">⚙️ Outro</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase">Responsável</label>
                      <input 
                        type="text" 
                        value={interactResp}
                        onChange={e => setInteractResp(e.target.value)}
                        placeholder="Ex: Liana"
                        className="w-full text-xs border border-slate-305 rounded px-2 py-1 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase">Resumo da Conversa / Ação Realizada</label>
                    <textarea 
                      rows={2}
                      value={interactResumo}
                      onChange={e => setInteractResumo(e.target.value)}
                      placeholder="Descreva brevemente o que foi conversado ou acordado..."
                      className="w-full text-xs border border-slate-305 rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-[#0A192F] bg-white text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase">Próximo Passo / Ação de Follow-up</label>
                    <input 
                      type="text" 
                      value={interactProximoPasso}
                      onChange={e => setInteractProximoPasso(e.target.value)}
                      placeholder="Ex: Enviar proposta de desconto na sexta, telefonar após as 14h, etc."
                      className="w-full text-xs border border-slate-305 rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-[#0A192F] bg-white text-slate-800 font-medium"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleRegisterInteraction}
                      className="p-1 px-3 bg-[#0A192F] text-white hover:bg-[#D4AF37] hover:text-[#0A192F] rounded text-xs font-bold transition-colors"
                    >
                      Registrar Interação
                    </button>
                  </div>
                </div>

                {/* CHRONOLOGICAL INTERACTION VIEWER (REVERSE CHRONOLOGICAL ORDER) WITH VISUAL TIMELINE NODES */}
                <div className="relative border-l-2 border-slate-200 ml-4 pl-6 py-2 space-y-6 max-h-[360px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 text-left">
                  {[...interacoes]
                    .sort((a, b) => {
                      const dA = a.date || '';
                      const dB = b.date || '';
                      return dB.localeCompare(dA);
                    })
                    .map((item, id) => {
                      const typeLower = String(item.type || '').toLowerCase();
                      
                      let typeColor = 'bg-slate-100 text-slate-700 border-slate-300';
                      let typeLabel = item.type || 'Interação';
                      let typeIcon = <Info className="w-3.5 h-3.5" />;

                      if (typeLower.includes('tel')) {
                        typeColor = 'bg-blue-50 text-blue-800 border-blue-250';
                        typeLabel = 'Telefone 📞';
                        typeIcon = <Phone className="w-3.5 h-3.5" />;
                      } else if (typeLower.includes('mail')) {
                        typeColor = 'bg-purple-50 text-purple-800 border-purple-250';
                        typeLabel = 'E-mail 📧';
                        typeIcon = <Mail className="w-3.5 h-3.5" />;
                      } else if (typeLower.includes('reun') || typeLower.includes('encon')) {
                        typeColor = 'bg-amber-50 text-amber-800 border-amber-250';
                        typeLabel = 'Reunião 👥';
                        typeIcon = <Calendar className="w-3.5 h-3.5" />;
                      } else if (typeLower.includes('whats') || typeLower.includes('chat')) {
                        typeColor = 'bg-emerald-50 text-emerald-800 border-emerald-300';
                        typeLabel = 'WhatsApp 💬';
                        typeIcon = <MessageCircle className="w-3.5 h-3.5" />;
                      } else if (typeLower.includes('system')) {
                        typeColor = 'bg-rose-50 text-rose-800 border-rose-250';
                        typeLabel = 'Sistema ⚙️';
                        typeIcon = <Sparkles className="w-3.5 h-3.5" />;
                      }

                      return (
                        <div key={id} className="relative group text-left animate-fade-in">
                          {/* Chronological Circle Indicator on vertical path line */}
                          <div className={cn(
                            "absolute -left-[35px] top-1.5 w-6 h-6 rounded-full flex items-center justify-center border shadow-inner transition-transform duration-200 group-hover:scale-110",
                            typeColor
                          )}>
                            {typeIcon}
                          </div>

                          {/* Node card */}
                          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs hover:shadow-sm transition-all duration-200 space-y-2.5 hover:border-slate-300">
                            {/* Meta header */}
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                              <div className="flex items-center gap-1.5">
                                <span className={cn(
                                  "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border",
                                  typeColor
                                )}>
                                  {typeLabel}
                                </span>
                                {item.responsavel && (
                                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                    Por: <span className="font-bold text-slate-700">{item.responsavel}</span>
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] font-bold text-slate-400 font-mono bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-400" /> {item.date}
                              </span>
                            </div>

                            {/* Text / Note Description content */}
                            {item.resumo ? (
                              <div className="space-y-2 text-left">
                                <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 whitespace-pre-wrap">
                                  {item.resumo}
                                </p>
                                {item.proximoPasso && (
                                  <div className="flex items-start gap-1.5 bg-[#D4AF37]/5 border border-[#D4AF37]/15 p-2 rounded-lg text-xs leading-none text-slate-800 font-medium">
                                    <span className="px-1.5 py-0.5 shrink-0 bg-yellow-100 border border-yellow-250 text-yellow-850 rounded text-[9px] font-extrabold uppercase mt-0.5 tracking-wider">
                                      👉 Próximo Passo
                                    </span>
                                    <span className="font-semibold text-slate-700 text-[11px] leading-snug">{item.proximoPasso}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-2 text-left">
                                <p className="text-xs text-slate-705 leading-relaxed font-medium bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 whitespace-pre-wrap">
                                  {item.text}
                                </p>
                                {item.proximoPasso && (
                                  <div className="flex items-start gap-1.5 bg-[#D4AF37]/5 border border-[#D4AF37]/15 p-2 rounded-lg text-xs leading-none text-slate-800 font-medium font-sans">
                                    <span className="px-1.5 py-0.5 shrink-0 bg-yellow-100 border border-yellow-250 text-yellow-850 rounded text-[9px] font-extrabold uppercase mt-0.5 tracking-wider">
                                      👉 Próximo Passo
                                    </span>
                                    <span className="font-semibold text-slate-700 text-[11px] leading-snug">{item.proximoPasso}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                  {interacoes.length === 0 && (
                    <div className="text-center py-8 text-xs text-slate-400 italic">
                      Nenhuma interação registrada no histórico.
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT PANELS (WHATSAPP AND DISCUSSIONS) */}
          <div className="lg:col-span-12 xl:col-span-5 space-y-6 flex flex-col lg:col-span-5 shrink-0">
            
            {/* WHATSAPP CRM COMPONENT */}
            <div className="bg-emerald-50/70 border border-emerald-250 p-5 rounded-2xl space-y-3.5">
              <span className="text-[10px] bg-emerald-100 text-emerald-990 font-black px-2 py-0.5 rounded uppercase block w-fit">Central Instantânea WhatsApp</span>
              
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-[10px] font-black text-slate-500 block mb-1">Pesquisar Modelo:</label>
                  <select 
                    value={selectedTemplate}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    className="w-full text-xs border border-emerald-200 bg-white rounded-lg px-2 py-1.5"
                  >
                    <option value="">Modelo Livre (Escrever Manual)</option>
                    <optgroup label="💼 Comercial / Vendas">
                      {templates.filter(t => t.category === 'Lead').map(t => (
                        <option key={t.id} value={t.id}>{t.label}</option>
                      ))}
                    </optgroup>
                    <optgroup label="💻 Onboarding / Suporte">
                      {templates.filter(t => t.category === 'Aluna').map(t => (
                        <option key={t.id} value={t.id}>{t.label}</option>
                      ))}
                    </optgroup>
                    <optgroup label="💵 Cobrança">
                      {templates.filter(t => t.category === 'Geral').map(t => (
                        <option key={t.id} value={t.id}>{t.label}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 block mb-1">Mensagem Final:</label>
                  <textarea 
                    rows={4} 
                    value={messageText} 
                    onChange={(e) => setMessageText(e.target.value)} 
                    className="w-full border border-emerald-200 rounded-lg p-2.5 font-normal leading-relaxed bg-white/95" 
                  />
                </div>

                <div className="flex gap-2">
                  <input type="text" value={customPhone} onChange={(e) => setCustomPhone(e.target.value)} className="w-full border border-emerald-200 rounded-lg px-2 bg-white" placeholder="Fone com DDD" />
                  <button type="button" onClick={handleSendWhatsApp} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg shrink-0">Disparar</button>
                </div>
              </div>
            </div>

            {/* TEAM INTERNAL CONVERSATIONS DISCUSSION */}
            <div className="bg-white border border-[#D4AF37]/50 p-5 rounded-2xl flex-1 flex flex-col">
              <h4 className="font-extrabold text-xs text-[#0a192f] uppercase tracking-wider mb-2.5 pb-1.5 border-b border-stone-150 flex justify-between items-center">
                <span>Discussão Interna Equipe</span>
                <span className="text-[9px] bg-amber-50 text-[#0a192f] border px-1.5 py-0.5 rounded font-black">{discussaoInterna.length} Notas</span>
              </h4>

              <div className="space-y-3 flex-1 overflow-y-auto max-h-[220px]">
                {discussaoInterna.map((msg, idx) => (
                  <div key={msg.id || idx} className="bg-slate-50 border p-2.5 rounded-lg text-xs relative group/item">
                    <div className="flex items-center gap-1.5 mb-1 bg-stone-50/50">
                      <span className="text-[10px]">{msg.avatar}</span>
                      <strong className="text-slate-700 font-extrabold">{msg.autorNome}</strong>
                      <span className="text-[9px] text-slate-400 font-normal">{msg.dataHora}</span>
                    </div>
                    <p className="text-slate-650 font-normal pl-4 leading-relaxed">{msg.texto}</p>
                  </div>
                ))}
              </div>

              {/* Msg Box writer */}
              <div className="space-y-2 mt-4">
                <div className="flex justify-between items-center text-[10px] text-slate-450 font-black">
                  <span>Escrever como:</span>
                  <div className="flex gap-1 bg-slate-50 rounded p-0.5 border">
                    <button type="button" onClick={() => setDiscAutor('luiza')} className={cn("px-1 py-0.2 rounded text-[9px] transition", discAutor === 'luiza' ? 'bg-indigo-900 text-white font-bold' : 'text-slate-500')}>Luiza ⚡</button>
                    <button type="button" onClick={() => setDiscAutor('liana')} className={cn("px-1 py-0.2 rounded text-[9px] transition", discAutor === 'liana' ? 'bg-indigo-900 text-white font-bold' : 'text-slate-500')}>Liana 👑</button>
                    <button type="button" onClick={() => setDiscAutor('nuria')} className={cn("px-1 py-0.2 rounded text-[9px] transition", discAutor === 'nuria' ? 'bg-indigo-900 text-white font-bold' : 'text-slate-500')}>Nuria 🌸</button>
                    <button type="button" onClick={() => setDiscAutor('ana')} className={cn("px-1 py-0.2 rounded text-[9px] transition", discAutor === 'ana' ? 'bg-indigo-900 text-white font-bold' : 'text-slate-500')}>Ana 💼</button>
                  </div>
                </div>

                <div className="flex gap-1.5">
                  <input 
                    type="text" 
                    placeholder="Comentário reservado..." 
                    value={novaDiscMsg} 
                    onChange={(e) => setNovaDiscMsg(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDiscMsg())}
                    className="border flex-1 inline p-2 rounded-lg text-xs" 
                    title="Tecle enter para enviar"
                  />
                  <button type="button" onClick={handleAddDiscMsg} className="p-2.5 bg-[#0a192f] hover:bg-[#D4AF37] text-white hover:text-[#0A192F] rounded-lg transition shrink-0">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 border-t border-slate-200 bg-slate-150 flex justify-end gap-2 shrink-0 select-none">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold">Cancelar</button>
          <button onClick={handleSaveAll} className="px-5 py-2 bg-[#0A192F] hover:bg-[#D4AF37] text-white hover:text-[#0A192F] rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm transition">
            <Save className="w-3.5 h-3.5" />
            <span>Salvar Dados Ficha</span>
          </button>
        </div>

      </div>

      {showOnboardingGuideModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/65 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 border border-slate-200">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <h4 className="font-extrabold text-[#0A192F] text-base flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                  <span>Matrícula Confirmada: Iniciar Onboarding</span>
                </h4>
                <p className="text-[10px] text-slate-500 font-medium">Guia passo a passo para a nova aluna: <strong>{nome}</strong></p>
              </div>
              <button onClick={() => setShowOnboardingGuideModal(false)} className="text-slate-400 hover:text-slate-650 transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs text-slate-700">
              <p className="leading-relaxed">
                Parabéns pela venda de <strong>{produtoInteresse || 'Formação ILG'}</strong>! 
                Ao iniciar o Onboarding, o cadastro será atualizado de <strong>Lead</strong> para <strong>Aluna Ativa</strong>.
              </p>

              <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-150">
                <p className="font-bold text-[#0A192F] text-xs">Selecione as etapas iniciais concluídas no ato da venda:</p>
                
                <label className="flex items-center gap-2.5 p-2 bg-white border rounded-lg cursor-pointer hover:bg-slate-50 transition w-full">
                  <input 
                    type="checkbox" 
                    checked={entrouGrupo} 
                    onChange={(e) => setEntrouGrupo(e.target.checked)} 
                    className="rounded text-[#0A192F]" 
                  />
                  <div className="ml-2.5">
                    <span className="font-bold block">Integrar ao Grupo Whats</span>
                    <span className="text-[10px] text-slate-450 block">Unir ao grupo vip de avisos no WhatsApp</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-2 bg-white border rounded-lg cursor-pointer hover:bg-slate-50 transition w-full">
                  <input 
                    type="checkbox" 
                    checked={acessoNutror} 
                    onChange={(e) => setAcessoNutror(e.target.checked)} 
                    className="rounded text-[#0A192F]" 
                  />
                  <div className="ml-2.5">
                    <span className="font-bold block">Liberar Acesso Nutror (EAD)</span>
                    <span className="text-[10px] text-slate-450 block">Enviar convite de acesso à área de membros</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-2 bg-white border rounded-lg cursor-pointer hover:bg-slate-50 transition w-full">
                  <input 
                    type="checkbox" 
                    checked={acessoMRP} 
                    onChange={(e) => setAcessoMRP(e.target.checked)} 
                    className="rounded text-[#0A192F]" 
                  />
                  <div className="ml-2.5">
                    <span className="font-bold block">Liberar Planilha MRP</span>
                    <span className="text-[10px] text-slate-450 block">Atribuir cópia da planilha operacional financeira</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-2 bg-white border rounded-lg cursor-pointer hover:bg-slate-50 transition w-full">
                  <input 
                    type="checkbox" 
                    checked={respondeuInicial} 
                    onChange={(e) => setRespondeuInicial(e.target.checked)} 
                    className="rounded text-[#0A192F]" 
                  />
                  <div className="ml-2.5">
                    <span className="font-bold block">Marcar Diagnóstico Inicial</span>
                    <span className="text-[10px] text-slate-450 block">Concluir questionário de objetivos das aulas</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button 
                onClick={() => setShowOnboardingGuideModal(false)}
                className="px-4 py-1.5 border hover:bg-slate-50 text-xs font-semibold rounded-lg text-slate-600 transition"
              >
                Voltar
              </button>
              <button 
                onClick={() => {
                  setTipoPessoa('aluna');
                  setFormacao(produtoInteresse || 'Formação Completa');
                  setStatusOnboarding('aguardando-boas-vindas');
                  setInteracoes(prev => [
                    { 
                      text: `[Onboarding Ativado] Lead convertido com sucesso. Status Onboarding inicializado como "Aguardando boas-vindas".`, 
                      date: 'Agora', 
                      type: 'system' 
                    },
                    ...prev
                  ]);
                  setShowOnboardingGuideModal(false);
                  showToast('Onboarding iniciado! Lembre-se de salvar os dados da ficha ao final.', 'success');
                }}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Iniciar Onboarding</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showTagManager && (
        <TagManagerModal onClose={() => setShowTagManager(false)} />
      )}

    </div>
  );
}
