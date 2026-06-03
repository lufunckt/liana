import React, { useState } from 'react';
import { useStore } from '../../store';
import { usePermissions, UserProfile, PermissionType } from '../../lib/permissions';
import { 
  Users, Shield, ShieldCheck, ShieldAlert, UserPlus, Trash2, Edit3, 
  X, Check, AlertTriangle, Mail, Phone, ExternalLink, Award, Sparkles,
  Linkedin, Instagram, HelpCircle
} from 'lucide-react';
import { showToast } from '../../lib/utils';

export function UserPermissionsConfig() {
  const { data, addSingleDocument, deleteSingleDocument } = useStore();
  const { isAdmin, activeProfile: curUser } = usePermissions();
  const perfis: UserProfile[] = data.perfis || [];

  // Local state for Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formCargo, setFormCargo] = useState('');
  const [formRole, setFormRole] = useState('Colaborador / Suporte');
  const [formPhone, setFormPhone] = useState('');
  const [formLinkedin, setFormLinkedin] = useState('');
  const [formInstagram, setFormInstagram] = useState('');
  const [formBiography, setFormBiography] = useState('');
  const [formFoto, setFormFoto] = useState('');
  const [formPermissions, setFormPermissions] = useState<PermissionType[]>(['view_only']);

  // Handle Opening Form for Create
  const handleOpenCreate = () => {
    if (!isAdmin) {
      showToast('Apenas administradores podem cadastrar novos perfis corporativos.', 'error');
      return;
    }
    setSelectedUser(null);
    setFormName('');
    setFormEmail('');
    setFormCargo('');
    setFormRole('Colaborador / Suporte');
    setFormPhone('');
    setFormLinkedin('');
    setFormInstagram('');
    setFormBiography('');
    setFormFoto('');
    setFormPermissions(['view_only']);
    setIsModalOpen(true);
  };

  // Handle Opening Form for Edit
  const handleOpenEdit = (user: UserProfile) => {
    if (!isAdmin) {
      showToast('Apenas administradores podem modificar perfis e permissões.', 'error');
      return;
    }
    setSelectedUser(user);
    setFormName(user.nome || '');
    setFormEmail(user.email || '');
    setFormCargo(user.cargo || '');
    setFormRole(user.role || 'Colaborador / Suporte');
    setFormPhone(user.telefone || '');
    setFormLinkedin(user.linkedin || '');
    setFormInstagram(user.instagram || '');
    setFormBiography(user.perfil || '');
    setFormFoto(user.foto || '');
    setFormPermissions(user.permissions || ['view_only']);
    setIsModalOpen(true);
  };

  // Auto-fill permissions based on Role Selection template
  const handleRoleChange = (roleName: string) => {
    setFormRole(roleName);
    if (roleName === 'Administrador' || roleName === 'Diretoria Geral') {
      setFormPermissions(['view_only', 'edit_leads', 'manage_all']);
    } else if (roleName === 'Operador de Vendas' || roleName === 'CRM Comercial') {
      setFormPermissions(['view_only', 'edit_leads']);
    } else {
      setFormPermissions(['view_only']);
    }
  };

  // Toggle specific permission
  const handleTogglePermission = (perm: PermissionType) => {
    if (perm === 'view_only') return; // View only is un-toggleable as default
    if (formPermissions.includes(perm)) {
      setFormPermissions(formPermissions.filter(p => p !== perm));
    } else {
      setFormPermissions([...formPermissions, perm]);
    }
  };

  // Save changes/insert to database
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formCargo.trim()) {
      showToast('Por favor, preencha o Nome, E-mail e Cargo do funcionário.', 'error');
      return;
    }

    // Prepare profile documentation
    const slug = selectedUser?.id || formName.toLowerCase().trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    const defaultAvatars: Record<string, string> = {
      liana: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300&h=300',
      ana: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300&h=300',
      nuria: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300&h=300',
      luiza: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300&h=300',
    };

    const finalFoto = formFoto.trim() || defaultAvatars[slug] || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formName)}`;

    const profileDoc: UserProfile = {
      id: slug,
      nome: formName,
      email: formEmail,
      cargo: formCargo,
      role: formRole,
      permissions: formPermissions,
      foto: finalFoto,
      telefone: formPhone,
      linkedin: formLinkedin,
      instagram: formInstagram,
      perfil: formBiography
    };

    try {
      await addSingleDocument('perfis', profileDoc);
      showToast(selectedUser ? 'Perfil atualizado com sucesso!' : 'Novo perfil cadastrado com sucesso!', 'success');
      setIsModalOpen(false);
    } catch (err) {
      showToast('Erro ao gravar dados no Firebase.', 'error');
    }
  };

  // Delete User Logic
  const handleOpenDelete = (user: UserProfile) => {
    if (!isAdmin) {
      showToast('Apenas administradores podem remover contas de usuários.', 'error');
      return;
    }
    // Protect core system structures
    if (user.id === 'luiza' || user.id === 'liana') {
      showToast(`O perfil de segurança principal de ${user.nome} não pode ser removido do sistema.`, 'error');
      return;
    }
    setSelectedUser(user);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    try {
      await deleteSingleDocument('perfis', selectedUser.id);
      showToast(`Perfil de '${selectedUser.nome}' removido com sucesso.`, 'success');
      setIsDeleteConfirmOpen(false);
      setSelectedUser(null);
    } catch (err) {
      showToast('Erro ao remover registro no bando de dados.', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Intro Dashboard Overview */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-[#0A192F] tracking-tight">Módulo de Gestão de Contas & Permissões</h2>
          </div>
          <p className="text-slate-550 text-sm max-w-2xl leading-relaxed">
            Aqui você gerencia as credenciais da equipe da <strong>Central ILG</strong>. Defina cargos específicos e configure permissões de leitura ou de moderação para garantir que cada operador veja apenas o que lhe é devido.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-[#0A192F] hover:bg-[#D4AF37] text-white hover:text-[#0A192F] transition-colors px-4 py-2.5 rounded-xl text-xs font-black tracking-wide shadow-md"
          >
            <UserPlus className="w-4 h-4" />
            NOVO USUÁRIO
          </button>
        )}
      </div>

      {/* Grid of Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {perfis.map((p) => {
          const isLianaOrLuiza = p.id === 'liana' || p.id === 'luiza';
          return (
            <div 
              key={p.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-[#D4AF37]/50 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row gap-5 relative overflow-hidden"
            >
              {/* Profile Background Indicator based on Permissions */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${
                p.permissions?.includes('manage_all') ? 'bg-indigo-600' :
                p.permissions?.includes('edit_leads') ? 'bg-orange-500' : 'bg-slate-400'
              }`} />

              {/* Left Column: Avatar & Social Links */}
              <div className="flex flex-col items-center flex-shrink-0 text-center gap-3">
                <div className={`w-16 h-16 rounded-full p-0.5 border-2 ${
                  p.permissions?.includes('manage_all') ? 'border-indigo-200' :
                  p.permissions?.includes('edit_leads') ? 'border-orange-200' : 'border-slate-200'
                }`}>
                  <img 
                    src={p.foto || `https://api.dicebear.com/7.x/initials/svg?seed=${p.nome}`} 
                    alt={p.nome}
                    className="w-full h-full rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                
                {/* Badge Level */}
                <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                  p.permissions?.includes('manage_all') ? 'bg-indigo-50 text-indigo-700' :
                  p.permissions?.includes('edit_leads') ? 'bg-orange-50 text-orange-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {p.permissions?.includes('manage_all') ? 'Admin' :
                   p.permissions?.includes('edit_leads') ? 'Operador' : 'Visualizador'}
                </span>

                {/* Social Links Mini HUD */}
                <div className="flex items-center gap-1.5 mt-1 text-slate-400">
                  {p.linkedin && (
                    <a href={`https://linkedin.com/in/${p.linkedin}`} target="_blank" rel="noreferrer" className="hover:text-indigo-600">
                      <Linkedin className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {p.instagram && (
                    <a href={`https://instagram.com/in/${p.instagram}`} target="_blank" rel="noreferrer" className="hover:text-rose-500">
                      <Instagram className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Right Column: Key User Metadata */}
              <div className="flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-850 text-base">{p.nome}</h3>
                      <p className="text-xs text-slate-450 font-semibold">{p.cargo}</p>
                    </div>

                    {/* Controls */}
                    {isAdmin && (
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 hover:bg-slate-100 hover:text-indigo-600 rounded-lg text-slate-400 transition"
                          title="Editar Usuário"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {!isLianaOrLuiza && (
                          <button 
                            onClick={() => handleOpenDelete(p)}
                            className="p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400 transition"
                            title="Remover Usuário"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 my-3">
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <Mail className="w-3 h-3 text-slate-400" /> {p.email}
                    </p>
                    {p.telefone && (
                      <p className="text-xs text-slate-500 flex items-center gap-2">
                        <Phone className="w-3 h-3 text-slate-400" /> {p.telefone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Sub permissions map indicators */}
                <div className="border-t border-slate-100 pt-3">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Permissões de Acesso</p>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-md font-medium">
                      ✓ Visualizar Tudo (Básico)
                    </span>
                    {p.permissions?.includes('edit_leads') && (
                      <span className="text-[9px] bg-orange-50 text-orange-700 border border-orange-100 px-2 py-0.5 rounded-md font-medium">
                        ✦ Editar Leads & CRM
                      </span>
                    )}
                    {p.permissions?.includes('manage_all') && (
                      <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-md font-medium">
                        🛡️ Gerenciar Contas e Configs (Full)
                      </span>
                    )}
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Safety Notice Block */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-900 flex gap-4">
        <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1 text-sm">
          <h4 className="font-bold">Aviso Importante sobre Hierarquia de Segurança</h4>
          <p className="leading-relaxed opacity-90 text-xs">
            As alterações de privilégios entram em vigor na próxima autenticação ou ao atualizar o navegador. O perfil da diretora principal (<strong className="font-extrabold text-amber-950">Liana Gomes</strong>) e da desenvolvedora líder (<strong className="font-extrabold text-amber-950">Luiza</strong>) mantêm sempre acessos integrais do sistema para evitar travamento acidental de configurações do portal.
          </p>
        </div>
      </div>

      {/* CREATE & EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-lg w-full border border-slate-200 max-h-[90vh] overflow-y-auto animate-in scale-in duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-bold text-[#0A192F] flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#D4AF37]" />
                {selectedUser ? `Editar Perfil: ${selectedUser.nome}` : 'Cadastrar Novo Usuário'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 bg-slate-100 rounded-full transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg py-2 px-3 focus:border-[#D4AF37] outline-none font-medium text-slate-800"
                    placeholder="Ex: Amanda Silva"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">E-mail Corporativo</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg py-2 px-3 focus:border-[#D4AF37] outline-none font-medium text-slate-800"
                    placeholder="amanda@institutolianagomes.com.br"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Cargo / Função</label>
                  <input
                    type="text"
                    required
                    value={formCargo}
                    onChange={(e) => setFormCargo(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg py-2 px-3 focus:border-[#D4AF37] outline-none font-medium text-slate-800"
                    placeholder="Ex: Comercial Senior"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Nível / Role Geral</label>
                  <select
                    value={formRole}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg py-2 px-3 focus:border-[#D4AF37] outline-none font-bold text-slate-700"
                  >
                    <option value="Colaborador / Suporte">Colaborador / Suporte</option>
                    <option value="Operador de Vendas">Operador de Vendas</option>
                    <option value="Administrador">Administrador</option>
                    <option value="Diretoria Geral">Diretoria Geral</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Foto de Perfil URL (Opcional)</label>
                <input
                  type="text"
                  value={formFoto}
                  onChange={(e) => setFormFoto(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg py-2 px-3 focus:border-[#D4AF37] outline-none font-medium text-slate-800"
                  placeholder="https://images.unsplash.com/... (ou em branco)"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">WhatsApp</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg py-2 px-3 focus:border-[#D4AF37] outline-none"
                    placeholder="11 99999-0000"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Linkedin User</label>
                  <input
                    type="text"
                    value={formLinkedin}
                    onChange={(e) => setFormLinkedin(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg py-2 px-3 focus:border-[#D4AF37] outline-none"
                    placeholder="amanda-silva"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Instagram User</label>
                  <input
                    type="text"
                    value={formInstagram}
                    onChange={(e) => setFormInstagram(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg py-2 px-3 focus:border-[#D4AF37] outline-none"
                    placeholder="amanda.ilg"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Biografia Operacional / Missão</label>
                <textarea
                  value={formBiography}
                  onChange={(e) => setFormBiography(e.target.value)}
                  rows={2}
                  className="w-full text-xs border border-slate-200 rounded-lg py-2 px-3 focus:border-[#D4AF37] outline-none font-medium"
                  placeholder="Descreva as principais funções ou atribuições do colaborador na equipe..."
                />
              </div>

              {/* Specific Privilege Checkboxes */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide block border-b border-slate-200 pb-1">
                  Atribuir Autorizações de Acesso Específicas
                </span>

                <div className="space-y-2">
                  <label className="flex items-start gap-2.5 cursor-not-allowed">
                    <input
                      type="checkbox"
                      checked={true}
                      disabled
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-700 block select-none">✓ Visualização Consolidada (`view_only`)</span>
                      <span className="text-[10px] text-slate-450">Básico que permite ver os painéis consolidados de alunas e métricas gerais.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPermissions.includes('edit_leads')}
                      onChange={() => handleTogglePermission('edit_leads')}
                      className="mt-0.5 rounded text-orange-600 focus:ring-orange-500 border-slate-300 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-700 block select-none">✦ Modificar Leads & CRM (`edit_leads`)</span>
                      <span className="text-[10px] text-slate-450">Permite registrar e atualizar informações no funil comercial e follow-ups.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPermissions.includes('manage_all')}
                      onChange={() => handleTogglePermission('manage_all')}
                      className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-700 block select-none">🛡️ Administração Geral (`manage_all`)</span>
                      <span className="text-[10px] text-slate-450">Acesso completo. Cadastra faturas, edita produtos, altera turmas e gerencia usuários.</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-100 text-slate-700 font-bold text-xs px-4 py-2 rounded-lg hover:bg-slate-200 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#0A192F] text-white hover:bg-[#D4AF37] hover:text-[#0A192F] font-bold text-xs px-5 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow"
                >
                  <ConfirmIcon className="w-3.5 h-3.5" />
                  Salvar Configuração
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* DELETE DIALOG */}
      {isDeleteConfirmOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full border border-slate-200 text-center space-y-4 animate-in zoom-in-95 duration-100">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              <Trash2 className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-lg">Remover Usuário do Sistema?</h3>
              <p className="text-xs text-slate-500 px-2 leading-relaxed">
                Você está prestes a remover permanentemente a conta de <strong className="text-slate-800">{selectedUser.nome}</strong>. Esta ação não poderá ser desfeita na Central.
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="bg-slate-150 text-slate-700 font-bold text-xs px-4 py-2 rounded-lg hover:bg-slate-200 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-5 py-2 rounded-lg transition shadow-md"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function ConfirmIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
