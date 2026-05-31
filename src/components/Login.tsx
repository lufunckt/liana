import React, { useState } from 'react';

export function Login({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl max-w-sm w-full shadow-2xl">
        <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">Central Operacional</h1>
        <p className="text-cyan-900 text-center mb-6">Instituto Liana Gomes</p>
        
        <button 
          onClick={onLogin} 
          className="w-full border border-slate-300 text-slate-700 font-medium py-2 rounded-md hover:bg-slate-50 transition flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
            <path fill="none" d="M1 1h22v22H1z" />
          </svg>
          Autenticar Acesso (Admin)
        </button>
      </div>
    </div>
  );
}

export function ProfileSelector({ onSelectProfile }: { onSelectProfile: (profile: string) => void }) {
  const profiles = [
    { id: 'liana', name: 'Liana Gomes', role: 'Diretoria / Estratégia', color: 'bg-amber-100 text-amber-800 border-amber-200 group-hover:bg-amber-500 group-hover:text-white', glow: 'group-hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]' },
    { id: 'luiza', name: 'Luiza', role: 'Tech Lead / Admin', color: 'bg-indigo-100 text-indigo-800 border-indigo-200 group-hover:bg-indigo-500 group-hover:text-white', glow: 'group-hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]' },
    { id: 'nuria', name: 'Nuria', role: 'Operações / Comercial', color: 'bg-emerald-100 text-emerald-800 border-emerald-200 group-hover:bg-emerald-500 group-hover:text-white', glow: 'group-hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]' },
    { id: 'ana', name: 'Ana', role: 'Sucesso do Aluno', color: 'bg-orange-100 text-orange-800 border-orange-200 group-hover:bg-orange-500 group-hover:text-white', glow: 'group-hover:shadow-[0_0_20px_rgba(249,115,22,0.4)]' }
  ];

  return (
    <div className="min-h-screen bg-[#0A192F] bg-gradient-to-br from-[#0A192F] to-[#112240] flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      
      <div className="z-10 text-center mb-10 w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-3">Quem está acessando?</h1>
        <p className="text-slate-400 text-lg">Selecione seu perfil na Central Operacional ILG</p>
      </div>
      
      <div className="z-10 grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl w-full">
        {profiles.map((p, idx) => (
          <button
            key={p.id}
            onClick={() => onSelectProfile(p.id)}
            className="group relative border border-slate-700/50 rounded-2xl p-6 text-left transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl flex flex-col items-center justify-center gap-4 bg-slate-800/80 backdrop-blur-sm shadow-xl"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-extrabold border-2 transition-all duration-500 ${p.color} ${p.glow}`}>
              {p.name.charAt(0)}
            </div>
            <div className="text-center">
              <h3 className="font-bold text-white text-xl tracking-tight transition-colors">{p.name}</h3>
              <p className="text-sm text-slate-400 mt-1 font-medium">{p.role}</p>
            </div>
          </button>
        ))}
      </div>
      <div className="z-10 mt-12 text-slate-500 text-xs font-medium tracking-widest uppercase">
        Sistema Interno Restrito • Ver. 2.1
      </div>
    </div>
  );
}
