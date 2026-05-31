export interface TemplateColumn {
  key: string;
  label: string;
  type: 'texto_curto' | 'texto_longo' | 'numero' | 'moeda' | 'data' | 'telefone' | 'email' | 'link' | 'checkbox' | 'selecao_unica' | 'multi_selecao' | 'status' | 'responsavel' | 'anexo' | 'tags' | 'rel_pessoa' | 'rel_turma' | 'rel_produto';
  options?: string[];
}

export interface SpreadsheetTemplate {
  id: string;
  nome: string;
  categoria: string;
  colunas: TemplateColumn[];
  defaultRecords: Record<string, any>[];
}

export const PLANILHA_TEMPLATES: SpreadsheetTemplate[] = [
  {
    id: 'tpl-leads',
    nome: 'Controle de Leads',
    categoria: 'Leads',
    colunas: [
      { key: 'nome', label: 'Nome Completo', type: 'rel_pessoa' },
      { key: 'whatsapp', label: 'WhatsApp', type: 'telefone' },
      { key: 'email', label: 'Mailing Address', type: 'email' },
      { key: 'origem', label: 'Origem do Lead', type: 'selecao_unica', options: ['Instagram', 'Indicados', 'Anúncio Pago', 'Google', 'WhatsApp'] },
      { key: 'produto', label: 'Produto de Interesse', type: 'rel_produto' },
      { key: 'responsavel', label: 'Responsável SDR', type: 'responsavel' },
      { key: 'status', label: 'Status Comercial', type: 'status', options: ['Novo Lead', 'Agendado', 'Em Negociação', 'Vendido', 'Sem Interesse'] },
      { key: 'temperatura', label: 'Temperatura', type: 'selecao_unica', options: ['Frio ❄️', 'Morno 🛑', 'Quente 🔥'] },
      { key: 'objecao', label: 'Objeção Primária', type: 'texto_curto' },
      { key: 'proximo', label: 'Próximo Contato', type: 'data' },
      { key: 'obs', label: 'Observações Finais', type: 'texto_longo' }
    ],
    defaultRecords: [
      {
        nome: 'Amanda Pinheiro',
        whatsapp: '5511977771234',
        email: 'amanda.pinheiro@email.com',
        origem: 'Instagram',
        produto: 'Formação Executiva & Compliance',
        responsavel: 'Ana',
        status: 'Em Negociação',
        temperatura: 'Quente 🔥',
        objecao: 'Consultando sócio financeiro',
        proximo: '2026-05-28',
        obs: 'Interesse forte na mentoria empresarial do Instituto.'
      },
      {
        nome: 'Juliana Vasconcelos',
        whatsapp: '5511933445566',
        email: 'ju.vascon@corp.com',
        origem: 'Anúncio Pago',
        produto: 'Formação Líder / Liderança',
        responsavel: 'Ana',
        status: 'Agendado',
        temperatura: 'Morno 🛑',
        objecao: 'Nenhuma',
        proximo: '2026-05-30',
        obs: 'Quer receber cronograma das aulas e faturamento CNPJ.'
      }
    ]
  },
  {
    id: 'tpl-alunos',
    nome: 'Controle de Alunos',
    categoria: 'Alunos',
    colunas: [
      { key: 'nome', label: 'Nome da Aluna', type: 'rel_pessoa' },
      { key: 'whatsapp', label: 'WhatsApp', type: 'telefone' },
      { key: 'email', label: 'E-mail principal', type: 'email' },
      { key: 'produto', label: 'Formação Escolar', type: 'rel_produto' },
      { key: 'turma', label: 'Turma Relacionada', type: 'rel_turma' },
      { key: 'grupo', label: 'Entrou no grupo?', type: 'checkbox' },
      { key: 'respondido', label: 'Respondeu Form Inicial?', type: 'checkbox' },
      { key: 'bonus', label: 'Recebeu Bônus Exclusivos?', type: 'checkbox' },
      { key: 'nutror', label: 'Acesso Ativado Nutror', type: 'checkbox' },
      { key: 'mrp', label: 'Acesso Ativado Planilha MRP', type: 'checkbox' },
      { key: 'status_onboarding', label: 'Status de Onboarding', type: 'status', options: ['Concluído', 'Pendente', 'Em Andamento', 'Crítico'] },
      { key: 'pendencias', label: 'Pendências Operacionais', type: 'tags' },
      { key: 'obs', label: 'Observações de Apoio', type: 'texto_longo' }
    ],
    defaultRecords: [
      {
        nome: 'Camila Santos de Souza',
        whatsapp: '5511988880011',
        email: 'camila.ss@terra.com.br',
        produto: 'Formação Executiva & Compliance',
        turma: 'Turma A - Primeiro Semestre',
        grupo: true,
        respondido: true,
        bonus: false,
        nutror: true,
        mrp: true,
        status_onboarding: 'Em Andamento',
        pendencias: ['Envio de Bônus'],
        obs: 'Falta liberar curso extra de auditoria.'
      },
      {
        nome: 'Heloisa Fontes',
        whatsapp: '5521999991122',
        email: 'heloisa.fontes@gmail.com',
        produto: 'Formação Executiva & Compliance',
        turma: 'Turma B - Mastermind',
        grupo: false,
        respondido: false,
        bonus: false,
        nutror: false,
        mrp: false,
        status_onboarding: 'Crítico',
        pendencias: ['Grupo Whats', 'Acesso Nutror', 'Acesso MRP'],
        obs: 'Não respondeu as mensagens mandadas pela Nuria de boas vindas.'
      }
    ]
  },
  {
    id: 'tpl-pagamentos',
    nome: 'Controle de Pagamentos',
    categoria: 'Pagamentos',
    colunas: [
      { key: 'nome', label: 'Pessoa Relacionada', type: 'rel_pessoa' },
      { key: 'produto', label: 'Formação ou Produto', type: 'rel_produto' },
      { key: 'valor', label: 'Valor Combinado', type: 'moeda' },
      { key: 'forma', label: 'Forma de Pagamento', type: 'selecao_unica', options: ['Cartão 12x', 'Pix à Vista', 'Boleto faturado', 'Boleto Parcelado'] },
      { key: 'status', label: 'Status Pagamento', type: 'status', options: ['Quitado', 'Parcial Recorrente', 'Aguardando', 'Atrasado'] },
      { key: 'vencimento', label: 'Vencimento', type: 'data' },
      { key: 'comprovante', label: 'Comprovante em Link', type: 'link' },
      { key: 'responsavel', label: 'Responsável Financeiro', type: 'responsavel' },
      { key: 'obs', label: 'Notas Operacionais', type: 'texto_longo' }
    ],
    defaultRecords: [
      {
        nome: 'Fernanda Lima',
        produto: 'Formação Executiva & Compliance',
        valor: 4997,
        forma: 'Pix à Vista',
        status: 'Quitado',
        vencimento: '2026-05-20',
        comprovante: 'https://comprovantes.bank/123456',
        responsavel: 'Ana',
        obs: 'Desconto aplicado de 5% no Pix.'
      },
      {
        nome: 'Renata Guimarães',
        produto: 'Formação Líder / Liderança',
        valor: 2997,
        forma: 'Boleto Parcelado',
        status: 'Atrasado',
        vencimento: '2026-05-25',
        comprovante: '',
        responsavel: 'Nuria',
        obs: 'Parcela 1 de 3 em atraso. Cobrança enviada com multa.'
      }
    ]
  },
  {
    id: 'tpl-suporte',
    nome: 'Controle de Suporte',
    categoria: 'Suporte',
    colunas: [
      { key: 'nome', label: 'Nome da Aluna', type: 'rel_pessoa' },
      { key: 'formacao', label: 'Formação', type: 'rel_produto' },
      { key: 'categoria', label: 'Categoria da Dúvida', type: 'selecao_unica', options: ['Suporte Nutror', 'Planilha MRP', 'Certificação', 'Financeiro', 'Acessibilidade'] },
      { key: 'descricao', label: 'Descrição da Dúvida', type: 'texto_longo' },
      { key: 'status', label: 'Status Chamado', type: 'status', options: ['Pendente 🔴', 'Em Análise 🟡', 'Respondido 🔵', 'Resolvido 🟢'] },
      { key: 'prioridade', label: 'Prioridade', type: 'selecao_unica', options: ['Alta', 'Média', 'Baixa'] },
      { key: 'responsavel', label: 'Responsável Suporte', type: 'responsavel' },
      { key: 'abertura', label: 'Abertura', type: 'data' },
      { key: 'resolucao', label: 'Resolução', type: 'data' },
      { key: 'resposta', label: 'Resposta Registrada', type: 'texto_longo' }
    ],
    defaultRecords: [
      {
        nome: 'Camila Santos de Souza',
        formacao: 'Formação Executiva & Compliance',
        categoria: 'Planilha MRP',
        descricao: 'Não acha chave de ativação para atualizar macros no Excel Mac.',
        status: 'Respondido 🔵',
        prioridade: 'Alta',
        responsavel: 'Nuria',
        abertura: '2026-05-26',
        resolucao: '',
        resposta: 'Enviado passo a passo de liberação pelo whats.'
      }
    ]
  },
  {
    id: 'tpl-materiais',
    nome: 'Controle de Materiais',
    categoria: 'Materiais',
    colunas: [
      { key: 'nome_material', label: 'Nome do Material', type: 'texto_curto' },
      { key: 'tipo', label: 'Tipo de Recurso', type: 'selecao_unica', options: ['Slide', 'E-book', 'Planilha', 'Canva Template', 'Checklist'] },
      { key: 'formacao', label: 'Formação Vinculada', type: 'rel_produto' },
      { key: 'drive', label: 'Link Drive Oficial', type: 'link' },
      { key: 'canva', label: 'Link Canva Layout', type: 'link' },
      { key: 'status', label: 'Status Material', type: 'status', options: ['Crítico', 'Em Produção', 'Em Revisão', 'Completo'] },
      { key: 'responsavel', label: 'Responsável Designer', type: 'responsavel' },
      { key: 'prazo', label: 'Prazo Limite', type: 'data' },
      { key: 'obs', label: 'Configurações Extras', type: 'texto_longo' }
    ],
    defaultRecords: [
      {
        nome_material: 'Guia de Liderança e Inteligência Emocional',
        tipo: 'E-book',
        formacao: 'Formação Líder / Liderança',
        drive: 'https://drive.google.com/9871',
        canva: 'https://canva.com/design/1',
        status: 'Em Produção',
        responsavel: 'Nuria',
        prazo: '2026-06-05',
        obs: 'Reunir com as mentoras para estruturar capítulos.'
      }
    ]
  },
  {
    id: 'tpl-bonus',
    nome: 'Controle de Bônus',
    categoria: 'Bônus',
    colunas: [
      { key: 'nome', label: 'Aluna Beneficiada', type: 'rel_pessoa' },
      { key: 'formacao', label: 'Formação Vinculada', type: 'rel_produto' },
      { key: 'bonus_prometido', label: 'Bônus Prometido', type: 'multi_selecao', options: ['Curso Auditoria Grátis', 'Planilha MRP Premium', 'Livro Físico Autografado', 'Mentoria 1-1 Individual'] },
      { key: 'enviado', label: 'Bônus Enviado?', type: 'checkbox' },
      { key: 'data_envio', label: 'Data de Envio', type: 'data' },
      { key: 'responsavel', label: 'Responsável Suporte', type: 'responsavel' },
      { key: 'pendencia', label: 'Pendências Extras', type: 'texto_curto' },
      { key: 'obs', label: 'Considerações', type: 'texto_longo' }
    ],
    defaultRecords: [
      {
        nome: 'Amanda Pinheiro',
        formacao: 'Formação Executiva & Compliance',
        bonus_prometido: ['Curso Auditoria Grátis', 'Mentoria 1-1 Individual'],
        enviado: false,
        data_envio: '',
        responsavel: 'Nuria',
        pendencia: 'Disponibilidade de agenda das mentoras',
        obs: 'SDR acordou envio após conclusão da aula 2.'
      }
    ]
  },
  {
    id: 'tpl-certificados',
    nome: 'Controle de Certificação',
    categoria: 'Certificação',
    colunas: [
      { key: 'nome', label: 'Nome da Aluna', type: 'rel_pessoa' },
      { key: 'formacao', label: 'Formação', type: 'rel_produto' },
      { key: 'turma', label: 'Turma', type: 'rel_turma' },
      { key: 'env_trabalho', label: 'Trabalho Final Enviado', type: 'checkbox' },
      { key: 'taxa_paga', label: 'Taxa Diplomacia Paga', type: 'checkbox' },
      { key: 'cert_ilg', label: 'Certificado ILG Digital', type: 'status', options: ['Não Emitido', 'Processando', 'Emitido', 'Devolvido'] },
      { key: 'cert_mec', label: 'Certificação MEC / FBR', type: 'status', options: ['Inativo', 'Em Análise MEC', 'Aprovado MEC'] },
      { key: 'status', label: 'Status Final', type: 'status', options: ['Formando', 'Pendente Requisitos', 'Diplomado'] },
      { key: 'obs', label: 'Observações Finais', type: 'texto_longo' }
    ],
    defaultRecords: [
      {
        nome: 'Camila Santos de Souza',
        formacao: 'Formação Executiva & Compliance',
        turma: 'Turma A - Primeiro Semestre',
        env_trabalho: true,
        taxa_paga: true,
        cert_ilg: 'Emitido',
        cert_mec: 'Aprovado MEC',
        status: 'Diplomado',
        obs: 'Certificado enviado por e-mail e impresso via SEDEX.'
      }
    ]
  },
  {
    id: 'tpl-lancamentos',
    nome: 'Controle de Lançamento/Imersão',
    categoria: 'Lançamentos',
    colunas: [
      { key: 'nome', label: 'Nome Ingressante', type: 'rel_pessoa' },
      { key: 'whatsapp', label: 'WhatsApp', type: 'telefone' },
      { key: 'ticket', label: 'Modo Inscrição', type: 'selecao_unica', options: ['BASIC (Assistente)', 'VIP (Com Especialistas)'] },
      { key: 'grupo', label: 'Entrou no Grupo Whats', type: 'checkbox' },
      { key: 'form_inicial', label: 'Respondeu Form Inicial?', type: 'checkbox' },
      { key: 'form_final', label: 'Respondeu Form Esteira?', type: 'checkbox' },
      { key: 'comprou_formacao', label: 'Entrou na Formação?', type: 'checkbox' },
      { key: 'forma_pagamento', label: 'Forma de Pagamento', type: 'selecao_unica', options: ['Cartão', 'Pix', 'Nenhuma'] },
      { key: 'responsavel', label: 'Responsável SDR', type: 'responsavel' },
      { key: 'status_comercial', label: 'Status Comercial', type: 'status', options: ['Interessado', 'Seguindo Líderes', 'Inscrito', 'Perdido'] },
      { key: 'obs', label: 'Observações de Conversão', type: 'texto_longo' }
    ],
    defaultRecords: [
      {
        nome: 'Renata Guimarães',
        whatsapp: '5511910102020',
        ticket: 'VIP (Com Especialistas)',
        grupo: true,
        form_inicial: true,
        form_final: false,
        comprou_formacao: true,
        forma_pagamento: 'Cartão',
        responsavel: 'Ana',
        status_comercial: 'Inscrito',
        obs: 'Melhor Lead do evento de maio.'
      }
    ]
  }
];
