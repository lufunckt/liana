import React, { useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { FileText, Image, Upload, Send, CheckCircle2, Lock, Paperclip } from 'lucide-react';

export function PortalExterno() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [canalAlvo, setCanalAlvo] = useState('suporte-alunos');
  const [mensagem, setMensagem] = useState('');
  
  // File state
  const [selectedFile, setSelectedFile] = useState<{ nome: string; tipo: string; payload: string } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Handle Drag-and-drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      let detectedType = 'pdf';
      if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(fileExt)) {
        detectedType = 'image';
      } else if (['xls', 'xlsx', 'csv'].includes(fileExt)) {
        detectedType = 'spreadsheet';
      } else if (['doc', 'docx', 'odt'].includes(fileExt)) {
        detectedType = 'doc';
      }

      setSelectedFile({
        nome: file.name,
        tipo: detectedType,
        payload: result // base64 string
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      alert('Por favor, informe seu nome.');
      return;
    }
    if (!selectedFile && !mensagem.trim()) {
      alert('Envie uma mensagem ou anexe um documento para continuar.');
      return;
    }

    setLoading(true);
    try {
      const dataHora = new Date().toISOString().replace('T', ' ').substring(0, 16);
      
      const newMsg = {
        id: 'msg_ext_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        channelId: canalAlvo,
        autorId: 'externo',
        autorNome: `📥 Ext: ${nome.trim()}`,
        avatar: '👤',
        texto: mensagem.trim() || `Enviou um documento via Portal Externo de Recebimento.`,
        dataHora,
        reacoes: [],
        pinned: false,
        replies: [],
        anexos: selectedFile ? [{
          nome: selectedFile.nome,
          tipo: selectedFile.tipo,
          url: selectedFile.payload
        }] : []
      };

      // Add document directly to Firestore mensagens
      const mensagensRef = collection(db, 'ilgc_mensagens');
      await addDoc(mensagensRef, newMsg);

      // Trigger automatic live updates on client's communications
      window.dispatchEvent(new Event('storage'));

      // If SMTP configurations are available, we can trigger external email to the board
      fetch('/api/comunicacao/notificar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          senderName: `${nome.trim()} (Ingestão Externa)`,
          channelName: canalAlvo,
          text: mensagem.trim() || `Anexou o documento "${selectedFile?.nome}"`,
          recipients: ['liane_gomes@hotmail.com', 'luiza.gestao.ilg@gmail.com', 'nuria.suporte@gmail.com', 'ericocavalheiro.psico@gmail.com']
        })
      }).catch(err => console.log('Mail notify failed on exterior ingestion', err));

      setEnviado(true);
    } catch (err: any) {
      console.error(err);
      setStatusMessage('Erro ao enviar documento. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A192F] text-slate-100 flex flex-col justify-between font-sans leading-relaxed">
      {/* Sleek branded header */}
      <header className="border-b border-[#10243e] bg-[#0A192F]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] font-bold text-sm rounded-xl">
              ILG
            </span>
            <div className="text-left">
              <h1 className="font-extrabold text-white text-sm tracking-wide uppercase">Instituto Liana Gomes</h1>
              <p className="text-[10px] text-slate-400 font-medium">Balcão Seguro de Recebimento de Arquivos</p>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full font-bold flex items-center gap-1 shadow-sm select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            Canal SSL Criptografado
          </span>
        </div>
      </header>

      {/* Main body form */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-10 flex flex-col justify-center">
        {enviado ? (
          <div className="bg-white/5 border border-emerald-500/30 p-8 rounded-3xl text-center space-y-6 shadow-2xl backdrop-blur-md animate-fade-in">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/35 rounded-full flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white tracking-tight">Documento Enviado!</h2>
              <p className="text-sm text-slate-350 max-w-md mx-auto">
                Olá, <b>{nome}</b>! Seu documento <b>{selectedFile?.nome || 'mensagem'}</b> foi enviado com sucesso diretamente ao painel operacional da equipe do Instituto Liana Gomes.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button 
                onClick={() => {
                  setEnviado(false);
                  setSelectedFile(null);
                  setMensagem('');
                }}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#D4AF37] hover:bg-[#c49e2f] text-[#0A192F] font-bold text-xs rounded-xl shadow-lg transition duration-200"
              >
                Enviar Novo Documento
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-left space-y-2">
              <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight">Portal de Envio Externo</h2>
              <p className="text-xs lg:text-sm text-slate-400 max-w-xl">
                Alunas, mentoradas, fornecedores ou parceiros corporativos podem enviar documentos, comprovantes ou pautas que entrarão diretamente no canal operacional da central.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl space-y-6 shadow-2xl backdrop-blur-md">
              {statusMessage && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-bold">{statusMessage}</div>
              )}

              {/* Sender Details row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">Nome Completo</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Seu nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full text-xs bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#D4AF37] font-semibold"
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">E-mail de Contato</label>
                  <input 
                    type="email" 
                    placeholder="exemplo@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#D4AF37] font-semibold"
                  />
                </div>
              </div>

              {/* Destination Sector */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">Destino Interno (Setor do Instituto)</label>
                <select 
                  value={canalAlvo}
                  onChange={(e) => setCanalAlvo(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#D4AF37] font-semibold"
                >
                  <option value="suporte-alunos">Setor: Suporte e Onboarding de Alunas (#suporte-alunos)</option>
                  <option value="comercial">Setor: Comercial, Copas e Pagamentos (#comercial)</option>
                  <option value="financeiro">Setor: Financeiro e Custos (#financeiro)</option>
                  <option value="geral">Quadro Geral de Avisos (#geral)</option>
                  <option value="conteudo">Setor: Conteúdo e Pautas Pedagógicas (#conteudo)</option>
                  <option value="design">Setor: Design e Criativos Artísticos (#design)</option>
                </select>
              </div>

              {/* Context message */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">Instrução / Mensagem de Contexto (Opcional)</label>
                <textarea 
                  placeholder="Escreva detalhes sobre o documento enviado ou sua solicitação..."
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  rows={3}
                  className="w-full text-xs bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#D4AF37] font-medium leading-relaxed"
                />
              </div>

              {/* Upload Dropzone */}
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">Documento / Anexo (PDF, Imagens, Planilhas)</label>
                
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition ${
                    dragActive ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-white/10 hover:border-white/20 bg-slate-950/45'
                  }`}
                >
                  {selectedFile ? (
                    <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-3.5 max-w-md mx-auto animate-fade-in">
                      <div className="flex items-center gap-3 text-left">
                        {selectedFile.tipo === 'image' ? (
                          <Image className="w-7 h-7 text-emerald-400 shrink-0" />
                        ) : (
                          <FileText className="w-7 h-7 text-[#D4AF37] shrink-0" />
                        )}
                        <div className="leading-tight">
                          <p className="text-xs font-bold text-white truncate max-w-[200px]">{selectedFile.nome}</p>
                          <p className="text-[9px] text-slate-400 uppercase font-mono">{selectedFile.tipo}</p>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="text-red-400 hover:text-red-500 font-bold text-[10px] bg-red-400/10 px-2 py-1 rounded"
                      >
                        Remover
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer space-y-2 flex flex-col items-center">
                      <div className="p-3 bg-white/5 rounded-full border border-white/15 text-slate-350">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-white">Arraste seu arquivo aqui ou clique para buscar</p>
                        <p className="text-[10px] text-slate-450">Suporta PDFs, Planilhas excel e Imagens de comprovantes.</p>
                      </div>
                      <input 
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls,.docx,.doc"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Submit button */}
              <button 
                type="submit"
                disabled={loading || (!nome && !mensagem && !selectedFile)}
                className="w-full bg-[#D4AF37] hover:bg-[#c49e2f] hover:scale-[1.01] active:scale-100 disabled:opacity-30 disabled:scale-100 disabled:hover:bg-[#D4AF37] text-[#0A192F] font-extrabold text-sm py-3.5 rounded-xl shadow-lg shadow-[#D4AF37]/15 flex items-center justify-center gap-2 transition duration-250 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Transmitir Criptografado</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Styled Branded Footer */}
      <footer className="py-6 border-t border-[#10243e] text-center text-[10px] text-slate-500">
        <p>© {new Date().getFullYear()} Instituto Liana Gomes. Todos os direitos reservados.</p>
        <p className="mt-1 flex items-center justify-center gap-1.5">
          <Lock className="w-3 h-3 text-slate-450" /> Protocolo SSL de criptografia militar de ponta a ponta.
        </p>
      </footer>
    </div>
  );
}
