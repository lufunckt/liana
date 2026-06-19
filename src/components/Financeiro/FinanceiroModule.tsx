import React, { useState, useMemo } from 'react';
import { useStore } from '../../store';
import { 
  DollarSign, 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  MessageSquare, 
  ExternalLink, 
  Filter, 
  Check, 
  X, 
  TrendingUp, 
  Calendar,
  ChevronRight,
  FileText,
  Activity,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { logAuditEvent } from '../../lib/audit';

export function FinanceiroModule() {
  const { data, updateModuleData } = useStore();
  const pagamentos = data.pagamentos || [];

  // Value formatting helper hoisted to top
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Handler to generate and download a beautifully crafted PDF summary report for the current month
  const handleGeneratePDF = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const mesNomeOpt = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const nomeMesAtual = mesNomeOpt[currentMonth];

    // Filter current month payments
    const currentMonthPayments = pagamentos.filter((p: any) => {
      if (!p.vencimento) return false;
      const dateParts = p.vencimento.split('-'); // YYYY-MM-DD
      if (dateParts.length !== 3) return false;
      const pYear = parseInt(dateParts[0], 10);
      const pMonth = parseInt(dateParts[1], 10) - 1; // 0-based index
      return pYear === currentYear && pMonth === currentMonth;
    });

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Calculate stats for current month
    let totalRecebido = 0;
    let totalPendente = 0;
    let totalAtrasado = 0;

    currentMonthPayments.forEach((p: any) => {
      const val = parseFloat(p.valorCombinado) || 0;
      if (p.status === 'pago') {
        totalRecebido += val;
      } else if (p.status === 'atrasado') {
        totalAtrasado += val;
      } else {
        totalPendente += val;
      }
    });

    const totalGeral = totalRecebido + totalPendente + totalAtrasado;
    const taxaAdimplencia = totalGeral > 0 ? Math.round((totalRecebido / totalGeral) * 100) : 100;

    // Header segment background
    doc.setFillColor(10, 25, 47); // Dark Navy #0A192F
    doc.rect(0, 0, 210, 38, 'F');

    // Title / branding block
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('INSTITUTO LIANA GOMES', 15, 15);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(212, 175, 55); // Brand Gold #D4AF37
    doc.text('Relatório Integrado de Gestão Financeira & Cobrança', 15, 21);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(180, 190, 200);
    doc.text(`Emitido em: ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`, 15, 29);

    // Month & Year Indicator card
    doc.setFillColor(212, 175, 55); // Gold
    doc.rect(135, 10, 60, 18, 'F');
    
    doc.setTextColor(10, 25, 47); // Navy text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('PERÍODO DE CONTROLE', 138, 15);
    
    doc.setFontSize(11);
    doc.text(`${nomeMesAtual.toUpperCase()} / ${currentYear}`, 138, 22);

    // Metric cards (Y = 48)
    const startY = 48;
    const colWidth = 44;
    const spacing = 4;
    const xOffset = 15;

    // Card 1: Received Amount
    doc.setFillColor(243, 249, 245); // Soft green
    doc.setDrawColor(210, 230, 215);
    doc.roundedRect(xOffset, startY, colWidth, 20, 2, 2, 'FD');
    doc.setTextColor(30, 95, 60);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('RECEBIDO NO MÊS', xOffset + 3, startY + 5);
    doc.setFontSize(9.5);
    doc.text(formatCurrency(totalRecebido), xOffset + 3, startY + 12);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(`${currentMonthPayments.filter(p => p.status === 'pago').length} parcelas liquidas`, xOffset + 3, startY + 17);

    // Card 2: To Receive (Pendente/Parcial)
    const xBox2 = xOffset + colWidth + spacing;
    doc.setFillColor(254, 249, 237); // Soft amber
    doc.setDrawColor(253, 235, 190);
    doc.roundedRect(xBox2, startY, colWidth, 20, 2, 2, 'FD');
    doc.setTextColor(160, 95, 10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('PROJETADO (A VENCER)', xBox2 + 3, startY + 5);
    doc.setFontSize(9.5);
    doc.text(formatCurrency(totalPendente), xBox2 + 3, startY + 12);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(`${currentMonthPayments.filter(p => p.status === 'pendente' || p.status === 'parcial').length} parcelas em aberto`, xBox2 + 3, startY + 17);

    // Card 3: Overdue Amount
    const xBox3 = xBox2 + colWidth + spacing;
    doc.setFillColor(254, 242, 242); // Soft rose
    doc.setDrawColor(254, 215, 215);
    doc.roundedRect(xBox3, startY, colWidth, 20, 2, 2, 'FD');
    doc.setTextColor(175, 25, 25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('ATRASO ATIVO NO MÊS', xBox3 + 3, startY + 5);
    doc.setFontSize(9.5);
    doc.text(formatCurrency(totalAtrasado), xBox3 + 3, startY + 12);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(`${currentMonthPayments.filter(p => p.status === 'atrasado').length} em atraso`, xBox3 + 3, startY + 17);

    // Card 4: Receipt rate
    const xBox4 = xBox3 + colWidth + spacing;
    doc.setFillColor(240, 246, 254); // Soft blue
    doc.setDrawColor(215, 225, 248);
    doc.roundedRect(xBox4, startY, colWidth, 20, 2, 2, 'FD');
    doc.setTextColor(15, 55, 130);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('ADIMPLÊNCIA MENSAL', xBox4 + 3, startY + 5);
    doc.setFontSize(9.5);
    doc.text(`${taxaAdimplencia}%`, xBox4 + 3, startY + 12);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    if (totalGeral > 0) {
      doc.text(`De ${formatCurrency(totalGeral)} esperados`, xBox4 + 3, startY + 17);
    } else {
      doc.text('Nenhum previsto', xBox4 + 3, startY + 17);
    }

    // Line separator
    doc.setDrawColor(220, 225, 230);
    doc.line(15, 74, 195, 74);

    // Detailed table header intro
    doc.setTextColor(10, 25, 47);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`DEMONSTRATIVO DETALHADO - MÊS DE REFERÊNCIA`, 15, 81);

    // Format tabular data
    const tableData = currentMonthPayments.length > 0
      ? currentMonthPayments.map((p: any) => {
          const valStr = formatCurrency(parseFloat(p.valorCombinado) || 0);
          const rawDate = p.vencimento ? new Date(p.vencimento + 'T12:00:00') : null;
          const dateStr = rawDate ? rawDate.toLocaleDateString('pt-BR') : '-';
          let labelStatus = 'A Vencer';
          if (p.status === 'pago') labelStatus = 'Pago';
          if (p.status === 'atrasado') labelStatus = 'Em Atraso';
          if (p.status === 'parcial') labelStatus = 'Parcial';

          return [
            p.aluno || 'Aluna não identificada',
            p.formacao || 'Curso não identificado',
            valStr,
            labelStatus,
            dateStr,
            p.responsavel || 'Equipe'
          ];
        })
      : [['-', 'Sem lançamentos financeiros agendados ou registrados para este mês de referência.', '-', '-', '-', '-']];

    // Trigger autoTable using extended or functional API safely
    autoTable(doc, {
      startY: 85,
      margin: { left: 15, right: 15 },
      head: [['Aluna', 'Formação / Programa', 'Valor', 'Status', 'Data Venc.', 'Responsável']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [10, 25, 47], // Matching branding dark blue (#0A192F)
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'left'
      },
      styles: {
        fontSize: 8,
        font: 'helvetica',
        cellPadding: 2.5
      },
      columnStyles: {
        2: { fontStyle: 'bold', halign: 'right' },
        3: { fontStyle: 'bold' },
        4: { halign: 'center' }
      },
      didParseCell: (dataCell) => {
        if (dataCell.section === 'body' && dataCell.column.index === 3) {
          const cellVal = dataCell.cell.raw;
          if (cellVal === 'Pago') {
            dataCell.cell.styles.textColor = [30, 95, 60];      // Green
          } else if (cellVal === 'Em Atraso') {
            dataCell.cell.styles.textColor = [175, 25, 25];     // Red
          } else if (cellVal === 'Parcial') {
            dataCell.cell.styles.textColor = [100, 30, 150];    // Purple
          } else if (cellVal === 'A Vencer') {
            dataCell.cell.styles.textColor = [160, 95, 10];     // Amber/Gold
          }
        }
      }
    });

    // Page decoration & details
    const pageCount = (doc as any).getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7.5);
      doc.setTextColor(140, 145, 155);
      doc.text('Instituto Liana Gomes • Governança, Transparência & Desenvolvimento', 15, 287);
      doc.text(`Página ${i} de ${pageCount}`, 195, 287, { align: 'right' });
    }

    const filename = `demonstrativo-mensal-${nomeMesAtual.toLowerCase()}-${currentYear}.pdf`;
    doc.save(filename);
  };

  const handleExportFilteredPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const now = new Date();
    
    // Header background
    doc.setFillColor(10, 25, 47); // Dark Navy #0A192F
    doc.rect(0, 0, 210, 38, 'F');

    // Branding (Instituto Liana Gomes Style)
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('INSTITUTO LIANA GOMES', 15, 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(212, 175, 55); // Gold #D4AF37
    doc.text('Relatório Personalizado de Lançamentos Financeiros (Filtros Ativos)', 15, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(170, 180, 190);
    doc.text(`Emitido em: ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`, 15, 27);

    // Active filters label box
    doc.setFillColor(255, 255, 255, 0.15); // Transparent white overlay
    doc.roundedRect(132, 8, 63, 22, 1.5, 1.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('FILTROS DA TELA ATIVA', 135, 13);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(`Busca: ${search ? `"${search}"` : 'Tudo'}`, 135, 17.5);
    doc.text(`Status: ${statusFilter ? statusFilter.toUpperCase() : 'Todos'}`, 135, 21.5);
    doc.text(`Curso: ${formacaoFilter ? formacaoFilter : 'Todos'}`, 135, 25.5);

    // Summary calculation for CURRENT FILTERED LIST OF PAYMENTS
    let totalPagoFiltrado = 0;
    let totalPendenteFiltrado = 0;
    let totalAtrasadoFiltrado = 0;

    filteredPagamentos.forEach((p: any) => {
      const val = parseFloat(p.valorCombinado) || 0;
      if (p.status === 'pago') {
        totalPagoFiltrado += val;
      } else if (p.status === 'atrasado') {
        totalAtrasadoFiltrado += val;
      } else {
        totalPendenteFiltrado += val;
      }
    });

    // Metrics Box section on PDF (Y = 45)
    const cardY = 45;
    const boxW = 58;
    const boxG = 4.5;
    const leftMargin = 15;

    // Card 1: Pago
    doc.setFillColor(243, 249, 245);
    doc.setDrawColor(210, 230, 215);
    doc.roundedRect(leftMargin, cardY, boxW, 16, 1.5, 1.5, 'FD');
    doc.setTextColor(30, 95, 60);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('TOTAL PAGO (FILTRADO)', leftMargin + 3.5, cardY + 5);
    doc.setFontSize(9);
    doc.text(formatCurrency(totalPagoFiltrado), leftMargin + 3.5, cardY + 11.5);

    // Card 2: Pendente
    const xCard2 = leftMargin + boxW + boxG;
    doc.setFillColor(254, 249, 237);
    doc.setDrawColor(253, 235, 190);
    doc.roundedRect(xCard2, cardY, boxW, 16, 1.5, 1.5, 'FD');
    doc.setTextColor(160, 95, 10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('A VENCER / PARCIAL', xCard2 + 3.5, cardY + 5);
    doc.setFontSize(9);
    doc.text(formatCurrency(totalPendenteFiltrado), xCard2 + 3.5, cardY + 11.5);

    // Card 3: Atrasado
    const xCard3 = xCard2 + boxW + boxG;
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(254, 215, 215);
    doc.roundedRect(xCard3, cardY, boxW, 16, 1.5, 1.5, 'FD');
    doc.setTextColor(175, 25, 25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('ATRASADO (FILTRADO)', xCard3 + 3.5, cardY + 5);
    doc.setFontSize(9);
    doc.text(formatCurrency(totalAtrasadoFiltrado), xCard3 + 3.5, cardY + 11.5);

    doc.setDrawColor(225, 230, 235);
    doc.line(15, 67, 195, 67);

    // Table view
    doc.setTextColor(10, 25, 47);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(`LANÇAMENTOS EXIBIDOS NA TELA (${filteredPagamentos.length} registros)`, 15, 73);

    const tableRows = filteredPagamentos.map((p: any) => {
      const formattedVal = formatCurrency(parseFloat(p.valorCombinado) || 0);
      const rawDate = p.vencimento ? new Date(p.vencimento + 'T12:00:00') : null;
      const dateStr = rawDate ? rawDate.toLocaleDateString('pt-BR') : '-';
      let statusLabel = 'A Vencer';
      if (p.status === 'pago') statusLabel = 'Pago';
      if (p.status === 'atrasado') statusLabel = 'Em Atraso';
      if (p.status === 'parcial') statusLabel = 'Parcial';

      return [
        p.aluno || 'Aluna não identificada',
        p.formacao || 'Curso não cadastrado',
        formattedVal,
        statusLabel,
        dateStr,
        p.responsavel || 'Equipe'
      ];
    });

    if (tableRows.length === 0) {
      tableRows.push(['-', 'Nenhum lançamento financeiro corresponde aos filtros aplicados em tela.', '-', '-', '-', '-']);
    }

    autoTable(doc, {
      startY: 77,
      margin: { left: 15, right: 15 },
      head: [['Aluna', 'Formação / Programa', 'Valor', 'Status', 'Vencimento', 'Responsável']],
      body: tableRows,
      theme: 'grid',
      headStyles: {
        fillColor: [10, 25, 47],
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: 'bold',
        halign: 'left'
      },
      styles: {
        fontSize: 7.5,
        font: 'helvetica',
        cellPadding: 2.2
      },
      columnStyles: {
        2: { fontStyle: 'bold', halign: 'right' },
        3: { fontStyle: 'bold' },
        4: { halign: 'center' }
      },
      didParseCell: (dataCell) => {
        if (dataCell.section === 'body' && dataCell.column.index === 3) {
          const cellVal = dataCell.cell.raw;
          if (cellVal === 'Pago') {
            dataCell.cell.styles.textColor = [30, 95, 60];
          } else if (cellVal === 'Em Atraso') {
            dataCell.cell.styles.textColor = [175, 25, 25];
          } else if (cellVal === 'Parcial') {
            dataCell.cell.styles.textColor = [100, 30, 150];
          } else if (cellVal === 'A Vencer') {
            dataCell.cell.styles.textColor = [160, 95, 10];
          }
        }
      }
    });

    // Add page footer to all pages dynamically
    const pages = (doc as any).getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFontSize(7.5);
      doc.setTextColor(140, 145, 155);
      doc.text('Instituto Liana Gomes • Exportação Financeira Personalizada', 15, 287);
      doc.text(`Página ${i} de ${pages}`, 195, 287, { align: 'right' });
    }

    doc.save(`financeiro-export-tela-${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}.pdf`);
  };

  // Local state for filters and views
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formacaoFilter, setFormacaoFilter] = useState('');

  // Tab state: 'lista' (default) or 'heatmap'
  const [activeTab, setActiveTab] = useState<'lista' | 'heatmap'>('lista');

  // Heatmap control states
  const [heatmapType, setHeatmapType] = useState<'pago_apenas' | 'todos'>('pago_apenas'); // showing receipts vs forecast
  const [heatmapMetric, setHeatmapMetric] = useState<'volume' | 'count'>('volume');      // grouping by total value vs quantity of tuitions
  const [selectedHeatmapCell, setSelectedHeatmapCell] = useState<{ y: number; m: number } | null>(null);
  const [searchHeatmapDetailQuery, setSearchHeatmapDetailQuery] = useState('');

  // Helper to safely parse year-month
  const parseYearMonth = (vencimentoStr: any) => {
    if (!vencimentoStr) return null;
    const parts = String(vencimentoStr).split('-');
    if (parts.length >= 2) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      if (!isNaN(y) && !isNaN(m)) {
        return { y, m };
      }
    }
    return null;
  };

  const mesesGeral = useMemo(() => [
    { num: 1, nome: 'Janeiro', abrev: 'Jan' },
    { num: 2, nome: 'Fevereiro', abrev: 'Fev' },
    { num: 3, nome: 'Março', abrev: 'Mar' },
    { num: 4, nome: 'Abril', abrev: 'Abr' },
    { num: 5, nome: 'Maio', abrev: 'Mai' },
    { num: 6, nome: 'Junho', abrev: 'Jun' },
    { num: 7, nome: 'Julho', abrev: 'Jul' },
    { num: 8, nome: 'Agosto', abrev: 'Ago' },
    { num: 9, nome: 'Setembro', abrev: 'Set' },
    { num: 10, nome: 'Outubro', abrev: 'Out' },
    { num: 11, nome: 'Novembro', abrev: 'Nov' },
    { num: 12, nome: 'Dezembro', abrev: 'Dez' }
  ], []);

  // Determine which years are present in data, descending sort
  const activeYears = useMemo(() => {
    const yearsSet = new Set<number>();
    const currentYear = new Date().getFullYear();
    yearsSet.add(currentYear);
    yearsSet.add(currentYear - 1);
    yearsSet.add(currentYear + 1);

    pagamentos.forEach((p: any) => {
      const parsed = parseYearMonth(p.vencimento);
      if (parsed) {
        yearsSet.add(parsed.y);
      }
    });

    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [pagamentos]);

  // Map monthly amounts and counts for visual plotting
  const heatmapCells = useMemo(() => {
    const cells: Record<string, { totalValue: number; totalCount: number; list: any[] }> = {};

    activeYears.forEach(y => {
      for (let m = 1; m <= 12; m++) {
        cells[`${y}-${m}`] = { totalValue: 0, totalCount: 0, list: [] };
      }
    });

    pagamentos.forEach((p: any) => {
      const parsed = parseYearMonth(p.vencimento);
      if (parsed) {
        const { y, m } = parsed;
        const key = `${y}-${m}`;
        if (!cells[key]) {
          cells[key] = { totalValue: 0, totalCount: 0, list: [] };
        }
        
        const valor = parseFloat(p.valorCombinado) || 0;
        const status = String(p.status).toLowerCase();
        
        cells[key].list.push(p);

        const matchesFilter = heatmapType === 'todos' || status === 'pago';
        
        if (matchesFilter) {
          cells[key].totalValue += valor;
          cells[key].totalCount += 1;
        }
      }
    });

    return cells;
  }, [pagamentos, activeYears, heatmapType]);

  // Find the maximum value in any single cell to use as the color denominator
  const maxCellMetrics = useMemo(() => {
    let maxVal = 0;
    let maxCount = 0;

    Object.values(heatmapCells).forEach((c: any) => {
      if (c.totalValue > maxVal) maxVal = c.totalValue;
      if (c.totalCount > maxCount) maxCount = c.totalCount;
    });

    return {
      maxVal: maxVal || 1,
      maxCount: maxCount || 1
    };
  }, [heatmapCells]);

  const getCellColorClass = (value: number, count: number) => {
    const isValMetric = heatmapMetric === 'volume';
    const measure = isValMetric ? value : count;
    const maxMeasure = isValMetric ? maxCellMetrics.maxVal : maxCellMetrics.maxCount;

    if (measure === 0) {
      return "bg-slate-50 border-slate-100 hover:bg-slate-100/60 text-slate-350";
    }

    const ratio = measure / maxMeasure;

    if (ratio <= 0.20) {
      return "bg-emerald-50 border-emerald-100/50 text-emerald-800 hover:bg-emerald-100/75";
    } else if (ratio <= 0.50) {
      return "bg-[#4A709C]/10 border-[#4A709C]/20 text-[#1D4E89] hover:bg-[#4A709C]/20";
    } else if (ratio <= 0.85) {
      return "bg-[#1D4E89] border-blue-900 text-white hover:bg-blue-800";
    } else {
      return "bg-[#0A192F] border-[#D4AF37] border-2 text-[#D4AF37] font-black hover:bg-[#152a4a] hover:scale-[1.03] transition-transform";
    }
  };

  // Inspector metrics computed whenever selectedHeatmapCell changes
  const selectedMonthDetails = useMemo(() => {
    if (!selectedHeatmapCell) return null;
    const { y, m } = selectedHeatmapCell;
    const key = `${y}-${m}`;
    const cellData = heatmapCells[key];
    if (!cellData) return null;

    const rawList = cellData.list || [];
    const filteredList = rawList.filter((item: any) => {
      if (!searchHeatmapDetailQuery.trim()) return true;
      const q = searchHeatmapDetailQuery.toLowerCase();
      return (
        String(item.aluno).toLowerCase().includes(q) ||
        String(item.formacao).toLowerCase().includes(q) ||
        String(item.responsavel).toLowerCase().includes(q) ||
        String(item.observacoes).toLowerCase().includes(q)
      );
    });

    let totalPago = 0;
    let totalPendente = 0;
    let totalAtrasado = 0;

    rawList.forEach((item: any) => {
      const val = parseFloat(item.valorCombinado) || 0;
      const status = String(item.status).toLowerCase();
      if (status === 'pago') {
        totalPago += val;
      } else if (status === 'atrasado') {
        totalAtrasado += val;
      } else {
        totalPendente += val;
      }
    });

    const sumAll = totalPago + totalPendente + totalAtrasado;
    const adimplencia = sumAll > 0 ? Math.round((totalPago / sumAll) * 100) : 100;

    return {
      year: y,
      month: m,
      monthName: mesesGeral.find(item => item.num === m)?.nome || '',
      totalPago,
      totalPendente,
      totalAtrasado,
      sumAll,
      adimplencia,
      allItems: rawList,
      filteredList,
    };
  }, [selectedHeatmapCell, heatmapCells, searchHeatmapDetailQuery, mesesGeral]);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Quick Stats Calculations
  const stats = useMemo(() => {
    let totalPago = 0;
    let totalPendente = 0;
    let totalAtrasado = 0;
    let totalRegistros = pagamentos.length;

    pagamentos.forEach((p: any) => {
      const valor = parseFloat(p.valorCombinado) || 0;
      if (p.status === 'pago') {
        totalPago += valor;
      } else if (p.status === 'atrasado') {
        totalAtrasado += valor;
      } else {
        totalPendente += valor;
      }
    });

    const totalCalculavel = totalPago + totalPendente + totalAtrasado;
    const taxaAdimplencia = totalCalculavel > 0 ? Math.round((totalPago / totalCalculavel) * 100) : 100;

    return {
      totalPago,
      totalPendente,
      totalAtrasado,
      totalRegistros,
      taxaAdimplencia
    };
  }, [pagamentos]);

  // Formações options for filter matching
  const formacoesOptions = useMemo(() => {
    const list = pagamentos.map((p: any) => p.formacao).filter(Boolean);
    return Array.from(new Set(list));
  }, [pagamentos]);

  // Filtered payments list
  const filteredPagamentos = useMemo(() => {
    return pagamentos.filter((p: any) => {
      const searchMatch = search === '' || 
        String(p.aluno).toLowerCase().includes(search.toLowerCase()) ||
        String(p.formacao).toLowerCase().includes(search.toLowerCase()) ||
        String(p.responsavel).toLowerCase().includes(search.toLowerCase()) ||
        String(p.observacoes).toLowerCase().includes(search.toLowerCase());

      const statusMatch = statusFilter === '' || p.status === statusFilter;
      const formacaoMatch = formacaoFilter === '' || p.formacao === formacaoFilter;

      return searchMatch && statusMatch && formacaoMatch;
    });
  }, [pagamentos, search, statusFilter, formacaoFilter]);

  // Fast payment transition trigger
  const handleMarkAsPaid = async (item: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = { ...item, status: 'pago' };
    await updateModuleData('pagamentos', pagamentos.map((r: any) => r.id === item.id ? updated : r));
    try {
      await logAuditEvent('recebimento_confirmado', item.id, {
        aluno: item.aluno,
        valor: item.valorCombinado,
        formacao: item.formacao,
        fastTrigger: true
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Delete payment
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir este registro de pagamento?')) {
      const target = pagamentos.find((r: any) => r.id === id);
      await updateModuleData('pagamentos', pagamentos.filter((r: any) => r.id !== id));
      try {
        await logAuditEvent('exclusao_pagamento', id, {
          aluno: target?.aluno,
          valor: target?.valorCombinado,
          formacao: target?.formacao
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Open modal triggers
  const openAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  // Save changes back to store (Firestore)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const newItem: any = {
      aluno: formData.get('aluno') as string,
      formacao: formData.get('formacao') as string,
      valorCombinado: parseFloat(formData.get('valorCombinado') as string) || 0,
      status: formData.get('status') as string,
      vencimento: formData.get('vencimento') as string,
      comprovante: formData.get('comprovante') as string,
      observacoes: formData.get('observacoes') as string,
      responsavel: formData.get('responsavel') as string,
    };

    if (editingItem && editingItem.id) {
      newItem.id = editingItem.id;
      await updateModuleData('pagamentos', pagamentos.map((r: any) => r.id === newItem.id ? newItem : r));
      try {
        await logAuditEvent('atualizacao_pagamento', editingItem.id, {
          aluno: newItem.aluno,
          valor: newItem.valorCombinado,
          status: newItem.status,
          formacao: newItem.formacao,
          responsavel: newItem.responsavel
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      newItem.id = 'pag_' + Math.random().toString(36).substring(2, 9);
      await updateModuleData('pagamentos', [newItem, ...pagamentos]);
      try {
        await logAuditEvent('cadastro_pagamento', newItem.id, {
          aluno: newItem.aluno,
          valor: newItem.valorCombinado,
          status: newItem.status,
          formacao: newItem.formacao,
          responsavel: newItem.responsavel
        });
      } catch (err) {
        console.error(err);
      }
    }
    setIsModalOpen(false);
  };

  // WhatsApp reminder message template dispatcher
  const handleSendWhatsAppNotification = (item: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const valorFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valorCombinado || 0);
    const dataVencimento = item.vencimento ? new Date(item.vencimento).toLocaleDateString('pt-BR') : 'Sem data';
    
    let mensagem = '';
    if (item.status === 'atrasado') {
      mensagem = `Olá, ${item.aluno}! Tudo bem?\n\nPassando para lembrar que identificamos em nossa base o vencimento atrasado de sua parcela de ${valorFormatado} (vencida em ${dataVencimento}) referente à formação "${item.formacao}".\n\nVocê saberia dizer se o pagamento foi realizado? Caso sim, envie o comprovante aqui para que eu possa dar baixa no sistema!\n\nSe precisar da chave PIX ou conta bancária para acerto, me avise. Muito obrigado!`;
    } else {
      mensagem = `Olá, ${item.aluno}! Tudo bem?\n\nEspero que sim! Aqui é da equipe financeira do Instituto Liana Gomes. Temos uma parcela programada para vencer no dia ${dataVencimento}, no valor de ${valorFormatado} referente à formação "${item.formacao}".\n\nCaso já queira adiantar ou se preferir efetuar o pagamento, basta realizar a transferência e anexar o comprovante. Segue nossa chave PIX CNPJ da Central para facilitar: 51.533.488/0001-09.\n\nQualquer dúvida, estamos sempre por aqui! Abraço.`;
    }

    const encodedText = encodeURIComponent(mensagem);
    // Since we don't store student phone number directly in payment (usually it is in Pessoas/Alunas),
    // let's try to lookup the phone number in our store!
    const matchingPessoa = (data.pessoas || []).find((p: any) => String(p.nome).toLowerCase() === String(item.aluno).toLowerCase());
    const telefoneParaEnvio = matchingPessoa?.telefone ? String(matchingPessoa.telefone).replace(/\D/g, '') : '';
    
    const url = telefoneParaEnvio 
      ? `https://api.whatsapp.com/send?phone=55${telefoneParaEnvio}&text=${encodedText}`
      : `https://api.whatsapp.com/send?text=${encodedText}`;
      
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // UI badge generator for status
  const renderStatusBadge = (status: string) => {
    let color = 'bg-slate-100 text-slate-700 border-slate-200';
    let text = status;

    if (status === 'pago') {
      color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      text = 'Pago';
    } else if (status === 'parcial') {
      color = 'bg-purple-50 text-purple-700 border-purple-200';
      text = 'Parcial';
    } else if (status === 'pendente') {
      color = 'bg-amber-50 text-amber-700 border-amber-200';
      text = 'A Vencer';
    } else if (status === 'atrasado') {
      color = 'bg-rose-50 text-rose-700 border-rose-200';
      text = 'Em Atraso';
    }

    return (
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${color}`}>
        {text}
      </span>
    );
  };

  return (
    <div className="space-y-6 flex flex-col min-h-full pb-12">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#0A192F]">Financeiro</h1>
          <p className="text-slate-500 text-sm mt-1">
            Controle de mensalidades de alunas, parcelas em aberto e disparos rápidos de cobranças.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button 
            type="button"
            onClick={handleExportFilteredPDF}
            className="inline-flex items-center px-4 py-2 border border-[#1D4E89] hover:bg-[#1D4E89]/5 text-[#1D4E89] font-semibold rounded-lg shadow-sm transition bg-white text-sm cursor-pointer select-none"
            title="Exportar lançamentos na tela atual com os filtros ativos para PDF"
          >
            <FileText className="w-4 h-4 mr-1.5 text-[#1D4E89]" />
            Exportar PDF
          </button>

          <button 
            type="button"
            onClick={handleGeneratePDF}
            className="inline-flex items-center px-4 py-2 border border-slate-350 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg shadow-sm transition bg-white text-sm cursor-pointer select-none"
            title="Gerar e baixar relatório resumido em PDF para o mês atual"
          >
            <FileText className="w-4 h-4 mr-1.5 text-slate-500" />
            Relatório do Mês (PDF)
          </button>
          
          <button 
            type="button"
            onClick={openAdd}
            className="inline-flex items-center px-4 py-2 bg-[#D4AF37] hover:bg-[#b8952b] text-white font-semibold rounded-lg shadow-sm transition-colors text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Lançamento
          </button>
        </div>
      </div>

      {/* Metrics widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium uppercase tracking-tight">Total Recebido</span>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(stats.totalPago)}</p>
          </div>
          <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium uppercase tracking-tight">A Receber / Pendente</span>
            <p className="text-2xl font-bold text-amber-600 mt-1">{formatCurrency(stats.totalPendente)}</p>
          </div>
          <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium uppercase tracking-tight text-rose-700 font-semibold">Total Em Atraso</span>
            <p className="text-2xl font-bold text-rose-600 mt-1">{formatCurrency(stats.totalAtrasado)}</p>
          </div>
          <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center text-rose-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium uppercase tracking-tight">Adimplência Operacional</span>
            <p className="text-2xl font-bold text-[#1D4E89] mt-1">{stats.taxaAdimplencia}%</p>
          </div>
          <div className="w-10 h-10 bg-cyan-50 rounded-lg flex items-center justify-center text-cyan-600 animate-pulse">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Ledger Table & Filter section */}
      <div className="bg-white rounded-3xl border border-slate-100/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col flex-1 overflow-hidden">
        
        {/* Navigation Tabs between Ledger and Heatmap */}
        <div className="flex border-b border-slate-200 bg-slate-50/75 p-1 font-sans select-none shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('lista')}
            className={cn(
              "flex-1 py-3 text-center text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer outline-none focus:outline-none border-b-2",
              activeTab === 'lista' 
                ? "text-[#0A192F] border-[#1D4E89] bg-white font-extrabold shadow-sm rounded-t-xl" 
                : "text-slate-500 border-transparent hover:text-slate-800 hover:bg-white/40"
            )}
          >
            📋 Livro de Lançamentos
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('heatmap');
              if (!selectedHeatmapCell) {
                setSelectedHeatmapCell({ y: new Date().getFullYear(), m: new Date().getMonth() + 1 });
              }
            }}
            className={cn(
              "flex-1 py-3 text-center text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer outline-none focus:outline-none border-b-2",
              activeTab === 'heatmap' 
                ? "text-[#0A192F] border-[#D4AF37] bg-white font-extrabold shadow-sm rounded-t-xl" 
                : "text-slate-500 border-transparent hover:text-slate-800 hover:bg-white/40"
            )}
          >
            🔥 Mapa de Calor do Fluxo
          </button>
        </div>

        {activeTab === 'lista' && (
          <>
            {/* Filters bar */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input 
                  type="text" 
                  placeholder="Pesquisar aluna, formação, observações..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg pl-9 pr-4 py-2 outline-none focus:border-[#1D4E89] focus:ring-1 focus:ring-[#1D4E89] text-slate-800 bg-white"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 shadow-sm">
                  <Filter className="w-3.5 h-3.5 mr-2 text-slate-500" /> Filtros
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 outline-none bg-white font-medium text-slate-700 cursor-pointer"
                >
                  <option value="">Todos os status</option>
                  <option value="pago">Pago</option>
                  <option value="parcial">Parcial</option>
                  <option value="pendente">A Vencer</option>
                  <option value="atrasado">Em Atraso</option>
                </select>

                <select
                  value={formacaoFilter}
                  onChange={(e) => setFormacaoFilter(e.target.value)}
                  className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 outline-none bg-white font-medium text-slate-700 max-w-[200px] truncate cursor-pointer"
                >
                  <option value="">Todas as formações</option>
                  {formacoesOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>

                {(search || statusFilter || formacaoFilter) && (
                  <button 
                    onClick={() => {
                      setSearch('');
                      setStatusFilter('');
                      setFormacaoFilter('');
                    }}
                    className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center px-2 py-1.5"
                  >
                    Limpar Filtros
                  </button>
                )}
              </div>
            </div>

            {/* Ledger list */}
            <div className="flex-1 overflow-x-auto">
              {filteredPagamentos.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-slate-500 text-sm">Nenhum lançamento foi encontrado com esses filtros.</p>
                  <button 
                    onClick={openAdd}
                    className="text-[#1D4E89] font-semibold text-sm hover:underline mt-2 inline-flex items-center"
                  >
                    Registrar um lançamento <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-[#1D4E89]/5 text-slate-600">
                    <tr>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Aluna</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Formação / Programa</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Valor Combinado</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Vencimento</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Responsável</th>
                      <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200 text-slate-700">
                    {filteredPagamentos.map((item: any) => {
                      const valor = formatCurrency(item.valorCombinado || 0);
                      const dataFormated = item.vencimento ? new Date(item.vencimento).toLocaleDateString('pt-BR') : '-';
                      return (
                        <tr 
                          key={item.id} 
                          className="hover:bg-slate-50 cursor-pointer transition-colors"
                          onClick={() => openEdit(item)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-semibold text-slate-900">{item.aluno || 'Sem nome'}</div>
                            {item.observacoes && (
                              <div className="text-xs text-slate-400 mt-1 max-w-[200px] truncate">{item.observacoes}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm max-w-[250px] truncate" title={item.formacao}>{item.formacao}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-slate-800">{valor}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {renderStatusBadge(item.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm flex items-center text-slate-600">
                              <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                              {dataFormated}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                              {item.responsavel || '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2 text-slate-500">
                              
                              {item.status !== 'pago' && (
                                <button
                                  type="button"
                                  onClick={(e) => handleMarkAsPaid(item, e)}
                                  className="p-1 px-2 border border-emerald-300 text-emerald-600 rounded bg-emerald-50 hover:bg-emerald-100 transition-colors flex items-center gap-1 text-xs"
                                  title="Marcar como Pago"
                                >
                                  <Check className="w-3 h-3" /> Pago
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={(e) => handleSendWhatsAppNotification(item, e)}
                                className="p-1.5 text-cyan-600 hover:text-cyan-800 hover:bg-cyan-50 rounded transition-all"
                                title="Enviar cobrança via WhatsApp"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </button>

                              {item.comprovante && (
                                <a
                                  href={item.comprovante}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-all"
                                  title="Ver Comprovante Anexo"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}

                              <button 
                                onClick={(e) => { e.stopPropagation(); openEdit(item); }}
                                className="p-1.5 text-[#1D4E89] hover:text-[#0A192F] hover:bg-slate-100 rounded transition-all"
                                title="Editar lançamento"
                              >
                                <Edit className="w-4 h-4" />
                              </button>

                              <button 
                                onClick={(e) => handleDelete(item.id, e)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-all"
                                title="Deletar lançamento"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {activeTab === 'heatmap' && (
          <div className="p-6 space-y-6 flex-1 overflow-y-auto bg-stone-50/20">
            {/* Heatmap settings bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-4.5 shadow-xs select-none">
              <div className="space-y-1">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-[#D4AF37]" /> Configuração do Mapa de Fluxo
                </h3>
                <p className="text-[10px] text-slate-500 font-medium">Selecione filtros de volume financeiro ou contagem de tuitions mensais.</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Mode Selector */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setHeatmapType('pago_apenas');
                      setSearchHeatmapDetailQuery('');
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition cursor-pointer",
                      heatmapType === 'pago_apenas' ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
                    )}
                  >
                    Apenas Recebidos (Pago)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHeatmapType('todos');
                      setSearchHeatmapDetailQuery('');
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition cursor-pointer",
                      heatmapType === 'todos' ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
                    )}
                  >
                    Previsão Completa (Todos)
                  </button>
                </div>

                {/* Metric Selector */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setHeatmapMetric('volume')}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition cursor-pointer",
                      heatmapMetric === 'volume' ? "bg-[#0A192F] text-[#D4AF37] shadow-xs" : "text-slate-500 hover:text-slate-800"
                    )}
                  >
                    Volume (R$)
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeatmapMetric('count')}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition cursor-pointer",
                      heatmapMetric === 'count' ? "bg-[#0A192F] text-[#D4AF37] shadow-xs" : "text-slate-500 hover:text-slate-800"
                    )}
                  >
                    Contagem (Alunas)
                  </button>
                </div>
              </div>
            </div>

            {/* Heatmap grid itself with custom gridTemplateColumns */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-x-auto">
              <div className="min-w-[850px] space-y-4">
                
                {/* Columns Header: Month names */}
                <div 
                  className="gap-2 border-b border-slate-150 pb-2 select-none"
                  style={{ display: 'grid', gridTemplateColumns: '70px repeat(12, minmax(0, 1fr))' }}
                >
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider text-center flex items-center justify-center font-mono border-r border-slate-150 pr-2">
                    Ano
                  </div>
                  {mesesGeral.map(m => (
                    <div key={m.num} className="text-[10px] font-black text-slate-600 uppercase tracking-widest text-center font-mono">
                      {m.abrev}
                    </div>
                  ))}
                </div>

                {/* Grid Rows: Years */}
                <div className="space-y-2.5">
                  {activeYears.map(year => (
                    <div 
                      key={year} 
                      className="gap-2 items-center"
                      style={{ display: 'grid', gridTemplateColumns: '70px repeat(12, minmax(0, 1fr))' }}
                    >
                      {/* Left: Year indicator */}
                      <div className="text-xs font-black text-slate-800 tracking-tight font-sans text-center border-r border-slate-150 pr-2 py-3.5 select-none flex flex-col justify-center bg-slate-50 rounded-xl h-full">
                        {year}
                      </div>

                      {/* Right: Month cells */}
                      {mesesGeral.map(month => {
                        const cellKey = `${year}-${month.num}`;
                        const cellData = heatmapCells[cellKey] || { totalValue: 0, totalCount: 0, list: [] };
                        const isSelected = selectedHeatmapCell?.y === year && selectedHeatmapCell?.m === month.num;
                        const hasVal = heatmapMetric === 'volume' ? cellData.totalValue > 0 : cellData.totalCount > 0;

                        return (
                          <button
                            key={month.num}
                            type="button"
                            onClick={() => {
                              setSelectedHeatmapCell({ y: year, m: month.num });
                            }}
                            className={cn(
                              "relative group px-1 py-4 rounded-xl flex flex-col items-center justify-center transition-all h-14 cursor-pointer border focus:outline-none",
                              getCellColorClass(cellData.totalValue, cellData.totalCount),
                              isSelected ? "ring-2 ring-[#1D4E89] ring-offset-1 scale-[1.03] z-10" : ""
                            )}
                          >
                            <span className="text-[8px] font-extrabold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity absolute top-0.5 uppercase tracking-wide">
                              {month.abrev}
                            </span>
                            
                            <span className="text-[10px] font-bold tracking-tight leading-none text-center block max-w-full truncate px-0.5 mt-1">
                              {heatmapMetric === 'volume' 
                                ? (cellData.totalValue >= 1000 
                                    ? `R$ ${(cellData.totalValue / 1000).toFixed(cellData.totalValue % 1000 === 0 ? 0 : 1)}k` 
                                    : cellData.totalValue > 0 ? `R$ ${cellData.totalValue}` : 'R$ 0')
                                : `${cellData.totalCount} al.`
                              }
                            </span>

                            {/* Active pulse on non-zero matching filter */}
                            {hasVal && (
                              <span className="absolute bottom-1 w-1.5 h-1.5 bg-emerald-500 rounded-full scale-75 opacity-70" />
                            )}
                          </button>
                        );
                      })}

                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* Heatmap Legend summary bar */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-xs text-slate-500 font-bold shrink-0">Legenda de Volume Mensal:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 md:gap-4">
                <span className="text-[9px] bg-slate-50 border border-slate-100 text-slate-450 px-2 py-1 rounded font-bold uppercase font-mono">Vazio</span>
                <span className="text-slate-300">→</span>
                <span className="text-[9px] bg-emerald-50 border border-emerald-100/50 text-emerald-800 px-2 py-1 rounded font-bold uppercase font-mono">Baixo (&lt;20%)</span>
                <span className="text-slate-300">→</span>
                <span className="text-[9px] bg-[#4A709C]/10 border-[#4A709C]/20 text-[#1D4E89] px-2 py-1 rounded font-bold uppercase font-mono">Moderado (20%-50%)</span>
                <span className="text-slate-300">→</span>
                <span className="text-[9px] bg-[#1D4E89] text-white px-2 py-1 rounded font-bold uppercase font-mono">Alto (50%-85%)</span>
                <span className="text-slate-300">→</span>
                <span className="text-[9px] bg-[#0A192F] border-[#D4AF37] border-2 text-[#D4AF37] px-2.5 py-1 rounded font-black uppercase font-mono">Pico (&gt;85%)</span>
              </div>
            </div>

            {/* Active Month Detail Sub-panel */}
            <AnimatePresence mode="wait">
              {selectedMonthDetails && (
                <motion.div
                  key={`${selectedMonthDetails.year}-${selectedMonthDetails.month}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6"
                >
                  {/* Detailed sub-header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">📊</span>
                        <h4 className="text-base font-black text-slate-800 uppercase tracking-wide">
                          Fluxo de Caixa Decifrado: <span className="text-[#1D4E89] font-black underline decoration-[#D4AF37] decoration-2">{selectedMonthDetails.monthName} de {selectedMonthDetails.year}</span>
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">Visão detalhada de todas as mensalidades e programas agendados para este período.</p>
                    </div>

                    {/* Simple search bar within Month list */}
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl max-w-xs w-full self-start sm:self-auto select-none">
                      <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        value={searchHeatmapDetailQuery}
                        onChange={(e) => setSearchHeatmapDetailQuery(e.target.value)}
                        placeholder="Filtrar lançamentos neste período..."
                        className="bg-transparent border-none outline-none text-xs text-slate-800 w-full placeholder-slate-400 focus:ring-0 outline-hidden"
                      />
                      {searchHeatmapDetailQuery && (
                        <button type="button" onClick={() => setSearchHeatmapDetailQuery('')} className="cursor-pointer">
                          <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Sub-KPI cards of selected month */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 select-none">
                    {/* Liquidated Volume */}
                    <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-4 flex flex-col justify-between">
                      <span className="text-[9px] font-black text-emerald-800 tracking-wider uppercase font-mono">Volume Realizado (Pago)</span>
                      <p className="text-xl font-bold text-emerald-700 mt-2">{formatCurrency(selectedMonthDetails.totalPago)}</p>
                      <div className="text-[9px] text-slate-400 font-bold mt-1.5">Matrículas confirmadas</div>
                    </div>

                    {/* Pending Volume */}
                    <div className="bg-amber-50/30 border border-amber-100 rounded-2xl p-4 flex flex-col justify-between">
                      <span className="text-[9px] font-black text-amber-800 tracking-wider uppercase font-mono">Volume Pendente</span>
                      <p className="text-xl font-bold text-amber-600 mt-2">{formatCurrency(selectedMonthDetails.totalPendente)}</p>
                      <div className="text-[9px] text-slate-400 font-bold mt-1.5">Previsão no radar</div>
                    </div>

                    {/* Delinquency / Overdue Volume */}
                    <div className="bg-rose-50/30 border border-rose-100 rounded-2xl p-4 flex flex-col justify-between">
                      <span className="text-[9px] font-black text-rose-800 tracking-wider uppercase font-mono">Inadimplente (Atrasado)</span>
                      <p className="text-xl font-bold text-rose-600 mt-2">{formatCurrency(selectedMonthDetails.totalAtrasado)}</p>
                      <div className="text-[9px] text-slate-400 font-bold mt-1.5">Incompletos overdue</div>
                    </div>

                    {/* Adimplence Performance */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between">
                      <span className="text-[9px] font-black text-[#1D4E89] tracking-wider uppercase font-mono">Adimplência Mensal</span>
                      <p className="text-xl font-bold text-[#1D4E89] mt-2">{selectedMonthDetails.adimplencia}%</p>
                      <div className="text-[9px] text-slate-400 font-bold mt-1.5">Proporção recebido / agendado</div>
                    </div>
                  </div>

                  {/* Micro list Table of Selected month */}
                  <div className="overflow-x-auto rounded-2xl border border-slate-150">
                    <table className="min-w-full divide-y divide-slate-150">
                      <thead className="bg-slate-50 text-slate-650">
                        <tr className="select-none text-[10px] font-black uppercase font-mono">
                          <th className="px-5 py-3 text-left">Aluna</th>
                          <th className="px-5 py-3 text-left">Programa / Formação</th>
                          <th className="px-5 py-3 text-left">Valor Combinado</th>
                          <th className="px-5 py-3 text-left">Status</th>
                          <th className="px-5 py-3 text-left">Vencimento</th>
                          <th className="px-5 py-3 text-right">Ações rápidas</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-150 text-slate-700 text-xs font-semibold">
                        {selectedMonthDetails.filteredList.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-5 py-8 text-center text-slate-400 font-medium select-none">
                              Nenhum lançamento financeiro correspondente neste período.
                            </td>
                          </tr>
                        ) : (
                          selectedMonthDetails.filteredList.map((item: any) => {
                            const valor = formatCurrency(item.valorCombinado || 0);
                            const dataFormated = item.vencimento ? new Date(item.vencimento + 'T12:00:00').toLocaleDateString('pt-BR') : '-';
                            return (
                              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-5 py-3.5">
                                  <div className="font-bold text-slate-850">{item.aluno || 'Sem nome'}</div>
                                  {item.observacoes && (
                                    <div className="text-[10px] text-slate-400 font-medium max-w-[150px] truncate mt-0.5">{item.observacoes}</div>
                                  )}
                                </td>
                                <td className="px-5 py-3.5 text-slate-600 max-w-[180px] truncate">
                                  {item.formacao}
                                </td>
                                <td className="px-5 py-3.5 font-extrabold text-slate-800">
                                  {valor}
                                </td>
                                <td className="px-5 py-3.5">
                                  {renderStatusBadge(item.status)}
                                </td>
                                <td className="px-5 py-3.5 font-mono text-[11px] text-slate-500">
                                  {dataFormated}
                                </td>
                                <td className="px-5 py-3.5 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {/* Fast mark as paid */}
                                    {item.status !== 'pago' && (
                                      <button
                                        type="button"
                                        onClick={(e) => handleMarkAsPaid(item, e)}
                                        className="px-2 py-1 border border-emerald-300 text-emerald-600 rounded bg-emerald-50 hover:bg-emerald-100 text-[10px] uppercase font-black tracking-wide leading-none transition cursor-pointer"
                                      >
                                        Liquidar
                                      </button>
                                    )}

                                    {/* WhatsApp cobrança */}
                                    <button
                                      type="button"
                                      onClick={(e) => handleSendWhatsAppNotification(item, e)}
                                      className="p-1.5 text-cyan-600 hover:text-cyan-800 hover:bg-cyan-50 rounded transition cursor-pointer"
                                      title="Enviar cobrança / lembrete via WhatsApp"
                                    >
                                      <MessageSquare className="w-3.5 h-3.5" />
                                    </button>

                                    {/* Edit details */}
                                    <button
                                      type="button"
                                      onClick={() => openEdit(item)}
                                      className="p-1.5 text-indigo-650 hover:text-indigo-850 hover:bg-indigo-50 rounded transition cursor-pointer"
                                      title="Editar"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
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

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 text-[10px] text-slate-500 font-bold select-none">
                    <span className="text-sm shrink-0">📈</span>
                    <span>Análise Estratégica: Usufrua as células do mapa comercial para sintonizar campanhas de ofertas com períodos historicamente fracos de recebimento.</span>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>

          </div>
        )}
      </div>

      {/* MODAL FORM SECTION */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col rounded-3xl shadow-2xl z-10 mx-4">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-[#1D4E89]/5">
              <h2 className="text-xl font-bold text-[#0A192F]">
                {editingItem ? 'Editar Lançamento' : 'Novo Lançamento Financeiro'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <div className="overflow-y-auto flex-1 p-6">
              <form id="paymentForm" onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Select or Input Student */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Nome da Aluna *</label>
                    <input 
                      type="text" 
                      name="aluno"
                      required
                      defaultValue={editingItem ? editingItem.aluno : ''}
                      placeholder="Ex: Viviane Diniz"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#1F4E89] focus:ring-1 focus:ring-[#1F4E89] text-slate-800 bg-white shadow-sm text-sm"
                    />
                  </div>

                  {/* Program of interest */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Formação / Programa *</label>
                    <input 
                      type="text" 
                      name="formacao"
                      required
                      defaultValue={editingItem ? editingItem.formacao : ''}
                      placeholder="Ex: Formação Master Trainer Líderes"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#1F4E89] focus:ring-1 focus:ring-[#1F4E89] text-slate-800 bg-white shadow-sm text-sm"
                    />
                  </div>

                  {/* Value */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Valor do Pagamento (R$) *</label>
                    <input 
                      type="number" 
                      name="valorCombinado"
                      step="0.01"
                      required
                      defaultValue={editingItem ? editingItem.valorCombinado : ''}
                      placeholder="Ex: 1250.00"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#1F4E89] focus:ring-1 focus:ring-[#1F4E89] text-slate-800 bg-white shadow-sm text-sm"
                    />
                  </div>

                  {/* Status selection */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Status do Pagamento *</label>
                    <select 
                      name="status"
                      required
                      defaultValue={editingItem ? editingItem.status : 'pendente'}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#1F4E89] focus:ring-1 focus:ring-[#1F4E89] text-slate-800 bg-white shadow-sm text-sm"
                    >
                      <option value="pago">Pago</option>
                      <option value="parcial">Parcial</option>
                      <option value="pendente">A Vencer (Pendente)</option>
                      <option value="atrasado">Em Atraso (Vencido)</option>
                    </select>
                  </div>

                  {/* Overdue/Vencimento date */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Data de Vencimento *</label>
                    <input 
                      type="date" 
                      name="vencimento"
                      required
                      defaultValue={editingItem ? editingItem.vencimento : ''}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#1F4E89] focus:ring-1 focus:ring-[#1F4E89] text-slate-800 bg-white shadow-sm text-sm"
                    />
                  </div>

                  {/* Comprovante receipts */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Link do Comprovante (Opcional)</label>
                    <input 
                      type="url" 
                      name="comprovante"
                      defaultValue={editingItem ? editingItem.comprovante : ''}
                      placeholder="Ex: https://drive.google.com/comprovante.pdf"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#1F4E89] focus:ring-1 focus:ring-[#1F4E89] text-slate-800 bg-white shadow-sm text-sm"
                    />
                  </div>

                  {/* Responsavel */}
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Responsável pelo Registro</label>
                    <input 
                      type="text" 
                      name="responsavel"
                      placeholder="Ex: Fabi / Financeiro"
                      defaultValue={editingItem ? editingItem.responsavel : 'Equipe Financeira'}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#1F4E89] focus:ring-1 focus:ring-[#1F4E89] text-slate-800 bg-white shadow-sm text-sm"
                    />
                  </div>

                  {/* Observations */}
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Observações / Detalhes de Negociação</label>
                    <textarea 
                      name="observacoes"
                      rows={3}
                      defaultValue={editingItem ? editingItem.observacoes : ''}
                      placeholder="Ex: Dividido em 2x no PIX, restando acerto da 2ª parcela..."
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#1F4E89] focus:ring-1 focus:ring-[#1F4E89] text-slate-800 bg-white shadow-sm text-sm"
                    />
                  </div>

                </div>
              </form>
            </div>

            {/* Modal Bottom Buttons */}
            <div className="border-t border-slate-100 px-6 py-4 flex justify-end gap-2 bg-slate-50">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-100 transition-colors text-sm"
              >
                Cancelar
              </button>
              <button 
                form="paymentForm" 
                type="submit" 
                className="px-4 py-2 bg-[#0A192F] text-white rounded-lg font-semibold hover:bg-[#152a4a] transition-colors text-sm shadow-sm"
              >
                Salvar Lançamento
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
