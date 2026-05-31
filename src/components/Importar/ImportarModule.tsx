import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

export function ImportarModule() {
  const [status, setStatus] = useState<'idle' | 'reading' | 'mapping' | 'success'>('idle');

  const handleSimulate = () => {
    setStatus('reading');
    setTimeout(() => setStatus('mapping'), 1000);
  };

  const handleFinish = () => {
    setStatus('success');
    setTimeout(() => setStatus('idle'), 3000);
  };

  return (
    <div className="flex flex-col h-full items-center justify-center space-y-4">
      <div className="bg-white p-8 rounded-xl shadow-xl border border-slate-200 max-w-lg w-full text-center">
        {status === 'idle' && (
          <>
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-[#1D4E89]" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Importar Planilhas</h2>
            <p className="text-slate-500 mb-6">Faça o upload do CSV das planilhas antigas. O sistema irá converter automaticamente para a nova Base Única de Pessoas.</p>
            <button onClick={handleSimulate} className="px-6 py-3 bg-[#0A192F] text-white rounded-lg font-medium hover:bg-opacity-90 transition shadow">
              Selecionar Arquivo CSV
            </button>
            <p className="text-xs text-slate-400 mt-4">Simulador: clique para avançar na UI.</p>
          </>
        )}

        {status === 'reading' && (
          <div className="py-8">
            <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-4 animate-pulse" />
            <p className="text-lg font-medium text-slate-700">Lendo arquivo...</p>
          </div>
        )}

        {status === 'mapping' && (
          <div className="text-left">
            <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Mapeamento de Colunas</h3>
            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2">
              <div className="flex justify-between items-center text-sm border border-slate-100 p-2 rounded bg-slate-50">
                <span className="text-slate-600 font-medium">Nome Completo (CSV)</span>
                <span>→</span>
                <span className="text-[#1D4E89] font-medium">Nome (Sistema)</span>
              </div>
              <div className="flex justify-between items-center text-sm border border-slate-100 p-2 rounded bg-slate-50">
                <span className="text-slate-600 font-medium">Produto / Formação (CSV)</span>
                <span>→</span>
                <span className="text-[#1D4E89] font-medium">Produto Comprado</span>
              </div>
              <div className="flex justify-between items-center text-sm border border-slate-100 p-2 rounded bg-slate-50">
                <span className="text-slate-600 font-medium">Situação / Status (CSV)</span>
                <span>→</span>
                <span className="text-[#1D4E89] font-medium">Status</span>
              </div>
            </div>
            <button onClick={handleFinish} className="w-full px-6 py-3 bg-[#D4AF37] text-white rounded-lg font-bold hover:bg-opacity-90 shadow">
              Confirmar Importação (120 linhas)
            </button>
          </div>
        )}

        {status === 'success' && (
          <div className="py-8 animate-in zoom-in duration-300">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800">Sucesso!</h2>
            <p className="text-slate-600 mt-2">Os dados foram integrados à Base Única de Pessoas com sucesso.</p>
          </div>
        )}
      </div>
    </div>
  );
}
