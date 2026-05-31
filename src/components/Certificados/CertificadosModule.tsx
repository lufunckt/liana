import React, { useState, useEffect, useMemo } from 'react';
import { 
  Award, FileBadge, Mail, Download, Edit, Trash2, Copy, Plus, X, Check, 
  Search, Filter, Upload, Send, Eye, RefreshCw, Sliders, Layout, 
  ChevronRight, ChevronLeft, AlertCircle, Sparkles, Printer, UserCheck, 
  Settings, CheckCircle, FileText, FileCheck, CheckCircle2, History
} from 'lucide-react';
import { useStore } from '../../store';
import { auth } from '../../lib/firebase';

// TS Interfaces
export interface CertificateTemplate {
  id: string;
  nome: string;
  tipo: 'participacao' | 'conclusao' | 'formacao' | 'workshop' | 'personalizado';
  layoutVisual: 'navy_premium' | 'petroleum_elegant' | 'beige_classic' | 'warm_white_minimal';
  textoPrincipal: string;
  cargaHorariaPadrao: string;
  assinatura: string;
  logo: 'selo_dourado' | 'selo_no_topo' | 'brasao_discreto' | 'padrao_ilg';
  corPrincipal: string; // Tailwind class background / border values
  corSecundaria: string;
  statusAtivo: boolean;
}

export interface IssuedCertificate {
  id: string;
  nomeAluno: string;
  emailAluno: string;
  nomeFormacao: string;
  turma: string;
  cargaHoraria: string;
  dataConclusao: string;
  dataEmissao: string;
  nomeInstrutora: string;
  observacoesInternas?: string;
  textoComplementar?: string;
  templateId: string;
  templateNome: string;
  dataGeracao: string;
  status: 'rascunho' | 'gerado' | 'enviado' | 'erro_envio';
  dataEnvio?: string;
  linkPdf?: string;
  responsavel: string;
}

// Default Presets to populate the database
const DEFAULT_TEMPLATES: CertificateTemplate[] = [
  {
    id: 'tpl-conclusao-ilg',
    nome: 'Certificado Padrão ILG - Conclusão',
    tipo: 'conclusao',
    layoutVisual: 'navy_premium',
    textoPrincipal: 'Certificamos que {nome_aluno} concluiu com aproveitamento a formação {nome_formacao}, com carga horária de {carga_horaria}, realizada pelo Instituto Liana Gomes, tendo cumprido todos os requisitos acadêmicos da turma {turma}.',
    cargaHorariaPadrao: '60 horas',
    assinatura: 'Profª. Liana Gomes • Diretora Executiva',
    logo: 'selo_dourado',
    corPrincipal: '#0A192F',
    corSecundaria: '#D4AF37',
    statusAtivo: true,
  },
  {
    id: 'tpl-participacao-ilg',
    nome: 'Certificado de Participação - Workshop',
    tipo: 'participacao',
    layoutVisual: 'petroleum_elegant',
    textoPrincipal: 'Certificamos que {nome_aluno} participou ativamente do Workshop {nome_formacao}, com carga horária de {carga_horaria}, promovido pelo Instituto Liana Gomes em coordenação com a turma {turma}.',
    cargaHorariaPadrao: '8 horas',
    assinatura: 'Coordenação Acadêmica Instituto Liana Gomes',
    logo: 'brasao_discreto',
    corPrincipal: '#1E3A8A',
    corSecundaria: '#93C5FD',
    statusAtivo: true,
  },
  {
    id: 'tpl-formacao-executive',
    nome: 'Certificado Platinum - Formação Executiva',
    tipo: 'formacao',
    layoutVisual: 'beige_classic',
    textoPrincipal: 'O Instituto Liana Gomes confere a {nome_aluno} o grau de Especialista pela conclusão da Formação Executiva em {nome_formacao}, ministrada com rigor técnico e prático de {carga_horaria}, concluída com êxito na data de {data_conclusao}.',
    cargaHorariaPadrao: '120 horas',
    assinatura: 'Profª. Liana Gomes • Mentora e Fundadora',
    logo: 'selo_no_topo',
    corPrincipal: '#FDFBF7',
    corSecundaria: '#D4AF37',
    statusAtivo: true,
  },
  {
    id: 'tpl-workshop-pratico',
    nome: 'Template Minimalista - Workshop Curto',
    tipo: 'workshop',
    layoutVisual: 'warm_white_minimal',
    textoPrincipal: 'Certificado de capacitação técnica conferido a {nome_aluno} por sua dedicação no workshop intensivo de {nome_formacao}, com carga de {carga_horaria}, realizada no dia {data_conclusao}.',
    cargaHorariaPadrao: '4 horas',
    assinatura: 'Equipe de Mentoria ILG',
    logo: 'padrao_ilg',
    corPrincipal: '#F9FAFB',
    corSecundaria: '#4B5563',
    statusAtivo: true,
  }
];

const DEFAULT_ISSUED: IssuedCertificate[] = [
  {
    id: 'cert-1',
    nomeAluno: 'Beatriz Nogueira',
    emailAluno: 'beatriz.nog@uol.com',
    nomeFormacao: 'Formação Executiva & Compliance',
    turma: 'Turma A',
    cargaHoraria: '120 horas',
    dataConclusao: '20/04/2026',
    dataEmissao: '25/04/2026',
    nomeInstrutora: 'Liana Gomes',
    templateId: 'tpl-formacao-executive',
    templateNome: 'Certificado Platinum - Formação Executiva',
    dataGeracao: '25/04/2026',
    status: 'enviado',
    dataEnvio: '25/04/2026 14:32',
    linkPdf: '#',
    responsavel: 'Núria'
  },
  {
    id: 'cert-2',
    nomeAluno: 'Juliana Ramos',
    emailAluno: 'juliaramos@gmail.com',
    nomeFormacao: 'Formação Líder / Liderança Feminina',
    turma: 'Turma B',
    cargaHoraria: '60 horas',
    dataConclusao: '12/05/2026',
    dataEmissao: '15/05/2026',
    nomeInstrutora: 'Liana Gomes',
    templateId: 'tpl-conclusao-ilg',
    templateNome: 'Certificado Padrão ILG - Conclusão',
    dataGeracao: '15/05/2026',
    status: 'gerado',
    linkPdf: '#',
    responsavel: 'Ana'
  },
  {
    id: 'cert-3',
    nomeAluno: 'Fernanda Silveira',
    emailAluno: 'fernanda.s@outlook.com',
    nomeFormacao: 'Workshop de Oratória de Alto Impacto',
    turma: 'Turma Executiva 02',
    cargaHoraria: '8 horas',
    dataConclusao: '22/05/2026',
    dataEmissao: '24/05/2026',
    nomeInstrutora: 'Liana Gomes',
    templateId: 'tpl-participacao-ilg',
    templateNome: 'Certificado de Participação - Workshop',
    dataGeracao: '24/05/2026',
    status: 'rascunho',
    responsavel: 'Núria'
  }
];

export function CertificadosModule() {
  const { data: storeData } = useStore();
  const pessoas = storeData.pessoas || [];

  // State
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'historico' | 'templates'>('dashboard');
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [issuedCertificates, setIssuedCertificates] = useState<IssuedCertificate[]>([]);

  // Wizard States
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardSource, setWizardSource] = useState<'existente' | 'manual' | 'csv'>('existente');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [searchStudentQuery, setSearchStudentQuery] = useState('');
  
  // Custom form input
  const [formData, setFormData] = useState({
    nomeAluno: '',
    emailAluno: '',
    nomeFormacao: '',
    turma: '',
    cargaHoraria: '60 horas',
    dataConclusao: new Date().toLocaleDateString('pt-BR'),
    dataEmissao: new Date().toLocaleDateString('pt-BR'),
    nomeInstrutora: 'Liana Gomes',
    textoComplementar: '',
    observacoesInternas: ''
  });

  // Selected Template in Creator
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  // Batch states
  const [batchCsvFile, setBatchCsvFile] = useState<File | null>(null);
  const [batchRecords, setBatchRecords] = useState<any[]>([]);
  const [batchStep, setBatchStep] = useState(1); // 1: upload/map, 2: choose template/preview, 3: progress
  const [batchMappedKeys, setBatchMappedKeys] = useState<Record<string, string>>({});
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [batchStatusLog, setBatchStatusLog] = useState<string[]>([]);
  const [batchCsvHeaders, setBatchCsvHeaders] = useState<string[]>([]);

  // Edit / Preview dynamic state (Step 3)
  const [previewEditingData, setPreviewEditingData] = useState<typeof formData | null>(null);

  // Email state modal
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [activeEmailCert, setActiveEmailCert] = useState<IssuedCertificate | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Template Editor State Modal
  const [isTemplateEditorOpen, setIsTemplateEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CertificateTemplate | null>(null);

  // History Filter state
  const [histSearch, setHistSearch] = useState('');
  const [histFormacao, setHistFormacao] = useState('all');
  const [histTurma, setHistTurma] = useState('all');
  const [histStatus, setHistStatus] = useState('all');

  // Trigger preview in standalone mode
  const [viewingCertificate, setViewingCertificate] = useState<IssuedCertificate | null>(null);

  // Initialize
  useEffect(() => {
    const savedTemplates = localStorage.getItem('ilg_cert_templates');
    const savedIssued = localStorage.getItem('ilg_cert_issued');

    if (savedTemplates) {
      try { setTemplates(JSON.parse(savedTemplates)); } catch(e) { setTemplates(DEFAULT_TEMPLATES); }
    } else {
      setTemplates(DEFAULT_TEMPLATES);
      localStorage.setItem('ilg_cert_templates', JSON.stringify(DEFAULT_TEMPLATES));
    }

    if (savedIssued) {
      try { setIssuedCertificates(JSON.parse(savedIssued)); } catch(e) { setIssuedCertificates(DEFAULT_ISSUED); }
    } else {
      setIssuedCertificates(DEFAULT_ISSUED);
      localStorage.setItem('ilg_cert_issued', JSON.stringify(DEFAULT_ISSUED));
    }
  }, []);

  // Listen to standard custom events for ficha triggering
  useEffect(() => {
    const handleTriggerNewCertificate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.aluno) {
        const student = customEvent.detail.aluno;
        // Open wizard auto populated
        setWizardSource('existente');
        setSelectedStudentId(student.id || '');
        setFormData({
          nomeAluno: student.nome || '',
          emailAluno: student.email || '',
          nomeFormacao: student.produtoComprado || student.produtoInteresse || 'Formação Executiva & Compliance',
          turma: student.turma || '',
          cargaHoraria: '120 horas',
          dataConclusao: new Date().toLocaleDateString('pt-BR'),
          dataEmissao: new Date().toLocaleDateString('pt-BR'),
          nomeInstrutora: 'Liana Gomes',
          textoComplementar: '',
          observacoesInternas: 'Criado diretamente da Ficha do Aluno'
        });
        setSelectedTemplateId(DEFAULT_TEMPLATES[0].id);
        setIsWizardOpen(true);
        setWizardStep(1);
      }
    };

    window.addEventListener('trigger_new_certificate', handleTriggerNewCertificate);
    return () => {
      window.removeEventListener('trigger_new_certificate', handleTriggerNewCertificate);
    };
  }, [pessoas]);

  // Helper sync
  const saveTemplates = (updated: CertificateTemplate[]) => {
    setTemplates(updated);
    localStorage.setItem('ilg_cert_templates', JSON.stringify(updated));
  };

  const saveIssued = (updated: IssuedCertificate[]) => {
    setIssuedCertificates(updated);
    localStorage.setItem('ilg_cert_issued', JSON.stringify(updated));
    // Trigger window event so that student profile reads it instantly
    window.dispatchEvent(new Event('certificados_updated'));
  };

  // Metrics calculations
  const metrics = useMemo(() => {
    const total = issuedCertificates.length;
    const gerados = issuedCertificates.filter(c => c.status === 'gerado' || c.status === 'enviado').length;
    const enviados = issuedCertificates.filter(c => c.status === 'enviado').length;
    const rascunhos = issuedCertificates.filter(c => c.status === 'rascunho').length;
    const erros = issuedCertificates.filter(c => c.status === 'erro_envio').length;

    return { total, gerados, enviados, rascunhos, erros };
  }, [issuedCertificates]);

  // Formatted preview replacement helper
  const renderTemplateText = (text: string, vars: typeof formData) => {
    return text
      .replace(/{nome_aluno}/g, vars.nomeAluno || '[Nome do Aluno]')
      .replace(/{email_aluno}/g, vars.emailAluno || '[E-mail]')
      .replace(/{nome_formacao}/g, vars.nomeFormacao || '[Nome da Formação]')
      .replace(/{turma}/g, vars.turma || '[Turma]')
      .replace(/{carga_horaria}/g, vars.cargaHoraria || '[Carga Horária]')
      .replace(/{data_conclusao}/g, vars.dataConclusao || '[Data de Conclusão]')
      .replace(/{data_emissao}/g, vars.dataEmissao || '[Data de Emissão]')
      .replace(/{nome_instrutora}/g, vars.nomeInstrutora || '[Instrutora G.]');
  };

  // Handle student selections
  const handleSelectStudent = (student: any) => {
    setSelectedStudentId(student.id);
    setFormData({
      ...formData,
      nomeAluno: student.nome || '',
      emailAluno: student.email || '',
      nomeFormacao: student.produtoComprado || student.produtoInteresse || 'Formação Executiva & Compliance',
      turma: student.turma || 'Turma A',
    });
  };

  // Find students from local pessoas data
  const filteredStudents = useMemo(() => {
    if (!searchStudentQuery.trim()) return pessoas;
    return pessoas.filter(p => p.nome?.toLowerCase().includes(searchStudentQuery.toLowerCase()) || p.email?.toLowerCase().includes(searchStudentQuery.toLowerCase()));
  }, [pessoas, searchStudentQuery]);

  // CSV Reader inside creator step
  const handleSampleCsv = () => {
    const sampleText = `nome_aluno,email_aluno,nome_formacao,turma,carga_horaria,data_conclusao,data_emissao
Fernanda Costa,fernanda.costa@gmail.com,Formação Executiva,Turma A,120 horas,20/05/2026,27/05/2026
Mariana Souza,mariana.souza@uol.com,Formação Líder,Turma B,60 horas,19/05/2026,27/05/2026
Ana Paula Martins,ana.paula@gmail.com,Workshop Compliance,Turma A,8 horas,15/05/2026,27/05/2026`;
    
    setBatchCsvHeaders(['nome_aluno', 'email_aluno', 'nome_formacao', 'turma', 'carga_horaria', 'data_conclusao', 'data_emissao']);
    
    const parsed = [
      { nomeAluno: 'Fernanda Costa', emailAluno: 'fernanda.costa@gmail.com', nomeFormacao: 'Formação Executiva & Compliance', turma: 'Turma A', cargaHoraria: '120 horas', dataConclusao: '20/05/2026', dataEmissao: '27/05/2026', nomeInstrutora: 'Liana Gomes' },
      { nomeAluno: 'Mariana Souza', emailAluno: 'mariana.souza@uol.com', nomeFormacao: 'Formação Líder / Liderança', turma: 'Turma B', cargaHoraria: '60 horas', dataConclusao: '19/05/2026', dataEmissao: '27/05/2026', nomeInstrutora: 'Liana Gomes' },
      { nomeAluno: 'Ana Paula Martins', emailAluno: 'ana.paula@gmail.com', nomeFormacao: 'Workshop Compliance', turma: 'Turma A', cargaHoraria: '8 horas', dataConclusao: '15/05/2026', dataEmissao: '27/05/2026', nomeInstrutora: 'Liana Gomes' }
    ];
    setBatchRecords(parsed);
    setFormData(parsed[0]);
    alert('Mock list carregado com sucesso! Mapeamento de colunas pronto.');
  };

  // Wizard transitions
  const stepForward = () => {
    if (wizardStep === 1) {
      if (wizardSource === 'existente' && !selectedStudentId) {
        alert('Por favor, selecione uma aluna existente para prosseguir.');
        return;
      }
      if (wizardSource === 'manual' && (!formData.nomeAluno || !formData.emailAluno || !formData.nomeFormacao)) {
        alert('Por favor, preencha o Nome, E-mail e Formação do Aluno.');
        return;
      }
      if (wizardSource === 'csv' && batchRecords.length === 0) {
        alert('Por favor, carregue a lista CSV ou use os dados de teste para prosseguir.');
        return;
      }
      setWizardStep(2);
    } else if (wizardStep === 2) {
      if (!selectedTemplateId) {
        alert('Por favor, selecione um template de certificado.');
        return;
      }
      // Populate step 3 data
      setPreviewEditingData({ ...formData });
      setWizardStep(3);
    }
  };

  // Create single certificate & save
  const handleGeneratePDF = (vars: typeof formData, template: CertificateTemplate, isBulk = false) => {
    const newCert: IssuedCertificate = {
      id: `cert-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      nomeAluno: vars.nomeAluno,
      emailAluno: vars.emailAluno,
      nomeFormacao: vars.nomeFormacao,
      turma: vars.turma,
      cargaHoraria: vars.cargaHoraria,
      dataConclusao: vars.dataConclusao,
      dataEmissao: vars.dataEmissao,
      nomeInstrutora: vars.nomeInstrutora,
      textoComplementar: vars.textoComplementar,
      observacoesInternas: vars.observacoesInternas,
      templateId: template.id,
      templateNome: template.nome,
      dataGeracao: new Date().toLocaleDateString('pt-BR'),
      status: 'gerado',
      linkPdf: '#', // download mock
      responsavel: auth.currentUser?.email?.split('@')[0] || 'Liana Gomes'
    };

    if (!isBulk) {
      const updatedList = [newCert, ...issuedCertificates];
      saveIssued(updatedList);
      
      // Open printing mode simulated
      printCertificateSimulated(newCert, template);
      
      setWizardStep(5);
      setActiveEmailCert(newCert);
      
      // Pre-fill email states
      setEmailSubject(`Seu certificado — Instituto Liana Gomes`);
      setEmailBody(`Olá, ${newCert.nomeAluno}.\n\nSegue em anexo o seu certificado referente à formação ${newCert.nomeFormacao}.\n\nParabéns pela sua participação e pelo compromisso com seu desenvolvimento profissional.\n\nCom carinho,\nEquipe Instituto Liana Gomes`);
    } else {
      return newCert;
    }
  };

  const printCertificateSimulated = (cert: IssuedCertificate, template: CertificateTemplate) => {
    // Generate beautiful custom iframe printing helper
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Seu navegador bloqueou o pop-up de visualização do PDF. Por favor, permita pop-ups para fazer download imediato ou clique em Baixar no Histórico.');
      return;
    }

    const tplStyle = getTemplateStyles(template.layoutVisual);

    printWindow.document.write(`
      <html>
        <head>
          <title>Certificado - ${cert.nomeAluno}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Inter:wght@400;600&family=Playfair+Display:ital,wght@0,600;1,400&display=swap');
            body { 
              margin: 0; 
              padding: 0; 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              height: 100vh; 
              background: #f3f4f6;
              font-family: 'Inter', sans-serif;
            }
            .cert-card {
              position: relative;
              width: 1050px;
              height: 700px;
              background-color: ${tplStyle.bg};
              color: ${tplStyle.text};
              border: 10px solid ${tplStyle.border};
              box-shadow: 0 10px 30px rgba(0,0,0,0.15);
              padding: 60px;
              box-sizing: border-box;
              display: flex;
              flex-col: column;
              text-align: center;
              justify-content: space-between;
              border-image: linear-gradient(to bottom right, #D4AF37, #9A7B1C, #D4AF37) 10;
            }
            .header {
              font-family: 'Cinzel', serif;
              letter-spacing: 4px;
              color: ${tplStyle.primaryText};
              margin-top: 10px;
            }
            .header h1 {
              font-size: 42px;
              margin: 0;
              font-weight: 700;
            }
            .header p {
              font-size: 14px;
              margin: 5px 0 0 0;
            }
            .content {
              font-family: 'Playfair Display', serif;
              font-size: 20px;
              line-height: 1.8;
              margin: 40px auto;
              max-width: 800px;
            }
            .highlight-name {
              font-size: 32px;
              font-weight: bold;
              display: block;
              margin: 15px 0;
              font-family: 'Cinzel', serif;
              color: #D4AF37;
            }
            .footer-info {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-top: auto;
              padding: 0 40px;
            }
            .sig-block {
              border-top: 1.5px solid ${tplStyle.mutedText};
              padding-top: 10px;
              width: 250px;
              font-size: 12px;
              color: ${tplStyle.mutedText};
            }
            .seal {
              width: 100px;
              height: 100px;
              border: 2px dashed #D4AF37;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: 'Cinzel', serif;
              font-weight: bold;
              font-size: 10px;
              color: #D4AF37;
              letter-spacing: 1px;
            }
            .print-btn {
              position: fixed;
              bottom: 20px;
              right: 20px;
              background: #0A192F;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-weight: bold;
              cursor: pointer;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              z-index: 1000;
            }
            @media print {
              .print-btn { display: none; }
              body { background: white; }
              .cert-card { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <button class="print-btn" onclick="window.print()">Imprimir / Salvar PDF</button>
          <div class="cert-card">
            <div class="header">
              <h1>CERTIFICADO</h1>
              <p>INSTITUTO LIANA GOMES</p>
            </div>
            <div class="content">
              Certificamos que
              <span class="highlight-name">${cert.nomeAluno}</span>
              concluiu com aproveitamento a formação <strong>${cert.nomeFormacao}</strong>, com carga horária de <strong>${cert.cargaHoraria}</strong>, organizada pelo Instituto Liana Gomes, referente à <strong>${cert.turma}</strong> em ${cert.dataConclusao}.
            </div>
            <div class="footer-info">
              <div class="sig-block">
                <strong>${cert.nomeInstrutora}</strong><br>
                Mentora / Diretora Geral
              </div>
              <div class="seal">
                SELO ILG<br>OFICIAL
              </div>
              <div class="sig-block">
                Emissão: ${cert.dataEmissao}<br>
                Código Autenticidade: ${cert.id.toUpperCase()}
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Run bulk emission flow
  const handleBulkEmission = async () => {
    if (!selectedTemplateId) {
      alert('Selecione um template antes de emitir em lote.');
      return;
    }
    const template = templates.find(t => t.id === selectedTemplateId);
    if (!template) return;

    if (!confirm(`Deseja emitir ${batchRecords.length} certificados em lote agora usando o template "${template.nome}"?`)) {
      return;
    }

    setIsBatchRunning(true);
    setBatchProgress(0);
    setBatchStatusLog([]);

    const userEmail = auth.currentUser?.email?.split('@')[0] || 'Liana Gomes';
    const newCertificates: IssuedCertificate[] = [];

    for (let i = 0; i < batchRecords.length; i++) {
      const rec = batchRecords[i];
      // Delay to simulate processing elegantly
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const newCert: IssuedCertificate = {
        id: `cert-batch-${Date.now()}-${i}`,
        nomeAluno: rec.nomeAluno,
        emailAluno: rec.emailAluno || 'aluno@ilg.com.br',
        nomeFormacao: rec.nomeFormacao || template.nome.replace('Certificado Padrão ILG - ', ''),
        turma: rec.turma || 'Turma Lote',
        cargaHoraria: rec.cargaHoraria || template.cargaHorariaPadrao,
        dataConclusao: rec.dataConclusao || new Date().toLocaleDateString('pt-BR'),
        dataEmissao: rec.dataEmissao || new Date().toLocaleDateString('pt-BR'),
        nomeInstrutora: 'Liana Gomes',
        templateId: template.id,
        templateNome: template.nome,
        dataGeracao: new Date().toLocaleDateString('pt-BR'),
        status: 'gerado',
        linkPdf: '#',
        responsavel: userEmail
      };

      newCertificates.push(newCert);
      setBatchProgress(Math.round(((i + 1) / batchRecords.length) * 100));
      setBatchStatusLog(prev => [...prev, `[Sucesso] Certificado de ${rec.nomeAluno} confeccionado.`]);
    }

    // Append to existing
    const updatedAll = [...newCertificates, ...issuedCertificates];
    saveIssued(updatedAll);
    setIsBatchRunning(false);

    alert(`${batchRecords.length} certificados foram gerados em lote e adicionados ao seu histórico!`);
    setIsWizardOpen(false);
    setWizardStep(1);
    setActiveSubTab('historico');
  };

  // Simulate sending single Certificate email
  const handleSendEmailSubmit = () => {
    if (!activeEmailCert) return;
    setIsSendingEmail(true);

    setTimeout(() => {
      setIsSendingEmail(false);
      
      // Update certificate status to sent in history
      const updated = issuedCertificates.map(c => {
        if (c.id === activeEmailCert.id) {
          return {
            ...c,
            status: 'enviado' as const,
            dataEnvio: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})
          };
        }
        return c;
      });

      saveIssued(updated);
      setIsEmailModalOpen(false);
      alert(`E-mail enviado com sucesso para ${activeEmailCert.emailAluno}! Status atualizado para "Enviado".`);
      setWizardStep(1);
      setIsWizardOpen(false);
      setActiveSubTab('historico');
    }, 1200);
  };

  // Template custom actions
  const handleToggleTemplateStatus = (tplId: string) => {
    const updated = templates.map(t => t.id === tplId ? { ...t, statusAtivo: !t.statusAtivo } : t);
    saveTemplates(updated);
  };

  const handleDeleteTemplate = (tplId: string, nome: string) => {
    if (confirm(`Excluir permanentemente o template "${nome}"?`)) {
      saveTemplates(templates.filter(t => t.id !== tplId));
    }
  };

  const handleDuplicateTemplate = (tpl: CertificateTemplate) => {
    const duplicated: CertificateTemplate = {
      ...tpl,
      id: `tpl-${Date.now()}`,
      nome: `${tpl.nome} (Cópia)`
    };
    saveTemplates([...templates, duplicated]);
    alert('Template duplicado com sucesso!');
  };

  const handleCreateOrSaveTemplate = (tpl: CertificateTemplate) => {
    const exists = templates.some(t => t.id === tpl.id);
    if (exists) {
      saveTemplates(templates.map(t => t.id === tpl.id ? tpl : t));
    } else {
      saveTemplates([...templates, tpl]);
    }
    setIsTemplateEditorOpen(false);
    setEditingTemplate(null);
    alert('Template salvo com sucesso!');
  };

  // Filtered History table records
  const filteredHistory = useMemo(() => {
    return issuedCertificates.filter(c => {
      const matchSearch = !histSearch || 
        c.nomeAluno.toLowerCase().includes(histSearch.toLowerCase()) ||
        c.nomeFormacao.toLowerCase().includes(histSearch.toLowerCase());
      
      const matchFormacao = histFormacao === 'all' || c.nomeFormacao === histFormacao;
      const matchTurma = histTurma === 'all' || c.turma === histTurma;
      const matchStatus = histStatus === 'all' || c.status === histStatus;

      return matchSearch && matchFormacao && matchTurma && matchStatus;
    });
  }, [issuedCertificates, histSearch, histFormacao, histTurma, histStatus]);

  // Unique lists for filtering dropdowns
  const uniqueFormacoes = useMemo(() => {
    const list = issuedCertificates.map(c => c.nomeFormacao);
    return Array.from(new Set(list));
  }, [issuedCertificates]);

  const uniqueTurmas = useMemo(() => {
    const list = issuedCertificates.map(c => c.turma);
    return Array.from(new Set(list));
  }, [issuedCertificates]);

  // Style helper for card visual backgrounds
  const getTemplateStyles = (layout: CertificateTemplate['layoutVisual']) => {
    switch (layout) {
      case 'navy_premium':
        return {
          bg: '#0A192F',
          text: '#ffffff',
          primaryText: '#ffffff',
          secondaryText: '#D4AF37',
          border: '#D4AF37',
          mutedText: '#94A3B8',
          textClass: 'text-white'
        };
      case 'petroleum_elegant':
        return {
          bg: '#1E3A8A',
          text: '#ffffff',
          primaryText: '#ffffff',
          secondaryText: '#F3F4F6',
          border: '#F3F4F6',
          mutedText: '#93C5FD',
          textClass: 'text-white'
        };
      case 'beige_classic':
        return {
          bg: '#FDFBF7',
          text: '#1F2937',
          primaryText: '#0A192F',
          secondaryText: '#D4AF37',
          border: '#D4AF37',
          mutedText: '#6B7280',
          textClass: 'text-slate-800'
        };
      case 'warm_white_minimal':
      default:
        return {
          bg: '#F9FAFB',
          text: '#111827',
          primaryText: '#111827',
          secondaryText: '#6B7280',
          border: '#E5E7EB',
          mutedText: '#9CA3AF',
          textClass: 'text-slate-900'
        };
    }
  };

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  return (
    <div className="space-y-6 pb-20 animate-fade-in select-none">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0A192F] flex items-center gap-2">
            <Award className="w-8 h-8 text-[#D4AF37]" />
            <span>Painel de Certificados</span>
          </h1>
          <p className="text-slate-500 text-sm">
            Confecção de certificados institucionais e envio direto por e-mail para as alunas do Instituto Liana Gomes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              // Clear state, default preset
              setWizardSource('existente');
              setWizardStep(1);
              setSelectedStudentId('');
              setFormData({
                nomeAluno: '',
                emailAluno: '',
                nomeFormacao: 'Formação Executiva & Compliance',
                turma: 'Turma A',
                cargaHoraria: '120 horas',
                dataConclusao: new Date().toLocaleDateString('pt-BR'),
                dataEmissao: new Date().toLocaleDateString('pt-BR'),
                nomeInstrutora: 'Liana Gomes',
                textoComplementar: '',
                observacoesInternas: ''
              });
              setSelectedTemplateId(templates[0]?.id || '');
              setIsWizardOpen(true);
            }}
            id="btn-criar-cert"
            className="px-4 py-2 bg-[#0A192F] hover:bg-[#D4AF37] text-white hover:text-[#0A192F] text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Certificado</span>
          </button>

          <button
            onClick={() => {
              setWizardSource('csv');
              setWizardStep(1);
              setBatchRecords([]);
              setSelectedTemplateId(templates[0]?.id || '');
              setIsWizardOpen(true);
            }}
            className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-1.5"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Gerar em Lote (CSV)</span>
          </button>
        </div>
      </div>

      {/* OPERATIONAL METRICS CARDS PANEL */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        <div 
          onClick={() => { setActiveSubTab('historico'); setHistStatus('all'); }} 
          className="bg-white border border-slate-200/80 p-4 rounded-xl cursor-pointer hover:border-slate-400 transition flex items-center justify-between"
        >
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Confeccionados</span>
            <p className="text-xl font-extrabold text-[#0A192F] tracking-tight">{metrics.total}</p>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg text-slate-600">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div 
          onClick={() => { setActiveSubTab('historico'); setHistStatus('gerado'); }} 
          className="bg-white border border-slate-200/80 p-4 rounded-xl cursor-pointer hover:border-emerald-400 transition flex items-center justify-between"
        >
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">PDFs Gerados</span>
            <p className="text-xl font-extrabold text-emerald-600 tracking-tight">{metrics.gerados}</p>
          </div>
          <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-600">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div 
          onClick={() => { setActiveSubTab('historico'); setHistStatus('enviado'); }} 
          className="bg-white border border-slate-200/80 p-4 rounded-xl cursor-pointer hover:border-indigo-400 transition flex items-center justify-between"
        >
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Enviados por E-mail</span>
            <p className="text-xl font-extrabold text-indigo-700 tracking-tight">{metrics.enviados}</p>
          </div>
          <div className="p-2.5 bg-indigo-50 rounded-lg text-indigo-705">
            <Mail className="w-5 h-5" />
          </div>
        </div>

        <div 
          onClick={() => { setActiveSubTab('historico'); setHistStatus('rascunho'); }} 
          className="bg-white border border-slate-200/80 p-4 rounded-xl cursor-pointer hover:border-amber-400 transition flex items-center justify-between"
        >
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Em Rascunho</span>
            <p className="text-xl font-extrabold text-amber-600 tracking-tight">{metrics.rascunhos}</p>
          </div>
          <div className="p-2.5 bg-amber-50 rounded-lg text-amber-600">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div 
          onClick={() => { setActiveSubTab('historico'); setHistStatus('erro_envio'); }} 
          className="bg-white border text-left border-slate-200/80 p-4 col-span-2 md:col-span-1 rounded-xl cursor-pointer hover:border-red-400 transition flex items-center justify-between"
        >
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 text-left">Falha de Envio</span>
            <p className="text-xl font-extrabold text-red-650 tracking-tight">{metrics.erros}</p>
          </div>
          <div className="p-2.5 bg-red-50 rounded-lg text-red-650">
            <AlertCircle className="w-5 h-5 text-red-650" />
          </div>
        </div>

      </div>

      {/* CORE NAVIGATION BAR */}
      <div className="bg-white border border-slate-200 rounded-xl p-1.5 flex gap-2">
        <button
          onClick={() => setActiveSubTab('dashboard')}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition ${
            activeSubTab === 'dashboard' ? 'bg-[#0A192F] text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Visão Geral & Atalhos
        </button>
        <button
          onClick={() => setActiveSubTab('historico')}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition ${
            activeSubTab === 'historico' ? 'bg-[#0A192F] text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Histórico de Emissões ({issuedCertificates.length})
        </button>
        <button
          onClick={() => setActiveSubTab('templates')}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition ${
            activeSubTab === 'templates' ? 'bg-[#0A192F] text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Modelos / Templates ({templates.length})
        </button>
      </div>

      {/* TAB 1: VISÃO GERAL */}
      {activeSubTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-gradient-to-br from-[#0A192F] to-[#1E3A8A] text-white p-6 rounded-2xl shadow-md border border-[#D4AF37]/30 space-y-4">
              <div className="flex justify-between items-start">
                <span className="p-3 bg-white/10 rounded-xl border border-white/20">
                  <Award className="w-5 h-5 text-amber-400" />
                </span>
                <span className="text-[10px] uppercase tracking-widest font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                  ILG Certs Engine
                </span>
              </div>
              <div>
                <h4 className="font-extrabold text-sm uppercase tracking-wide">Como criar certificados em 3 passos?</h4>
                <p className="text-slate-300 text-[11px] leading-relaxed mt-1">
                  Selecione o aluno direto da base CRM, determine o tipo de template oficial (Navy, Petroleum, Beige ou Minimal) e faça a geração do PDF. O sistema já cria o link de download e permite envio de e-mail integrado em segundos.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setWizardSource('existente');
                    setWizardStep(1);
                    setSelectedStudentId('');
                    setIsWizardOpen(true);
                  }}
                  className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-[#0A192F] text-xs font-extrabold uppercase rounded-lg shadow transition"
                >
                  Criar Novo Agora
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-800 border-b pb-2 flex items-center justify-between">
                <span>Estatísticas de Categoria</span>
                <Sliders className="w-4 h-4 text-slate-400" />
              </h3>

              <div className="space-y-3">
                {['conclusao', 'participacao', 'formacao', 'workshop'].map(type => {
                  const count = issuedCertificates.filter(c => {
                    const tpl = templates.find(t => t.id === c.templateId);
                    return (tpl?.tipo || 'conclusao') === type;
                  }).length;
                  const pct = issuedCertificates.length ? Math.round((count / issuedCertificates.length) * 100) : 0;

                  return (
                    <div key={type} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="capitalize text-slate-700 font-semibold">{type}</span>
                        <span className="text-slate-500">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-[#0A192F] h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4">
              <div className="flex justify-between items-center border-b pb-3.5">
                <h3 className="text-sm font-extrabold uppercase tracking-wide text-[#0A192F] flex items-center gap-1.5">
                  <History className="w-4.5 h-4.5 text-slate-500" />
                  <span>Atividades de Emissão Recentes</span>
                </h3>
                <button 
                  onClick={() => setActiveSubTab('historico')}
                  className="text-xs text-[#0A192F] hover:text-[#D4AF37] font-bold"
                >
                  Ver Histórico Completo →
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {issuedCertificates.slice(0, 5).map(cert => {
                  const tpl = templates.find(t => t.id === cert.templateId);
                  const isSent = cert.status === 'enviado';
                  const isError = cert.status === 'erro_envio';

                  return (
                    <div key={cert.id} className="py-3.5 flex items-center justify-between hover:bg-slate-50/50 px-2 rounded-lg transition">
                      <div className="flex items-center gap-3">
                        <span className="p-2 bg-indigo-50 border border-indigo-100 rounded-lg text-[#0A192F]">
                          <Award className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="font-bold text-xs text-slate-800">{cert.nomeAluno}</h4>
                          <p className="text-[10px] text-slate-400">
                            {cert.nomeFormacao} • {cert.turma} • Responsável: <strong>{cert.responsavel}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <span className="text-[10px] text-slate-400 font-mono italic block">{cert.dataGeracao}</span>
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase mt-1 ${
                            isSent ? 'bg-indigo-100 text-indigo-700' :
                            isError ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {cert.status === 'enviado' ? 'E-mail Enviado' : cert.status === 'gerado' ? 'PDF Gerado' : cert.status}
                          </span>
                        </div>

                        <div className="flex gap-1.5">
                          <button
                            onClick={() => {
                              const templateObj = templates.find(t => t.id === cert.templateId) || templates[0];
                              printCertificateSimulated(cert, templateObj);
                            }}
                            className="p-1 px-2 border border-slate-200 hover:bg-slate-50 rounded text-xs text-[#0A192F] font-bold"
                            title="Visualizar Certificado"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          
                          <button
                            onClick={() => {
                              setActiveEmailCert(cert);
                              setEmailSubject(`Seu certificado — Instituto Liana Gomes`);
                              setEmailBody(`Olá, ${cert.nomeAluno}.\n\nSegue em anexo o seu certificado referente à formação ${cert.nomeFormacao}.\n\nParabéns pela sua participação e pelo compromisso com seu desenvolvimento profissional.\n\nCom carinho,\nEquipe Instituto Liana Gomes`);
                              setIsEmailModalOpen(true);
                            }}
                            className="p-1 px-2 bg-[#0A192F] hover:bg-[#D4AF37] hover:text-[#0A192F] text-white rounded text-xs font-bold"
                            title="Enviar por e-mail"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: HISTÓRICO DE EMISSÕES */}
      {activeSubTab === 'historico' && (
        <div className="bg-white border rounded-2xl p-5 space-y-4">
          
          {/* SEARCH FILTERS */}
          <div className="flex flex-wrap gap-3 items-center justify-between border-b pb-4 select-none">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Filtrar por nome de aluna..."
                  value={histSearch}
                  onChange={e => setHistSearch(e.target.value)}
                  className="pl-9 bg-slate-50 border border-slate-200 rounded-lg text-xs py-2 w-56 font-semibold outline-none focus:bg-white focus:border-indigo-400"
                />
              </div>

              <select
                value={histFormacao}
                onChange={e => setHistFormacao(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg text-xs py-2.5 px-3 font-semibold outline-none"
              >
                <option value="all">Todas Formações</option>
                {uniqueFormacoes.map(f => (<option key={f} value={f}>{f}</option>))}
              </select>

              <select
                value={histTurma}
                onChange={e => setHistTurma(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg text-xs py-2.5 px-3 font-semibold outline-none"
              >
                <option value="all">Todas as Turmas</option>
                {uniqueTurmas.map(t => (<option key={t} value={t}>{t}</option>))}
              </select>

              <select
                value={histStatus}
                onChange={e => setHistStatus(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg text-xs py-2.5 px-3 font-semibold outline-none"
              >
                <option value="all">Todos Status</option>
                <option value="rascunho">Rascunho</option>
                <option value="gerado">PDF Gerado</option>
                <option value="enviado">E-mail Enviado</option>
                <option value="erro_envio">Erro de Envio</option>
              </select>
            </div>

            <button
              onClick={() => {
                setHistSearch('');
                setHistFormacao('all');
                setHistTurma('all');
                setHistStatus('all');
              }}
              className="text-xs text-slate-500 font-bold hover:underline"
            >
              Limpar Filtros
            </button>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-[#0A192F] text-white">
                <tr>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Aluna / E-mail</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Formação / Turma</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Template Usado</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Emitido Em</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredHistory.map(cert => {
                  const isSent = cert.status === 'enviado';
                  const isDraft = cert.status === 'rascunho';
                  const isError = cert.status === 'erro_envio';

                  return (
                    <tr key={cert.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 text-xs">
                        <p className="font-extrabold text-[#0A192F]">{cert.nomeAluno}</p>
                        <p className="text-[10px] text-slate-400">{cert.emailAluno}</p>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <p className="font-bold text-slate-700">{cert.nomeFormacao}</p>
                        <p className="text-[10px] text-slate-400">{cert.turma}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 font-semibold">{cert.templateNome}</td>
                      <td className="px-4 py-3 text-xs text-slate-500 font-mono">{cert.dataGeracao}</td>
                      <td className="px-4 py-3 text-xs">
                        <span className={`inline-block px-2 text-[10px] font-extrabold uppercase rounded ${
                          isSent ? 'bg-indigo-100 text-indigo-700' :
                          isError ? 'bg-red-100 text-red-700' :
                          isDraft ? 'bg-amber-100 text-amber-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {cert.status === 'enviado' ? 'E-mail Enviado' : cert.status === 'gerado' ? 'PDF Gerado' : cert.status}
                        </span>
                        {cert.dataEnvio && (
                          <span className="text-[9px] text-slate-400 block mt-0.5">{cert.dataEnvio}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={() => {
                              const templateObj = templates.find(t => t.id === cert.templateId) || templates[0];
                              printCertificateSimulated(cert, templateObj);
                            }}
                            className="p-1.5 hover:bg-slate-100 rounded text-[#0A192F]"
                            title="Visualizar & Imprimir PDF"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setActiveEmailCert(cert);
                              setEmailSubject(`Seu certificado — Instituto Liana Gomes`);
                              setEmailBody(`Olá, ${cert.nomeAluno}.\n\nSegue em anexo o seu certificado referente à formação ${cert.nomeFormacao}.\n\nParabéns pela sua participação e pelo compromisso com seu desenvolvimento profissional.\n\nCom carinho,\nEquipe Instituto Liana Gomes`);
                              setIsEmailModalOpen(true);
                            }}
                            className="p-1.5 hover:bg-slate-100 rounded text-indigo-650"
                            title="Enviar por e-mail"
                          >
                            <Mail className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Deseja clonar os dados deste certificado para criar um novo?`)) {
                                setWizardSource('manual');
                                setFormData({
                                  nomeAluno: cert.nomeAluno,
                                  emailAluno: cert.emailAluno,
                                  nomeFormacao: cert.nomeFormacao,
                                  turma: cert.turma,
                                  cargaHoraria: cert.cargaHoraria,
                                  dataConclusao: cert.dataConclusao,
                                  dataEmissao: cert.dataEmissao,
                                  nomeInstrutora: cert.nomeInstrutora,
                                  textoComplementar: cert.textoComplementar || '',
                                  observacoesInternas: `Duplicado de ${cert.id}`
                                });
                                setSelectedTemplateId(cert.templateId);
                                setIsWizardOpen(true);
                                setWizardStep(1);
                              }
                            }}
                            className="p-1.5 hover:bg-slate-100 rounded text-amber-600"
                            title="Duplicar Certificado"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Excluir permanentemente este registro de certificado de ${cert.nomeAluno}?`)) {
                                saveIssued(issuedCertificates.filter(item => item.id !== cert.id));
                              }
                            }}
                            className="p-1.5 hover:bg-slate-100 rounded text-red-500 hover:text-red-700"
                            title="Deletar Registro"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredHistory.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-slate-400 font-semibold text-xs py-12 bg-slate-50/50">
                      Nenhum certificado emitido localizado nos critérios informados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* TAB 3: TEMPLATES / MODELOS */}
      {activeSubTab === 'templates' && (
        <div className="space-y-6">
          
          <div className="flex justify-between items-center bg-white border border-slate-200 p-4 rounded-xl">
            <div>
              <h3 className="text-sm font-extrabold text-[#0A192F] uppercase">Gerenciador de Modelos</h3>
              <p className="text-xs text-slate-500">
                Ative, desative, edite os textos variáveis ou duplique templates prontificados do Instituto Liana Gomes.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingTemplate({
                  id: `tpl-${Date.now()}`,
                  nome: 'Novo Template Personalizado',
                  tipo: 'conclusao',
                  layoutVisual: 'navy_premium',
                  textoPrincipal: 'Certificamos que {nome_aluno} concluiu a formação {nome_formacao}, com carga horária de {carga_horaria}, realizada pelo Instituto Liana Gomes.',
                  cargaHorariaPadrao: '40 horas',
                  assinatura: 'Profª. Liana Gomes • Mentora',
                  logo: 'brasao_discreto',
                  corPrincipal: '#0A192F',
                  corSecundaria: '#D4AF37',
                  statusAtivo: true
                });
                setIsTemplateEditorOpen(true);
              }}
              className="px-4.5 py-2 bg-[#0A192F] text-white hover:bg-slate-900 text-xs font-bold uppercase rounded-lg shadow transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Template</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.map(tpl => {
              const countUsed = issuedCertificates.filter(c => c.templateId === tpl.id).length;
              const isNavy = tpl.layoutVisual === 'navy_premium';
              const isPetrol = tpl.layoutVisual === 'petroleum_elegant';
              const isBeige = tpl.layoutVisual === 'beige_classic';

              return (
                <div 
                  key={tpl.id}
                  className="bg-white border rounded-2xl shadow-xs p-5 flex flex-col justify-between hover:border-indigo-400 transition"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] uppercase font-extrabold tracking-widest bg-yellow-100 text-yellow-800 border border-yellow-200 py-0.5 px-2 rounded">
                        {tpl.tipo}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${tpl.statusAtivo ? 'bg-emerald-500 animate-pulse' : 'bg-slate-350'}`} />
                        <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wide">
                          {tpl.statusAtivo ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </div>

                    <h4 className="font-extrabold text-[#0A192F] text-sm uppercase mb-1">{tpl.nome}</h4>
                    <span className="text-[10px] text-slate-400 font-medium block mb-3.5">
                      Usado em <strong>{countUsed}</strong> certificados emitidos
                    </span>

                    {/* MOCK THUMBNAIL PREVIEW */}
                    <div className="p-4 border rounded-xl my-4 text-xs font-semibold scale-95 origin-center text-left" style={{
                      backgroundColor: isNavy ? '#0A192F' : isPetrol ? '#1E3A8A' : isBeige ? '#FDFBF7' : '#F9FAFB',
                      color: (isNavy || isPetrol) ? '#E2E8F0' : '#374151',
                      border: `3px solid ${tpl.corSecundaria}`
                    }}>
                      <div className="flex justify-between items-center mb-2 select-none">
                        <span className="text-[9px] font-mono tracking-widest opacity-80 uppercase font-bold">CERTIFICADO OFICIAL</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                      </div>
                      <p className="text-[9px] leading-relaxed truncate mb-1.5">{tpl.textoPrincipal}</p>
                      <div className="flex justify-between items-center text-[8px] opacity-75 mt-3 border-t pt-1.5 pb-0.5 border-dashed">
                        <span>Carga: {tpl.cargaHorariaPadrao}</span>
                        <span>{tpl.assinatura}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingTemplate(tpl);
                        setIsTemplateEditorOpen(true);
                      }}
                      className="flex-1 py-2 text-xs font-bold border rounded-lg text-slate-700 hover:bg-slate-50 transition uppercase tracking-wide flex justify-center items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>

                    <button
                      onClick={() => handleToggleTemplateStatus(tpl.id)}
                      className={`px-3 py-2 text-xs font-bold border rounded-lg transition uppercase tracking-wide`}
                      title={tpl.statusAtivo ? 'Desativar template' : 'Ativar template'}
                    >
                      {tpl.statusAtivo ? 'Desativar' : 'Ativar'}
                    </button>

                    <button
                      onClick={() => handleDuplicateTemplate(tpl)}
                      className="p-2 hover:bg-slate-50 border rounded-lg text-amber-500"
                      title="Duplicar Modelo"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteTemplate(tpl.id, tpl.nome)}
                      className="p-2 hover:bg-red-50 hover:text-red-650 border rounded-lg text-slate-300 transition"
                      title="Deletar Modelo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* MODAL: STEP-BY-STEP CERTIFICATE CREATION WIZARD */}
      {isWizardOpen && (
        <div className="fixed inset-0 bg-slate-950/55 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl border border-slate-200 overflow-hidden flex flex-col my-8 shadow-2xl animate-fade-in text-left">
            
            {/* Header step progress */}
            <div className="p-4.5 bg-[#0A192F] border-b text-white flex justify-between items-center select-none shrink-0 shadow-sm">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-sm uppercase tracking-wider">
                  Assistente de Emissão (Passo {wizardStep} de 5)
                </h3>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(step => (
                  <span key={step} className={`w-6 h-1.5 rounded ${wizardStep >= step ? 'bg-amber-400' : 'bg-slate-700'}`} />
                ))}
              </div>
            </div>

            <div className="flex-1 p-6 space-y-5 overflow-y-auto max-h-[70vh]">
              
              {/* STEP 1: CHOOSE DATA ORIGIN */}
              {wizardStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-extrabold uppercase text-[#0A192F] mb-1.5">Escolha a origem dos dados do aluno:</h4>
                    <p className="text-slate-500 text-xs">Determine como o assistente receberá as variáveis do aluno e da formação.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-semibold select-none">
                    <label className={`p-4 border rounded-xl cursor-pointer flex gap-3 items-start transition ${
                      wizardSource === 'existente' ? 'border-[#0A192F] bg-indigo-50/20' : 'border-slate-200 hover:bg-slate-50/50'
                    }`}>
                      <input 
                        type="radio" 
                        name="wizardSource" 
                        checked={wizardSource === 'existente'} 
                        onChange={() => { setWizardSource('existente'); }} 
                        className="mt-1"
                      />
                      <div>
                        <span className="text-xs uppercase font-extrabold text-slate-800 block">Aluno Existente</span>
                        <span className="text-[10px] font-medium text-slate-500 block mt-1 leading-normal">
                          Selecione um aluno da Base de Pessoas, o sistema carregará o nome, e-mail e formação comprada automaticamente.
                        </span>
                      </div>
                    </label>

                    <label className={`p-4 border rounded-xl cursor-pointer flex gap-3 items-start transition ${
                      wizardSource === 'manual' ? 'border-[#0A192F] bg-indigo-50/20' : 'border-slate-200 hover:bg-slate-50/50'
                    }`}>
                      <input 
                        type="radio" 
                        name="wizardSource" 
                        checked={wizardSource === 'manual'} 
                        onChange={() => { setWizardSource('manual'); }} 
                        className="mt-1"
                      />
                      <div>
                        <span className="text-xs uppercase font-extrabold text-slate-800 block">Digitação Manual</span>
                        <span className="text-[10px] font-medium text-slate-500 block mt-1 leading-normal">
                          Insira manualmente todos os dados em um formulário rápido (útil para eventos isolados do ILG).
                        </span>
                      </div>
                    </label>

                    <label className={`p-4 border rounded-xl cursor-pointer flex gap-3 items-start transition ${
                      wizardSource === 'csv' ? 'border-[#0A192F] bg-indigo-50/20' : 'border-slate-200 hover:bg-slate-50/50'
                    }`}>
                      <input 
                        type="radio" 
                        name="wizardSource" 
                        checked={wizardSource === 'csv'} 
                        onChange={() => { setWizardSource('csv'); }} 
                        className="mt-1"
                      />
                      <div>
                        <span className="text-xs uppercase font-extrabold text-slate-800 block">Importação de CSV</span>
                        <span className="text-[10px] font-medium text-slate-500 block mt-1 leading-normal">
                          Importe uma lista em formato CSV estruturado para emitir múltiplos certificados em massa.
                        </span>
                      </div>
                    </label>
                  </div>

                  <div className="h-px bg-slate-100 my-4" />

                  {/* SUBSECTION IF EXISTING STUDENT */}
                  {wizardSource === 'existente' && (
                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Buscar aluna pelo nome ou e-mail..."
                          value={searchStudentQuery}
                          onChange={e => setSearchStudentQuery(e.target.value)}
                          className="pl-9 w-full text-xs font-semibold py-2.5 border border-slate-305 bg-slate-50 rounded-lg outline-none focus:bg-white"
                        />
                      </div>

                      <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-xl divide-y bg-white text-xs font-bold">
                        {filteredStudents.map(student => {
                          const isSelected = selectedStudentId === student.id;
                          return (
                            <div
                              key={student.id}
                              onClick={() => handleSelectStudent(student)}
                              className={`p-3 cursor-pointer flex justify-between items-center hover:bg-slate-50/80 transition ${
                                isSelected ? 'bg-indigo-50/50 border-l-4 border-indigo-600' : ''
                              }`}
                            >
                              <div>
                                <p className="text-slate-900">{student.nome}</p>
                                <p className="text-[10px] text-slate-450">{student.email} • {student.telefone || 'Sem WhatsApp'}</p>
                              </div>

                              <div className="text-right">
                                <span className="text-[10px] uppercase block tracking-wide px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                                  {student.produtoComprado || student.produtoInteresse || 'Sem Curso'}
                                </span>
                                {isSelected && (
                                  <span className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-1 justify-end mt-1">
                                    <Check className="w-3 h-3" /> Selecionado
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {filteredStudents.length === 0 && (
                          <div className="p-8 text-center text-slate-400">Nenhum aluno localizado.</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* SUBSECTION MANUAL INPUT */}
                  {wizardSource === 'manual' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-slate-700">
                      <div>
                        <label className="block mb-1 uppercase text-[10px] text-slate-500">Nome completo do aluno:</label>
                        <input
                          type="text"
                          value={formData.nomeAluno}
                          onChange={e => setFormData({ ...formData, nomeAluno: e.target.value })}
                          placeholder="Ex: Beatriz Cardoso Nogueira"
                          className="w-full border p-2.5 bg-white font-medium rounded-lg text-xs outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 uppercase text-[10px] text-slate-500">E-mail do aluno:</label>
                        <input
                          type="email"
                          value={formData.emailAluno}
                          onChange={e => setFormData({ ...formData, emailAluno: e.target.value })}
                          placeholder="Ex: beatriz.nog@uol.com"
                          className="w-full border p-2.5 bg-white font-medium rounded-lg text-xs outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 uppercase text-[10px] text-slate-500">Nome da Formação:</label>
                        <input
                          type="text"
                          value={formData.nomeFormacao}
                          onChange={e => setFormData({ ...formData, nomeFormacao: e.target.value })}
                          placeholder="Ex: Formação Executiva & Compliance"
                          className="w-full border p-2.5 bg-white font-medium rounded-lg text-xs outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block mb-1 uppercase text-[10px] text-slate-500">Turma:</label>
                          <input
                            type="text"
                            value={formData.turma}
                            onChange={e => setFormData({ ...formData, turma: e.target.value })}
                            placeholder="Ex: Turma Executiva A"
                            className="w-full border p-2.5 bg-white font-medium rounded-lg text-xs outline-none"
                          />
                        </div>

                        <div>
                          <label className="block mb-1 uppercase text-[10px] text-slate-500">Carga Horária:</label>
                          <input
                            type="text"
                            value={formData.cargaHoraria}
                            onChange={e => setFormData({ ...formData, cargaHoraria: e.target.value })}
                            placeholder="Ex: 120 horas"
                            className="w-full border p-2.5 bg-white font-medium rounded-lg text-xs outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block mb-1 uppercase text-[10px] text-slate-500">Conclusão:</label>
                          <input
                            type="text"
                            value={formData.dataConclusao}
                            onChange={e => setFormData({ ...formData, dataConclusao: e.target.value })}
                            className="w-full border p-2.5 bg-white font-medium rounded-lg text-xs outline-none"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 uppercase text-[10px] text-slate-500">Emissão:</label>
                          <input
                            type="text"
                            value={formData.dataEmissao}
                            onChange={e => setFormData({ ...formData, dataEmissao: e.target.value })}
                            className="w-full border p-2.5 bg-white font-medium rounded-lg text-xs outline-none"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 uppercase text-[10px] text-slate-500">Signatária:</label>
                          <input
                            type="text"
                            value={formData.nomeInstrutora}
                            onChange={e => setFormData({ ...formData, nomeInstrutora: e.target.value })}
                            className="w-full border p-2.5 bg-white font-medium rounded-lg text-xs outline-none"
                          />
                        </div>
                      </div>

                      <div className="col-span-1 md:col-span-2 space-y-3 pt-2">
                        <div>
                          <label className="block mb-1 uppercase text-[10px] text-slate-500">Texto Complementar (Opcional):</label>
                          <textarea
                            rows={2}
                            value={formData.textoComplementar}
                            onChange={e => setFormData({ ...formData, textoComplementar: e.target.value })}
                            placeholder="Adicione um parágrafo que complemente o certificado (participou de workshop prático avançado modular...)"
                            className="w-full border p-2.5 bg-white font-medium rounded-lg text-xs outline-none"
                          />
                        </div>

                        <div>
                          <label className="block mb-1 uppercase text-[10px] text-slate-500">Observações Internas (Opcional):</label>
                          <input
                            type="text"
                            value={formData.observacoesInternas}
                            onChange={e => setFormData({ ...formData, observacoesInternas: e.target.value })}
                            placeholder="Notas da equipe sobre este certificado"
                            className="w-full border p-2.5 bg-white font-medium rounded-lg text-xs outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUBSECTION CSV BATCH */}
                  {wizardSource === 'csv' && (
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 hover:border-indigo-400 transition text-center select-none space-y-3">
                        <Upload className="w-10 h-10 text-slate-400 mx-auto" />
                        <div>
                          <h5 className="font-extrabold text-[#0A192F] text-xs uppercase mb-1">Upload da Lista CSV</h5>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Arraste ou selecione seu arquivo CSV (.csv) com colunas do aluno de certificação.
                          </p>
                        </div>

                        <div className="flex gap-2 justify-center pt-2">
                          <button
                            onClick={handleSampleCsv}
                            type="button"
                            className="px-3.5 py-1.5 bg-indigo-55 bg-[#0A192F] text-white text-[11px] font-bold uppercase tracking-wider rounded transition"
                          >
                            Carregar Dados de Teste ILG
                          </button>
                        </div>
                      </div>

                      {batchRecords.length > 0 && (
                        <div className="bg-slate-50 border p-4.5 rounded-xl space-y-2">
                          <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Lista de Alunas Mapeadas ({batchRecords.length} registros):</span>
                          <div className="max-h-40 overflow-y-auto divide-y bg-white border rounded text-[11px]">
                            {batchRecords.map((item, idx) => (
                              <div key={idx} className="p-2 font-medium flex justify-between">
                                <span className="font-bold text-[#0A192F]">{item.nomeAluno}</span>
                                <span className="text-slate-550">{item.emailAluno}</span>
                                <span className="text-slate-500 italic font-mono">{item.nomeFormacao}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}

              {/* STEP 2: CHOOSE TEMPLATE */}
              {wizardStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-extrabold uppercase text-[#0A192F] mb-1.5">Selecione o Template Oficial:</h4>
                    <p className="text-slate-500 text-xs">Utilizamos o padrão formal do Instituto Liana Gomes com cores refinadas.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.filter(t => t.statusAtivo).map(tpl => {
                      const isSelected = selectedTemplateId === tpl.id;
                      const styles = getTemplateStyles(tpl.layoutVisual);

                      return (
                        <div
                          key={tpl.id}
                          onClick={() => setSelectedTemplateId(tpl.id)}
                          className={`border rounded-2xl p-5 cursor-pointer hover:shadow-md transition flex flex-col justify-between ${
                            isSelected ? 'border-4 border-[#D4AF37] ring-2 ring-amber-200' : 'border-slate-200 bg-white'
                          }`}
                        >
                          <div>
                            <div className="flex justify-between mb-3 items-center">
                              <span className="text-[10px] uppercase font-bold text-slate-400">Layout: {tpl.layoutVisual}</span>
                              {isSelected && <span className="text-[10px] text-amber-600 font-extrabold">✓ Selecionado</span>}
                            </div>
                            <h5 className="font-extrabold text-xs text-[#0A192F] uppercase mb-1">{tpl.nome}</h5>
                            <p className="text-[10px] text-slate-500 leading-normal line-clamp-2">{tpl.textoPrincipal}</p>
                          </div>

                          <div className="mt-4 pt-3 border-t flex justify-between items-center text-[10px] text-slate-400">
                            <span>Tipo: <strong className="uppercase font-extrabold text-[#0A192F]">{tpl.tipo}</strong></span>
                            <span>Carga: {tpl.cargaHorariaPadrao}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 3: HIGH FIDELITY PREVIEW */}
              {wizardStep === 3 && selectedTemplate && previewEditingData && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-extrabold uppercase text-[#0A192F] mb-1.5">Pré-visualização do Certificado:</h4>
                    <p className="text-slate-500 text-xs">Os campos variáveis foram substituídos. Você pode editar os dados antes de consolidar o documento.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    
                    {/* LIVE FIELD EDITOR PANEL */}
                    <div className="lg:col-span-4 bg-slate-50 p-4 border rounded-2xl text-xs font-semibold space-y-4">
                      <span className="text-[10px] font-extrabold text-slate-400 block uppercase mb-1">Ajuste os dados de texto:</span>
                      
                      <div className="space-y-3 font-normal">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-1">NOME COMPLETO:</label>
                          <input 
                            type="text" 
                            className="w-full border p-2 bg-white rounded text-xs"
                            value={previewEditingData.nomeAluno}
                            onChange={e => setPreviewEditingData({...previewEditingData, nomeAluno: e.target.value})}
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-1">NOME DA FORMAÇÃO:</label>
                          <input 
                            type="text" 
                            className="w-full border p-2 bg-white rounded text-xs"
                            value={previewEditingData.nomeFormacao}
                            onChange={e => setPreviewEditingData({...previewEditingData, nomeFormacao: e.target.value})}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-1">TURMA:</label>
                            <input 
                              type="text" 
                              className="w-full border p-2 bg-white rounded text-xs"
                              value={previewEditingData.turma}
                              onChange={e => setPreviewEditingData({...previewEditingData, turma: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-1">CARGA HORÁRIA:</label>
                            <input 
                              type="text" 
                              className="w-full border p-2 bg-white rounded text-xs"
                              value={previewEditingData.cargaHoraria}
                              onChange={e => setPreviewEditingData({...previewEditingData, cargaHoraria: e.target.value})}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-1">CONCLUSÃO:</label>
                            <input 
                              type="text" 
                              className="w-full border p-2 bg-white rounded text-xs"
                              value={previewEditingData.dataConclusao}
                              onChange={e => setPreviewEditingData({...previewEditingData, dataConclusao: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-1">EMISSÃO:</label>
                            <input 
                              type="text" 
                              className="w-full border p-2 bg-white rounded text-xs"
                              value={previewEditingData.dataEmissao}
                              onChange={e => setPreviewEditingData({...previewEditingData, dataEmissao: e.target.value})}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-1">SIGNATÁRIA / RESPONSÁVEL:</label>
                          <input 
                            type="text" 
                            className="w-full border p-2 bg-white rounded text-xs"
                            value={previewEditingData.nomeInstrutora}
                            onChange={e => setPreviewEditingData({...previewEditingData, nomeInstrutora: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>

                    {/* LIVE VIEWING CARD RENDERING */}
                    <div className="lg:col-span-8 border rounded-2xl flex flex-col items-center justify-center p-6 text-center select-none shadow-sm relative overflow-hidden" style={{
                      backgroundColor: getTemplateStyles(selectedTemplate.layoutVisual).bg,
                      color: getTemplateStyles(selectedTemplate.layoutVisual).text,
                      border: `8px solid ${selectedTemplate.corSecundaria}`,
                    }}>
                      <div className="space-y-3 mt-4">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37]">
                          INSTITUTO LIANA GOMES (ILG)
                        </span>
                        <h2 className="text-3xl font-serif text-slate-100 uppercase tracking-widest font-extrabold" style={{
                          color: getTemplateStyles(selectedTemplate.layoutVisual).primaryText
                        }}>
                          CERTIFICADO
                        </h2>
                      </div>

                      <div className="my-6 max-w-lg leading-relaxed text-sm font-serif">
                        {renderTemplateText(selectedTemplate.textoPrincipal, previewEditingData)}
                      </div>

                      <div className="w-full flex justify-between items-end mt-auto px-6 pt-6 border-t border-slate-700 border-dashed text-left">
                        <div className="text-[10px] font-medium space-y-0.5 opacity-80">
                          <p className="font-bold">{previewEditingData.nomeInstrutora}</p>
                          <p>Mentora / Coordenação Geral ILG</p>
                        </div>

                        <div className="w-14 h-14 border border-[#D4AF37] rounded-full flex items-center justify-center text-[7px] font-bold text-[#D4AF37] uppercase text-center leading-tight">
                          SELO DE<br />VALIDADE
                        </div>

                        <div className="text-[10px] font-mono text-right opacity-80">
                          <p>Data: {previewEditingData.dataEmissao}</p>
                          <p>Código: MODEL-PREVIEW-X</p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* STEP 4: GENERATION / EMISSION PROGRESS OR TRIGGER */}
              {wizardStep === 4 && selectedTemplate && (
                <div className="space-y-6">
                  {wizardSource !== 'csv' ? (
                    <div className="max-w-md mx-auto text-center space-y-5 py-8">
                      <div className="p-4 bg-emerald-50 text-emerald-800 border-emerald-200 border rounded-2xl flex items-start gap-4 text-left">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 mt-1 shrink-0" />
                        <div>
                          <h4 className="font-extrabold text-xs uppercase text-emerald-950 mb-0.5">Tudo pronto para confeccionar!</h4>
                          <p className="text-[11px] font-medium leading-relaxed select-none">
                            O documento está formatado e validado. Ao prosseguir, o sistema salvará o histórico e abrirá a impressão oficial do PDF do certificado.
                          </p>
                        </div>
                      </div>

                      <div className="p-4.5 bg-slate-50 border rounded-xl space-y-2 text-left text-xs font-semibold">
                        <h4 className="text-[10px] uppercase font-extrabold text-slate-400">Detalhamento Técnico:</h4>
                        <ul className="text-slate-700 space-y-1.5 font-normal">
                          <li>• Nome do Aluno: <strong className="text-slate-900">{previewEditingData?.nomeAluno || formData.nomeAluno}</strong></li>
                          <li>• E-mail: <strong>{previewEditingData?.emailAluno || formData.emailAluno}</strong></li>
                          <li>• Formação ou Curso: <strong>{previewEditingData?.nomeFormacao || formData.nomeFormacao}</strong></li>
                          <li>• Template Selecionado: <strong>{selectedTemplate.nome}</strong></li>
                        </ul>
                      </div>

                      <div className="pt-4 flex gap-3">
                        <button
                          onClick={() => {
                            if (previewEditingData) {
                              handleGeneratePDF(previewEditingData, selectedTemplate);
                            }
                          }}
                          className="flex-1 py-3 bg-[#0A192F] text-white hover:bg-slate-900 font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                        >
                          <Printer className="w-5 h-5 text-amber-500" />
                          <span>Gerar Certificado em PDF</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    // IF BATCH CSV PROGRESS SHOW
                    <div className="max-w-md mx-auto text-center space-y-5 py-6">
                      <h4 className="text-sm font-extrabold uppercase text-[#0A192F]">Emissão em Lote Pronta:</h4>
                      <p className="text-slate-500 text-xs">A lista com {batchRecords.length} alunas será processada individualmente.</p>

                      {isBatchRunning ? (
                        <div className="space-y-4">
                          <p className="text-xs font-extrabold text-indigo-700 animate-pulse uppercase">Processando emissão em massa ({batchProgress}%)...</p>
                          <div className="w-full bg-slate-150 h-3 rounded-full overflow-hidden border">
                            <div className="bg-indigo-650 h-3 rounded-full transition-all duration-300" style={{ width: `${batchProgress}%` }} />
                          </div>

                          <div className="h-32 overflow-y-auto border bg-slate-50/50 rounded p-2 divide-y font-mono text-[9px] text-left">
                            {batchStatusLog.map((log, idx) => (
                              <div key={idx} className="p-1">{log}</div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="pt-4 space-y-3">
                          <button
                            onClick={handleBulkEmission}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                          >
                            <Sparkles className="w-5 h-5 text-amber-400" />
                            <span>Emitir {batchRecords.length} Certificados em Lote</span>
                          </button>
                          
                          <p className="text-[10px] text-slate-400">Cada certificado será gerado automaticamente com link no histórico.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 5: SEND MAIL OPTION */}
              {wizardStep === 5 && activeEmailCert && (
                <div className="space-y-6">
                  <div className="max-w-lg mx-auto p-4 bg-indigo-50 border border-indigo-150 rounded-xl space-y-1.5 text-left">
                    <h5 className="font-extrabold text-xs text-indigo-950 uppercase flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-indigo-700" />
                      <span>Certificado Confeccionado com sucesso!</span>
                    </h5>
                    <p className="text-[11px] text-slate-705 font-medium leading-relaxed">
                      Deseja enviar o certificado digital em PDF por e-mail para <strong className="text-indigo-955">{activeEmailCert.emailAluno}</strong> imediatamente?
                    </p>
                  </div>

                  <div className="max-w-lg mx-auto border rounded-2xl p-5 bg-stone-50/50 font-semibold text-xs space-y-3 font-normal">
                    <span className="text-[10px] font-extrabold text-slate-400 block uppercase">Ajuste os dados de Envio do E-mail:</span>
                    
                    <div className="space-y-3 text-slate-700">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">DESTINATÁRIO:</label>
                        <input 
                          type="text" 
                          className="w-full border p-2 bg-white rounded text-xs text-slate-800"
                          value={activeEmailCert.emailAluno}
                          disabled
                        />
                      </div>
                      
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">ASSUNTO DO E-MAIL:</label>
                        <input 
                          type="text" 
                          className="w-full border p-2 bg-white rounded text-xs text-slate-800"
                          value={emailSubject}
                          onChange={e => setEmailSubject(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">CONTEÚDO DO TEXTO (MENSAGEM):</label>
                        <textarea 
                          rows={6}
                          className="w-full border p-2 bg-white rounded text-xs text-slate-800 font-sans leading-relaxed"
                          value={emailBody}
                          onChange={e => setEmailBody(e.target.value)}
                        />
                      </div>

                      <div className="p-2 border border-dashed rounded bg-slate-100 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 flex items-center gap-1.5 font-bold">
                          <FileText className="w-4 h-4 text-red-500" />
                          <span>Certificado_${activeEmailCert.nomeAluno.replace(/\s+/g, '_')}.pdf</span>
                        </span>
                        <span className="text-[9px] text-slate-400 italic font-mono bg-white px-2 py-0.5 rounded border">Anexo automatico</span>
                      </div>
                    </div>
                  </div>

                  <div className="max-w-lg mx-auto pt-4 flex gap-3">
                    <button
                      onClick={handleSendEmailSubmit}
                      disabled={isSendingEmail}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                    >
                      {isSendingEmail ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin text-white" />
                          <span>Enviando por e-mail...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 text-indigo-100" />
                          <span>Enviar Certificado por E-mail</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setIsWizardOpen(false);
                        setWizardStep(1);
                        setActiveSubTab('historico');
                      }}
                      className="px-6 py-3 border border-slate-350 text-slate-500 font-extrabold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-50"
                    >
                      Pular Envio
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Wizard sticky footer controls */}
            <div className="p-4.5 bg-slate-50 border-t border-slate-150 flex gap-3 select-none justify-between shrink-0">
              {wizardStep > 1 && wizardStep < 5 && (
                <button
                  onClick={() => setWizardStep(prev => prev - 1)}
                  className="px-4.5 py-2.5 border border-slate-350 bg-white hover:bg-slate-50 font-bold text-xs uppercase text-slate-500 tracking-wide rounded-xl"
                >
                  Voltar
                </button>
              )}

              <div className="flex-1" />

              <div className="flex gap-2 text-right">
                <button
                  onClick={() => {
                    setIsWizardOpen(false);
                    setWizardStep(1);
                  }}
                  className="px-4.5 py-2.5 border border-slate-200 hover:bg-red-50 hover:text-red-650 text-xs text-slate-450 font-bold uppercase rounded-xl transition"
                >
                  Cancelar
                </button>

                {wizardStep < 3 && (
                  <button
                    onClick={stepForward}
                    className="px-5 py-2.5 bg-[#0A192F] text-white hover:bg-[#D4AF37] hover:text-[#0A192F] font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
                  >
                    Prosseguir
                  </button>
                )}

                {wizardStep === 3 && (
                  <button
                    onClick={() => setWizardStep(4)}
                    className="px-5 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
                  >
                    Confirmar & Gerar PDF
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: EMAIL FORWARD MANUAL MODAL (Standalone history actions) */}
      {isEmailModalOpen && activeEmailCert && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-slate-200 overflow-hidden text-left flex flex-col shadow-2xl">
            
            <div className="p-4 bg-[#0A192F] border-b text-white flex justify-between items-center select-none shrink-0 shadow-sm">
              <h3 className="font-extrabold text-sm uppercase tracking-wider">Enviar Certificado Digital</h3>
              <button onClick={() => setIsEmailModalOpen(false)} className="text-white hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto font-semibold text-xs text-slate-700">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">DESTINATÁRIO (E-MAIL DA ALUNA):</label>
                <input 
                  type="text" 
                  className="w-full border p-2 bg-slate-100 rounded text-xs text-slate-800"
                  value={activeEmailCert.emailAluno}
                  disabled
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">ASSUNTO:</label>
                <input 
                  type="text" 
                  className="w-full border p-2 bg-white rounded text-xs text-slate-800"
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">MENSAGEM:</label>
                <textarea 
                  rows={6}
                  className="w-full border p-2 bg-white rounded text-xs font-sans text-slate-800 leading-relaxed font-normal"
                  value={emailBody}
                  onChange={e => setEmailBody(e.target.value)}
                />
              </div>

              <div className="p-2.5 border rounded-lg bg-slate-50 flex items-center justify-between text-[11px] font-bold text-slate-600">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-red-500" />
                  <span>Certificado_{activeEmailCert.nomeAluno.replace(/\s+/g, '_')}.pdf</span>
                </span>
                <span className="text-[9px] bg-white border rounded px-1.5 italic text-slate-400">PDF anexo</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t flex gap-2 justify-end">
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="px-4.5 py-2 border border-slate-300 hover:bg-slate-50 text-xs font-bold uppercase rounded-lg"
              >
                Cancelar
              </button>
              
              <button
                onClick={handleSendEmailSubmit}
                disabled={isSendingEmail}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase rounded-lg shadow transition flex items-center gap-1.5"
              >
                {isSendingEmail ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar E-mail</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: TEMPLATE VISUAL SETUP EDITOR */}
      {isTemplateEditorOpen && editingTemplate && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-4xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] text-left shadow-2xl animate-fade-in">
            
            <div className="p-4 bg-[#0A192F] border-b text-white flex justify-between items-center select-none shrink-0 shadow">
              <h3 className="font-extrabold text-sm uppercase tracking-wider">Editor de Template de Certificado</h3>
              <button onClick={() => { setIsTemplateEditorOpen(false); setEditingTemplate(null); }} className="text-white hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-6 space-y-5 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* SIDEBAR FIELDS EDITOR FORM */}
              <div className="md:col-span-5 font-semibold text-xs text-slate-700 space-y-4.5 pr-2">
                <span className="text-[10px] uppercase font-extrabold text-slate-400 block border-b pb-1 mb-2">Estrutura de Layout do Certificado</span>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">NOME DO TEMPLATE:</label>
                  <input
                    type="text"
                    value={editingTemplate.nome}
                    onChange={e => setEditingTemplate({...editingTemplate, nome: e.target.value})}
                    className="w-full border p-2 bg-white rounded text-xs"
                    placeholder="Nome interno do template..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">TIPO DO CERTIFICADO:</label>
                    <select
                      value={editingTemplate.tipo}
                      onChange={e => setEditingTemplate({...editingTemplate, tipo: e.target.value as any})}
                      className="w-full border p-2 bg-white rounded text-xs"
                    >
                      <option value="conclusao">Conclusão</option>
                      <option value="participacao">Participação</option>
                      <option value="formacao">Formação</option>
                      <option value="workshop">Workshop</option>
                      <option value="personalizado">Personalizado</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">PALETA OPERACIONAL:</label>
                    <select
                      value={editingTemplate.layoutVisual}
                      onChange={e => setEditingTemplate({...editingTemplate, layoutVisual: e.target.value as any})}
                      className="w-full border p-2 bg-white rounded text-xs"
                    >
                      <option value="navy_premium">Azul Marinho Premium</option>
                      <option value="petroleum_elegant">Azul Petróleo Elegante</option>
                      <option value="beige_classic">Bege Clássico Imperial</option>
                      <option value="warm_white_minimal">Minimalista Branco Quente</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">LOGO / MARCAÇÃO DO TOPO:</label>
                  <select
                    value={editingTemplate.logo}
                    onChange={e => setEditingTemplate({...editingTemplate, logo: e.target.value as any})}
                    className="w-full border p-2 bg-white rounded text-xs"
                  >
                    <option value="selo_dourado">Selo Dourado Oficial ILG</option>
                    <option value="brasao_discreto">Brasão Discreto Acadêmico</option>
                    <option value="selo_no_topo">Selo no Topo Centralizado</option>
                    <option value="padrao_ilg">Iniciais ILG Minimalista</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1 flex justify-between">
                    <span>TEXTO PRINCIPAL:</span>
                    <span className="text-[9px] text-[#D4AF37] lowercase">Suporta {`{nome_aluno}`}, {`{nome_formacao}`}</span>
                  </label>
                  <textarea
                    rows={4}
                    value={editingTemplate.textoPrincipal}
                    onChange={e => setEditingTemplate({...editingTemplate, textoPrincipal: e.target.value})}
                    className="w-full border p-2 bg-white rounded text-xs leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">CARGA PADRÃO:</label>
                    <input
                      type="text"
                      className="w-full border p-2 bg-white rounded text-xs"
                      value={editingTemplate.cargaHorariaPadrao}
                      onChange={e => setEditingTemplate({...editingTemplate, cargaHorariaPadrao: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">EMISSOR / ASSINATURA:</label>
                    <input
                      type="text"
                      className="w-full border p-2 bg-white rounded text-xs"
                      value={editingTemplate.assinatura}
                      onChange={e => setEditingTemplate({...editingTemplate, assinatura: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">COR BOLA 1:</label>
                    <input
                      type="color"
                      className="w-full border p-1 h-8 rounded shrink-0 cursor-pointer"
                      value={editingTemplate.corPrincipal}
                      onChange={e => setEditingTemplate({...editingTemplate, corPrincipal: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">COR BOLA 2 (DETALHES):</label>
                    <input
                      type="color"
                      className="w-full border p-1 h-8 rounded shrink-0 cursor-pointer"
                      value={editingTemplate.corSecundaria}
                      onChange={e => setEditingTemplate({...editingTemplate, corSecundaria: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* LIVE DUAL PREVIEW CONTAINER */}
              <div className="md:col-span-7 bg-slate-50 p-6 border rounded-2xl flex flex-col justify-center items-center select-none text-center shadow-inner relative overflow-hidden" style={{
                backgroundColor: getTemplateStyles(editingTemplate.layoutVisual).bg,
                color: getTemplateStyles(editingTemplate.layoutVisual).text,
                border: `8px solid ${editingTemplate.corSecundaria}`,
              }}>
                <div className="space-y-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500" style={{ color: editingTemplate.corSecundaria }}>
                    INSTITUTO LIANA GOMES (ILG)
                  </span>
                  <p className="text-3xl font-serif font-extrabold uppercase tracking-widest" style={{
                    color: getTemplateStyles(editingTemplate.layoutVisual).primaryText
                  }}>
                    {editingTemplate.tipo === 'conclusao' ? 'CERTIFICADO DE CONCLUSÃO' : 'CERTIFICADO'}
                  </p>
                </div>

                <div className="my-8 max-w-md font-serif text-xs leading-relaxed leading-normal md:text-sm">
                  {editingTemplate.textoPrincipal
                    .replace(/{nome_aluno}/g, 'Fernanda Costa')
                    .replace(/{nome_formacao}/g, 'Formação Executiva & Compliance')
                    .replace(/{turma}/g, 'Turma A')
                    .replace(/{carga_horaria}/g, editingTemplate.cargaHorariaPadrao)
                    .replace(/{data_conclusao}/g, '27/05/2026')
                    .replace(/{data_emissao}/g, '27/05/2026')
                    .replace(/{nome_instrutora}/g, 'Liana Gomes')}
                </div>

                <div className="w-full flex justify-between items-end mt-auto px-6 pt-6 border-t border-slate-700 border-dashed text-left text-[9px] opacity-85">
                  <div>
                    <p className="font-bold">{editingTemplate.assinatura}</p>
                    <p>Corpo Docente / Mentoria ILG</p>
                  </div>

                  <div className="w-12 h-12 border-2 border-dashed rounded-full flex items-center justify-center text-[7px] text-[#D4AF37] font-bold uppercase tracking-tighter" style={{ borderColor: editingTemplate.corSecundaria, color: editingTemplate.corSecundaria }}>
                    ILG OFICIAL
                  </div>

                  <div className="text-right">
                    <p>Validade: Permanente</p>
                    <p>Chave: PREVIEW-COR-X</p>
                  </div>
                </div>
              </div>

            </div>

            <div className="p-4 bg-slate-50 border-t flex gap-2 justify-end shrink-0">
              <button
                onClick={() => { setIsTemplateEditorOpen(false); setEditingTemplate(null); }}
                className="px-4.5 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold uppercase rounded-lg"
              >
                Voltar
              </button>

              <button
                onClick={() => handleCreateOrSaveTemplate(editingTemplate)}
                className="px-5 py-2 bg-[#0A192F] text-white hover:bg-[#D4AF37] hover:text-[#0A192F] text-xs font-bold uppercase rounded-lg shadow transition"
              >
                Salvar Configurações
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
