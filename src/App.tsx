/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Suspense } from 'react';
import { Login, ProfileSelector } from './components/Login';
import { Layout } from './components/Layout';
import { PessoaFicha } from './components/Pessoas/PessoaFicha';
import { ToastContainer } from './components/ToastContainer';
import { seedDatabase } from './data/seed_firebase';
import { AppData } from './types';
import { ALL_SCHEMAS } from './data/schemas';
import { auth, loginWithGoogle, logout } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { FirebaseProvider } from './lib/FirebaseProvider';

// Lazy load modules as requested (Named outputs correctly modeled)
const Dashboard = React.lazy(() => import('./components/Dashboard').then(m => ({ default: m.Dashboard })));
const MeuPainel = React.lazy(() => import('./components/MeuPainel').then(m => ({ default: m.MeuPainel })));
const PrioridadesHoje = React.lazy(() => import('./components/PrioridadesHoje').then(m => ({ default: m.PrioridadesHoje })));
const BuscaGlobal = React.lazy(() => import('./components/BuscaGlobal').then(m => ({ default: m.BuscaGlobal })));
const PessoasModule = React.lazy(() => import('./components/Pessoas/PessoasModule').then(m => ({ default: m.PessoasModule })));
const ComercialModule = React.lazy(() => import('./components/Comercial/ComercialModule').then(m => ({ default: m.ComercialModule })));
const AlunosModule = React.lazy(() => import('./components/Alunos/AlunosModule').then(m => ({ default: m.AlunosModule })));
const TarefasSuporteModule = React.lazy(() => import('./components/Tarefas/TarefasSuporteModule').then(m => ({ default: m.TarefasSuporteModule })));
const MateriaisModule = React.lazy(() => import('./components/Materiais/MateriaisModule').then(m => ({ default: m.MateriaisModule })));
const ImportarModule = React.lazy(() => import('./components/Importar/ImportarModule').then(m => ({ default: m.ImportarModule })));
const EspacosModule = React.lazy(() => import('./components/Espacos/EspacosModule').then(m => ({ default: m.EspacosModule })));
const FinanceiroModule = React.lazy(() => import('./components/Financeiro/FinanceiroModule').then(m => ({ default: m.FinanceiroModule })));
const WhatsappModule = React.lazy(() => import('./components/Whatsapp/WhatsappModule').then(m => ({ default: m.WhatsappModule })));
const PlanilhasModule = React.lazy(() => import('./components/Planilhas/PlanilhasModule').then(m => ({ default: m.PlanilhasModule })));
const CertificadosModule = React.lazy(() => import('./components/Certificados/CertificadosModule').then(m => ({ default: m.CertificadosModule })));
const ReunioesModule = React.lazy(() => import('./components/Reunioes/ReunioesModule').then(m => ({ default: m.ReunioesModule })));
const WorkspaceCriativoModule = React.lazy(() => import('./components/WorkspaceCriativo/WorkspaceCriativoModule').then(m => ({ default: m.WorkspaceCriativoModule })));
const ComunicacaoInternaModule = React.lazy(() => import('./components/ComunicacaoInterna/ComunicacaoInternaModule').then(m => ({ default: m.ComunicacaoInternaModule })));
const AgenteSocialSellerModule = React.lazy(() => import('./components/AgenteSocialSeller/AgenteSocialSellerModule').then(m => ({ default: m.AgenteSocialSellerModule })));

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('ilg_demo_authenticated') === 'true';
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'meu_painel' | 'pessoas' | 'comercial' | 'alunos' | 'tarefas_suporte' | 'materials' | 'importar' | 'espacos' | 'financeiro' | 'whatsapp' | 'planilhas' | 'certificados' | 'salas_reuniao' | 'workspace_criativo' | 'comunicacao_interna' | 'agente_social_seller' | 'prioridades_hoje' | 'busca_global' | any>('meu_painel');
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
      } else if (localStorage.getItem('ilg_demo_authenticated') === 'true') {
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

  const handleDemoLogin = () => {
    localStorage.setItem('ilg_demo_authenticated', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    localStorage.removeItem('ilg_selected_profile');
    localStorage.removeItem('ilg_demo_authenticated');
    localStorage.removeItem('ilg_store_fallback_data');
    setSelectedProfile(null);
    setIsAuthenticated(false);
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
    return <Login onLogin={handleLogin} onDemoLogin={handleDemoLogin} />;
  }

  return (
    <FirebaseProvider>
      {!selectedProfile ? (
        <ProfileSelector onSelectProfile={handleSelectProfile} />
      ) : (
        <Layout activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} onSwapProfile={handleSwapProfile} selectedProfile={selectedProfile}>
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center p-12 min-h-[50vh] space-y-3">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></div>
              <p className="text-slate-500 text-sm font-semibold tracking-wide">Carregando Módulo...</p>
            </div>
          }>
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
          </Suspense>
        </Layout>
      )}

      {fichaPessoa && (
        <PessoaFicha 
          pessoa={fichaPessoa} 
          onClose={() => setFichaPessoa(null)} 
        />
      )}

      {/* Global Non-blocking Toast notification system */}
      <ToastContainer />
    </FirebaseProvider>
  );
}
