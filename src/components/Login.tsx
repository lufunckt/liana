import React, { useState } from 'react';
import { Mail, Lock, ShieldAlert } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface LoginProps {
  onLogin: (email: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setErrorMsg('Por favor, preencha todos os campos.');
      setLoading(false);
      return;
    }

    try {
      const userRef = doc(db, 'usuarios_credenciais', normalizedEmail);

      if (mode === 'login') {
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          setErrorMsg('Este e-mail não está cadastrado. Se for seu primeiro acesso, clique em "Criar uma aqui" abaixo.');
          setLoading(false);
          return;
        }

        const userData = userSnap.data();
        if (userData.password !== password) {
          setErrorMsg('E-mail ou senha incorretos.');
          setLoading(false);
          return;
        }

        // Successfully authenticated!
        localStorage.setItem('ilg_session_active', 'true');
        localStorage.setItem('ilg_authenticated_email', normalizedEmail);
        onLogin(normalizedEmail);
      } else {
        // Mode: Register
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setErrorMsg('Este e-mail já possui uma conta cadastrada. Faça o login.');
          setLoading(false);
          return;
        }

        // Save credential
        await setDoc(userRef, {
          email: normalizedEmail,
          password: password,
          createdAt: new Date().toISOString()
        });

        // Set session active and trigger login
        localStorage.setItem('ilg_session_active', 'true');
        localStorage.setItem('ilg_authenticated_email', normalizedEmail);
        onLogin(normalizedEmail);
      }
    } catch (error: any) {
      console.error(error);
      setErrorMsg('Erro na conexão com o banco de dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 bg-gradient-to-br from-[#0A192F] to-[#122c54] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      
      <div className="bg-white/95 backdrop-blur-md p-6 md:p-8 rounded-2xl max-w-sm w-full shadow-2xl border border-slate-100/50 z-10 flex flex-col">
        <div className="w-16 h-16 bg-[#0A192F] rounded-2xl flex items-center justify-center self-center mb-5 shadow-lg border border-[#D4AF37]/30">
          <span className="text-[#D4AF37] font-black text-2xl tracking-tighter">ILG</span>
        </div>
        
        <h1 className="text-2xl font-black text-slate-900 text-center mb-1 tracking-tight">Central Operacional</h1>
        <p className="text-[#D4AF37]/90 text-center text-[10px] font-black tracking-widest uppercase mb-6">Instituto Liana Gomes</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-550 uppercase tracking-wide flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1D4E89]/40 focus:border-[#1D4E89] transition-all"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-550 uppercase tracking-wide flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              Senha
            </label>
            <input
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1D4E89]/40 focus:border-[#1D4E89] transition-all"
              required
            />
          </div>

          {errorMsg && (
            <div className="bg-red-50 text-red-900 p-3 rounded-xl border border-red-100 flex flex-col gap-2 text-xs font-semibold leading-relaxed">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
              {errorMsg.includes('já possui uma conta') && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg('');
                  }}
                  className="mt-1 self-start bg-[#0A192F] hover:bg-slate-800 text-white font-extrabold text-[10px] px-3 py-1.5 rounded-lg transition-colors uppercase tracking-wider"
                >
                  Preencher dados e Fazer Login
                </button>
              )}
              {errorMsg.includes('não está cadastrado') && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMsg('');
                  }}
                  className="mt-1 self-start bg-[#0A192F] hover:bg-slate-800 text-white font-extrabold text-[10px] px-3 py-1.5 rounded-lg transition-colors uppercase tracking-wider"
                >
                  Ir para Criar Conta agora
                </button>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0A192F] hover:bg-slate-800 text-white font-extrabold text-xs py-3.5 px-4 rounded-xl shadow-lg border border-[#D4AF37]/25 hover:border-[#D4AF37]/50 hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? 'Processando...' : (mode === 'login' ? 'Acessar Central Operacional' : 'Criar Conta')}
          </button>
        </form>

        <p className="text-[10px] text-slate-500 text-center mt-6">
          {mode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}
          <button 
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-[#1D4E89] font-bold ml-1 hover:underline"
          >
            {mode === 'login' ? 'Criar uma aqui' : 'Acesse aqui'}
          </button>
        </p>

        <div className="mt-6 text-center text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
          Instituto Liana Gomes
        </div>
      </div>
    </div>
  );
}
