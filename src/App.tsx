/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Suspense } from 'react';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { PessoaFicha } from './components/Pessoas/PessoaFicha';
import { ToastContainer } from './components/ToastContainer';
import { ChatWidget } from './components/ChatWidget';
import { NotificationWatcher } from './components/NotificationWatcher';
import { seedDatabase } from './data/seed_firebase';
import { AppData } from './types';
import { ALL_SCHEMAS } from './data/schemas';
import { db } from './lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { FirebaseProvider } from './lib/FirebaseProvider';
import { useStore, isLocalFallbackMode } from './store';

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
const TagManagerModule = React.lazy(() => import('./components/TagManager/TagManagerModule').then(m => ({ default: m.TagManagerModule })));
const MeuPerfilModule = React.lazy(() => import('./components/MeuPerfil/MeuPerfilModule').then(m => ({ default: m.MeuPerfilModule })));
const RelatorioPerformanceModule = React.lazy(() => import('./components/RelatorioPerformance/RelatorioPerformanceModule').then(m => ({ default: m.RelatorioPerformanceModule })));

const PortalExterno = React.lazy(() => import('./components/ComunicacaoInterna/PortalExterno').then(m => ({ default: m.PortalExterno })));

export default function App() {
  const { data } = useStore();
  const allowedEmailsList = data.allowed_emails || [];

  const isEmailAllowed = (email: string) => {
    const userEmail = email.toLowerCase().trim();
    const baseEmails = [
      'ericocavalheiro.psico@gmail.com', // Admin / Desenvolvedor
      'liana@institutolianagomes.com.br',
      'luiza@institutolianagomes.com.br',
      'nuria@institutolianagomes.com.br',
      'ana@institutolianagomes.com.br',
      'fabi@institutolianagomes.com.br',
      'luizaftessele@gmail.com',
    ];
    const dynamicEmails = allowedEmailsList.map((item: any) => item.email?.toLowerCase().trim()).filter(Boolean);
    const merged = Array.from(new Set([...baseEmails, ...dynamicEmails]));
    return merged.includes(userEmail) || userEmail.endsWith('@institutolianagomes.com.br');
  };

  const isExternalPortal = typeof window !== 'undefined' && (
    window.location.search.includes('externo=true') || 
    window.location.hash.includes('externo=true')
  );

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return false; // Force real authentication
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'meu_painel' | 'meu_perfil' | 'relatorio_performance' | 'pessoas' | 'comercial' | 'alunos' | 'tarefas_suporte' | 'materials' | 'importar' | 'espacos' | 'financeiro' | 'whatsapp' | 'planilhas' | 'certificados' | 'salas_reuniao' | 'workspace_criativo' | 'comunicacao_interna' | 'agente_social_seller' | 'prioridades_hoje' | 'busca_global' | any>('meu_painel');
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [fichaPessoa, setFichaPessoa] = useState<any>(null);

  const allowedEmailsKey = allowedEmailsList.map((item: any) => item.email).join(',');

  useEffect(() => {
    // Check if there is a saved profile in local storage
    const savedProfile = localStorage.getItem('ilg_selected_profile');
    if (savedProfile) {
      setSelectedProfile(savedProfile);
    }

    const checkLocalAuth = async () => {
      console.log("[CHECK_AUTH] [STAGE 1/6] Starting checkLocalAuth hook check...");
      
      // Removed auto-login from local storage to enforce password requirement every start
      console.log("[CHECK_AUTH] [STAGE 2/6] Auto-login from local storage disabled to ensure security.");
      
      setIsAuthenticated(false);
      setLoading(false);
    };

    checkLocalAuth();
  }, [allowedEmailsKey]);

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

  const handleLogin = async (email: string) => {
    console.log("[LOGIN] [STAGE 1] Starting handleLogin for input:", email);
    try {
      setLoading(true);
      const userEmail = email.toLowerCase().trim();
      const isAllowed = isEmailAllowed(userEmail);
      console.log(`[LOGIN] [STAGE 2] Whitelist testing for "${userEmail}": Is Allowed?`, isAllowed);
      
      if (isAllowed) {
        console.log("[LOGIN] [STAGE 3] Authorized. Setting localStorage item and isAuthenticated = true.");
        localStorage.setItem('ilg_authenticated_email', userEmail);
        setIsAuthenticated(true);
        
        let queryStartTime = 0;
        try {
          console.log("[LOGIN] [STAGE 4] Preparing Firestore query for profile document...");
          const perfisRef = collection(db, 'perfis');
          const q = query(perfisRef, where('email', '==', userEmail));
          console.log("[LOGIN] [STAGE 5] Triggering getDocs wrapped in a 4-second race block...");
          
          queryStartTime = performance.now();
          // Race Firestore query with a 4s timeout to guarantee prompt UI transition
          const queryPromise = getDocs(q);
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Firestore profile query timeout (4000ms limit reached)")), 4000)
          );

          const querySnapshot = await Promise.race([queryPromise, timeoutPromise]);
          const queryEndTime = performance.now();
          const queryLatency = (queryEndTime - queryStartTime).toFixed(2);
          console.warn(`[TELEMETRY] [LOGIN] Firestore query succeeded in ${queryLatency}ms.`);
          console.log("[LOGIN] Firestore query resolved! Empty snapshot?", querySnapshot.empty);
          
          if (!querySnapshot.empty) {
            const profileDoc = querySnapshot.docs[0];
            const profileId = profileDoc.id;
            console.log("[LOGIN] [STAGE 6] Found matching profile document. ID:", profileId, "Raw Data:", profileDoc.data());
            setSelectedProfile(profileId);
            localStorage.setItem('ilg_selected_profile', profileId);
          } else {
            const baseId = userEmail.split('@')[0];
            console.log("[LOGIN] [STAGE 6] No doc found in 'perfis'. Yielding prefix fallback ID:", baseId);
            setSelectedProfile(baseId); 
            localStorage.setItem('ilg_selected_profile', baseId);
          }
        } catch (dbError: any) {
          const queryEndTime = performance.now();
          const elapsed = queryStartTime > 0 ? (queryEndTime - queryStartTime).toFixed(2) : "unknown";
          console.error(`[TELEMETRY] [LOGIN] Firestore query failed/timed-out after ${elapsed}ms. Details:`, {
            message: dbError.message,
            code: dbError.code,
            stack: dbError.stack,
            errorObjectParsed: JSON.stringify(dbError)
          });
          const baseId = userEmail.split('@')[0];
          console.log("[LOGIN] Resolving hang gracefully by applying fallback ID:", baseId);
          setSelectedProfile(baseId); 
          localStorage.setItem('ilg_selected_profile', baseId);
        }
      } else {
        console.log("[LOGIN] Access Denied. Whitelist checks failed for:", userEmail);
        alert('Acesso Negado: Seu e-mail não possui permissão para acessar a Central Operacional ILG.');
        setIsAuthenticated(false);
      }
    } catch (error: any) {
      console.error("[LOGIN] Fatal error in outer login block:", error);
      alert('Erro ao realizar login operacional. Verifique sua conexão.');
    } finally {
      console.log("[LOGIN] Setting loading to false.");
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('ilg_selected_profile');
    localStorage.removeItem('ilg_store_fallback_data');
    localStorage.removeItem('ilg_authenticated_email');
    setSelectedProfile(null);
    setIsAuthenticated(false);
  };

  if (isExternalPortal) {
    return (
      <Suspense fallback={<div className="h-screen bg-[#0A192F] flex items-center justify-center text-slate-300 font-bold select-none text-xs animate-pulse">Iniciando Portal de Submissão Seguro...</div>}>
        <PortalExterno />
      </Suspense>
    );
  }

  if (loading) {
    return <div className="h-screen bg-slate-900 flex items-center justify-center text-white font-sans">Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <FirebaseProvider>
      {!selectedProfile ? (
        <div className="h-screen bg-[#0A192F] flex flex-col items-center justify-center text-white space-y-4">
          <div className="w-10 h-10 border-4 border-slate-700 border-t-[#D4AF37] rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-semibold tracking-wide">Incializando sessão da colaboradora...</p>
        </div>
      ) : (
        <Layout activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} selectedProfile={selectedProfile}>
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center p-12 min-h-[50vh] space-y-3">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></div>
              <p className="text-slate-500 text-sm font-semibold tracking-wide">Carregando Módulo...</p>
            </div>
          }>
            {activeTab === 'dashboard' && <Dashboard selectedProfile={selectedProfile} />}
            {activeTab === 'meu_painel' && <MeuPainel setActiveTab={setActiveTab} />}
            {activeTab === 'meu_perfil' && selectedProfile && <MeuPerfilModule userId={selectedProfile} />}
            {activeTab === 'relatorio_performance' && selectedProfile === 'liana' && <RelatorioPerformanceModule />}
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
            {activeTab === 'tag_manager' && <TagManagerModule />}
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

      {selectedProfile && <ChatWidget />}
      {selectedProfile && <NotificationWatcher />}

      {/* Global Non-blocking Toast notification system */}
      <ToastContainer />
    </FirebaseProvider>
  );
}
