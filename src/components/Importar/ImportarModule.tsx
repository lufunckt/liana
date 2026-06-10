import React, { useState } from 'react';
import Papa from 'papaparse';
import { Upload, FileSpreadsheet, Download, RefreshCw, Layers, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export function ImportarModule() {
  const [activeTab, setActiveTab] = useState<'migracao' | 'cruzamento'>('cruzamento');
  
  // Cruzamento States
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [dataA, setDataA] = useState<any[]>([]);
  const [dataB, setDataB] = useState<any[]>([]);
  const [headersA, setHeadersA] = useState<string[]>([]);
  const [headersB, setHeadersB] = useState<string[]>([]);
  
  const [matchColA, setMatchColA] = useState<string>('');
  const [matchColB, setMatchColB] = useState<string>('');
  
  const [results, setResults] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<1|2|3>(1);

  const handleFileUpload = (file: File, isFileA: boolean) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (isFileA) {
          setFileA(file);
          setDataA(results.data);
          setHeadersA(results.meta.fields || []);
          // Auto-select email if present
          const emailCol = (results.meta.fields || []).find(f => f.toLowerCase().includes('mail'));
          if (emailCol) setMatchColA(emailCol);
        } else {
          setFileB(file);
          setDataB(results.data);
          setHeadersB(results.meta.fields || []);
          const emailCol = (results.meta.fields || []).find(f => f.toLowerCase().includes('mail'));
          if (emailCol) setMatchColB(emailCol);
        }
      }
    });
  };

  const processCrossReference = () => {
    if (!matchColA || !matchColB) {
      alert("Por favor, selecione as colunas de cruzamento para ambas as planilhas.");
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate slight delay for UX
    setTimeout(() => {
      const setB = new Set(dataB.map(row => {
        const val = row[matchColB];
        return typeof val === 'string' ? val.trim().toLowerCase() : val;
      }).filter(Boolean));

      const differences = dataA.filter(row => {
        const val = row[matchColA];
        const normalized = typeof val === 'string' ? val.trim().toLowerCase() : val;
        if (!normalized) return false;
        return !setB.has(normalized);
      });

      setResults(differences);
      setIsProcessing(false);
      setStep(3);
    }, 800);
  };

  const exportResults = () => {
    if (results.length === 0) return;
    const csv = Papa.unparse(results);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "oportunidades_cruzamento.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetTool = () => {
    setFileA(null);
    setFileB(null);
    setDataA([]);
    setDataB([]);
    setHeadersA([]);
    setHeadersB([]);
    setMatchColA('');
    setMatchColB('');
    setResults([]);
    setStep(1);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 space-y-6 max-w-5xl mx-auto p-4 md:p-6 animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#0A192F] tracking-tight">Data Tools & Importação</h2>
            <p className="text-sm text-slate-500 mt-1">Ferramentas de cruzamento de dados e migração de bases csv.</p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl shadow-xs border border-slate-200 shrink-0">
            <button
              onClick={() => setActiveTab('cruzamento')}
              className={cn("px-4 py-2 text-xs font-bold rounded-lg transition-all", activeTab === 'cruzamento' ? "bg-white text-indigo-700 shadow" : "text-slate-500 hover:text-slate-800")}
            >
              Cruzador Nutror
            </button>
            <button
              onClick={() => setActiveTab('migracao')}
              className={cn("px-4 py-2 text-xs font-bold rounded-lg transition-all", activeTab === 'migracao' ? "bg-white text-[#0A192F] shadow" : "text-slate-500 hover:text-slate-800")}
            >
              Migração Base
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'migracao' && (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center">
          <Upload className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700 mb-2">Migração de Base Antiga</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">Esta funcionalidade foi transferida para o módulo de <span className="font-bold underline text-indigo-600">Planilhas</span> no seu painel lateral. Gerencie e importe dados CSV diretamente por lá.</p>
        </div>
      )}

      {activeTab === 'cruzamento' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 bg-slate-50 border-b border-light-200 flex justify-between items-center select-none shrink-0">
            <h3 className="font-bold text-sm text-[#0A192F] uppercase flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Intel Cruzamento de Listas (Nutror / Excel)</span>
            </h3>
            <div className="flex gap-2 items-center">
              <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full", step >= 1 ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-500")}>1. Uploads</span>
              <span className="text-slate-300">→</span>
              <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full", step >= 2 ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-500")}>2. Mapeamento</span>
              <span className="text-slate-300">→</span>
              <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full", step >= 3 ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500")}>3. Resultado</span>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-8 flex-1">
            
            {step === 1 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
                  <strong className="block mb-1">Como utilizar?</strong>
                  Para saber quem participou da <strong>Imersão</strong> mas não comprou a <strong>Formação</strong>, faça o upload da lista da Imersão (Lista A - Base Maior) e da lista da Formação (Lista B - Base Menor). O sistema apontará quem está na A e não na B.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:bg-slate-50 transition relative">
                    <FileSpreadsheet className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
                    <h4 className="font-bold text-slate-700 mb-1">Lista A (Base Origem / Maior)</h4>
                    <p className="text-xs text-slate-500 mb-4">Ex: Todos que participaram da Imersão</p>
                    
                    <input 
                      type="file" 
                      accept=".csv" 
                      id="upload-a" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0], true);
                          if (fileB || (e.target.files && e.target.files[0] && fileB)) setStep(2);
                        }
                      }}
                    />
                    
                    {fileA ? (
                      <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-2 rounded-lg text-sm font-semibold">
                        <CheckCircle2 className="w-4 h-4" />
                        {fileA.name} ({dataA.length} linhas)
                      </div>
                    ) : (
                      <span className="inline-block px-6 py-2.5 bg-white border border-slate-200 text-[#0A192F] text-xs font-bold uppercase rounded-lg shadow-sm">
                        Selecionar CSV
                      </span>
                    )}
                  </div>

                  <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:bg-slate-50 transition relative">
                    <FileSpreadsheet className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                    <h4 className="font-bold text-slate-700 mb-1">Lista B (Subtrair estes)</h4>
                    <p className="text-xs text-slate-500 mb-4">Ex: Alunos atuais da Formação</p>
                    
                    <input 
                      type="file" 
                      accept=".csv" 
                      id="upload-b" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0], false);
                          if (fileA) setStep(2);
                        }
                      }}
                    />
                    
                    {fileB ? (
                      <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-lg text-sm font-semibold">
                        <CheckCircle2 className="w-4 h-4" />
                        {fileB.name} ({dataB.length} linhas)
                      </div>
                    ) : (
                      <span className="inline-block px-6 py-2.5 bg-white border border-slate-200 text-[#0A192F] text-xs font-bold uppercase rounded-lg shadow-sm">
                        Selecionar CSV
                      </span>
                    )}
                  </div>
                </div>

                {fileA && fileB && (
                  <div className="flex justify-end">
                    <button onClick={() => setStep(2)} className="px-6 py-3 bg-[#0A192F] text-white rounded-xl text-sm font-bold uppercase tracking-wider flex items-center gap-2 shadow-md hover:bg-[#D4AF37] hover:text-[#0A192F] transition">
                      Avançar Mapeamento &rarr;
                    </button>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300 max-w-2xl mx-auto xl:max-w-none">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-[#0A192F]">Mapeamento de Chave Única</h3>
                  <p className="text-sm text-slate-500">O sistema precisa saber por qual coluna comparar as duas planilhas (Recomendamos "E-mail" ou "Telefone").</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-[#1D4E89]">Coluna Chave - Lista A</label>
                    <select
                      value={matchColA}
                      onChange={(e) => setMatchColA(e.target.value)}
                      className="w-full text-sm border-slate-300 rounded-xl p-3 shadow-sm bg-white"
                    >
                      <option value="">Selecione a coluna...</option>
                      {headersA.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-amber-700">Coluna Chave - Lista B</label>
                    <select
                      value={matchColB}
                      onChange={(e) => setMatchColB(e.target.value)}
                      className="w-full text-sm border-slate-300 rounded-xl p-3 shadow-sm bg-white"
                    >
                      <option value="">Selecione a coluna...</option>
                      {headersB.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <button onClick={() => setStep(1)} className="px-6 py-3 text-slate-500 text-sm font-bold transition hover:bg-slate-100 rounded-xl">
                    &larr; Voltar
                  </button>

                  <button 
                    onClick={processCrossReference} 
                    disabled={isProcessing}
                    className="px-8 py-3 bg-[#0A192F] text-white rounded-xl text-sm font-bold uppercase tracking-wider flex items-center gap-2 shadow-md hover:bg-[#D4AF37] hover:text-[#0A192F] transition disabled:opacity-50"
                  >
                    {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Layers className="w-5 h-5" />}
                    {isProcessing ? 'Cruzando relatórios...' : 'Cruzar Dados'}
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-emerald-900">Cruzamento Concluído</h3>
                      <p className="text-sm text-emerald-700 font-medium mt-1">
                        Dos {dataA.length} registros na Lista A, encontramos <strong>{results.length} pessoas</strong> que NÃO ESTÃO na Lista B.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 shrink-0">
                    <button onClick={resetTool} className="px-4 py-2 bg-white border border-emerald-200 text-emerald-700 font-bold text-xs uppercase rounded-lg hover:bg-emerald-100 transition shadow-sm">
                      Novo Cruzamento
                    </button>
                    {results.length > 0 && (
                      <button onClick={exportResults} className="px-6 py-2 bg-emerald-600 border border-emerald-600 text-white font-black tracking-widest text-xs uppercase rounded-lg hover:bg-emerald-700 transition shadow flex items-center gap-2">
                        <Download className="w-4 h-4" /> Exportar CSV
                      </button>
                    )}
                  </div>
                </div>

                {results.length > 0 ? (
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                    <div className="overflow-x-auto max-h-[50vh]">
                      <table className="w-full text-xs text-slate-700">
                        <thead className="bg-[#0A192F] text-white font-bold sticky top-0 uppercase tracking-widest text-[9px]">
                          <tr>
                            {headersA.slice(0, 7).map(h => (
                              <th key={h} className="p-3 text-left border-r border-[#1D4E89]/50">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {results.slice(0, 100).map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50 transition">
                              {headersA.slice(0, 7).map(h => (
                                <td key={h} className="p-3 border-r border-slate-50 last:border-0 truncate max-w-[200px]" title={row[h]}>{row[h]}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {results.length > 100 && (
                      <div className="p-3 text-center bg-slate-50 border-t border-slate-100 text-xs text-slate-500 font-medium">
                        Mostrando Apenas as 100 primeiras linhas na visualização. Exporte o CSV completo com os {results.length} resultados.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-emerald-400" />
                    <h3 className="text-lg font-bold text-slate-800">100% dos registros encontrados!</h3>
                    <p className="text-sm mt-1">Todos os registros da Lista A estão presentes na Lista B segundo o mapeamento feito.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

