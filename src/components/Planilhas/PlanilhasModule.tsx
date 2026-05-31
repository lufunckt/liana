import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileSpreadsheet, Plus, HelpCircle, Layers, Trash2, ArrowRight, Upload, 
  Settings, Zap, Check, Bookmark, Filter, Search, Grid, TrendingUp, AlertCircle, Clock, 
  FolderLock, UserCheck, Play, ArrowUpRight, BadgeHelp, ClipboardList, CheckCircle2
} from 'lucide-react';
import { PLANILHA_TEMPLATES, SpreadsheetTemplate, TemplateColumn } from './templates';
import { PlanilhaGrid } from './PlanilhaGrid';

// Interface for dynamic spreadsheets
export interface DynamicSpreadsheet {
  id: string;
  nome: string;
  categoria: string;
  responsavel: string;
  ultimaAtualizacao: string;
  status: 'Ativo' | 'Em Análise' | 'Arquivado' | 'Parado';
  colunas: TemplateColumn[];
  registros: Record<string, any>[];
  promovido?: boolean;
  regras?: Array<{
    id: string;
    seCampo: string;
    seValor: string;
    entaoAcao: string;
    ativo: boolean;
  }>;
}

export function PlanilhasModule() {
  // Primary database state of sheets
  const [spreadsheets, setSpreadsheets] = useState<DynamicSpreadsheet[]>([]);
  const [selectedSheetId, setSelectedSheetId] = useState<string | null>(null);

  // Filter & search of sheets index
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Wizard flow states for creating new sheets
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1); // 1, 2, 3
  const [creationStyle, setCreationStyle] = useState<'zero' | 'modelo' | 'importar'>('zero');
  
  // Sheet variables in creation
  const [newSheetName, setNewSheetName] = useState('');
  const [newSheetCategory, setNewSheetCategory] = useState('Leads');
  const [newSheetResponsavel, setNewSheetResponsavel] = useState('Nuria');
  const [selectedTemplateId, setSelectedTemplateId] = useState('tpl-leads');
  const [newSheetColumns, setNewSheetColumns] = useState<TemplateColumn[]>([
    { key: 'nome', label: 'Nome Completo', type: 'rel_pessoa' }
  ]);

  // CSV Import simulation
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvFileName, setCsvFileName] = useState('');
  const [csvFilePreview, setCsvFilePreview] = useState<string[][]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvHasHeader, setCsvHasHeader] = useState(true);
  const [csvTargetSheet, setCsvTargetSheet] = useState('new'); // 'new' or specific sheet ID
  const [csvColumnMapping, setCsvColumnMapping] = useState<Record<string, string>>({});

  // Automation / rules pop-ups
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [activeRuleSheetId, setActiveRuleSheetId] = useState<string | null>(null);
  const [ruleField, setRuleField] = useState('');
  const [ruleValue, setRuleValue] = useState('');
  const [ruleAction, setRuleAction] = useState('criar_tarefa');

  // Bootstrap initial sheets from templates if none exist
  useEffect(() => {
    const saved = localStorage.getItem('ilg_planilhas');
    if (saved) {
      try {
        setSpreadsheets(JSON.parse(saved));
      } catch (e) {
        bootstrapDefaultSpreadsheets();
      }
    } else {
      bootstrapDefaultSpreadsheets();
    }
  }, []);

  const bootstrapDefaultSpreadsheets = () => {
    const bootstrapped: DynamicSpreadsheet[] = PLANILHA_TEMPLATES.map((tpl, i) => ({
      id: tpl.id,
      nome: tpl.nome,
      categoria: tpl.categoria,
      responsavel: i % 2 === 0 ? 'Ana' : 'Nuria',
      ultimaAtualizacao: new Date().toLocaleDateString('pt-BR'),
      status: 'Ativo',
      colunas: tpl.colunas,
      registros: tpl.defaultRecords,
      promovido: i < 2, // Promote Leads and Alunos by default
      regras: [
        {
          id: `rule-${tpl.id}-1`,
          seCampo: tpl.colunas.find(c => c.type === 'status' || c.key.includes('status'))?.key || 'status',
          seValor: 'Atrasado',
          entaoAcao: 'Criar tarefa de contato imediata para o financeiro',
          ativo: true
        }
      ]
    }));
    
    localStorage.setItem('ilg_planilhas', JSON.stringify(bootstrapped));
    setSpreadsheets(bootstrapped);
  };

  // Sync state to local storage when state changes
  const saveSpreadsheetsState = (updated: DynamicSpreadsheet[]) => {
    setSpreadsheets(updated);
    localStorage.setItem('ilg_planilhas', JSON.stringify(updated));
    // Dispatch general storage event to sync custom views if needed
    window.dispatchEvent(new Event('storage'));
  };

  // Categories suggestions list
  const CATEGORIAS_SUGERIDAS = [
    'Leads', 'Alunos', 'Turmas', 'Pagamentos', 'Suporte', 'Materiais', 
    'Bônus', 'Certificação', 'Conteúdo', 'Tarefas', 'Lançamentos', 'Personalizada'
  ];

  // Global counts for Operational Feed Dashboard Feed Integration
  const dashboardMetrics = useMemo(() => {
    let totalRows = 0;
    let countAtrasados = 0;
    let pendingOnboarding = 0;
    let criticalMaterials = 0;

    spreadsheets.forEach(sheet => {
      totalRows += sheet.registros.length;
      sheet.registros.forEach(row => {
        // Look for values of 'atrasado' or 'pendente' or similar
        Object.entries(row).forEach(([k, v]) => {
          const strVal = String(v).toLowerCase();
          if (strVal === 'atrasado') countAtrasados++;
          if (k === 'status_onboarding' && strVal === 'pendente') pendingOnboarding++;
          if (k === 'status' && strVal === 'critico') criticalMaterials++;
        });
      });
    });

    return {
      totalRows,
      countAtrasados,
      pendingOnboarding,
      criticalMaterials
    };
  }, [spreadsheets]);

  // Retrieve matching columns for filter dropdown
  const currentlySelectedSheet = useMemo(() => {
    return spreadsheets.find(s => s.id === selectedSheetId) || null;
  }, [spreadsheets, selectedSheetId]);

  // Handle spreadsheet deletions
  const handleDeleteSheet = (id: string, name: string) => {
    if (confirm(`Tem certeza de que deseja excluir permanentemente a planilha "${name}" e todos os seus dados?`)) {
      const filtered = spreadsheets.filter(s => s.id !== id);
      saveSpreadsheetsState(filtered);
      if (selectedSheetId === id) setSelectedSheetId(null);
    }
  };

  // Handle promover to menu toggle concept
  const handlePromoteProductTab = (id: string) => {
    const updated = spreadsheets.map(s => {
      if (s.id === id) {
        const nextPromotedStatus = !s.promovido;
        alert(nextPromotedStatus 
          ? `Módulo "${s.nome}" foi promovido com destaque no painel principal!` 
          : `Módulo removido dos promovidos.`);
        return { ...s, promovido: nextPromotedStatus };
      }
      return s;
    });
    saveSpreadsheetsState(updated);
  };

  // Create wizard finish action
  const handleWizardSubmit = () => {
    let finalCols: TemplateColumn[] = [];
    let finalRecords: Record<string, any>[] = [];

    if (creationStyle === 'zero') {
      finalCols = [...newSheetColumns];
      finalRecords = [];
    } else if (creationStyle === 'modelo') {
      const template = PLANILHA_TEMPLATES.find(t => t.id === selectedTemplateId);
      if (template) {
        finalCols = template.colunas;
        finalRecords = template.defaultRecords;
      } else {
        finalCols = [{ key: 'nome', label: 'Nome Completo', type: 'rel_pessoa' }];
      }
    } else if (creationStyle === 'importar') {
      // Simulate CSV upload structure
      finalCols = csvHeaders.map(h => {
        const mappedType = csvColumnMapping[h] || 'texto_curto';
        return {
          key: h.toLowerCase().replace(/\s+/g, '_'),
          label: h,
          type: mappedType as any
        };
      });

      // Transform simulated mock CSV rows (using the preview)
      finalRecords = csvFilePreview.slice(csvHasHeader ? 1 : 0).map(row => {
        const rec: Record<string, any> = {};
        csvHeaders.forEach((h, index) => {
          const colKey = h.toLowerCase().replace(/\s+/g, '_');
          let val: any = row[index] || '';
          const mappedType = csvColumnMapping[h] || 'texto_curto';
          if (mappedType === 'numero' || mappedType === 'moeda') {
            val = Number(val.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
          } else if (mappedType === 'checkbox') {
            val = val.toLowerCase() === 'sim' || val.toLowerCase() === 'true' || val === '1';
          }
          rec[colKey] = val;
        });
        return rec;
      });
    }

    const newSheet: DynamicSpreadsheet = {
      id: `sheet-${Date.now()}`,
      nome: newSheetName.trim() || `Planilha de ${newSheetCategory}`,
      categoria: newSheetCategory,
      responsavel: newSheetResponsavel,
      ultimaAtualizacao: new Date().toLocaleDateString('pt-BR'),
      status: 'Ativo',
      colunas: finalCols,
      registros: finalRecords,
      regras: [
        {
          id: `rule-custom-${Date.now()}`,
          seCampo: finalCols[0]?.key || 'nome',
          seValor: '',
          entaoAcao: 'Enviar alerta ao dashboard se alterado',
          ativo: false
        }
      ]
    };

    saveSpreadsheetsState([...spreadsheets, newSheet]);
    setSelectedSheetId(newSheet.id);
    setIsWizardOpen(false);
    setNewSheetName('');
    setWizardStep(1);
  };

  // CSV Loader Trigger Preview
  const handleCSVUploadSimulate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    setCsvFileName(file.name);

    // Provide pre-built elegant parser mock rows of typical ILG Leads or Alunos
    const isLeadWord = file.name.toLowerCase().includes('lead');
    let headings: string[] = [];
    let rows: string[][] = [];

    if (isLeadWord) {
      headings = ['Nome Completo', 'Mailing Address', 'WhatsApp', 'Origem do Lead', 'Status Comercial'];
      rows = [
        ['Nome Completo', 'Mailing Address', 'WhatsApp', 'Origem do Lead', 'Status Comercial'],
        ['Gabriela Mello', 'gabi.m@yahoo.com', '5511944445555', 'Anúncio Pago', 'Novo Lead'],
        ['Lucas Berton', 'lucas.berton@outlook.com', '5511922221111', 'Instagram', 'Sem Interesse'],
        ['Sofia Loren', 'sofia@lorencorp.com', '5521911112222', 'Indicados', 'Agendado']
      ];
    } else {
      headings = ['Ficha Aluna', 'WhatsApp', 'E-mail principal', 'Formação ou Produto', 'Turma Relacionada'];
      rows = [
        ['Ficha Aluna', 'WhatsApp', 'E-mail principal', 'Formação ou Produto', 'Turma Relacionada'],
        ['Beatriz Nogueira', '5511955556666', 'beatriz.nog@uol.com', 'Formação Executiva & Compliance', 'Turma A'],
        ['Juliana Ramos', '5511966667777', 'juliaramos@gmail.com', 'Formação Líder / Liderança', 'Turma B']
      ];
    }

    setCsvHeaders(headings);
    setCsvFilePreview(rows);
    
    // Auto map values
    const autoMap: Record<string, string> = {};
    headings.forEach(h => {
      if (h.includes('Nome') || h.includes('Ficha')) autoMap[h] = 'rel_pessoa';
      else if (h.includes('WhatsApp') || h.includes('Telefone')) autoMap[h] = 'telefone';
      else if (h.includes('E-mail') || h.includes('Mail')) autoMap[h] = 'email';
      else if (h.includes('Status')) autoMap[h] = 'status';
      else if (h.includes('Vencimento') || h.includes('Data')) autoMap[h] = 'data';
      else autoMap[h] = 'texto_curto';
    });
    setCsvColumnMapping(autoMap);
  };

  // Add rule submit
  const handleAddRule = () => {
    if (!activeRuleSheetId || !ruleField || !ruleValue) return;

    const updated = spreadsheets.map(s => {
      if (s.id === activeRuleSheetId) {
        const currentRules = s.regras || [];
        return {
          ...s,
          regras: [
            ...currentRules,
            {
              id: `rule-${Date.now()}`,
              seCampo: ruleField,
              seValor: ruleValue,
              entaoAcao: ruleAction === 'criar_tarefa' 
                ? 'Criar tarefa interna de cobrança/follow-up para SDR' 
                : ruleAction === 'alerta_dashboard'
                ? 'Exibir alerta vermelho de emergência no dashboard'
                : 'Criar aviso pendente no onboarding da aluna',
              ativo: true
            }
          ]
        };
      }
      return s;
    });

    saveSpreadsheetsState(updated);
    setIsRulesModalOpen(false);
    alert('Regra de automação salva com sucesso! O sistema rodará as validações continuamente.');
  };

  // Column reordering
  const handleUpdateCols = (sheetId: string, newCols: TemplateColumn[]) => {
    const updated = spreadsheets.map(s => {
      if (s.id === sheetId) {
        return { ...s, colunas: newCols };
      }
      return s;
    });
    saveSpreadsheetsState(updated);
  };

  const handleUpdateRegs = (sheetId: string, newRegs: Record<string, any>[]) => {
    const updated = spreadsheets.map(s => {
      if (s.id === sheetId) {
        return { 
          ...s, 
          registros: newRegs,
          ultimaAtualizacao: new Date().toLocaleDateString('pt-BR')
        };
      }
      return s;
    });
    saveSpreadsheetsState(updated);
  };

  // Filter list of sheet summaries in directory
  const filteredSpreadsheets = useMemo(() => {
    return spreadsheets.filter(s => {
      const matchesSearch = s.nome.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.categoria.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCat = selectedCategory === 'all' || s.categoria === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [spreadsheets, searchQuery, selectedCategory]);

  return (
    <div className="flex flex-col h-full bg-slate-50 gap-5 max-w-7xl mx-auto p-4 select-none animate-fade-in">
      
      {/* 2. OPERATIONAL SHEET METRICS INTEGRATION HEADER */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full cursor-default select-none border-b pb-4 shrink-0">
        <div className="bg-white border border-slate-200/80 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Total de Registros</span>
            <p className="text-xl font-extrabold text-[#0A192F] tracking-tight">{dashboardMetrics.totalRows} linhas</p>
          </div>
          <div className="p-2.5 bg-indigo-50 rounded-lg text-indigo-700">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Financeiro / Atrasados</span>
            <p className="text-xl font-extrabold text-red-600 tracking-tight">{dashboardMetrics.countAtrasados} pendências</p>
          </div>
          <div className="p-2.5 bg-red-50 rounded-lg text-red-650">
            <AlertCircle className="w-5 h-5 text-red-650" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Onboarding Pendente</span>
            <p className="text-xl font-extrabold text-indigo-700 tracking-tight">{dashboardMetrics.pendingOnboarding} alunas</p>
          </div>
          <div className="p-2.5 bg-yellow-50 rounded-lg text-amber-600">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Automações Ativas</span>
            <p className="text-xl font-extrabold text-indigo-600 tracking-tight">Active Engine</p>
          </div>
          <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-600">
            <Zap className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* PORTAL BODY CONTAINER */}
      <div className="flex-1 flex flex-col min-h-0">
        
        {/* IF A SHEET IS OPENED IN BREADCRUMB MODE */}
        {selectedSheetId && currentlySelectedSheet ? (
          <div className="flex-1 flex flex-col min-h-0 space-y-4">
            
            {/* Nav Back Header */}
            <div className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-xl shadow-xs select-none">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setSelectedSheetId(null)}
                  className="px-3.5 py-1.5 border border-slate-200 font-bold hover:bg-slate-50 transition rounded-lg text-xs leading-none text-slate-600"
                >
                  ← Voltar para Central de Planilhas
                </button>
                <div className="h-4 w-px bg-slate-200 mx-2" />
                <span className="text-sm font-semibold text-slate-500">Editando:</span>
                <span className="text-sm font-extrabold text-[#0A192F] uppercase">{currentlySelectedSheet.nome}</span>
              </div>

              {/* SHEET SPECIFIC RULES TRIGGERS AND CONFIGS */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveRuleSheetId(currentlySelectedSheet.id);
                    setRuleField(currentlySelectedSheet.colunas[0]?.key || '');
                    setIsRulesModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-indigo-50 text-indigo-800 hover:bg-[#D4AF37] hover:text-[#0A192F] transition rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Regras & Automação ({currentlySelectedSheet.regras?.filter(r=>r.ativo).length || 0})</span>
                </button>

                <button
                  onClick={() => handlePromoteProductTab(currentlySelectedSheet.id)}
                  className={`px-3.5 py-1.5 border transition rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                    currentlySelectedSheet.promovido 
                      ? 'bg-amber-500 text-white border-amber-600 hover:bg-amber-600' 
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                  }`}
                  title={currentlySelectedSheet.promovido ? 'Remover promoção de menu' : 'Promover a Módulo Fixo do Menu Lateral'}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{currentlySelectedSheet.promovido ? 'Módulo Promovido ⭐' : 'Promover para Módulo'}</span>
                </button>
              </div>
            </div>

            {/* AUTOMATION ACCORDION ACTIVE FEED */}
            {currentlySelectedSheet.regras && currentlySelectedSheet.regras.length > 0 && (
              <div className="p-3 bg-indigo-950 text-indigo-100 rounded-xl flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse shrink-0" />
                  <p>
                    <strong>Regra ativa:</strong> Se o campo <code className="bg-indigo-900 px-1 py-0.5 rounded text-yellow-400">{currentlySelectedSheet.regras[0].seCampo}</code> for <code className="bg-indigo-900 px-1 py-0.5 rounded text-yellow-400">{currentlySelectedSheet.regras[0].seValor || 'Qualquer valor'}</code>, então: <strong>{currentlySelectedSheet.regras[0].entaoAcao}</strong>.
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="text-[10px] text-amber-400 font-extrabold uppercase">Ativado</span>
                  <button 
                    onClick={() => {
                      const updated = spreadsheets.map(s => {
                        if (s.id === currentlySelectedSheet.id) {
                          return {
                            ...s,
                            regras: s.regras?.map(r => ({ ...r, ativo: false }))
                          };
                        }
                        return s;
                      });
                      saveSpreadsheetsState(updated);
                    }}
                    className="text-indigo-300 hover:text-white"
                  >
                    Desativar
                  </button>
                </div>
              </div>
            )}

            {/* LIVE GRID VIEW EDITOR */}
            <div className="flex-1 min-h-0">
              <PlanilhaGrid 
                sheetId={currentlySelectedSheet.id}
                nome={currentlySelectedSheet.nome}
                colunas={currentlySelectedSheet.colunas}
                registros={currentlySelectedSheet.registros}
                onUpdateRegistros={(regs) => handleUpdateRegs(currentlySelectedSheet.id, regs)}
                onUpdateColunas={(cols) => handleUpdateCols(currentlySelectedSheet.id, cols)}
              />
            </div>

          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 space-y-4">
            
            {/* SEARCH FILTER BAR CONTROL */}
            <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 select-none">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Pesquisar planilhas pelo nome..."
                    className="pl-9 bg-slate-50 border border-slate-300 rounded-lg text-xs py-2 w-64 font-semibold outline-none focus:bg-white"
                  />
                </div>

                <div className="flex gap-1 bg-slate-100 p-1 rounded-lg text-[11px] font-bold">
                  <button 
                    onClick={() => setSelectedCategory('all')} 
                    className={`px-3 py-1.5 rounded transition ${selectedCategory === 'all' ? 'bg-white text-[#0A192F] shadow-xs' : 'text-slate-500'}`}
                  >
                    Todas
                  </button>
                  {CATEGORIAS_SUGERIDAS.slice(0, 5).map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setSelectedCategory(cat)} 
                      className={`px-3 py-1.5 rounded transition ${selectedCategory === cat ? 'bg-white text-[#0A192F] shadow-xs' : 'text-slate-500'}`}
                    >
                      {cat}
                    </button>
                  ))}
                  <select
                    value={CATEGORIAS_SUGERIDAS.includes(selectedCategory) && CATEGORIAS_SUGERIDAS.indexOf(selectedCategory) >= 5 ? selectedCategory : 'more'}
                    onChange={(e) => {
                      if (e.target.value !== 'more') setSelectedCategory(e.target.value);
                    }}
                    className="bg-transparent text-slate-500 font-bold px-1 select-none pr-1 focus:outline-none"
                  >
                    <option value="more">Outros...</option>
                    {CATEGORIAS_SUGERIDAS.slice(5).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={() => {
                  setNewSheetName('');
                  setIsWizardOpen(true);
                  setWizardStep(1);
                }}
                className="px-4 py-2.5 bg-[#0A192F] hover:bg-[#D4AF37] text-white hover:text-[#0A192F] transition font-bold text-xs rounded-xl flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Criar Nova Planilha</span>
              </button>
            </div>

            {/* DIRECTORY LISTING AS BENTO INTERFACE GRID */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredSpreadsheets.map((sheet) => {
                  return (
                    <div 
                      key={sheet.id}
                      className="bg-white border border-slate-200 hover:border-indigo-400 rounded-2xl shadow-xs hover:shadow transition-all duration-350 p-5 flex flex-col justify-between"
                    >
                      <div>
                        {/* Summary metrics header of individual row card */}
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[10px] font-extrabold tracking-widest uppercase py-0.5 px-2 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded select-none">
                            {sheet.categoria}
                          </span>
                          
                          {/* Options indicators */}
                          <div className="flex gap-1">
                            {sheet.promovido && (
                              <span className="p-1 text-amber-500 font-bold text-[9px] uppercase tracking-wide bg-amber-50 rounded" title="Promovido para Módulo principal">
                                ⭐ Promovido
                              </span>
                            )}
                            <button
                              onClick={() => handleDeleteSheet(sheet.id, sheet.nome)}
                              className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                              title="Deletar Planilha"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <h3 className="font-extrabold text-slate-800 text-sm leading-tight uppercase group-hover:text-indigo-600 mb-1">
                          {sheet.nome}
                        </h3>
                        
                        <p className="text-[11px] text-slate-500 font-medium">
                          Responsável principal do ILG: <strong>{sheet.responsavel}</strong>
                        </p>

                        <div className="my-3.5 h-px bg-slate-100" />

                        {/* Record count summary specs */}
                        <div className="grid grid-cols-2 gap-3 text-xs font-semibold my-4 select-none">
                          <div className="bg-slate-50/50 p-2 border border-slate-100 rounded-lg">
                            <span className="text-[9px] text-slate-400 font-bold block uppercase mb-0.5">Nº de Linhas</span>
                            <span className="text-[#0A192F] font-bold font-mono">{sheet.registros.length} registros</span>
                          </div>
                          <div className="bg-slate-50/50 p-2 border border-slate-100 rounded-lg text-right">
                            <span className="text-[9px] text-slate-400 font-bold block uppercase mb-0.5">Última alteração</span>
                            <span className="text-slate-600 font-mono">{sheet.ultimaAtualizacao}</span>
                          </div>
                        </div>
                      </div>

                      {/* Primary functional controls of bento panel cards */}
                      <div className="pt-2 flex gap-2">
                        <button
                          onClick={() => setSelectedSheetId(sheet.id)}
                          className="flex-1 py-2.5 bg-[#0A192F] text-white hover:bg-[#D4AF37] hover:text-[#0A192F] text-xs font-bold uppercase tracking-wider rounded-lg shadow-xs flex items-center justify-center gap-1 transition"
                        >
                          <Play className="w-3 h-3 fill-current shrink-0" />
                          <span>Abrir Planilha</span>
                        </button>

                        <button
                          onClick={() => {
                            const newName = prompt(`Insira o novo nome para "${sheet.nome}":`, sheet.nome);
                            if (newName && newName.trim()) {
                              const updated = spreadsheets.map(s => s.id === sheet.id ? { ...s, nome: newName.trim() } : s);
                              saveSpreadsheetsState(updated);
                            }
                          }}
                          className="px-3 py-2.5 border border-slate-200 text-[#0A192F] hover:bg-slate-50 transition rounded-lg text-xs font-bold"
                          title="Renomear planilha"
                        >
                          Renomear
                        </button>
                      </div>

                    </div>
                  );
                })}

                {filteredSpreadsheets.length === 0 && (
                  <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-dashed text-slate-400 text-sm font-semibold select-none">
                    Nenhuma planilha encontrada para os critérios de busca. Crie uma clicando em "Criar Nova Planilha".
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* MODAL 3: WIZARD FLOW CREATOR STEP MODALS */}
      {isWizardOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header step progress */}
            <div className="p-4.5 bg-slate-50 border-b border-light-200 flex justify-between items-center select-none shrink-0">
              <h3 className="font-bold text-sm text-[#0A192F] uppercase flex items-center gap-1.5">
                <FileSpreadsheet className="w-4.5 h-4.5 text-[#0A192F]" />
                <span>Assistente de Criação (Passo {wizardStep} de 3)</span>
              </h3>
              <div className="flex gap-1.5">
                <span className={`w-2 h-2 rounded-full ${wizardStep >= 1 ? 'bg-[#0A192F]' : 'bg-slate-200'}`} />
                <span className={`w-2 h-2 rounded-full ${wizardStep >= 2 ? 'bg-[#0A192F]' : 'bg-slate-200'}`} />
                <span className={`w-2 h-2 rounded-full ${wizardStep >= 3 ? 'bg-[#0A192F]' : 'bg-slate-200'}`} />
              </div>
            </div>

            {/* Scrollable step body contents */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-left">
              
              {/* STEP 1: CHOICE OF SOURCE STYLE */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <h4 className="text-xs uppercase font-extrabold text-slate-600 tracking-wide mb-1">Como você deseja iniciar sua nova planilha?</h4>
                  
                  <div className="grid grid-cols-1 gap-3 font-medium">
                    <label className={`p-4 border rounded-xl flex items-start gap-3.5 cursor-pointer transition ${
                      creationStyle === 'zero' ? 'border-[#0A192F] bg-indigo-50/20' : 'border-slate-200 hover:bg-slate-50/50'
                    }`}>
                      <input 
                        type="radio" 
                        name="creationStyle" 
                        checked={creationStyle === 'zero'}
                        onChange={() => setCreationStyle('zero')}
                        className="mt-1 text-[#0A192F]"
                      />
                      <div>
                        <span className="font-bold text-slate-800 text-xs block uppercase">Começar do absoluto zero</span>
                        <span className="text-[10px] text-slate-500">Defina você mesmo o nome, categoria e crie todas as colunas manualmente.</span>
                      </div>
                    </label>

                    <label className={`p-4 border rounded-xl flex items-start gap-3.5 cursor-pointer transition ${
                      creationStyle === 'modelo' ? 'border-[#0A192F] bg-indigo-50/20' : 'border-slate-200 hover:bg-slate-50/50'
                    }`}>
                      <input 
                        type="radio" 
                        name="creationStyle" 
                        checked={creationStyle === 'modelo'}
                        onChange={() => setCreationStyle('modelo')}
                        className="mt-1 text-[#0A192F]"
                      />
                      <div>
                        <span className="font-bold text-slate-800 text-xs block uppercase">Usar modelo operacional do ILG</span>
                        <span className="text-[10px] text-slate-500">Controle de Leads, Controle de Alunos, Pagamentos, Certificação, Suporte com colunas automatizadas.</span>
                      </div>
                    </label>

                    <label className={`p-4 border rounded-xl flex items-start gap-3.5 cursor-pointer transition ${
                      creationStyle === 'importar' ? 'border-[#0A192F] bg-indigo-50/20' : 'border-slate-200 hover:bg-slate-50/50'
                    }`}>
                      <input 
                        type="radio" 
                        name="creationStyle" 
                        checked={creationStyle === 'importar'}
                        onChange={() => setCreationStyle('importar')}
                        className="mt-1 text-[#0A192F]"
                      />
                      <div>
                        <span className="font-bold text-slate-800 text-xs block uppercase">Importar planilha antiga (CSV)</span>
                        <span className="text-[10px] text-slate-500">Fazer o upload, pré-visualizar dados mapeados e re-incorporar no sistema automaticamente.</span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* STEP 2: NAME, CATEGORY AND SOURCE SETTINGS */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  
                  {/* Common inputs */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1 uppercase">Nome da Planilha:</label>
                      <input 
                        type="text" 
                        value={newSheetName}
                        onChange={(e) => setNewSheetName(e.target.value)}
                        placeholder="Ex: Controle de Turma B MEC"
                        className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white font-medium outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1 uppercase">Responsável Interno:</label>
                      <select 
                        value={newSheetResponsavel}
                        onChange={(e) => setNewSheetResponsavel(e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white font-medium outline-none animate-none"
                      >
                        <option value="Nuria">Nuria (Suporte/Acompanhamento)</option>
                        <option value="Ana">Ana (SDR / Coordenador)</option>
                        <option value="Suellen">Suellen (Suporte Técnico)</option>
                        <option value="Liana Gomes">Liana Gomes (Geral)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1 uppercase">Categoria Operacional:</label>
                    <select 
                      value={newSheetCategory}
                      onChange={(e) => setNewSheetCategory(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white font-medium outline-none"
                    >
                      {CATEGORIAS_SUGERIDAS.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* If beginning from zero: manually list col definitions */}
                  {creationStyle === 'zero' && (
                    <div className="p-3.5 border border-slate-150 bg-slate-50/50 rounded-xl space-y-2">
                      <div className="flex justify-between items-center select-none border-b pb-1.5 mb-2">
                        <span className="text-[11px] font-bold text-[#0A192F] uppercase block">Seletor de Colunas Padrão</span>
                        <button
                          type="button"
                          onClick={() => setNewSheetColumns([...newSheetColumns, { key: `col_${Date.now()}`, label: 'Nova Coluna', type: 'texto_curto' }])}
                          className="text-[10px] text-indigo-650 font-bold hover:underline"
                        >
                          + Adicionar Coluna
                        </button>
                      </div>

                      <div className="space-y-2 max-h-44 overflow-y-auto pr-2">
                        {newSheetColumns.map((col, index) => (
                          <div key={index} className="flex gap-2 items-center">
                            <input 
                              type="text" 
                              value={col.label}
                              onChange={(e) => {
                                const list = [...newSheetColumns];
                                list[index].label = e.target.value;
                                list[index].key = e.target.value.toLowerCase().replace(/\s+/g, '_');
                                setNewSheetColumns(list);
                              }}
                              placeholder="Nome da Coluna"
                              className="flex-1 text-[11px] p-1.5 border border-slate-350 bg-white rounded"
                            />
                            
                            <select 
                              value={col.type}
                              onChange={(e) => {
                                const list = [...newSheetColumns];
                                list[index].type = e.target.value as any;
                                setNewSheetColumns(list);
                              }}
                              className="text-[11px] p-1.5 border border-slate-300 rounded bg-white"
                            >
                              <option value="texto_curto">Texto Curto</option>
                              <option value="moeda">Moeda</option>
                              <option value="data">Data</option>
                              <option value="rel_pessoa">Pessoa cadastrada</option>
                              <option value="status">Status</option>
                              <option value="checkbox">Checkbox</option>
                            </select>

                            <button 
                              type="button"
                              onClick={() => setNewSheetColumns(newSheetColumns.filter((_, i) => i !== index))}
                              className="p-1 text-slate-300 hover:text-red-500"
                            >
                              <XIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* If selecting template: model pick trigger */}
                  {creationStyle === 'modelo' && (
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1 uppercase">Selecione o Modelo ILG Prontificado:</label>
                      <select 
                        value={selectedTemplateId}
                        onChange={(e) => {
                          setSelectedTemplateId(e.target.value);
                          const chosen = PLANILHA_TEMPLATES.find(t => t.id === e.target.value);
                          if (chosen) {
                            setNewSheetName(chosen.nome);
                            setNewSheetCategory(chosen.categoria);
                          }
                        }}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white font-medium outline-none"
                      >
                        {PLANILHA_TEMPLATES.map(tpl => (
                          <option key={tpl.id} value={tpl.id}>{tpl.nome} ({tpl.colunas.length} colunas estruturadas)</option>
                        ))}
                      </select>

                      <div className="p-3 border border-indigo-100 bg-indigo-50/20 text-indigo-800 text-[11px] font-semibold rounded-xl mt-3 space-y-1">
                        <p className="font-extrabold uppercase text-indigo-950">Colunas deste modelo:</p>
                        <p className="leading-relaxed">
                          {PLANILHA_TEMPLATES.find(t => t.id === selectedTemplateId)?.colunas.map(c => c.label).join(' • ')}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* If importing CSV: show upload fields */}
                  {creationStyle === 'importar' && (
                    <div className="space-y-3.5">
                      <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl p-6 text-center transition">
                        <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <span className="text-[11px] font-extrabold text-slate-700 uppercase block mb-1">Upload de CSV de Leads/Alunos</span>
                        <input 
                          type="file" 
                          accept=".csv"
                          onChange={handleCSVUploadSimulate}
                          className="opacity-0 absolute w-0 h-0"
                          id="csv_picker_wizard"
                        />
                        <label 
                          htmlFor="csv_picker_wizard"
                          className="px-4 py-1.5 bg-indigo-650 text-white rounded text-xs font-bold cursor-pointer inline-block"
                        >
                          Escolher arquivo CSV
                        </label>
                        {csvFileName && (
                          <p className="text-[10px] text-indigo-700 font-bold mt-2">Mapeado: {csvFileName}</p>
                        )}
                      </div>

                      {csvHeaders.length > 0 && (
                        <div className="space-y-2">
                          <label className="text-[10px] font-extrabold text-slate-600 block uppercase">Mapear tipos de dados das colunas:</label>
                          <div className="max-h-36 overflow-y-auto border border-slate-150 rounded bg-slate-50 p-2 space-y-1.5 font-medium">
                            {csvHeaders.map(h => (
                              <div key={h} className="flex justify-between items-center text-xs">
                                <span className="text-slate-700">{h}</span>
                                <select
                                  value={csvColumnMapping[h] || 'texto_curto'}
                                  onChange={(e) => setCsvColumnMapping({...csvColumnMapping, [h]: e.target.value})}
                                  className="text-[10px] bg-white border rounded p-1"
                                >
                                  <option value="texto_curto">Texto Curto</option>
                                  <option value="telefone">Telefone</option>
                                  <option value="email">E-mail</option>
                                  <option value="status">Status</option>
                                  <option value="rel_pessoa">Pessoa</option>
                                </select>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}

              {/* STEP 3: PREVIEW METRICS AND INLINE CREATION REPORT */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-150 rounded-xl flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-xs uppercase text-emerald-950 mb-0.5">Tudo pronto para carregar!</h4>
                      <p className="text-[11px] leading-relaxed font-semibold">
                        Nossa central operacional validou a estrutura da tabela. Clique em "Confirmar Importação" para incorporar ao ILG Dashboard.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 border bg-stone-50 rounded-xl space-y-2 font-medium">
                    <h5 className="text-[11px] font-extrabold uppercase text-slate-400 select-none tracking-widest">Resumo Operacional</h5>
                    <ul className="text-xs text-slate-700 space-y-1.5">
                      <li>• Título oficial: <strong className="text-slate-900">{newSheetName || `Planilha de ${newSheetCategory}`}</strong></li>
                      <li>• Segmentação: <strong className="text-[#0A192F]">{newSheetCategory}</strong></li>
                      <li>• Responsável técnico: <strong>{newSheetResponsavel}</strong></li>
                      <li>
                        • Estrutura: <strong>{
                          creationStyle === 'zero' ? newSheetColumns.length :
                          creationStyle === 'modelo' ? PLANILHA_TEMPLATES.find(t=>t.id===selectedTemplateId)?.colunas.length :
                          csvHeaders.length
                        } colunas mapeadas</strong>
                      </li>
                      <li>
                        • Registros estimados: <strong>{
                          creationStyle === 'zero' ? '0 registros (vazia)' :
                          creationStyle === 'modelo' ? PLANILHA_TEMPLATES.find(t=>t.id===selectedTemplateId)?.defaultRecords.length :
                          csvFilePreview.length - (csvHasHeader ? 1 : 0)
                        } registros</strong>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

            </div>

            {/* Sticky wizard footer trigger bars */}
            <div className="p-4.5 bg-slate-50 border-t border-slate-150 flex gap-3 shrink-0">
              {wizardStep > 1 && (
                <button
                  type="button"
                  onClick={() => setWizardStep(prev => prev - 1)}
                  className="px-4 py-2.5 border border-slate-350 text-slate-500 font-bold text-xs uppercase tracking-wide rounded-lg"
                >
                  Voltar
                </button>
              )}

              {wizardStep < 3 ? (
                <button
                  type="button"
                  onClick={() => setWizardStep(prev => prev + 1)}
                  className="flex-1 py-1 px-4 text-[#0A192F] font-bold text-xs uppercase tracking-wider rounded-lg outline-none bg-[#D4AF37] hover:bg-yellow-500"
                >
                  Continuar →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleWizardSubmit}
                  className="flex-1 py-1.5 px-4 bg-[#0A192F] text-white hover:bg-slate-900 font-bold text-xs uppercase tracking-wider rounded-lg shadow"
                >
                  Confirmar Importação & Criar
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsWizardOpen(false)}
                className="px-4.5 py-2.5 border border-slate-200 hover:bg-slate-50 text-xs text-slate-400 font-bold uppercase rounded-lg"
              >
                Cancelar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* RULES / AUTOMATION EDIT MODAL */}
      {isRulesModalOpen && currentlySelectedSheet && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-sm p-5 space-y-4 text-left">
            <h3 className="font-extrabold text-xs text-[#0A192F] uppercase select-none flex items-center gap-1 border-b pb-2">
              <Zap className="w-4.5 h-4.5 text-amber-500 animate-bounce" />
              <span>Criar Nova Regra de Planilha</span>
            </h3>

            <div className="space-y-3 font-medium">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">SE O CAMPO:</label>
                <select
                  value={ruleField}
                  onChange={(e) => setRuleField(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white outline-none"
                >
                  {currentlySelectedSheet.colunas.map(c => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">FOR IGUAL A:</label>
                <input 
                  type="text" 
                  value={ruleValue}
                  onChange={(e) => setRuleValue(e.target.value)}
                  placeholder="Ex: Atrasado ou pendente"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">ENTÃO EXECUTAR AÇÃO AUTOMÁTICA:</label>
                <select
                  value={ruleAction}
                  onChange={(e) => setRuleAction(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white focus:outline-none"
                >
                  <option value="criar_tarefa">Criar Tarefa Interna de Cobrança para SDR</option>
                  <option value="alerta_dashboard">Gerar Alerta Vermelho crítico no Dashboard Principal</option>
                  <option value="aviso_onboarding">Adicionar pendência operacional no Onboarding Geral</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={handleAddRule}
                className="flex-1 py-2.5 bg-indigo-650 hover:bg-slate-900 text-white text-xs font-bold rounded-lg shadow"
              >
                Salvar Regra
              </button>
              <button
                onClick={() => setIsRulesModalOpen(false)}
                className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-xs text-slate-500 font-semibold rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Minimal Icons replacement missing in Lucide standard builds to stay safe:
function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
