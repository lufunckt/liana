import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { X, Save, Camera, UploadCloud, UserCircle } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

interface MeuPerfilModalProps {
  onClose: () => void;
  userId: string;
}

export function MeuPerfilModal({ onClose, userId }: MeuPerfilModalProps) {
  const { data, updateSingleField, addSingleDocument } = useStore();
  const perfis = data.perfis || [];
  const activeProfile = perfis.find((p: any) => p.id === userId) || { id: userId, nome: userId };

  const [formName, setFormName] = useState(activeProfile.nome || '');
  const [formEmail, setFormEmail] = useState(activeProfile.email || '');
  const [formFoto, setFormFoto] = useState(activeProfile.foto || '');
  const [formBiografia, setFormBiografia] = useState(activeProfile.perfil || '');
  const [formPhone, setFormPhone] = useState(activeProfile.telefone || '');
  const [formLinkedin, setFormLinkedin] = useState(activeProfile.linkedin || '');
  const [formInstagram, setFormInstagram] = useState(activeProfile.instagram || '');
  const [formCargo, setFormCargo] = useState(activeProfile.cargo || '');

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (activeProfile.nome) setFormName(prev => prev || activeProfile.nome || '');
    if (activeProfile.email) setFormEmail(prev => prev || activeProfile.email || '');
    if (activeProfile.foto) setFormFoto(prev => prev === '' ? (activeProfile.foto || '') : prev);
    if (activeProfile.perfil) setFormBiografia(prev => prev || activeProfile.perfil || '');
    if (activeProfile.telefone) setFormPhone(prev => prev || activeProfile.telefone || '');
    if (activeProfile.linkedin) setFormLinkedin(prev => prev || activeProfile.linkedin || '');
    if (activeProfile.instagram) setFormInstagram(prev => prev || activeProfile.instagram || '');
    if (activeProfile.cargo) setFormCargo(prev => prev || activeProfile.cargo || '');
  }, [
    activeProfile.nome, 
    activeProfile.email, 
    activeProfile.foto, 
    activeProfile.perfil, 
    activeProfile.telefone, 
    activeProfile.linkedin, 
    activeProfile.instagram, 
    activeProfile.cargo
  ]);

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
      const exists = perfis.some((p: any) => p.id === userId);
      if (exists) {
         await updateSingleField('perfis', userId, { foto: downloadURL });
      } else {
         await addSingleDocument('perfis', { id: userId, foto: downloadURL });
      }
    } catch (e) {
      console.error(e);
      alert('Erro ao enviar imagem.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        nome: formName,
        email: formEmail,
        foto: formFoto,
        perfil: formBiografia,
        telefone: formPhone,
        linkedin: formLinkedin,
        instagram: formInstagram,
        cargo: formCargo,
      };

      const exists = perfis.some((p: any) => p.id === userId);
      if (exists) {
         await updateSingleField('perfis', userId, payload as any);
      } else {
         await addSingleDocument('perfis', { id: userId, ...payload } as any);
      }
      
      alert('Perfil atualizado com sucesso!');
      onClose();
    } catch (e) {
      console.error(e);
      alert('Erro ao atualizar perfil.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl relative flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-lg font-black text-slate-800">Meu Perfil</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Personalize seus dados visíveis para outras colaboradoras</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="flex items-start gap-6">
            <div className="shrink-0 flex flex-col items-center gap-3">
              <div className="relative group w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-md overflow-hidden flex items-center justify-center">
                {formFoto ? (
                  <img src={formFoto} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  <UserCircle className="w-12 h-12 text-slate-300" />
                )}
                
                <label className="absolute inset-0 bg-slate-900/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-white">
                  <UploadCloud className="w-6 h-6" />
                  <span className="text-[10px] font-bold mt-1">{uploading ? '...' : 'Alterar'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
                </label>
              </div>
              <label className="text-[11px] font-extrabold text-[#1D4E89] hover:text-[#0A192F] hover:underline cursor-pointer select-none">
                {uploading ? 'Enviando...' : 'Fazer Upload'}
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
              </label>
            </div>

            <div className="flex-1 space-y-4">
               <div>
                 <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Foto do Perfil (URL)</label>
                 <input 
                   type="text" 
                   value={formFoto}
                   onChange={e => setFormFoto(e.target.value)}
                   className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D4AF37]"
                   placeholder="https://sua-foto.com/imagem.jpg"
                 />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Nome Completo</label>
                   <input 
                     type="text" 
                     value={formName}
                     onChange={e => setFormName(e.target.value)}
                     className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D4AF37]"
                   />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Cargo / Título</label>
                   <input 
                     type="text" 
                     value={formCargo}
                     onChange={e => setFormCargo(e.target.value)}
                     className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D4AF37]"
                   />
                 </div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">E-mail</label>
               <input 
                 type="email" 
                 value={formEmail}
                 readOnly
                 className="w-full border border-slate-200 bg-slate-50 text-slate-500 rounded-lg px-3 py-2 text-sm outline-none"
               />
             </div>
             <div>
               <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">WhatsApp / Telefone</label>
               <input 
                 type="text" 
                 value={formPhone}
                 onChange={e => setFormPhone(e.target.value)}
                 className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D4AF37]"
               />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">LinkedIn</label>
               <input 
                 type="text" 
                 value={formLinkedin}
                 onChange={e => setFormLinkedin(e.target.value)}
                 className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D4AF37]"
               />
             </div>
             <div>
               <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Instagram</label>
               <input 
                 type="text" 
                 value={formInstagram}
                 onChange={e => setFormInstagram(e.target.value)}
                 className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D4AF37]"
               />
             </div>
          </div>

          <div>
             <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Biografia Profissional</label>
             <textarea 
               value={formBiografia}
               onChange={e => setFormBiografia(e.target.value)}
               rows={3}
               className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D4AF37]"
               placeholder="Resumo das suas especialidades..."
             ></textarea>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-800 transition"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={saving || uploading}
            className="px-6 py-2 bg-[#0A192F] hover:bg-[#D4AF37] text-white hover:text-[#0A192F] rounded-lg text-sm font-bold transition flex items-center gap-2 shadow-md"
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}
