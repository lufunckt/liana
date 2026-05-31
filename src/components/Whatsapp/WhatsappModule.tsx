import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Phone, MessageSquare, Send, Search, QrCode, Clipboard, Check, RefreshCw, 
  Settings, Bot, Radio, Sliders, Play, AlertCircle, Sparkles, User, ShieldCheck, 
  Layers, CheckSquare, PlusCircle, CheckCircle2, Paperclip, MessageCircle, ExternalLink, Info
} from 'lucide-react';
import { useStore } from '../../store';

interface Message {
  id: string;
  sender: 'me' | 'them' | 'system';
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}

const TEMPLATE_PRESETS = [
  {
    id: 'boas_vindas',
    title: '✨ Boas-vindas Lead',
    text: "Olá, {nome}! Tudo bem? 😊 Aqui é a Ana do *Instituto Liana Gomes*. Vi que você se interessou em saber mais sobre a nossa formação de*{produto}*. É um prazer enorme conversar com você! Como estão suas metas profissionais hoje?"
  },
  {
    id: 'onboarding_bem_vinda',
    title: '🎉 Boas-vindas Aluna',
    text: "Olá, {nome}! Seja super bem-vinda à nossa comunidade no *Instituto Liana Gomes*! 🥰 Aqui é a Núria. Para darmos início ao onboarding na sua formação de *{produto}*, segue o link do seu portal de aulas no Nutror: https://www.nutror.com"
  },
  {
    id: 'grupo_link',
    title: '💬 Link do Grupo WhatsApp',
    text: "Olá, {nome}! Tudo bem? ✨ Segue o link exclusivo para você ingressar no grupo oficial de WhatsApp da sua turma: https://chat.whatsapp.com/ExemploGrupoILG. É fundamental estar lá para receber novidades e mentorias!"
  },
  {
    id: 'diag_reminder',
    title: '📝 Lembrete Diagnóstico',
    text: "Olá, {nome}! Tudo bem? 🌸 Passando para lembrar de preencher o *Formulário de Diagnóstico Inicial* para que nossa equipe alinhe as mentorias aos seus objetivos: https://forms.gle/ExemploDiagnosticoILG"
  },
  {
    id: 'cobranca_boleto',
    title: '💵 Central Financeira: Boleto',
    text: "Olá, {nome}! Espero que esteja bem. ✨ Passando para avisar que sua mensalidade está pronta. Você pode realizar o pagamento Pix com a nossa chave CNPJ oficial:\n🔑 CNPJ: *51.533.488/0001-09*\n\nQualquer dúvida me avise!"
  }
];

export function WhatsappModule() {
  const { data, updateModuleData } = useStore();
  const pessoas = data.pessoas || [];

  // Active view tabs inside WhatsApp module
  const [activeSubTab, setActiveSubTab] = useState<'conversas' | 'config' | 'disparos'>('conversas');

  // Selected active chat
  const [selectedPessoaId, setSelectedPessoaId] = useState<string | null>(null);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Local storage / state for WhatsApp messages per contact ID
  const [chatHistories, setChatHistories] = useState<Record<string, Message[]>>({});
  
  // Inputs
  const [newMessageText, setNewMessageText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const [provider, setProvider] = useState(() => localStorage.getItem('ilg_wa_provider') || 'evolution');
  const [qrCodeImage, setQrCodeImage] = useState<string>('');

  // Configuration settings (simulated or real integration config saved in localStorage)
  const [apiUrl, setApiUrl] = useState(() => localStorage.getItem('ilg_wa_api_url') || 'https://api.ilg-whatsapp.com/v1');
  const [apiToken, setApiToken] = useState(() => localStorage.getItem('ilg_wa_api_token') || '');
  const [instanceName, setInstanceName] = useState(() => localStorage.getItem('ilg_wa_instance_name') || 'ilg_operacional');
  const [isConnected, setIsConnected] = useState(() => localStorage.getItem('ilg_wa_connected') === 'true');
  const [connectionStatus, setConnectionStatus] = useState<string>(() => 
    localStorage.getItem('ilg_wa_connected') === 'true' ? 'Active & Paired' : 'Desconectado'
  );
  
  // Pairing workflow states
  const [qrCodeValue, setQrCodeValue] = useState<string>('');
  const [generatingQr, setGeneratingQr] = useState(false);
  const [qrCountdown, setQrCountdown] = useState(0);

  // Auto-scroller ref for chat thread
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Active student/lead selected properties for easy editing right from the sidebar
  const selectedPessoa = useMemo(() => {
    return pessoas.find(p => p.id === selectedPessoaId) || null;
  }, [pessoas, selectedPessoaId]);

  // Handle first time load or default mock conversations
  useEffect(() => {
    if (pessoas.length > 0 && !selectedPessoaId) {
      // Find person with phone number
      const firstWithPhone = pessoas.find(p => p.telefone);
      if (firstWithPhone) {
        setSelectedPessoaId(firstWithPhone.id);
      } else {
        setSelectedPessoaId(pessoas[0].id);
      }
    }
  }, [pessoas]);

  // Fetch or generate mock messages when selected person changes
  useEffect(() => {
    if (!selectedPessoaId) return;

    if (!chatHistories[selectedPessoaId]) {
      const pessoa = pessoas.find(p => p.id === selectedPessoaId);
      if (pessoa) {
        // Build simulated seed chat history based on current person status
        const list: Message[] = [];
        list.push({
          id: 'sys-1',
          sender: 'system',
          text: `Chat iniciado com ${pessoa.nome} (${pessoa.tipoPessoa || 'lead'})`,
          timestamp: 'Hoje de manhã'
        });

        if (pessoa.tipoPessoa === 'aluna') {
          list.push({
            id: 'm-1',
            sender: 'them',
            text: `Olá! Consegui acessar a plataforma Nutror, mas não encontrei o link da planilha MRP. Onde fica?`,
            timestamp: '09:12'
          });
          list.push({
            id: 'm-2',
            sender: 'me',
            text: `Bom dia, ${pessoa.nome}! Sou a Núria. Fica na aba de materiais extras, mas vou te mandar o link direto!`,
            timestamp: '09:15',
            status: 'read'
          });
        } else {
          list.push({
            id: 'm-1',
            sender: 'them',
            text: `Olá, tenho interesse na mentoria de compliance administrativo. Vocês poderiam me mandar os valores e datas?`,
            timestamp: 'Ontem às 17:40'
          });
          list.push({
            id: 'm-2',
            sender: 'me',
            text: `Olá! Claro! Deixa eu verificar sua disponibilidade para uma chamada explicativa rápida com a Ana. Que horas fica melhor hoje?`,
            timestamp: 'Ontem às 17:45',
            status: 'read'
          });
        }
        
        setChatHistories(prev => ({
          ...prev,
          [selectedPessoaId]: list
        }));
      }
    }

    // Scroll to bottom
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }, [selectedPessoaId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistories]);

  // Countdown timer for pairing QR-code simulation
  useEffect(() => {
    let interval: any;
    if (qrCountdown > 0) {
      interval = setInterval(() => {
        setQrCountdown(prev => prev - 1);
      }, 1000);
    } else if (qrCountdown === 0 && qrCodeValue) {
      setQrCodeValue('');
    }
    return () => clearInterval(interval);
  }, [qrCountdown, qrCodeValue]);

  // Get filtered people list for the chat menu
  const filteredPessoas = useMemo(() => {
    return pessoas.filter(p => {
      const matchSearch = p.nome?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.telefone?.includes(searchTerm) ||
                          p.tipoPessoa?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch;
    });
  }, [pessoas, searchTerm]);

  // Simulates scanning a QR-code using cellphone
  const handleSimulateScan = () => {
    setGeneratingQr(true);
    setTimeout(() => {
      setGeneratingQr(false);
      setIsConnected(true);
      setConnectionStatus('Conectado como +55 11 95133-4880 (Instituto Liana Gomes)');
      setQrCodeValue('');
      setQrCodeImage('');
      setQrCountdown(0);
      localStorage.setItem('ilg_wa_connected', 'true');
      localStorage.setItem('ilg_wa_api_url', apiUrl);
      localStorage.setItem('ilg_wa_api_token', apiToken);
      localStorage.setItem('ilg_wa_instance_name', instanceName);
      localStorage.setItem('ilg_wa_provider', provider);
    }, 1500);
  };

  // Simulates disconnecting the WhatsApp
  const handleDisconnect = () => {
    setIsConnected(false);
    setConnectionStatus('Desconectado');
    setQrCodeImage('');
    setQrCodeValue('');
    setQrCountdown(0);
    localStorage.removeItem('ilg_wa_connected');
  };

  // Generates unique mock dynamic QR Code for authentication pairing OR fetches real QR Code from Evolution API or Z-API
  const handleGenerateQr = async () => {
    setGeneratingQr(true);
    setQrCodeImage('');
    setQrCodeValue('');

    // If API credentials exist and they are not the placeholder, try to call the real Evolution/Z-API
    if (apiUrl && apiToken && apiUrl !== 'https://api.ilg-whatsapp.com/v1') {
      try {
        const cleanUrl = apiUrl.replace(/\/$/, '');
        let qrUrl = '';
        let headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };

        if (provider === 'evolution') {
          // Standard Evolution API fetch connection QR code: GET /instance/connect/{instanceName}
          qrUrl = `${cleanUrl}/instance/connect/${instanceName}`;
          headers['apikey'] = apiToken;
        } else if (provider === 'zapi') {
          // Z-API QR code endpoint: GET /instances/{instance}/qr-code
          qrUrl = `${cleanUrl}/instances/${instanceName}/qr-code`;
          headers['Client-Token'] = apiToken;
        } else {
          qrUrl = `${cleanUrl}/instance/connect/${instanceName}`;
          headers['apikey'] = apiToken;
        }

        const res = await fetch(qrUrl, { 
          method: 'GET',
          headers
        });

        if (res.ok) {
          const resData = await res.json();
          // Evolution API base64 pic lives in resData.base64, or resData.qrcode.base64, or resData.code
          const base64Pic = resData.base64 || resData.qrcode?.base64 || (resData.code?.startsWith('data:image') ? resData.code : '');
          if (base64Pic) {
            setQrCodeImage(base64Pic);
            setGeneratingQr(false);
            setQrCountdown(60);
            return;
          }
        }
      } catch (e) {
        console.warn("Real WhatsApp connection failed (expected if local server is not running). Falling back to interface simulation:", e);
      }
    }

    // Interactive Simulator fallback
    setTimeout(() => {
      setGeneratingQr(false);
      setQrCodeValue(`ilg-secure-oauth-handshake-${Math.random().toString(36).substring(7)}`);
      setQrCountdown(60); // QR stays valid for 60s
    }, 850);
  };

  // Quick insertion of message templates
  const handlePickTemplate = (text: string) => {
    if (!selectedPessoa) return;
    const activeProd = selectedPessoa.tipoPessoa === 'aluna' 
      ? (selectedPessoa.produtoComprado || 'Formação Executiva & Compliance') 
      : (selectedPessoa.produtoInteresse || 'Formação Líder');
    
    const filled = text
      .replace(/{nome}/g, selectedPessoa.nome)
      .replace(/{produto}/g, activeProd);
    
    setNewMessageText(filled);
  };

  // Send WhatsApp Action
  const handleSendMessage = async () => {
    if (!newMessageText.trim() || !selectedPessoaId || !selectedPessoa) return;

    const textToSend = newMessageText.trim();
    const now = new Date();
    const formattedTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const messageId = `msg-${Date.now()}`;
    const newMsg: Message = {
      id: messageId,
      sender: 'me',
      text: textToSend,
      timestamp: formattedTime,
      status: 'sent'
    };

    // 1. Instantly append message to localized active chat interface state
    setChatHistories(prev => ({
      ...prev,
      [selectedPessoaId]: [...(prev[selectedPessoaId] || []), newMsg]
    }));

    setNewMessageText('');

    // 2. Perform background actual API Dispatch to self-hosted Evolution API or Z-API
    if (isConnected && apiUrl && apiToken && apiUrl !== 'https://api.ilg-whatsapp.com/v1') {
      try {
        let cleanPhone = String(selectedPessoa.telefone).replace(/\D/g, '');
        if (cleanPhone.length > 0 && !cleanPhone.startsWith('55') && cleanPhone.length <= 11) {
          cleanPhone = '55' + cleanPhone;
        }

        const cleanUrl = apiUrl.replace(/\/$/, '');
        let targetEndpoint = '';
        let headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };
        let bodyPayload: any = {};

        if (provider === 'evolution') {
          // POST /message/sendText/{instanceName}
          targetEndpoint = `${cleanUrl}/message/sendText/${instanceName}`;
          headers['apikey'] = apiToken;
          bodyPayload = {
            number: cleanPhone,
            options: {
              delay: 1000,
              presence: "composing",
              linkPreview: false
            },
            textMessage: {
              text: textToSend
            }
          };
        } else if (provider === 'zapi') {
          // POST /instances/{instance}/send-text
          targetEndpoint = `${cleanUrl}/instances/${instanceName}/send-text`;
          headers['Client-Token'] = apiToken;
          bodyPayload = {
            phone: cleanPhone,
            message: textToSend
          };
        } else {
          // Fallback Baileys API endpoint template
          targetEndpoint = `${cleanUrl}/message/sendText/${instanceName}`;
          headers['apikey'] = apiToken;
          bodyPayload = {
            number: cleanPhone,
            text: textToSend
          };
        }

        console.log(`[WhatsApp API GATEWAY Dispatch] URL: ${targetEndpoint}`, bodyPayload);
        
        await fetch(targetEndpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(bodyPayload)
        });
      } catch (e) {
        console.error("Erro na requisição HTTP para o Gateway do cliente: ", e);
      }
    }

    // 3. PERSIST interaction note back to Pessoas collections on Firestore!
    // This allows seamless synchronization, so the message log appears on their core history card timeline.
    try {
      const updatedInteractions = [
        { text: `[Whats Atendimento] Enviado: "${textToSend}"`, date: 'Agora no Chat', type: 'whatsapp' },
        ...(selectedPessoa.interacoes || [])
      ];
      
      const updatedModel = {
        ...selectedPessoa,
        interacoes: updatedInteractions
      };

      const updatedList = pessoas.map((p: any) => p.id === selectedPessoa.id ? updatedModel : p);
      await updateModuleData('pessoas', updatedList);
    } catch (e) {
      console.error("Erro ao registrar nota de interação no Firestore: ", e);
    }

    // 4. Simulate a fun mock automatic customer support response for testing!
    setTimeout(() => {
      const responseMsg: Message = {
        id: `reply-${Date.now()}`,
        sender: 'them',
        text: `Obrigada pelo retorno! Pode deixar que vou verificar isso agora mesmo e te aviso por aqui. 👍🌸`,
        timestamp: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes() + 1).padStart(2, '0')}`
      };
      setChatHistories(prev => ({
        ...prev,
        [selectedPessoaId]: [...(prev[selectedPessoaId] || []), responseMsg]
      }));
    }, 3000);
  };

  // Checkbox helpers directly inside WhatsApp to easily checklist items
  const handleTogglePessoaCheckbox = async (field: 'entrouGrupo' | 'respondeuInicial' | 'acessoNutror' | 'acessoMRP', value: boolean) => {
    if (!selectedPessoa) return;

    try {
      const updatedModel = {
        ...selectedPessoa,
        [field]: value,
        interacoes: [
          { text: `[Whats Painel] Checklist '${field}' alterado para: ${value ? 'CONCLUÍDO' : 'PENDENTE'}`, date: 'Agora', type: 'system' },
          ...(selectedPessoa.interacoes || [])
        ]
      };

      const updatedList = pessoas.map((p: any) => p.id === selectedPessoa.id ? updatedModel : p);
      await updateModuleData('pessoas', updatedList);
    } catch (e) {
      console.error("Failed to update student checkpoint: ", e);
    }
  };

  return (
    <div className="flex flex-col min-h-full space-y-6 pb-12">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A192F] flex items-center gap-2.5">
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <MessageSquare className="w-6 h-6" />
            </span>
            <span>Central WhatsApp ILG</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Conecte o número operacional da empresa e converse em tempo real com Leads, Alunas e envie relatórios e notificações.
          </p>
        </div>

        {/* CONNECTION SUMMARY STICKY */}
        <div className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-lg p-2.5 pr-4 shadow-xs">
          <div className="relative">
            <span className={`block w-3.5 h-3.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-400'}`} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Status Integração</p>
            <p className="text-xs text-slate-500 font-medium truncate max-w-[200px]">
              {isConnected ? 'Whats Corporativo Pareado' : 'Desconectado de APIs'}
            </p>
          </div>
        </div>
      </div>

      {/* INNER TABS MENU */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('conversas')}
          className={`px-4 py-2.5 border-b-2 font-bold text-xs transition duration-200 uppercase tracking-widest flex items-center gap-2 ${
            activeSubTab === 'conversas' 
              ? 'border-[#0A192F] text-[#0A192F]' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          Conversas & Atendimento
        </button>

        <button
          onClick={() => setActiveSubTab('config')}
          className={`px-4 py-2.5 border-b-2 font-bold text-xs transition duration-200 uppercase tracking-widest flex items-center gap-2 ${
            activeSubTab === 'config' 
              ? 'border-[#0A192F] text-[#0A192F]' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          Configuração de Conexão
        </button>

        <button
          onClick={() => setActiveSubTab('disparos')}
          className={`px-4 py-2.5 border-b-2 font-bold text-xs transition duration-200 uppercase tracking-widest flex items-center gap-2 ${
            activeSubTab === 'disparos' 
              ? 'border-[#0A192F] text-[#0A192F]' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bot className="w-4 h-4" />
          IA Copiloto & Disparos
        </button>
      </div>

      {/* CORE SCREENS DISPATCH */}
      
      {/* TAB 1: REAL-TIME CHATS */}
      {activeSubTab === 'conversas' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[700px] bg-white rounded-3xl border border-slate-200/60 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          
          {/* LEFT 4 COLS: Active Chat List Sidebar */}
          <div className="lg:col-span-3 border-r border-slate-150 flex flex-col h-full bg-slate-50/50">
            {/* Search inputs */}
            <div className="p-3.5 border-b border-slate-150 flex items-center gap-2 bg-slate-50/50">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Pesquisar contatos..."
                  className="w-full text-xs font-medium border border-slate-250 bg-white rounded-lg pl-8 pr-2.5 py-2.5 outline-none focus:border-[#0A192F]"
                />
              </div>
            </div>

            {/* List entries */}
            <div className="flex-1 overflow-y-auto space-y-1 p-2">
              {filteredPessoas.map((p) => {
                const isSelected = p.id === selectedPessoaId;
                const badgeColor = p.tipoPessoa === 'aluna' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700';
                
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPessoaId(p.id)}
                    className={`w-full text-left p-3 rounded-lg flex flex-col transition ${
                      isSelected 
                        ? 'bg-[#0A192F]/5 border-l-4 border-[#0A192F]' 
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-xs truncate max-w-[130px]">{p.nome}</span>
                      <span className="text-[9px] text-slate-400 font-medium">10:45</span>
                    </div>
                    
                    <div className="flex justify-between items-center mt-1.5 ">
                      <span className="text-[10px] text-slate-500 font-mono truncate max-w-[120px]">
                        {p.telefone || 'Sem fone'}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase scale-90 ${badgeColor}`}>
                        {p.tipoPessoa || 'lead'}
                      </span>
                    </div>
                  </button>
                );
              })}

              {filteredPessoas.length === 0 && (
                <div className="p-6 text-center text-slate-400 text-xs">
                  Nenhum contato encontrado.
                </div>
              )}
            </div>
          </div>

          {/* MIDDLE 6 COLS: Main Chat Frame */}
          <div className="lg:col-span-6 flex flex-col h-full bg-slate-50">
            {selectedPessoa ? (
              <>
                {/* Active contact header bar */}
                <div className="p-3 bg-white border-b border-slate-150 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 bg-emerald-50 text-emerald-700 rounded-full">
                      <User className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="font-bold text-xs text-slate-950 uppercase">{selectedPessoa.nome}</h3>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium mt-0.5">
                        <Phone className="w-3 h-3 inline text-slate-400" />
                        <span>{selectedPessoa.telefone || 'Ainda sem telefone cadastrado'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {selectedPessoa.telefone && (
                      <button 
                        onClick={() => {
                          let cleanPhone = String(selectedPessoa.telefone).replace(/\D/g, '');
                          if (cleanPhone.length > 0 && !cleanPhone.startsWith('55') && cleanPhone.length <= 11) {
                            cleanPhone = '55' + cleanPhone;
                          }
                          window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}`, '_blank', 'noreferrer,noopener');
                        }}
                        className="p-2 border border-slate-200 hover:border-slate-350 bg-white rounded-lg text-emerald-600 hover:bg-slate-50 transition shadow-xs text-xs font-semibold flex items-center gap-1"
                        title="Abrir diretamente no Aplicativo WhatsApp"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Abrir Link Whats</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Message list area (scrollable) */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5 flex flex-col bg-stone-100">
                  {chatHistories[selectedPessoaId || '']?.map((msg) => {
                    if (msg.sender === 'system') {
                      return (
                        <div key={msg.id} className="mx-auto bg-slate-200/80 text-slate-600 font-bold text-[10px] px-2.5 py-1 rounded">
                          {msg.text}
                        </div>
                      );
                    }

                    const isMe = msg.sender === 'me';
                    return (
                      <div 
                        key={msg.id}
                        className={`max-w-[80%] flex flex-col rounded-xl p-3 shadow-xs ${
                          isMe 
                            ? 'bg-[#0E5C4E] text-white self-end rounded-tr-none' 
                            : 'bg-white text-slate-800 self-start rounded-tl-none border border-slate-150'
                        }`}
                      >
                        <p className="text-xs leading-relaxed font-normal">{msg.text}</p>
                        <span className={`text-[9px] mt-1.5 self-end block font-medium ${
                          isMe ? 'text-emerald-200' : 'text-slate-400'
                        }`}>
                          {msg.timestamp}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>

                {/* Quick select templates selection header inside chat column */}
                <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-150 flex items-center gap-2 overflow-x-auto shrink-0 select-none">
                  <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Templates:</span>
                  {TEMPLATE_PRESETS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handlePickTemplate(t.text)}
                      className="px-2.5 py-1 text-[10px] bg-white border border-slate-200 hover:border-[#0A192F] text-slate-700 font-bold rounded-full transition shrink-0"
                    >
                      {t.title}
                    </button>
                  ))}
                </div>

                {/* Input action toolbar */}
                <div className="p-3 bg-white border-t border-slate-200 flex gap-2 items-center shrink-0">
                  <input 
                    type="text"
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Digite uma mensagem... (Pressione Enter para enviar para o cliente)"
                    className="flex-1 text-xs border border-slate-350 bg-slate-50 px-3.5 py-3 rounded-lg outline-none focus:border-[#0E5C4E] focus:bg-white text-slate-800"
                  />
                  
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessageText.trim()}
                    className="py-3 px-4.5 bg-[#0E5C4E] hover:bg-emerald-800 text-white font-bold rounded-lg transition disabled:opacity-40 flex items-center gap-1.5 shadow-sm text-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-slate-400 text-xs">
                Selecione uma conversa ao lado para responder.
              </div>
            )}
          </div>

          {/* RIGHT 3 COLS: Live checklist controls & properties sidebar */}
          <div className="lg:col-span-3 border-l border-slate-150 p-6 h-full overflow-y-auto flex flex-col space-y-6 bg-slate-50/50 select-none">
            {selectedPessoa ? (
              <>
                {/* Contact information details summary */}
                <div className="pb-3 border-b border-slate-150 text-left">
                  <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-widest block mb-2">Detalhes Operacionais</h4>
                  <p className="text-xs font-bold text-slate-800">{selectedPessoa.nome}</p>
                  
                  <p className="text-[11px] text-slate-500 mt-2">
                    Tipo: <strong className="text-slate-700 uppercase text-[9px]">{selectedPessoa.tipoPessoa || 'lead'}</strong>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Responsável: <strong className="text-slate-700">{selectedPessoa.responsavel || 'Ana'}</strong>
                  </p>
                  {selectedPessoa.tipoPessoa === 'aluna' && (
                    <p className="text-[11px] text-slate-500 mt-1">
                      Turma: <strong className="text-[#D4AF37]">{selectedPessoa.turma || 'Sem turma'}</strong>
                    </p>
                  )}
                </div>

                {/* Onboarding Operations checklist toggler - Syncs live with Firestore */}
                {selectedPessoa.tipoPessoa === 'aluna' ? (
                  <div className="space-y-2.5">
                    <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0A192F]" />
                      <span>Checklist Integrada</span>
                    </h5>
                    
                    <label className="flex items-center gap-2 p-2 border border-slate-100 rounded-lg bg-stone-50 hover:bg-slate-100 cursor-pointer text-xs">
                      <input 
                        type="checkbox" 
                        checked={!!selectedPessoa.entrouGrupo} 
                        onChange={(e) => handleTogglePessoaCheckbox('entrouGrupo', e.target.checked)} 
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5" 
                      />
                      <span>Grupo Whats</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 border border-slate-100 rounded-lg bg-stone-50 hover:bg-slate-100 cursor-pointer text-xs">
                      <input 
                        type="checkbox" 
                        checked={!!selectedPessoa.respondeuInicial} 
                        onChange={(e) => handleTogglePessoaCheckbox('respondeuInicial', e.target.checked)} 
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5" 
                      />
                      <span>Diag. Inicial</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 border border-slate-100 rounded-lg bg-stone-50 hover:bg-slate-100 cursor-pointer text-xs">
                      <input 
                        type="checkbox" 
                        checked={!!selectedPessoa.acessoNutror} 
                        onChange={(e) => handleTogglePessoaCheckbox('acessoNutror', e.target.checked)} 
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5" 
                      />
                      <span>Cadastrado Nutror</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 border border-slate-100 rounded-lg bg-stone-50 hover:bg-slate-100 cursor-pointer text-xs">
                      <input 
                        type="checkbox" 
                        checked={!!selectedPessoa.acessoMRP} 
                        onChange={(e) => handleTogglePessoaCheckbox('acessoMRP', e.target.checked)} 
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5" 
                      />
                      <span>Acesso Planilha MRP</span>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-[#0A192F]" />
                      <span>Perfil de Conversão</span>
                    </h5>
                    
                    <div className="p-3 bg-stone-50 border border-slate-150 rounded-lg space-y-1.5">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Interesse primordial:</p>
                      <p className="text-xs font-semibold text-slate-700 truncate">{selectedPessoa.produtoInteresse || 'Não informado'}</p>
                      
                      <p className="text-[10px] text-slate-500 uppercase font-bold mt-2">Dores registradas:</p>
                      <p className="text-[11px] text-slate-600 leading-relaxed max-h-[80px] overflow-y-auto font-normal">
                        {selectedPessoa.observacoes || 'Nenhuma nota de dor.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Dynamic mini logs for that person */}
                <div className="flex-1 flex flex-col min-h-0">
                  <h5 className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Histórico Resumido</h5>
                  <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[140px] border border-slate-100 rounded p-1.5 bg-slate-50 pr-1 pr-1.5">
                    {selectedPessoa.interacoes?.slice(0, 4).map((i: any, ind: number) => (
                      <div key={ind} className="p-2 bg-white rounded border border-slate-150 text-[10px]">
                        <p className="font-medium text-slate-700">{i.text}</p>
                        <span className="text-[9px] text-slate-400 mt-1 block">{i.date}</span>
                      </div>
                    ))}
                    {(!selectedPessoa.interacoes || selectedPessoa.interacoes.length === 0) && (
                      <span className="text-[10px] text-slate-400 italic block text-center mt-4">Nenhuma nota disponível.</span>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-slate-400 text-xs py-12">
                Nenhum contato selecionado
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: CONFIGURATION & DEVICE PAIRING */}
      {activeSubTab === 'config' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col space-y-6 shadow-xs max-w-4xl mx-auto select-none">
          <div>
            <h2 className="text-lg font-bold text-[#0A192F] flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-600" />
              <span>Painel de Integração do WhatsApp</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Fornecemos suporte para múltiplos provedores API de WhatsApp. Escolha o serviço de gateway de sua preferência para receber e disparar mensagens perfeitamente através de canais privados.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* Left Col: Setup Fields */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Selecione o Provedor de API de preferência:</label>
                <select 
                  value={provider}
                  onChange={(e) => {
                    setProvider(e.target.value);
                    localStorage.setItem('ilg_wa_provider', e.target.value);
                  }}
                  className="w-full text-xs font-semibold border border-slate-300 rounded-lg px-3 py-2 bg-white select-none"
                >
                  <option value="evolution">Evolution API v1 (Totalmente Grátis - Código Aberto)</option>
                  <option value="zapi">Z-API (Serviço de Gateway Pago)</option>
                  <option value="baileys">Baileys Gateway Local (Livre e Gratuito)</option>
                </select>
                <span className="text-[10px] text-indigo-600 font-bold mt-1.5 block">
                  💡 Evolution API é 100% open-source e gratuita. Você pode hospedá-la no seu próprio servidor (VPS de R$ 15/mês) sem mensalidades adicionais e sem limite de envios!
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">URL Endpoint do Servidor API:</label>
                <input 
                  type="text" 
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="Ex: https://api.whatsapp-gateway.ilg.com.br"
                  className="w-full text-xs border border-slate-350 px-3 py-2 rounded-lg outline-none text-slate-800 focus:border-[#0A192F]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Chave / Token de Autenticação (API Key):</label>
                <input 
                  type="password" 
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                  placeholder="Digite o Token da Instância"
                  className="w-full text-xs border border-slate-350 px-3 py-2 rounded-lg outline-none text-slate-800 focus:border-[#0A192F]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Identificador da Instância (Session ID):</label>
                <input 
                  type="text" 
                  value={instanceName}
                  onChange={(e) => setInstanceName(e.target.value)}
                  placeholder="Ex: ilg_atendimento"
                  className="w-full text-xs border border-slate-350 px-3 py-2 rounded-lg outline-none text-slate-800 focus:border-[#0A192F]"
                />
                <span className="text-[10px] text-slate-400 font-normal mt-1 block">A session ID identifica individualmente este telefone no servidor parceiro.</span>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => {
                    localStorage.setItem('ilg_wa_api_url', apiUrl);
                    localStorage.setItem('ilg_wa_api_token', apiToken);
                    localStorage.setItem('ilg_wa_instance_name', instanceName);
                    localStorage.setItem('ilg_wa_provider', provider);
                    alert('Credenciais da API de Integração gravadas em segurança com sucesso!');
                  }}
                  className="px-4 py-2 bg-[#0A192F] hover:bg-[#D4AF37] hover:text-[#0A192F] text-white font-bold text-xs rounded-lg transition"
                >
                  Salvar Credenciais
                </button>
                {isConnected && (
                  <button
                    onClick={handleDisconnect}
                    className="px-4 py-2 border border-rose-300 hover:bg-rose-50 text-rose-700 font-semibold text-xs rounded-lg transition"
                  >
                    Desconectar WhatsApp
                  </button>
                )}
              </div>

              {/* VPS / SELF-HOSTING QUICK START GUIDE */}
              <div className="p-4 border border-slate-200 bg-[#0A192F]/5 rounded-xl space-y-3 mt-4 text-left">
                <h4 className="text-xs font-bold text-[#0A192F] flex items-center gap-1.5 uppercase tracking-wider">
                  <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Como rodar de graça (Evolution API)</span>
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                  A Evolution API utiliza o protocolo Baileys em NodeJS para simular conexões de web whatsapp de forma rápida e segura. Para hospedar você mesmo e não pagar assinaturas caras:
                </p>
                <div className="text-[10px] bg-slate-950 text-emerald-400 p-2.5 rounded font-mono select-all overflow-x-auto">
                  # 1. Tenha uma máquina VPS (Ubuntu Linux na Hetzner/DigitalOcean)<br/>
                  # 2. Instale docker e rode este simples comando:<br/>
                  docker run -d --name evolution-api -p 8080:8080 \<br/>
                  &nbsp;&nbsp;-e SERVER_TYPE=evolution \<br/>
                  &nbsp;&nbsp;-e API_KEY=ilg_token_escolhido \<br/>
                  &nbsp;&nbsp;atendai/evolution-api:latest
                </div>
                <ul className="list-decimal pl-4.5 text-[10px] text-slate-500 space-y-1 font-medium">
                  <li>Troque <code className="text-[#0A192F] bg-slate-100 font-bold px-1 rounded">ilg_token_escolhido</code> por sua chave privada de preferência.</li>
                  <li>Salve na URL do aplicativo acima seu IP ou domínio com a porta 8080 (ex: <code className="bg-slate-100 font-mono text-[9px] px-1 rounded">http://seu-ip:8080</code>).</li>
                  <li>Pronto! Você terá um gateway potente livre de custos.</li>
                </ul>
              </div>
            </div>

            {/* Right Col: QR Code scan visualizer */}
            <div className="bg-slate-50 border border-slate-150 rounded-xl p-5 text-center flex flex-col items-center justify-center space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Conexão via QR-Code</span>
              
              {isConnected ? (
                <div className="py-8 space-y-3 flex flex-col items-center">
                  <div className="p-3 bg-emerald-100 text-emerald-700 rounded-full">
                    <ShieldCheck className="w-12 h-12" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">Seu WhatsApp está conectado!</h4>
                  <p className="text-xs text-slate-500 max-w-sm px-4">
                    A recepção e o envio de mensagens estão vinculados ao número corporativo do Instituto Liana Gomes.
                  </p>
                  <p className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 border border-emerald-150 rounded-full mt-2">
                    {connectionStatus}
                  </p>
                </div>
              ) : (
                <>
                  {qrCodeValue || qrCodeImage ? (
                    <div className="space-y-4 py-4 flex flex-col items-center">
                      <div className="p-4 bg-white border-2 border-emerald-500 rounded-xl shadow-sm relative">
                        {qrCodeImage ? (
                          <img 
                            src={qrCodeImage} 
                            alt="WhatsApp Evolution QR Code" 
                            className="w-44 h-44 object-contain"
                          />
                        ) : (
                          /* Styled mock QR grid pattern visually */
                          <div className="w-44 h-44 flex flex-col justify-between items-stretch">
                            <div className="flex justify-between">
                              <span className="w-10 h-10 border-4 border-slate-800" />
                              <span className="w-10 h-10 border-4 border-slate-800" />
                            </div>
                            <div className="self-center">
                              <span className="w-14 h-14 bg-slate-800 rounded flex items-center justify-center text-white text-[10px] font-extrabold uppercase">ILG QR</span>
                            </div>
                            <div className="flex justify-between items-end">
                              <span className="w-10 h-10 border-4 border-slate-800" />
                              <span className="w-6 h-6 bg-emerald-500 rounded-full animate-ping absolute -bottom-1 -right-1" />
                              <span className="w-10 h-10 border-4 border-slate-800" />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-center">
                        <p className="text-xs text-slate-700 font-bold">Escaneie o código com seu celular</p>
                        <p className="text-[11px] text-slate-500 mt-1 max-w-xs leading-relaxed font-normal">
                          Abra o WhatsApp no seu smartphone &gt; Configurações/Aparelhos conectados &gt; Conectar novo aparelho.
                        </p>
                      </div>

                      <div className="text-xs font-semibold text-amber-600 flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-lg">
                        <AlertCircle className="w-4 h-4" />
                        <span>O QR Code expira em {qrCountdown} segundos.</span>
                      </div>

                      <button
                        onClick={handleSimulateScan}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-4 h-4" /> Simular Leitura do QR Code
                      </button>
                    </div>
                  ) : (
                    <div className="py-12 space-y-4 flex flex-col items-center">
                      <div className="p-3 bg-slate-100 text-slate-400 rounded-full">
                        <QrCode className="w-12 h-12" />
                      </div>
                      <p className="text-xs text-slate-500 max-w-sm">
                        Para estabelecer o pareamento de sessão, clique abaixo para gerar um convite de QR Code criptografado.
                      </p>
                      
                      <button
                        onClick={handleGenerateQr}
                        disabled={generatingQr}
                        className="py-2.5 px-6 bg-slate-800 hover:bg-[#0A192F] text-white font-bold text-xs rounded-lg transition disabled:opacity-50 flex items-center gap-2"
                      >
                        {generatingQr ? <RefreshCw className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
                        <span>Gerar Novo QR Code de Conexão</span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: SMART BROADCASTS & IA ACTIONS */}
      {activeSubTab === 'disparos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 border border-slate-200 rounded-xl p-6 select-none max-w-4xl mx-auto">
          
          {/* Group invite templates panel */}
          <div className="bg-white p-5 border border-slate-150 rounded-xl flex flex-col justify-between">
            <div className="space-y-4">
              <span className="p-1 px-2.5 bg-[#0A192F]/10 text-[#0A192F] rounded-md font-extrabold uppercase text-[10px] tracking-wider inline-block">Canais & Grupos Acadêmicos</span>
              <h3 className="font-bold text-sm text-slate-900 mt-1">Status de Canais Acadêmicos</h3>
              <p className="text-xs text-slate-500 font-normal leading-relaxed">
                Links e códigos dos canais de WhatsApp criados para networking de alunas e avisos de novos cursos.
              </p>

              <div className="space-y-2.5 pt-2">
                <div className="p-2.5 border border-slate-200 rounded p-3 bg-stone-50 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-800">Turma 01 - Mastermind Executivo</h4>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Grupo Oficial de Aluna</span>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText('https://chat.whatsapp.com/ExecutivoTurma01');
                      alert('Link da Turma 01 copiado!');
                    }}
                    className="p-1.5 bg-white border border-slate-200 rounded hover:bg-slate-100" 
                    title="Copiar convite"
                  >
                    <Clipboard className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                </div>

                <div className="p-2.5 border border-slate-200 rounded p-3 bg-stone-50 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-800">Turma 02 - Líder de Compliance</h4>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Grupo Oficial de Aluna</span>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText('https://chat.whatsapp.com/ComplianceTurma02');
                      alert('Link da Turma 02 copiado!');
                    }}
                    className="p-1.5 bg-white border border-slate-200 rounded hover:bg-slate-100" 
                    title="Copiar convite"
                  >
                    <Clipboard className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 mt-4 flex justify-between items-center bg-slate-50 -mx-5 -mb-5 p-3.5 rounded-b-xl">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-indigo-500" />
                <span>Links monitorados</span>
              </span>
              <button 
                onClick={() => alert('Criação de novos links acadêmicos requer integração avançada.')}
                className="text-xs font-bold text-[#0A192F] hover:underline"
              >
                + Registrar Grupo
              </button>
            </div>
          </div>

          {/* AI Advisor Assist */}
          <div className="bg-white p-5 border border-slate-150 rounded-xl flex flex-col justify-between">
            <div className="space-y-4">
              <span className="p-1 px-2.5 bg-indigo-50 text-indigo-700 border border-indigo-150 rounded-md font-extrabold uppercase text-[10px] tracking-wider inline-block">SDR Copiloto</span>
              <h3 className="font-bold text-sm text-slate-900 mt-1">Disparo de Onboardings</h3>
              <p className="text-xs text-slate-500 font-normal leading-relaxed">
                Nosso assistente operacional monitora quais alunas ainda precisam realizar checkpoints de onboarding (Grupo, Nutror, Formulário Diagnóstico), listando-as para contato em lote.
              </p>

              <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-lg text-xs space-y-2 text-slate-800">
                <p className="font-semibold flex items-center gap-1.5 text-indigo-900">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Relatório de Onboardings Pendentes:</span>
                </p>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px] font-medium leading-relaxed">
                  <li>Alunas fora do Grupo Whats: <strong>{pessoas.filter(p => !p.entrouGrupo && p.tipoPessoa === 'aluna').length}</strong></li>
                  <li>Alunas pendentes de Diagnóstico Inicial: <strong>{pessoas.filter(p => !p.respondeuInicial && p.tipoPessoa === 'aluna').length}</strong></li>
                  <li>Alunas com cadastro Nutror pendente: <strong>{pessoas.filter(p => !p.acessoNutror && p.tipoPessoa === 'aluna').length}</strong></li>
                </ul>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 mt-4 flex justify-end">
              <button
                onClick={() => setActiveSubTab('conversas')}
                className="px-4 py-2.5 bg-[#0A192F] hover:bg-[#D4AF37] text-white hover:text-[#0A192F] font-bold text-xs rounded-lg transition"
              >
                Ir para Atendimento Inteligente
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
