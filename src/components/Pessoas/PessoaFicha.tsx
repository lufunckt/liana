import React, { useState, useEffect } from 'react';
import { X, Save, MessageSquare, Plus, Check, MessageCircle, Send, Phone, Mail, User, Info, Tag, Layers, CheckSquare, Award, Printer, Trash2, Edit3, Sparkles } from 'lucide-react';
import { useStore } from '../../store';

const COMPANY_PIX_CNPJ = '51.533.488/0001-09';

export function PessoaFicha({ pessoa, onClose }: { pessoa: any, onClose: () => void }) {
  if (!pessoa) return null;

  const { data, updateModuleData } = useStore();
  const pessoas = data.pessoas || [];

  // Core contact states
  const [nome, setNome] = useState(pessoa.nome || '');
  const [email, setEmail] = useState(pessoa.email || '');
  const [telefone, setTelefone] = useState(pessoa.telefone || '');
  const [tipoPessoa, setTipoPessoa] = useState(pessoa.tipoPessoa || 'lead');
  
  // Commercial journey states
  const [produtoInteresse, setProdutoInteresse] = useState(pessoa.produtoInteresse || '');
  const [status, setStatus] = useState(pessoa.status || 'novo');
  const [temperatura, setTemperatura] = useState(pessoa.temperatura || 'frio');
  const [proximoContato, setProximoContato] = useState(pessoa.proximoContato || '');
  const [responsavel, setResponsavel] = useState(pessoa.responsavel || 'Ana');
  const [observacoes, setObservacoes] = useState(pessoa.observacoes || '');

  // Student journey states
  const [produtoComprado, setProdutoComprado] = useState(pessoa.produtoComprado || '');
  const [turma, setTurma] = useState(pessoa.turma || '');
  const [entrouGrupo, setEntrouGrupo] = useState(pessoa.entrouGrupo || false);
  const [respondeuInicial, setResondeuInicial] = useState(pessoa.respondeuInicial || false);
  const [acessoNutror, setAcessoNutror] = useState(pessoa.acessoNutror || false);
  const [acessoMRP, setAcessoMRP] = useState(pessoa.acessoMRP || false);

  // Interaction logs (with auto-scrolling list)
  const [interacoes, setInteracoes] = useState<any[]>(pessoa.interacoes || [
    { text: `Registro inicializado como ${pessoa.tipoPessoa || 'lead'}`, date: 'Sistema', type: 'system' }
  ]);
  const [novaInteracao, setNovaInteracao] = useState('');

  // WhatsApp helper states
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [messageText, setMessageText] = useState('');
  const [customPhone, setCustomPhone] = useState(pessoa.telefone || '');

  // Internal discussion states
  const [discussaoInterna, setDiscussaoInterna] = useState<any[]>(pessoa.discussaoInterna || [
    { id: 'disc_init', autorNome: 'Liana Gomes', autorId: 'liana', avatar: '👑', texto: 'Iniciamos o alinhamento de processos desse contato. Qualquer atualização de suporte ou cronograma comercial deve ser postada nesta área!', dataHora: '2026-05-24 10:00' }
  ]);
  const [novaDiscMsg, setNovaDiscMsg] = useState('');
  const [discAutor, setDiscAutor] = useState<'liana' | 'nuria' | 'ana' | 'luiza'>('luiza');
  const [editingDiscId, setEditingDiscId] = useState<string | null>(null);
  const [editingDiscText, setEditingDiscText] = useState('');

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

  const handleDeleteDiscMsg = (msgId: string) => {
    setDiscussaoInterna(prev => prev.filter(m => m.id !== msgId));
  };

  // Certificate log states
  const [studentCertificates, setStudentCertificates] = useState<any[]>([]);

  useEffect(() => {
    const loadStudentCerts = () => {
      const savedIssued = localStorage.getItem('ilg_cert_issued');
      if (savedIssued) {
        try {
          const list = JSON.parse(savedIssued) as any[];
          // Match by student's email or name
          const matched = list.filter(c => 
            (c.emailAluno && email && c.emailAluno.toLowerCase() === email.toLowerCase()) ||
            (c.nomeAluno && nome && c.nomeAluno.toLowerCase() === nome.toLowerCase())
          );
          setStudentCertificates(matched);
        } catch(e) {}
      }
    };

    loadStudentCerts();
    
    // Listen to local update events
    window.addEventListener('certificados_updated', loadStudentCerts);
    return () => {
      window.removeEventListener('certificados_updated', loadStudentCerts);
    };
  }, [email, nome]);

  // Define premium predefined message templates
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
      text: `Olá, ${nome}! Espero que esteja super bem. ✨\n\nPassando para lembrar que temos uma parcela da sua formação em *{produto}* programada para vencer nos próximos dias.\n\n💳 Para facilitar seu acerto via PIX, nossa chave CNPJ oficial é:\n🔑 CNPJ: *${COMPANY_PIX_CNPJ}*\n\nAssim que realizar a transferência, compartilhe o comprovante aqui para atualizarmos seu status financeiro. Gratidão!`
    }
  ];

  // Sync templates selection with variables
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (!templateId) {
      setMessageText('');
      return;
    }

    const tpl = templates.find(t => t.id === templateId);
    if (tpl) {
      const activeProd = tipoPessoa === 'aluna' ? (produtoComprado || 'Formação Executiva') : (produtoInteresse || 'Formação Líder');
      const activeResp = responsavel || 'Ana';
      
      let processed = tpl.text
        .replace(/{nome}/g, nome)
        .replace(/{produto}/g, activeProd)
        .replace(/{responsavel}/g, activeResp);
      
      setMessageText(processed);
    }
  };

  // Launch WhatsApp with standard phone validation
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

    if (cleanPhone.length < 10) {
      alert('O número de telefone informado parece incompleto.');
      return;
    }

    const encodedText = encodeURIComponent(messageText);
    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;

    // Add interaction note locally
    const templateName = templates.find(t => t.id === selectedTemplate)?.label || 'Mensagem Manual';
    const logText = `[WhatsApp] Enviado: "${templateName}" para o número ${targetPhone}`;
    setInteracoes(prev => [
      { text: logText, date: 'Agora', type: 'whatsapp' },
      ...prev
    ]);

    // Open WhatsApp in safe separate window
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Add a manual custom timeline note
  const handleAddInteraction = () => {
    if (!novaInteracao.trim()) return;
    setInteracoes(prev => [
      { text: novaInteracao.trim(), date: 'Agora', type: 'manual' },
      ...prev
    ]);
    setNovaInteracao('');
  };

  // Persist edits back to firestore database
  const handleSaveAll = async () => {
    try {
      const updatedModel: any = {
        id: pessoa.id,
        nome,
        email,
        telefone: customPhone || telefone,
        tipoPessoa,
        status,
        temperatura,
        responsavel,
        produtoInteresse,
        observacoes,
        interacoes,
        discussaoInterna,
        
        // If they purchased or is student
        produtoComprado,
        turma,
        entrouGrupo,
        respondeuInicial,
        acessoNutror,
        acessoMRP
      };

      // Query database copy to update
      const updatedList = pessoas.map((p: any) => p.id === pessoa.id ? updatedModel : p);

      await updateModuleData('pessoas', updatedList);
      alert('Cadastro e linha do tempo salvos com sucesso!');
      onClose();
    } catch (e: any) {
      alert('Erro ao salvar no Firestore: ' + e.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-stretch md:items-center justify-end md:justify-center bg-slate-950/40 backdrop-blur-xs">
      <div className="bg-white w-full md:w-11/12 max-w-5xl h-full md:h-[95vh] md:rounded-xl shadow-2xl flex flex-col animate-in slide-in-from-right md:slide-in-from-bottom-4 overflow-hidden">
        
        {/* Modal Top Bar */}
        <div className="flex justify-between items-center p-5 border-b border-slate-150 shrink-0 bg-slate-50">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-[#0A192F]/10 text-[#0A192F] rounded-lg">
              <User className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={nome} 
                  onChange={(e) => setNome(e.target.value)} 
                  className="text-xl font-bold text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-[#1F4E89] focus:ring-0 px-1 py-0.5 outline-none bg-transparent"
                  title="Clique para editar o nome"
                  placeholder="Nome do contato"
                />
                <select 
                  value={tipoPessoa} 
                  onChange={(e) => setTipoPessoa(e.target.value)}
                  className="px-2 py-0.5 text-xs font-bold uppercase rounded border border-slate-300 bg-white"
                >
                  <option value="lead">Lead</option>
                  <option value="aluna">Aluna</option>
                  <option value="ex-aluna">Ex-aluna</option>
                </select>
              </div>
              <p className="text-slate-500 text-xs mt-1 flex items-center gap-4">
                <span>E-mail: <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="text-slate-600 underline outline-none bg-transparent hover:bg-white px-1" /></span>
                <span>Whats: <input type="text" value={customPhone} onChange={(e) => { setCustomPhone(e.target.value); setTelefone(e.target.value); }} className="text-slate-600 outline-none bg-transparent hover:bg-white px-1 w-28" /></span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 bg-slate-100 p-2 rounded-full transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Main Body Scroll container */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 bg-slate-50/50">
          
          {/* LEFT PANEL: CRM Properties Form fields */}
          <div className="lg:col-span-7 space-y-6 bg-white p-5 rounded-xl border border-slate-200">
            
            {/* Lead metrics & journey section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Layers className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold uppercase text-slate-800 tracking-wider">Metadados da Jornada Comercial</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Produto de Interesse</label>
                  <input 
                    type="text" 
                    value={produtoInteresse}
                    onChange={(e) => setProdutoInteresse(e.target.value)}
                    placeholder="Ex: Mentoria Compliance"
                    className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#1F4E89]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">SDR / Responsável</label>
                  <select 
                    value={responsavel}
                    onChange={(e) => setResponsavel(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white outline-none focus:border-[#1F4E89]"
                  >
                    <option value="Liana">Liana</option>
                    <option value="Ana">Ana</option>
                    <option value="Núria">Núria</option>
                    <option value="Luiza">Luiza</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Funil de Vendas</label>
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full text-xs border border-slate-300 bg-white rounded-lg px-2.5 py-1.5 outline-none focus:border-[#1F4E89]"
                  >
                    <option value="novo">Novo Lead</option>
                    <option value="em qualificação">Em Qualificação</option>
                    <option value="em negociação">Em Negociação</option>
                    <option value="aguardando pagamento">Aguardando Pagamento</option>
                    <option value="comprou">Comprou / Aluna</option>
                    <option value="perdido">Perdido</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Temperatura</label>
                  <select 
                    value={temperatura}
                    onChange={(e) => setTemperatura(e.target.value)}
                    className="w-full text-xs border border-slate-300 bg-white rounded-lg px-2.5 py-1.5 outline-none focus:border-[#1F4E89]"
                  >
                    <option value="frio">❄️ Frio</option>
                    <option value="morno">🔥 Morno</option>
                    <option value="quente">⚡ Quente</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Próximo Contato agendado</label>
                  <input 
                    type="date" 
                    value={proximoContato}
                    onChange={(e) => setProximoContato(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white outline-none focus:border-[#1F4E89]"
                  />
                </div>
              </div>
            </section>

            {/* Student Onboarding details - Shows if Aluna / purchased */}
            {(tipoPessoa === 'aluna' || status === 'comprou' || produtoComprado) && (
              <section className="space-y-4 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold uppercase text-slate-800 tracking-wider">Controles & Checkpoints de Aluna</h3>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Produto Comprado</label>
                    <input 
                      type="text" 
                      value={produtoComprado}
                      onChange={(e) => setProdutoComprado(e.target.value)}
                      placeholder="Ex: Combo Compliance + Executivo"
                      className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#1F4E89]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Identificação da Turma</label>
                    <input 
                      type="text" 
                      value={turma}
                      onChange={(e) => setTurma(e.target.value)}
                      placeholder="Ex: Turma 03"
                      className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#1F4E89]"
                    />
                  </div>
                </div>

                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide block mb-1">Status Interno de Onboarding (Núria / CS):</span>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 p-2.5 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer text-xs">
                    <input 
                      type="checkbox" 
                      checked={entrouGrupo} 
                      onChange={(e) => setEntrouGrupo(e.target.checked)} 
                      className="rounded text-emerald-600 focus:ring-emerald-500" 
                    />
                    <span>Ingressou no Grupo Whats</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer text-xs">
                    <input 
                      type="checkbox" 
                      checked={respondeuInicial} 
                      onChange={(e) => setResondeuInicial(e.target.checked)} 
                      className="rounded text-emerald-600 focus:ring-emerald-500" 
                    />
                    <span>Respondeu Diag. Inicial</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer text-xs">
                    <input 
                      type="checkbox" 
                      checked={acessoNutror} 
                      onChange={(e) => setAcessoNutror(e.target.checked)} 
                      className="rounded text-emerald-600 focus:ring-emerald-500" 
                    />
                    <span>Acesso ao Nutror</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer text-xs">
                    <input 
                      type="checkbox" 
                      checked={acessoMRP} 
                      onChange={(e) => setAcessoMRP(e.target.checked)} 
                      className="rounded text-emerald-600 focus:ring-emerald-500" 
                    />
                    <span>Acesso à Planilha MRP</span>
                  </label>
                </div>
              </section>
            )}

            {/* Academic Certificates Tab / Card */}
            {(tipoPessoa === 'aluna' || status === 'comprou' || produtoComprado) && (
              <section className="space-y-4 pt-4 border-t border-slate-100 select-none">
                <div className="flex items-center gap-2 justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Award className="w-4.5 h-4.5 text-amber-500" />
                    <h3 className="text-sm font-bold uppercase text-slate-800 tracking-wider">Certificados Emitidos</h3>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => {
                      const tabEvent = new CustomEvent('change_active_tab', { detail: 'certificados' });
                      window.dispatchEvent(tabEvent);
                      
                      setTimeout(() => {
                        const certEvent = new CustomEvent('trigger_new_certificate', { detail: { aluno: pessoa } });
                        window.dispatchEvent(certEvent);
                      }, 100);

                      onClose();
                    }}
                    className="p-1 px-2.5 bg-[#0A192F] hover:bg-[#D4AF37] text-white hover:text-[#0A192F] text-[10px] font-bold uppercase tracking-wide rounded-md transition flex items-center gap-1 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Emitir Novo</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {studentCertificates.length > 0 ? (
                    studentCertificates.map(cert => {
                      const isSent = cert.status === 'enviado';
                      return (
                        <div key={cert.id} className="p-3 bg-slate-50 border border-slate-200/60 rounded-lg flex justify-between items-center text-xs">
                          <div>
                            <p className="font-bold text-[#0A192F]">{cert.nomeFormacao}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Emitido em: {cert.dataGeracao} • Carga: {cert.cargaHoraria}</p>
                            {isSent && (
                              <p className="text-[9px] text-indigo-700 font-extrabold flex items-center gap-0.5 mt-1 bg-indigo-50 border border-indigo-100 px-1.5 py-0.2 rounded w-fit">
                                <Check className="w-3 h-3 text-indigo-600" /> Enviado por e-mail ({cert.dataEnvio?.split(' ')[0]})
                              </p>
                            )}
                          </div>
                          
                          <div>
                            <button
                              type="button"
                              onClick={() => {
                                // Direct custom print popup block
                                const printWindow = window.open('', '_blank');
                                if (!printWindow) {
                                  alert('Seu navegador bloqueou o pop-up de visualização do PDF. Por favor, permita pop-ups para fazer download imediato.');
                                  return;
                                }
                                printWindow.document.write(`
                                  <html>
                                    <head>
                                      <title>Certificado - ${cert.nomeAluno}</title>
                                      <style>
                                        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Inter:wght@400;600&family=Playfair+Display:ital,wght@0,600;1,400&display=swap');
                                        body { 
                                          margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f3f4f6; font-family: 'Inter', sans-serif;
                                        }
                                        .cert-card {
                                          position: relative; width: 1050px; height: 700px; background-color: #0A192F; color: white; border: 10px solid #D4AF37; box-shadow: 0 10px 30px rgba(0,0,0,0.15); padding: 60px; box-sizing: border-box; display: flex; flex-direction: column; text-align: center; justify-content: space-between; border-image: linear-gradient(to bottom right, #D4AF37, #9A7B1C, #D4AF37) 10;
                                        }
                                        .header { font-family: 'Cinzel', serif; letter-spacing: 4px; color: white; margin-top: 10px; }
                                        .header h1 { font-size: 42px; margin: 0; font-weight: 700; }
                                        .header p { font-size: 14px; margin: 5px 0 0 0; }
                                        .content { font-family: 'Playfair Display', serif; font-size: 20px; line-height: 1.8; margin: 40px auto; max-width: 800px; }
                                        .highlight-name { font-size: 32px; font-weight: bold; display: block; margin: 15px 0; font-family: 'Cinzel', serif; color: #D4AF37; }
                                        .footer-info { display: flex; justify-content: space-between; align-items: flex-end; margin-top: auto; padding: 0 40px; }
                                        .sig-block { border-top: 1.5px solid #94A3B8; padding-top: 10px; width: 250px; font-size: 12px; color: #94A3B8; }
                                        .seal { width: 100px; height: 100px; border: 2px dashed #D4AF37; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Cinzel', serif; font-weight: bold; font-size: 10px; color: #D4AF37; letter-spacing: 1px; }
                                        .print-btn { position: fixed; bottom: 20px; right: 20px; background: #0A192F; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 1000; }
                                        @media print { .print-btn { display: none; } body { background: white; } .cert-card { box-shadow: none; } }
                                      </style>
                                    </head>
                                    <body>
                                      <button class="print-btn" onclick="window.print()">Imprimir / Salvar PDF</button>
                                      <div class="cert-card">
                                        <div class="header">
                                          <h1>CERTIFICADO</h1>
                                          <p>INSTITUTO LIANA GOMES</p>
                                        </div>
                                        <div class="content">
                                          Certificamos que <span class="highlight-name">${cert.nomeAluno}</span> concluiu com aproveitamento a formação <strong>${cert.nomeFormacao}</strong>, com carga horária de <strong>${cert.cargaHoraria}</strong>, organizada pelo Instituto Liana Gomes, referente à <strong>${cert.turma}</strong> em ${cert.dataConclusao}.
                                        </div>
                                        <div class="footer-info">
                                          <div class="sig-block">
                                            <strong>Liana Gomes</strong><br>Mentora / Diretora Geral
                                          </div>
                                          <div class="seal">SELO ILG<br>OFICIAL</div>
                                          <div class="sig-block">
                                            Emissão: ${cert.dataEmissao}<br>Código Autenticidade: ${cert.id.toUpperCase()}
                                          </div>
                                        </div>
                                      </div>
                                    </body>
                                  </html>
                                `);
                                printWindow.document.close();
                              }}
                              className="px-2.5 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 bg-white shadow-xs rounded-lg text-[10px] font-bold tracking-wide uppercase flex items-center gap-1.5"
                            >
                              <Printer className="w-3.5 h-3.5 text-slate-550" />
                              <span>Baixar PDF</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 border border-dashed rounded-lg bg-slate-50/50 text-slate-400 flex items-center gap-2">
                      <p className="text-[11px] text-slate-500 italic">Nenhum certificado emitido para esta aluna ainda.</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* CRM General Notes Area */}
            <section className="pt-2 border-t border-slate-100">
              <label className="text-xs font-bold uppercase text-slate-800 tracking-wider block mb-1">Observações Completas / Dores e Desejos</label>
              <textarea 
                rows={4} 
                value={observacoes} 
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Insira notas de ligações, metas profissionais do contato, feedbacks..."
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#1F4E89] text-slate-800 leading-relaxed font-normal"
              />
            </section>
          </div>

          {/* RIGHT PANEL: WhatsApp Integration + Interaction Timeline */}
          <div className="lg:col-span-5 space-y-6 flex flex-col">
            
            {/* WHATSAPP ASSISTANT PANEL */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <span className="p-1 px-1.5 bg-emerald-100 text-emerald-700 rounded-md">
                    <MessageCircle className="w-4 h-4 inline" />
                  </span>
                  <span>CRM WhatsApp Assistente</span>
                </div>
                {telefone && (
                  <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-extrabold uppercase">
                    WhatsApp Pronto
                  </span>
                )}
              </div>
              
              <div>
                <label className="text-xs font-semibold text-emerald-950 block mb-1">Selecione o Modelo de Mensagem:</label>
                <select 
                  value={selectedTemplate}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full text-xs border border-emerald-300 bg-white rounded-lg px-2.5 py-1.5 outline-none text-slate-800 focus:border-emerald-500"
                >
                  <option value="">Modelo Manual (Em Branco)</option>
                  
                  <optgroup label="💼 Liana & Ana (Comercial / Vendas)">
                    {templates.filter(t => t.category === 'Lead').map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </optgroup>

                  <optgroup label="💻 Núria (Onboarding / Suporte)">
                    {templates.filter(t => t.category === 'Aluna').map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </optgroup>

                  <optgroup label="💵 Cobrança & Central Financeiro">
                    {templates.filter(t => t.category === 'Geral').map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-emerald-900 uppercase tracking-widest block mb-1">Texto de Envio (Editável):</label>
                <textarea 
                  rows={5}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Selecione um modelo de envio ou digite uma mensagem personalizada aqui..."
                  className="w-full text-xs border border-emerald-300 rounded-lg px-3 py-2 outline-none focus:ring-emerald-500 focus:border-emerald-500 text-slate-800 leading-relaxed font-normal bg-white/90"
                />
              </div>

              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  placeholder="Número de Envio com DDD"
                  className="text-xs border border-emerald-300 rounded-lg px-3 py-2 bg-white flex-1 outline-none text-slate-800"
                  title="Confirme o telefone de destino"
                />
                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" /> Enviar
                </button>
              </div>
            </div>

            {/* TIMELINE INTERACTS LOG PANEL */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex-1 flex flex-col min-h-[300px]">
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-3.5 pb-1 border-b border-slate-100 flex items-center justify-between">
                <span>Histórico & Interações</span>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.2 rounded font-semibold">{interacoes.length} Notas</span>
              </h3>

              {/* Add Interaction Custom Text Box */}
              <div className="flex gap-1.5 mb-4 items-center">
                <input 
                  type="text"
                  placeholder="Registrar ligação, e-mail recebido..."
                  value={novaInteracao}
                  onChange={(e) => setNovaInteracao(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddInteraction()}
                  className="text-xs border border-slate-300 rounded-lg px-3 py-2 flex-1 outline-none focus:border-[#1F4E89] text-slate-800"
                />
                <button 
                  onClick={handleAddInteraction}
                  className="p-2 bg-[#0A192F] hover:bg-[#D4AF37] text-white hover:text-[#0A192F] rounded-lg transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Interaction List */}
              <div className="flex-1 overflow-y-auto space-y-4 max-h-[300px] pr-1 scrollbar-thin">
                {interacoes.map((item, idx) => (
                  <div key={idx} className="pl-4 border-l-2 border-slate-200 hover:border-[#D4AF37] relative transition-colors py-0.5">
                    <div className="absolute w-2 h-2 rounded-full -left-[5px] top-1.5 transition-colors bg-slate-200" />
                    <p className="text-xs text-slate-700 leading-relaxed font-normal">{item.text}</p>
                    <span className="text-[10px] text-slate-400 block mt-1.5 font-medium">{item.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* DISCUSSÃO INTERNA (INTERNAL DISCUSSION) */}
            <div className="bg-white border border-[#D4AF37]/45 rounded-xl p-5 flex flex-col min-h-[300px] shadow-[#D4AF37]/5 shadow-sm">
              <h3 className="text-xs font-bold uppercase text-slate-950 tracking-wider mb-3.5 pb-1.5 border-b border-amber-200/50 flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> Discussão Interna da Equipe (Sem WhatsApp)</span>
                <span className="text-[10px] bg-amber-50 text-[#0A192F] border border-amber-200 px-2 py-0.5 rounded font-extrabold">{discussaoInterna.length} Comentários</span>
              </h3>

              {/* Author Selector and Send box */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold">
                  <span>Escrevendo como:</span>
                  <div className="flex gap-1.5">
                    <button 
                      type="button"
                      onClick={() => setDiscAutor('luiza')} 
                      className={`px-1.5 py-0.5 rounded-lg border text-[9px] transition ${discAutor === 'luiza' ? 'bg-rose-50 text-rose-800 border-rose-300 font-extrabold shadow-2xs' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                    >
                      Luiza ⚡
                    </button>
                    <button 
                      type="button"
                      onClick={() => setDiscAutor('liana')} 
                      className={`px-1.5 py-0.5 rounded-lg border text-[9px] transition ${discAutor === 'liana' ? 'bg-amber-50 text-amber-800 border-amber-300 font-extrabold shadow-2xs' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                    >
                      Liana 👑
                    </button>
                    <button 
                      type="button"
                      onClick={() => setDiscAutor('nuria')} 
                      className={`px-1.5 py-0.5 rounded-lg border text-[9px] transition ${discAutor === 'nuria' ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-extrabold shadow-2xs' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                    >
                      Núria 🌸
                    </button>
                    <button 
                      type="button"
                      onClick={() => setDiscAutor('ana')} 
                      className={`px-1.5 py-0.5 rounded-lg border text-[9px] transition ${discAutor === 'ana' ? 'bg-indigo-50 text-indigo-800 border-indigo-300 font-extrabold shadow-2xs' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                    >
                      Ana 💼
                    </button>
                  </div>
                </div>

                <div className="flex gap-1.5 items-center">
                  <input 
                    type="text"
                    placeholder="Discutir o momento desse lead/aluna..."
                    value={novaDiscMsg}
                    onChange={(e) => setNovaDiscMsg(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDiscMsg())}
                    className="text-xs border border-slate-300 rounded-lg px-3 py-2 flex-1 outline-none focus:border-[#D4AF37] text-slate-800 bg-[#FCFBF9]"
                  />
                  <button 
                    type="button"
                    onClick={handleAddDiscMsg}
                    className="p-2 bg-[#0A192F] hover:bg-[#D4AF37] text-white hover:text-[#0A192F] rounded-lg transition"
                    title="Enviar para discussões internas"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Discussions Live Feed */}
              <div className="flex-1 overflow-y-auto space-y-3.5 max-h-[250px] pr-1 scrollbar-thin">
                {discussaoInterna.length === 0 ? (
                  <div className="p-4 text-center text-[11px] text-slate-400">Nenhuma anotação de discussão interna. Digite acima!</div>
                ) : (
                  discussaoInterna.map((msg, mIdx) => (
                    <div key={msg.id || mIdx} className="bg-slate-50/50 hover:bg-slate-100/50 p-2.5 rounded-lg border border-slate-150 relative group">
                      <div className="absolute right-2.5 top-2.5 opacity-0 group-hover:opacity-100 transition">
                        <button 
                          type="button" 
                          onClick={() => handleDeleteDiscMsg(msg.id)}
                          className="p-1 text-slate-450 hover:text-red-650 rounded transition" 
                          title="Excluir mensagem da equipe"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5 mb-1 text-left">
                        <span className="text-[10px] bg-slate-100 rounded-full w-4 h-4 flex items-center justify-center select-none">{msg.avatar || '⚡'}</span>
                        <span className="text-xs font-bold text-slate-800">{msg.autorNome}</span>
                        <span className="text-[9px] text-slate-400 font-normal">{msg.dataHora}</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed text-left font-normal pl-5">
                        {msg.texto}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-100 flex justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold"
          >
            Cancelar
          </button>
          
          <button
            onClick={handleSaveAll}
            className="px-5 py-2 bg-[#0A192F] hover:bg-[#D4AF37] text-white hover:text-[#0A192F] rounded-lg font-bold text-xs transition shadow-sm flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" /> Salvar Tudo
          </button>
        </div>

      </div>
    </div>
  );
}
