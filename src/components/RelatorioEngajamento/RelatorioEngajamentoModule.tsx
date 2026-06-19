import React, { useState, useMemo } from 'react';
import { useStore } from '../../store';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target, 
  Percent, 
  ChevronRight, 
  Calendar, 
  Filter, 
  ArrowUpRight, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2, 
  Briefcase, 
  Layers, 
  Search, 
  SlidersHorizontal,
  Flame,
  ArrowRight,
  RefreshCw,
  X,
  PieChart,
  User,
  ExternalLink
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { cn } from '../../lib/utils';

interface OriginData {
  origem: string;
  totalLeads: number;
  conversoes: number;
  taxaConversao: number;
  temperaturaMedia: {
    quente: number;
    morno: number;
    frio: number;
  };
  produtos: Record<string, number>;
  statusFrequentes: Record<string, number>;
}

export function RelatorioEngajamentoModule() {
  const { data, updateSingleField } = useStore();
  const rawPessoas = data.pessoas || [];

  // Filter only elements that are qualified leads in the commercial module
  const leads = useMemo(() => {
    return rawPessoas.filter(
      p => 
        p.tipoPessoa === 'lead' || 
        p.tipoPessoa === 'em negociação' || 
        ['frio', 'morno', 'quente'].includes(p.temperatura)
    );
  }, [rawPessoas]);

  // UI Interactive States
  const [periodo, setPeriodo] = useState<'tudo' | 'mes' | '90dias' | '30dias'>('tudo');
  const [selectedProduto, setSelectedProduto] = useState<string>('todos');
  const [selectedResponsavel, setSelectedResponsavel] = useState<string>('todos');
  const [viewType, setViewType] = useState<'conversao' | 'volume'>('conversao');
  const [selectedOriginDetail, setSelectedOriginDetail] = useState<string | null>(null);
  const [searchLeadQuery, setSearchLeadQuery] = useState('');
  
  // Quick status edit helper
  const [editingLeadStatusId, setEditingLeadStatusId] = useState<string | null>(null);

  // Extract dynamic filters from real leads
  const produtosDisponiveis = useMemo(() => {
    const list = leads.map(l => l.produto).filter(Boolean);
    return ['todos', ...Array.from(new Set(list))];
  }, [leads]);

  const responsaveisDisponiveis = useMemo(() => {
    const list = leads.map(l => l.responsavel).filter(Boolean);
    return ['todos', ...Array.from(new Set(list))];
  }, [leads]);

  // Date threshold utility
  const matchesPeriod = (cadastroDateStr: string | undefined): boolean => {
    if (periodo === 'tudo' || !cadastroDateStr) return true;
    try {
      const cadDate = new Date(cadastroDateStr + 'T12:00:00');
      const diffTime = Math.abs(new Date().getTime() - cadDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (periodo === '30dias' && diffDays <= 30) return true;
      if (periodo === '90dias' && diffDays <= 90) return true;
      if (periodo === 'mes') {
        const today = new Date();
        return cadDate.getMonth() === today.getMonth() && cadDate.getFullYear() === today.getFullYear();
      }
      return false;
    } catch {
      return true;
    }
  };

  // Filtered Leads used for computation
  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      // Period
      if (!matchesPeriod(l.dataCadastro)) return false;
      // Product
      if (selectedProduto !== 'todos' && l.produto !== selectedProduto) return false;
      // Responsible
      if (selectedResponsavel !== 'todos' && l.responsavel !== selectedResponsavel) return false;
      return true;
    });
  }, [leads, periodo, selectedProduto, selectedResponsavel]);

  // Group and compute conversion metrics per Origin
  const originMetrics = useMemo(() => {
    const map: Record<string, OriginData> = {};
    
    // Core default origins from CRM selector to guarantee their listing
    const defaultOrigins = [
      'Tráfego Pago',
      'Instagram',
      'WhatsApp',
      'Google',
      'Indicação',
      'Site/Landing page'
    ];

    defaultOrigins.forEach(orig => {
      map[orig] = {
        origem: orig,
        totalLeads: 0,
        conversoes: 0,
        taxaConversao: 0,
        temperaturaMedia: { quente: 0, morno: 0, frio: 0 },
        produtos: {},
        statusFrequentes: {}
      };
    });

    filteredLeads.forEach(lead => {
      const orig = lead.origem || 'Outros ou Desconhecido';
      
      if (!map[orig]) {
        map[orig] = {
          origem: orig,
          totalLeads: 0,
          conversoes: 0,
          taxaConversao: 0,
          temperaturaMedia: { quente: 0, morno: 0, frio: 0 },
          produtos: {},
          statusFrequentes: {}
        };
      }

      const metrics = map[orig];
      metrics.totalLeads += 1;

      // Status 'comprou' means a confirmed converted student
      const rawStatus = (lead.status || '').toLowerCase().trim();
      const isConverted = rawStatus === 'comprou' || rawStatus === 'matriculada' || lead.tipoPessoa === 'aluna';
      if (isConverted) {
        metrics.conversoes += 1;
      }

      // Heat / Temperature
      const temp = (lead.temperatura || '').toLowerCase();
      if (temp === 'quente') metrics.temperaturaMedia.quente += 1;
      else if (temp === 'morno') metrics.temperaturaMedia.morno += 1;
      else metrics.temperaturaMedia.frio += 1;

      // Products
      if (lead.produto) {
        metrics.produtos[lead.produto] = (metrics.produtos[lead.produto] || 0) + 1;
      }

      // Status breakdown
      if (lead.status) {
        metrics.statusFrequentes[lead.status] = (metrics.statusFrequentes[lead.status] || 0) + 1;
      }
    });

    // Compute final rates and return sorted array
    return Object.values(map).map(item => {
      const rate = item.totalLeads > 0 ? (item.conversoes / item.totalLeads) * 100 : 0;
      return {
        ...item,
        taxaConversao: parseFloat(rate.toFixed(1))
      };
    }).sort((a, b) => {
      // Sort primarily by active view config (either highest conversion rate or volume)
      if (viewType === 'conversao') {
        return b.taxaConversao - a.taxaConversao || b.totalLeads - a.totalLeads;
      } else {
        return b.totalLeads - a.totalLeads || b.taxaConversao - a.taxaConversao;
      }
    });
  }, [filteredLeads, viewType]);

  // Overall KPIs
  const globalKpi = useMemo(() => {
    const totalLeadsCount = filteredLeads.length;
    const totalConversions = filteredLeads.filter(l => {
      const rawStatus = (l.status || '').toLowerCase().trim();
      return rawStatus === 'comprou' || rawStatus === 'matriculada' || l.tipoPessoa === 'aluna';
    }).length;
    
    const generalRate = totalLeadsCount > 0 ? (totalConversions / totalLeadsCount) * 100 : 0;

    // Lead temperatures overview
    const hotLeads = filteredLeads.filter(l => (l.temperatura || '').toLowerCase() === 'quente').length;
    const warmLeads = filteredLeads.filter(l => (l.temperatura || '').toLowerCase() === 'morno').length;
    const coldLeads = filteredLeads.filter(l => (l.temperatura || '').toLowerCase() === 'frio' || !l.temperatura).length;

    // Leader source
    const activeOriginsWithConversions = originMetrics.filter(o => o.totalLeads > 0);
    const leaderOrigem = activeOriginsWithConversions.reduce((best, cur) => {
      if (!best) return cur;
      return cur.taxaConversao > best.taxaConversao ? cur : best;
    }, null as OriginData | null);

    return {
      totalLeads: totalLeadsCount,
      conversoes: totalConversions,
      taxaConversao: generalRate.toFixed(1),
      hotCount: hotLeads,
      warmCount: warmLeads,
      coldCount: coldLeads,
      leader: leaderOrigem ? leaderOrigem.origem : 'Sem Dados',
      leaderRate: leaderOrigem ? leaderOrigem.taxaConversao : 0
    };
  }, [filteredLeads, originMetrics]);

  // Lead details mapped to currently selected Origin Row/Bar details
  const detailLeads = useMemo(() => {
    if (!selectedOriginDetail) return [];
    return filteredLeads
      .filter(l => {
        const orig = l.origem || 'Outros ou Desconhecido';
        return orig === selectedOriginDetail;
      })
      .filter(l => {
        if (!searchLeadQuery.trim()) return true;
        const q = searchLeadQuery.toLowerCase();
        return (
          (l.nome || '').toLowerCase().includes(q) ||
          (l.produto || '').toLowerCase().includes(q) ||
          (l.responsavel || '').toLowerCase().includes(q) ||
          (l.status || '').toLowerCase().includes(q)
        );
      });
  }, [filteredLeads, selectedOriginDetail, searchLeadQuery]);

  // Dynamic automatic strategic insights system
  const strategicInsights = useMemo(() => {
    const list: Array<{ tipo: 'sucesso' | 'alerta' | 'oportunidade'; titulo: string; desc: string }> = [];

    // 1. Success Origin
    const highestConv = [...originMetrics].filter(o => o.totalLeads >= 3).sort((a,b) => b.taxaConversao - a.taxaConversao)[0];
    if (highestConv && highestConv.taxaConversao > 35) {
      list.push({
        tipo: 'sucesso',
        titulo: `Alta conversão via ${highestConv.origem}`,
        desc: `O canal ${highestConv.origem} está entregando uma taxa de conversão excepcional de ${highestConv.taxaConversao}% (Mínimo de 3 leads). Considere amplificar as ações neste funil.`
      });
    }

    // 2. High volume, low conversion warning
    const highestVol = [...originMetrics].sort((a,b) => b.totalLeads - a.totalLeads)[0];
    if (highestVol && highestVol.totalLeads >= 5 && highestVol.taxaConversao < 15) {
      list.push({
        tipo: 'alerta',
        titulo: `Ajustar Tráfego/Alinhamento de ${highestVol.origem}`,
        desc: `O canal ${highestVol.origem} possui o maior volume absoluto de captação (${highestVol.totalLeads} leads), porém retém uma conversão baixa de ${highestVol.taxaConversao}%. Verifique a qualificação do público ou o roteiro comercial.`
      });
    }

    // 3. Opportunity with warm leads
    const strongWarmCount = originMetrics.find(o => o.temperaturaMedia.quente >= 2 && o.taxaConversao < 30);
    if (strongWarmCount) {
      list.push({
        tipo: 'oportunidade',
        titulo: `Leads quentes parados em ${strongWarmCount.origem}`,
        desc: `Identificados ${strongWarmCount.temperaturaMedia.quente} leads extremamente interessados ("quentes") vindos de ${strongWarmCount.origem}. Agende recontatos prioritários hoje para reaquecer a venda.`
      });
    }

    // Fallbacks if list is too short
    if (list.length === 0) {
      list.push({
        tipo: 'oportunidade',
        titulo: 'Fidelização & Indicação',
        desc: 'Incentive suas alunas atuais a indicarem novos contatos. Campanhas de indicação costumam registrar taxas de conversão acima de 50% devido à alta confiança transferida.'
      });
    }

    return list;
  }, [originMetrics]);

  // Handle immediate status update from within the micro table
  const handleUpdateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const isConversion = newStatus === 'comprou';
      const updatedFields: any = { status: newStatus };
      if (isConversion) {
        updatedFields.tipoPessoa = 'aluna';
      } else if (newStatus === 'novo' || newStatus === 'em negociação' || newStatus === 'em qualificação') {
        updatedFields.tipoPessoa = 'lead';
      }
      
      await updateSingleField('pessoas', leadId, updatedFields);
      setEditingLeadStatusId(null);
    } catch (err) {
      console.error("Falha ao salvar status do lead:", err);
    }
  };

  // Custom tooltips for Recharts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as OriginData;
      return (
        <div className="bg-[#0A192F] text-white p-3.5 rounded-xl border border-slate-700 shadow-xl font-sans text-xs space-y-2 select-none min-w-[200px]">
          <p className="font-extrabold text-[#D4AF37] text-sm border-b border-slate-700 pb-1 uppercase">{data.origem}</p>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            <span className="text-slate-400">Total Leads:</span>
            <span className="font-bold text-right">{data.totalLeads}</span>
            <span className="text-slate-400">Conversões:</span>
            <span className="font-bold text-right text-emerald-400">{data.conversoes}</span>
            <span className="text-slate-400">Taxa Conversão:</span>
            <span className="font-extrabold text-right text-amber-400 text-sm">{data.taxaConversao}%</span>
          </div>
          <div className="border-t border-slate-700/50 pt-1.5 flex justify-between gap-1 items-center">
            <span className="text-[10px] text-slate-400">Interesses quentes:</span>
            <span className="text-[10px] bg-red-500/20 text-red-400 font-bold px-1.5 py-0.5 rounded-full">{data.temperaturaMedia.quente}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto min-h-screen bg-stone-50/40">
      
      {/* Header section with Premium Brand Identity */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#0A192F] text-[#D4AF37] rounded-xl shadow-md">
              <BarChart3 className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-black tracking-widest text-[#D4AF37] uppercase font-mono">Instituto Liana Gomes</p>
              <h1 className="text-xl md:text-2xl font-black text-slate-850 tracking-tight font-sans mt-0.5">Relatório de Engajamento</h1>
            </div>
          </div>
          <p className="text-xs text-slate-550 mt-1 max-w-2xl font-medium">
            Monitore o retorno dos seus canais de aquisição comercial. Avalie quais origens de tráfego convertem mais leads qualificados em matrículas no Instituto.
          </p>
        </div>

        {/* Global Select Filters */}
        <div className="flex flex-wrap items-center gap-2 bg-white px-2 py-1.5 border border-slate-200 rounded-xl shadow-xs self-start md:self-auto shrink-0 select-none">
          {/* Period */}
          <div className="flex items-center gap-1.5 px-2">
            <Calendar className="w-3.5 h-3.5 text-slate-450" />
            <select 
              value={periodo} 
              onChange={(e) => setPeriodo(e.target.value as any)} 
              className="text-xs font-bold text-slate-700 bg-transparent border-none outline-none focus:ring-0 cursor-pointer"
            >
              <option value="tudo">Todo o Histórico</option>
              <option value="mes">Este Mês</option>
              <option value="30dias">Últimos 30 Dias</option>
              <option value="90dias">Últimos 90 Dias</option>
            </select>
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          {/* Dynamic products */}
          <div className="flex items-center gap-1.5 px-2">
            <Filter className="w-3.5 h-3.5 text-slate-450" />
            <select 
              value={selectedProduto} 
              onChange={(e) => setSelectedProduto(e.target.value)} 
              className="text-xs font-bold text-slate-700 bg-transparent border-none outline-none focus:ring-0 cursor-pointer max-w-[120px] truncate"
            >
              <option value="todos">Todos os Produtos</option>
              {produtosDisponiveis.filter(p => p !== 'todos').map((prod) => (
                <option key={prod} value={prod}>{prod}</option>
              ))}
            </select>
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          {/* Dynamic responsible */}
          <div className="flex items-center gap-1.5 px-2">
            <User className="w-3.5 h-3.5 text-slate-450" />
            <select 
              value={selectedResponsavel} 
              onChange={(e) => setSelectedResponsavel(e.target.value)} 
              className="text-xs font-bold text-slate-700 bg-transparent border-none outline-none focus:ring-0 cursor-pointer max-w-[120px] truncate"
            >
              <option value="todos">Todas Vendedoras</option>
              {responsaveisDisponiveis.filter(r => r !== 'todos').map((resp) => (
                <option key={resp} value={resp}>{resp}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Leads */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-450 tracking-wider uppercase font-mono">Leads Monitorados</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black text-slate-800 leading-none">{globalKpi.totalLeads}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[9px] bg-slate-100 text-slate-650 font-extrabold px-1.5 py-0.5 rounded-full uppercase leading-none">
                Filtrados
              </span>
              <span className="text-[10px] text-slate-450 font-medium">no período selecionado</span>
            </div>
          </div>
        </div>

        {/* Total Conversions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-450 tracking-wider uppercase font-mono">Matrículas Realizadas</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black text-slate-800 leading-none">{globalKpi.conversoes}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[9px] bg-emerald-50 text-emerald-750 font-extrabold px-1.5 py-0.5 rounded-full uppercase leading-none">
                Sucesso
              </span>
              <span className="text-[10px] text-slate-450 font-medium">compras efetivadas</span>
            </div>
          </div>
        </div>

        {/* Global Conversion Rate */}
        <div className="bg-[#0A192F] text-white rounded-2xl p-4.5 shadow-md relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-24 h-24 bg-slate-700/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-[#D4AF37] tracking-wider uppercase font-mono">Taxa de Conversão</span>
            <div className="p-1.5 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37]">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black text-amber-100 leading-none">{globalKpi.taxaConversao}%</p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[9px] bg-[#D4AF37] text-slate-900 font-extrabold px-1.5 py-0.5 rounded-full uppercase leading-none">
                Geral
              </span>
              <span className="text-[10px] text-slate-350 font-medium">conversão média</span>
            </div>
          </div>
        </div>

        {/* Leader Segment origin */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-450 tracking-wider uppercase font-mono">Melhor Canal</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
              <Sparkles className="w-4 h-4 animate-bounce" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-base font-black text-slate-800 leading-tight truncate uppercase">{globalKpi.leader}</p>
            <div className="flex items-center gap-1.5 mt-2.5">
              <span className="text-[9px] bg-amber-100 text-amber-750 font-extrabold px-1.5 py-0.5 rounded-full uppercase leading-none">
                Conversão
              </span>
              <span className="text-[10px] text-slate-500 font-bold">{globalKpi.leaderRate}% de taxa</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Core Area: Bar Chart & Detailed Origin List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (9 cols for detailed charts, or 7 cols to keep layout balanced) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50/50 select-none">
            <div>
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#D4AF37]" /> Desempenho por Canal de Captação
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Analise a conversão relativa ou volume bruto coletado em cada origem.</p>
            </div>
            
            {/* View toggle */}
            <div className="flex bg-slate-100 p-1 rounded-lg self-start sm:self-auto shrink-0 gap-1">
              <button
                type="button"
                onClick={() => setViewType('conversao')}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[10px] font-black uppercase transition",
                  viewType === 'conversao' ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
                )}
              >
                Taxa Conversão (%)
              </button>
              <button
                type="button"
                onClick={() => setViewType('volume')}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[10px] font-black uppercase transition",
                  viewType === 'volume' ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
                )}
              >
                Volume Absoluto
              </button>
            </div>
          </div>

          <div className="p-6 flex-1 min-h-[340px] flex flex-col justify-center">
            {originMetrics.filter(o => o.totalLeads > 0).length === 0 ? (
              <div className="text-center py-20 bg-stone-50/20 rounded-xl border border-dashed border-slate-200 m-4 flex flex-col items-center justify-center space-y-2 select-none">
                <span className="text-3xl">🏜️</span>
                <p className="text-xs font-black text-slate-700">Nenhum dado comercial localizado</p>
                <p className="text-[10px] text-slate-450 max-w-[280px]">Para ver este relatório funcionar, selecione um período com mais leads ou registre novos contatos com seus devidos canais de origem no Módulo Comercial.</p>
              </div>
            ) : (
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={originMetrics.filter(o => o.totalLeads > 0)}
                    margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis 
                      dataKey="origem" 
                      stroke="#475569" 
                      fontSize={10} 
                      fontStyle="bold" 
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="#475569" 
                      fontSize={10} 
                      tickLine={false}
                      tickFormatter={(value) => viewType === 'conversao' ? `${value}%` : `${value} L`}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#D4AF37', opacity: 0.05 }} />
                    <Bar 
                      dataKey={viewType === 'conversao' ? "taxaConversao" : "totalLeads"} 
                      radius={[6, 6, 0, 0]}
                      barSize={40}
                      onClick={(data) => {
                        if (data && data.origem) {
                          setSelectedOriginDetail(data.origem === selectedOriginDetail ? null : data.origem);
                        }
                      }}
                      className="cursor-pointer"
                    >
                      {originMetrics.filter(o => o.totalLeads > 0).map((entry, index) => {
                        // Dynamically color channels depending on view mode or performance
                        let barColor = "#1d4e89"; // Slate primary
                        if (viewType === 'conversao') {
                          if (entry.taxaConversao >= 40) barColor = "#10B981"; // Strong green
                          else if (entry.taxaConversao >= 20) barColor = "#F59E0B"; // Warm Gold/Amber
                          else barColor = "#EF4444"; // Low red
                        } else {
                          // Colored based on ranking
                          barColor = index === 0 ? "#0A192F" : index === 1 ? "#1F4E89" : "#4A709C";
                        }

                        // Highlight currently selected detail bar
                        const isSelected = selectedOriginDetail === entry.origem;
                        const finalColor = isSelected ? "#D4AF37" : barColor;

                        return (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={finalColor} 
                            style={{ 
                              filter: isSelected ? 'drop-shadow(0px 0px 8px rgba(212,175,55,0.45))' : 'none',
                              transition: 'all 0.15s ease'
                            }} 
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            
            <div className="px-4 py-3 bg-stone-550/5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-bold select-none">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-md block shrink-0" /> Conversão ≥ 40%
                <span className="w-2.5 h-2.5 bg-amber-500 rounded-md block shrink-0 ml-2" /> Conversão 20%-39%
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-md block shrink-0 ml-2" /> Conversão &lt; 20%
              </span>
              <span className="text-slate-400 italic">Dica: clique em uma barra para filtrar as alunas</span>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols for precise textual details & insights) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Detailed Lists per Origin */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5 flex flex-col justify-between">
            <div className="pb-3 border-b border-slate-100 select-none">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#D4AF37]" /> Ranking Detalhado de Origens
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Visão numérica e conversão percentual de cada canal ativo.</p>
            </div>

            <div className="divide-y divide-slate-100 mt-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1 space-y-3 pt-1">
              {originMetrics.map((item, idx) => {
                const hasLeads = item.totalLeads > 0;
                const isSelected = selectedOriginDetail === item.origem;

                return (
                  <button
                    key={item.origem}
                    type="button"
                    onClick={() => setSelectedOriginDetail(isSelected ? null : item.origem)}
                    className={cn(
                      "w-full text-left p-3 rounded-xl transition flex flex-col gap-2 cursor-pointer focus:outline-none",
                      isSelected ? "bg-amber-50/40 border border-amber-200/55" : "hover:bg-slate-50 border border-transparent"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-extrabold text-slate-400 font-mono w-4">#{idx+1}</span>
                        <span className="text-xs font-black text-slate-800 truncate uppercase tracking-tight">{item.origem}</span>
                        {isSelected && (
                          <span className="text-[8px] bg-amber-550 text-white font-extrabold px-1.5 py-0.2 rounded-full uppercase scale-90">Filtrado</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-500 font-mono">{item.conversoes}/{item.totalLeads} L</span>
                        <span className={cn(
                          "text-[10px] font-black px-2 py-0.5 rounded-full font-mono",
                          item.taxaConversao >= 40 ? "bg-emerald-50 text-emerald-700" :
                          item.taxaConversao >= 20 ? "bg-amber-50 text-amber-700" :
                          hasLeads ? "bg-rose-50 text-rose-700" : "bg-slate-50 text-slate-400"
                        )}>
                          {item.taxaConversao}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar of Conversion Rate */}
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          item.taxaConversao >= 40 ? "bg-emerald-500" :
                          item.taxaConversao >= 20 ? "bg-amber-500" : "bg-rose-500"
                        )}
                        style={{ width: `${Math.min(item.taxaConversao, 100)}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
            
            {selectedOriginDetail && (
              <button
                type="button"
                onClick={() => setSelectedOriginDetail(null)}
                className="w-full mt-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black text-center rounded-xl transition uppercase cursor-pointer"
              >
                Limpar Filtro Selecionado
              </button>
            )}
          </div>

          {/* Strategic AI Insights / Recomendações do Instituto */}
          <div className="bg-gradient-to-br from-[#0A192F] to-[#1E2E4A] text-white rounded-2xl p-5 shadow-md flex-1 flex flex-col justify-between">
            <div className="select-none">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37] animate-pulse" />
                <h3 className="text-xs font-black tracking-wider text-[#D4AF37] uppercase font-mono">Diretrizes de Engajamento Comercial</h3>
              </div>
              <p className="text-[11px] text-slate-300 mt-1">Análise automatizada de gargalos de vendas e sugestões executivas.</p>
            </div>

            <div className="space-y-3.5 mt-4">
              {strategicInsights.map((ins, idx) => (
                <div key={idx} className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">
                      {ins.tipo === 'sucesso' ? '🚀' : ins.tipo === 'alerta' ? '⚠️' : '💡'}
                    </span>
                    <h4 className="text-xs font-black text-amber-100 tracking-tight">{ins.titulo}</h4>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-relaxed font-medium">{ins.desc}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-3 mt-4 text-[9px] text-[#D4AF37] font-bold font-mono tracking-wider select-none text-right">
              RECOMENDAÇÕES EXECUTIVAS • PORTAL LIANA GOMES
            </div>
          </div>

        </div>

      </div>

      {/* Selected Channel Lead Inspector (Rendered in real-time beneath chart or activated row selection) */}
      <AnimatePresence>
        {selectedOriginDetail && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.2 }}
            className="bg-white border-2 border-[#D4AF37]/35 rounded-2xl p-5 shadow-md space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2 select-none">
                  <span className="text-lg">🎯</span>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                    Inspetor de Alunas & Leads originários de <span className="text-indigo-850 underline decoration-[#D4AF37] decoration-2">{selectedOriginDetail}</span>
                  </h3>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Modifique os status das leads ou reforce a priorização de contato diretamente por aqui.</p>
              </div>

              {/* Inspector Search */}
              <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl max-w-xs w-full self-start sm:self-auto">
                <Search className="w-3.5 h-3.5 text-slate-450 shrink-0" />
                <input
                  type="text"
                  value={searchLeadQuery}
                  onChange={(e) => setSearchLeadQuery(e.target.value)}
                  placeholder="Buscar lead na lista..."
                  className="bg-transparent border-none outline-none text-xs text-slate-850 w-full placeholder-slate-450 focus:ring-0"
                />
                {searchLeadQuery && (
                  <button type="button" onClick={() => setSearchLeadQuery('')}>
                    <X className="w-3 h-3 text-slate-450 hover:text-slate-700" />
                  </button>
                )}
              </div>
            </div>

            {/* Micro Table of Inspector */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-stone-50/50">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0A192F] text-[#D4AF37] text-[10px] font-black uppercase font-mono border-b border-slate-700 select-none">
                    <th className="p-3">Lead / Nome</th>
                    <th className="p-3">Produto Interessado</th>
                    <th className="p-3">Temperatura</th>
                    <th className="p-3">Vendedora</th>
                    <th className="p-3">Cadastro</th>
                    <th className="p-3">Status Funil</th>
                    <th className="p-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-250">
                  {detailLeads.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-xs text-slate-500 select-none">
                        Nenhum lead correspondentes com "{searchLeadQuery}" nesta origem.
                      </td>
                    </tr>
                  ) : (
                    detailLeads.map(lead => {
                      const temp = (lead.temperatura || '').toLowerCase();
                      const status = (lead.status || 'novo').toLowerCase();

                      return (
                        <tr key={lead.id} className="hover:bg-slate-50 text-xs font-semibold text-slate-850 transition-colors">
                          <td className="p-3">
                            <div>
                              <p className="font-extrabold text-slate-900">{lead.nome}</p>
                              {lead.email && <p className="text-[10px] text-slate-450 tracking-wide font-normal">{lead.email}</p>}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="text-slate-750">{lead.produto || 'Não informado'}</span>
                          </td>
                          <td className="p-3 select-none">
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 w-max",
                              temp === 'quente' ? "bg-red-100 text-red-800 border border-red-300" :
                              temp === 'morno' ? "bg-amber-100 text-amber-800 border border-amber-300" :
                              "bg-indigo-100 text-indigo-800 border border-indigo-300"
                            )}>
                              <Flame className="w-2.5 h-2.5" /> {temp || 'frio'}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-slate-700 bg-slate-200/50 px-1.5 py-0.5 rounded uppercase text-[9px]">{lead.responsavel || 'Desconectado'}</span>
                          </td>
                          <td className="p-3 text-slate-500 font-mono text-[10px]">
                            {lead.dataCadastro ? new Date(lead.dataCadastro + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}
                          </td>
                          <td className="p-3">
                            {editingLeadStatusId === lead.id ? (
                              <select
                                value={lead.status || 'novo'}
                                onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value)}
                                onBlur={() => setEditingLeadStatusId(null)}
                                autoFocus
                                className="border border-slate-350 rounded px-2.5 py-1 text-xs outline-none bg-white text-slate-800 font-extrabold focus:ring-1 focus:ring-indigo-500"
                              >
                                <option value="novo">Novo Lead</option>
                                <option value="em qualificação">Em Qualificação</option>
                                <option value="em negociação">Em Negociação</option>
                                <option value="comprou">Comprou (Aluno)</option>
                                <option value="perdido">Perdido</option>
                              </select>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setEditingLeadStatusId(lead.id)}
                                className={cn(
                                  "px-2.5 py-1 rounded-md text-[10px] font-black uppercase text-left transition hover:ring-1 hover:ring-indigo-300",
                                  status === 'comprou' ? "bg-emerald-100 text-emerald-800" :
                                  status === 'perdido' ? "bg-rose-100 text-rose-800" :
                                  "bg-slate-150 text-slate-700"
                                )}
                              >
                                {lead.status || 'novo'} ✏️
                              </button>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Quick conversion success button */}
                              {status !== 'comprou' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateLeadStatus(lead.id, 'comprou')}
                                  className="p-1 px-2 bg-emerald-500 hover:bg-emerald-600 border border-emerald-600 text-white rounded text-[9px] font-black uppercase tracking-wide leading-none transition shadow-2xs"
                                  title="Marcar como Comprou / Matriculado"
                                >
                                  Comprou ✅
                                </button>
                              )}
                              
                              {/* Open detail view placeholder or simple reminder */}
                              <button
                                type="button"
                                onClick={() => {
                                  // Find the dispatch or simple state trigger to inspect lead Ficha
                                  // Since layouts support onSelectPessoa/fichaPessoa in standard scope, we can simulate dispatch or remind users
                                  alert(`Informações completas do lead "${lead.nome}" podem ser administradas e consultadas com detalhes profundos dentro da "Base de Pessoas" ou no "Funil Comercial".`);
                                }}
                                className="p-1 text-slate-600 hover:text-[#0A192F] hover:bg-slate-200 rounded transition"
                                title="Ver Ficha Única no Portal"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-indigo-50 text-indigo-900 text-[11px] font-black tracking-wide rounded-xl flex items-center gap-1.5 select-none">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>O Portal de Vendas do Instituto atualiza em tempo real. Qualquer alteração ou conversão consolidada neste formulário ajusta instantaneamente os gráficos de barras e relatórios acima!</span>
            </div>
            
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
