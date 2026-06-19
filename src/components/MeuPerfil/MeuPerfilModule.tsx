import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store';
import { Camera, UploadCloud, UserCircle, Save, Bell, Check, Download, Trash2, Plus, Shield, Mail } from 'lucide-react';
import { ref, uploadString, getDownloadURL, uploadBytes } from 'firebase/storage';
import { storage } from '../../lib/firebase';
import { showToast } from '../../lib/utils';

export function MeuPerfilModule({ userId }: { userId: string }) {
  const { data, updateSingleField, addSingleDocument, deleteSingleDocument } = useStore();
  const perfis = data.perfis || [];
  const activeProfile = perfis.find((p: any) => p.id === userId) || { id: userId, nome: '', email: '' };

  const [formName, setFormName] = useState(activeProfile.nome || '');
  const [formCargo, setFormCargo] = useState(activeProfile.cargo || '');
  const [formFoto, setFormFoto] = useState(activeProfile.foto || '');
  const [notif, setNotif] = useState(activeProfile.notificacoes || { email: true, whatsapp: false });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [emailInput, setEmailInput] = useState('');
  const [isAddingEmail, setIsAddingEmail] = useState(false);

  const allowedEmailsList = data.allowed_emails || [];

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailToTrim = emailInput.trim().toLowerCase();
    if (!emailToTrim) return;
    
    // Simple email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToTrim)) {
      showToast('Por favor, informe um e-mail válido.', 'error');
      return;
    }

    // Check if duplicate
    const baseEmails = [
      'ericocavalheiro.psico@gmail.com',
      'liana@institutolianagomes.com.br',
      'luiza@institutolianagomes.com.br',
      'nuria@institutolianagomes.com.br',
      'ana@institutolianagomes.com.br',
      'fabi@institutolianagomes.com.br',
      'luizaftessele@gmail.com',
    ];
    const existsInBase = baseEmails.map(e => e.toLowerCase()).includes(emailToTrim);
    const existsInDynamic = allowedEmailsList.some((item: any) => item.email?.trim().toLowerCase() === emailToTrim);

    if (existsInBase || existsInDynamic) {
      showToast('Este e-mail já possui permissão de acesso.', 'info');
      return;
    }

    setIsAddingEmail(true);
    try {
      const docId = `email-${Date.now()}`;
      await addSingleDocument('allowed_emails', { id: docId, email: emailToTrim });
      setEmailInput('');
      showToast('E-mail adicionado com sucesso!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Erro ao adicionar e-mail.', 'error');
    } finally {
      setIsAddingEmail(false);
    }
  };

  const handleRemoveEmail = async (docId: string) => {
    try {
      await deleteSingleDocument('allowed_emails', docId);
      showToast('E-mail removido com sucesso.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Erro ao remover e-mail.', 'error');
    }
  };

  useEffect(() => {
    if (activeProfile.nome) setFormName(prev => prev || activeProfile.nome || '');
    if (activeProfile.cargo) setFormCargo(prev => prev || activeProfile.cargo || '');
    if (activeProfile.foto) setFormFoto(prev => prev === '' ? (activeProfile.foto || '') : prev);
    if (activeProfile.notificacoes) setNotif(activeProfile.notificacoes);
  }, [
    activeProfile.nome,
    activeProfile.cargo,
    activeProfile.foto,
    activeProfile.notificacoes
  ]);

  useEffect(() => {
    if (showCamera) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(err => console.error(err));
    } else {
      videoRef.current?.srcObject && (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
    }
  }, [showCamera]);

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg');
    uploadPhoto(dataUrl);
    setShowCamera(false);
  };

  const uploadPhoto = async (dataUrl: string) => {
    setUploading(true);
    try {
      const storageRef = ref(storage, `avatars/${userId}/${Date.now()}.jpg`);
      await uploadString(storageRef, dataUrl, 'data_url');
      const downloadURL = await getDownloadURL(storageRef);
      setFormFoto(downloadURL);
      
      // Persist photo directly to Firebase
      await updateSingleField('perfis', userId, {
        foto: downloadURL
      });
      
      showToast('Foto atualizada com sucesso!', 'success');
    } catch (e) {
      console.error(e);
      showToast('Erro ao enviar foto.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `avatars/${userId}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setFormFoto(downloadURL);
      
      // Persist photo directly to Firebase
      await updateSingleField('perfis', userId, {
        foto: downloadURL
      });

      showToast('Foto enviada com sucesso!', 'success');
    } catch (e) {
      console.error(e);
      showToast('Erro ao enviar foto do computador.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSingleField('perfis', userId, {
        nome: formName,
        cargo: formCargo,
        foto: formFoto,
        notificacoes: notif
      });
      showToast('Perfil atualizado!', 'success');
    } catch (e) {
      console.error(e);
      showToast('Erro ao salvar perfil.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleBackupLocalStorage = () => {
    try {
      const backup: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          if (value !== null) {
            backup[key] = value;
          }
        }
      }
      
      const dataStr = JSON.stringify(backup, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup_ilg_sessao_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Backup do localStorage baixado com sucesso!', 'success');
    } catch (e) {
      console.error(e);
      showToast('Erro ao exportar backup de sessão.', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-[#0A192F]">Meu Perfil</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-150 p-6 space-y-6">
        {/* Avatar section */}
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-slate-100 overflow-hidden shadow-inner flex items-center justify-center relative justify-center bg-slate-105">
            {formFoto ? <img src={formFoto} className="w-full h-full object-cover" /> : <UserCircle className="w-12 h-12 text-slate-400" />}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
             <button 
               type="button"
               onClick={() => setShowCamera(true)} 
               className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
             >
               <Camera className="w-4 h-4 text-slate-500" />
               Tirar Foto (Câmera)
             </button>
             
             <label className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer select-none">
               <UploadCloud className="w-4 h-4 text-[#1D4E89]" />
               <span>{uploading ? 'Enviando...' : 'Fazer Upload do Computador'}</span>
               <input 
                 type="file" 
                 accept="image/*" 
                 className="hidden" 
                 onChange={handleFileChange} 
                 disabled={uploading} 
               />
             </label>
          </div>
        </div>

        {showCamera && (
             <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
                <div className="bg-white p-4 rounded-xl">
                    <video ref={videoRef} autoPlay className="w-64 h-64 bg-black rounded-lg" />
                    <button onClick={capturePhoto} className="mt-4 w-full bg-[#0A192F] text-white p-2 rounded">Capturar</button>
                </div>
             </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <input type="text" value={formName} onChange={e => setFormName(e.target.value)} placeholder="Nome" className="border rounded-lg p-2 text-sm" />
          <input type="text" value={formCargo} onChange={e => setFormCargo(e.target.value)} placeholder="Cargo" className="border rounded-lg p-2 text-sm" />
        </div>

        {/* Notif prefs */}
        <div className="border-t pt-4 space-y-2">
           <h3 className="flex items-center gap-2 font-bold text-sm text-[#0A192F]"><Bell className="w-4 h-4"/>Preferências de Notificação</h3>
           <label className="flex items-center gap-2 text-sm cursor-pointer text-slate-700">
              <input type="checkbox" checked={notif.email} onChange={e => setNotif({...notif, email: e.target.checked})} /> Receber por Email
           </label>
           <label className="flex items-center gap-2 text-sm cursor-pointer text-slate-700">
              <input type="checkbox" checked={notif.whatsapp} onChange={e => setNotif({...notif, whatsapp: e.target.checked})} /> Receber por WhatsApp
           </label>
        </div>

        {/* Backup de Sessão */}
        <div className="border-t pt-4 space-y-3">
           <h3 className="flex items-center gap-2 font-bold text-sm text-[#0A192F]">
             <Download className="w-4 h-4" /> Backup da Sessão
           </h3>
           <p className="text-xs text-slate-500 max-w-xl">
             Baixe um arquivo contendo todos os dados de sessão salvos localmente neste navegador (como e-mail autenticado, perfis e preferências) no formato de arquivo JSON. Isso serve como uma cópia de segurança simples das suas configurações.
           </p>
           <button 
             onClick={handleBackupLocalStorage}
             id="btn-backup-session"
             className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-[#0A192F] hover:bg-slate-50 transition-colors"
           >
             <Download className="w-4 h-4 text-emerald-600" /> Baixar Backup Local (JSON)
           </button>
        </div>

        <div className="pt-2">
          <button onClick={handleSave} disabled={saving} className="bg-[#0A192F] hover:bg-[#142A4A] text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
              <Save className="w-4 h-4" /> {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>

      {userId === 'liana' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-150 p-6 space-y-4">
          <div className="flex items-center gap-2.5 border-b pb-3 border-slate-100">
            <Shield className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <h2 className="text-base font-bold text-[#0A192F]">Gestão de Permissões de Acesso</h2>
              <p className="text-xs text-slate-500">Exclusivo para a diretoria. Gerencie quem possui autorização para se autenticar e operar o sistema.</p>
            </div>
          </div>

          <form onSubmit={handleAddEmail} className="flex gap-2 max-w-lg mt-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                placeholder="colaboradora@institutolianagomes.com.br"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4E89]/40 focus:border-[#1D4E89] transition-all"
                disabled={isAddingEmail}
              />
            </div>
            <button
              type="submit"
              disabled={isAddingEmail || !emailInput.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {isAddingEmail ? 'Adicionando...' : 'Permitir'}
            </button>
          </form>

          {/* List of Allowed Emails */}
          <div className="space-y-2 mt-4">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider">E-mails Dinâmicos Autorizados ({allowedEmailsList.length})</h3>
            
            {allowedEmailsList.length === 0 ? (
              <p className="text-sm text-slate-400 italic">Nenhum e-mail adicional cadastrado. Apenas o grupo base original de colaboradoras possui acesso.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                {allowedEmailsList.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-[#1D4E89]/20 transition-all">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
                      <span className="text-sm font-semibold text-slate-800 truncate">{item.email}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveEmail(item.id)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors"
                      title="Remover autorização"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reference panel of hardcoded base emails */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs space-y-2">
            <p className="font-bold text-slate-650 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-slate-500" />
              E-mails de Acesso Mínimo Garantido (Fixos no Sistema)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1.5 text-slate-500 font-mono">
              <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>ericocavalheiro.psico@gmail.com</div>
              <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>liana@institutolianagomes.com.br</div>
              <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>luizaftessele@gmail.com</div>
            </div>
            <div className="text-slate-400 italic mt-1 font-medium select-none">Qualquer e-mail que termine em @institutolianagomes.com.br possui acesso automático de colaboradora.</div>
          </div>
        </div>
      )}
    </div>
  );
}
