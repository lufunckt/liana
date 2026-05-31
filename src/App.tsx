/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Login, ProfileSelector } from './components/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { MeuPainel } from './components/MeuPainel';
import { PrioridadesHoje } from './components/PrioridadesHoje';
import { BuscaGlobal } from './components/BuscaGlobal';

import { PessoasModule } from './components/Pessoas/PessoasModule';
import { ComercialModule } from './components/Comercial/ComercialModule';
import { AlunosModule } from './components/Alunos/AlunosModule';
import { TarefasSuporteModule } from './components/Tarefas/TarefasSuporteModule';
import { MateriaisModule } from './components/Materiais/MateriaisModule';
import { ImportarModule } from './components/Importar/ImportarModule';
import { EspacosModule } from './components/Espacos/EspacosModule';
import { FinanceiroModule } from './components/Financeiro/FinanceiroModule';
import { WhatsappModule } from './components/Whatsapp/WhatsappModule';
import { PlanilhasModule } from './components/Planilhas/PlanilhasModule';
import { CertificadosModule } from './components/Certificados/CertificadosModule';
import { ReunioesModule } from './components/Reunioes/ReunioesModule';
import { WorkspaceCriativoModule } from './components/WorkspaceCriativo/WorkspaceCriativoModule';
import { ComunicacaoInternaModule } from './components/ComunicacaoInterna/ComunicacaoInternaModule';
import { AgenteSocialSellerModule } from './components/AgenteSocialSeller/AgenteSocialSellerModule';
import { PessoaFicha } from './components/Pessoas/PessoaFicha';
import { seedDatabase } from './data/seed_firebase';
import { AppData } from './types';
import { ALL_SCHEMAS } from './data/schemas';
import { auth, loginWithGoogle, logout } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { FirebaseProvider } from './lib/FirebaseProvider';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'meu_painel' | 'pessoas' | 'comercial' | 'alunos' | 'tarefas_suporte' | 'materiais' | 'importar' | 'espacos' | 'financeiro' | 'whatsapp' | 'planilhas' | 'certificados' | 'salas_reuniao' | 'workspace_criativo' | 'comunicacao_interna' | 'agente_social_seller' | 'prioridades_hoje' | 'busca_global'>('dashboard');
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [fichaPessoa, setFichaPessoa] = useState<any>(null);

  useEffect(() => {
    // Check if there is a saved profile in local storage
    const savedProfile = localStorage.getItem('ilg_selected_profile');
    if (savedProfile) {
      setSelectedProfile(savedProfile);
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSelectProfile = (profile: string) => {
    localStorage.setItem('ilg_selected_profile', profile);
    setSelectedProfile(profile);
  };

  useEffect(() => {
    const handleTabChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setActiveTab(customEvent.detail);
      }
    };
    window.addEventListener('change_active_tab', handleTabChange);

    const handleOpenFicha = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setFichaPessoa(customEvent.detail);
      }
    };
    window.addEventListener('open_pessoa_ficha', handleOpenFicha);

    return () => {
      window.removeEventListener('change_active_tab', handleTabChange);
      window.removeEventListener('open_pessoa_ficha', handleOpenFicha);
    };
  }, []);

  const handleLogin = async () => {
    await loginWithGoogle();
  };

  const handleLogout = async () => {
    localStorage.removeItem('ilg_selected_profile');
    setSelectedProfile(null);
    await logout();
  };

  // If user wants to swap profile without full Google logout:
  const handleSwapProfile = () => {
    localStorage.removeItem('ilg_selected_profile');
    setSelectedProfile(null);
  };

  if (loading) {
    return <div className="h-screen bg-slate-900 flex items-center justify-center text-white">Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  if (!selectedProfile) {
    return <ProfileSelector onSelectProfile={handleSelectProfile} />;
  }

  const activeSchema = ALL_SCHEMAS.find(s => s.id === activeTab);

  return (
    <FirebaseProvider>
      <Layout activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} onSwapProfile={handleSwapProfile} selectedProfile={selectedProfile}>
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'meu_painel' && <MeuPainel setActiveTab={setActiveTab} />}
        {activeTab === 'espacos' && <EspacosModule />}
        {activeTab === 'pessoas' && <PessoasModule />}
        {activeTab === 'whatsapp' && <WhatsappModule />}
        {activeTab === 'comercial' && <ComercialModule />}
        {activeTab === 'financeiro' && <FinanceiroModule />}
        {activeTab === 'alunos' && <AlunosModule />}
        {activeTab === 'tarefas_suporte' && <TarefasSuporteModule />}
        {activeTab === 'materiais' && <MateriaisModule />}
        {activeTab === 'importar' && <ImportarModule />}
        {activeTab === 'planilhas' && <PlanilhasModule />}
        {activeTab === 'certificados' && <CertificadosModule />}
        {activeTab === 'salas_reuniao' && <ReunioesModule />}
        {activeTab === 'workspace_criativo' && <WorkspaceCriativoModule />}
        {activeTab === 'comunicacao_interna' && <ComunicacaoInternaModule />}
        {activeTab === 'agente_social_seller' && <AgenteSocialSellerModule />}
        {activeTab === 'prioridades_hoje' && <PrioridadesHoje />}
        {activeTab === 'busca_global' && <BuscaGlobal />}
      </Layout>

      {fichaPessoa && (
        <PessoaFicha 
          pessoa={fichaPessoa} 
          onClose={() => setFichaPessoa(null)} 
        />
      )}
    </FirebaseProvider>
  );
}
