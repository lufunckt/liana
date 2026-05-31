import { ModuleSchema } from '../types';

export const LEADS_SCHEMA: ModuleSchema = {
  id: 'leads',
  title: 'Leads',
  filterFields: ['status', 'produtoInteresse', 'temperatura', 'origem', 'responsavel', 'proximoFollowUp'],
  fields: [
    { key: 'nome', label: 'Nome', type: 'text' },
    { key: 'telefone', label: 'Telefone', type: 'text' },
    { key: 'email', label: 'E-mail', type: 'text' },
    { key: 'linkedin', label: 'LinkedIn', type: 'text' },
    { key: 'instagram', label: 'Instagram', type: 'text' },
    { key: 'origem', label: 'Origem', type: 'text' },
    { key: 'produtoInteresse', label: 'Produto de Interesse', type: 'text' },
    { key: 'status', label: 'Status', type: 'select', options: ['novo lead', 'contato iniciado', 'em qualificação', 'qualificado', 'produto indicado', 'enviado para atendimento', 'em negociação', 'vendido', 'nutrição', 'perdido'] },
    { key: 'temperatura', label: 'Temperatura', type: 'select', options: ['frio', 'morno', 'quente'] },
    { key: 'responsavel', label: 'Responsável', type: 'text' },
    { key: 'ultimaInteracao', label: 'Última Interação', type: 'date' },
    { key: 'proximoFollowUp', label: 'Próximo Follow-up', type: 'date' },
    { key: 'observacoes', label: 'Observações', type: 'textarea' },
    { key: 'tags', label: 'Tags', type: 'tags' }
  ]
};

export const ALUNOS_SCHEMA: ModuleSchema = {
  id: 'alunos',
  title: 'Alunos',
  filterFields: ['formacao', 'turma', 'statusAcesso', 'pendencias', 'pagamento'],
  fields: [
    { key: 'nome', label: 'Nome', type: 'text' },
    { key: 'telefone', label: 'Telefone', type: 'text' },
    { key: 'email', label: 'E-mail', type: 'text' },
    { key: 'formacao', label: 'Formação', type: 'text' },
    { key: 'turma', label: 'Turma', type: 'text' },
    { key: 'statusAcesso', label: 'Status de Acesso', type: 'select', options: ['ativo', 'bloqueado', 'cancelado'] },
    { key: 'statusNutror', label: 'Status Nutror', type: 'text' },
    { key: 'statusMRP', label: 'Status MRP', type: 'text' },
    { key: 'grupoWhatsApp', label: 'Grupo de WhatsApp', type: 'checkbox' },
    { key: 'pendencias', label: 'Pendências', type: 'text' },
    { key: 'certificadoILG', label: 'Certificado ILG', type: 'checkbox' },
    { key: 'certificadoMEC', label: 'Certificado MEC', type: 'checkbox' },
    { key: 'pagamento', label: 'Pagamento', type: 'select', options: ['em dia', 'atrasado', 'quitado'] },
    { key: 'observacoes', label: 'Observações', type: 'textarea' }
  ]
};

export const TURMAS_SCHEMA: ModuleSchema = {
  id: 'turmas',
  title: 'Turmas',
  filterFields: ['formacao', 'status', 'responsavel'],
  fields: [
    { key: 'nome', label: 'Nome da Turma', type: 'text' },
    { key: 'formacao', label: 'Formação', type: 'text' },
    { key: 'dataInicio', label: 'Data de Início', type: 'date' },
    { key: 'dataEncerramento', label: 'Data de Encerramento', type: 'date' },
    { key: 'status', label: 'Status', type: 'select', options: ['planejada', 'em andamento', 'concluída', 'cancelada'] },
    { key: 'links', label: 'Links Importantes', type: 'textarea' },
    { key: 'grupoWhatsApp', label: 'Link Grupo WhatsApp', type: 'text' },
    { key: 'responsavel', label: 'Responsável', type: 'text' },
    { key: 'observacoes', label: 'Observações', type: 'textarea' }
  ]
};

export const MATERIAIS_SCHEMA: ModuleSchema = {
  id: 'materiais',
  title: 'Materiais',
  filterFields: ['tipo', 'formacaoRelacionada', 'status', 'responsavel'],
  fields: [
    { key: 'nome', label: 'Nome do Material', type: 'text' },
    { key: 'tipo', label: 'Tipo', type: 'select', options: ['slide', 'ebook', 'tutorial', 'arte', 'kit', 'bônus', 'proposta', 'documento'] },
    { key: 'formacaoRelacionada', label: 'Formação Relacionada', type: 'text' },
    { key: 'linkDrive', label: 'Link Drive', type: 'text' },
    { key: 'linkCanva', label: 'Link Canva', type: 'text' },
    { key: 'status', label: 'Status', type: 'select', options: ['solicitado', 'em produção', 'em revisão', 'aprovado', 'entregue'] },
    { key: 'responsavel', label: 'Responsável', type: 'text' },
    { key: 'prazo', label: 'Prazo', type: 'date' },
    { key: 'observacoes', label: 'Observações', type: 'textarea' }
  ]
};

export const PAGAMENTOS_SCHEMA: ModuleSchema = {
  id: 'pagamentos',
  title: 'Pagamentos e Pendências',
  filterFields: ['formacao', 'status', 'responsavel'],
  fields: [
    { key: 'aluno', label: 'Aluno (Nome)', type: 'text' },
    { key: 'formacao', label: 'Formação', type: 'text' },
    { key: 'valorCombinado', label: 'Valor Combinado', type: 'number' },
    { key: 'status', label: 'Status', type: 'select', options: ['pago', 'parcial', 'pendente', 'atrasado'] },
    { key: 'vencimento', label: 'Vencimento', type: 'date' },
    { key: 'comprovante', label: 'Comprovante (Link)', type: 'text' },
    { key: 'observacoes', label: 'Observações da Negociação', type: 'textarea' },
    { key: 'responsavel', label: 'Responsável', type: 'text' }
  ]
};

export const SUPORTE_SCHEMA: ModuleSchema = {
  id: 'suporte',
  title: 'Suporte',
  filterFields: ['categoria', 'status', 'responsavel'],
  fields: [
    { key: 'aluno', label: 'Aluno', type: 'text' },
    { key: 'formacao', label: 'Formação', type: 'text' },
    { key: 'categoria', label: 'Categoria', type: 'select', options: ['MRP', 'Nutror', 'acesso', 'financeiro', 'certificação', 'material', 'bônus', 'didático', 'administrativo'] },
    { key: 'descricao', label: 'Descrição da Dúvida', type: 'textarea' },
    { key: 'status', label: 'Status', type: 'select', options: ['novo', 'em análise', 'respondido', 'aguardando aluno', 'resolvido'] },
    { key: 'responsavel', label: 'Responsável', type: 'text' },
    { key: 'dataAbertura', label: 'Data de Abertura', type: 'date' },
    { key: 'dataResolucao', label: 'Data de Resolução', type: 'date' },
    { key: 'resposta', label: 'Resposta Registrada', type: 'textarea' }
  ]
};

export const TAREFAS_SCHEMA: ModuleSchema = {
  id: 'tarefas',
  title: 'Tarefas Internas',
  filterFields: ['area', 'status', 'responsavel', 'prioridade'],
  fields: [
    { key: 'titulo', label: 'Título', type: 'text' },
    { key: 'descricao', label: 'Descrição', type: 'textarea' },
    { key: 'area', label: 'Área', type: 'select', options: ['comercial', 'suporte', 'conteúdo', 'financeiro', 'administrativo', 'design', 'lançamento'] },
    { key: 'responsavel', label: 'Responsável', type: 'text' },
    { key: 'prioridade', label: 'Prioridade', type: 'select', options: ['baixa', 'média', 'alta'] },
    { key: 'prazo', label: 'Prazo', type: 'date' },
    { key: 'status', label: 'Status', type: 'select', options: ['a fazer', 'em andamento', 'aguardando', 'concluído'] },
    { key: 'observacoes', label: 'Observações', type: 'textarea' }
  ]
};

export const ALL_SCHEMAS = [
  LEADS_SCHEMA, ALUNOS_SCHEMA, TURMAS_SCHEMA, MATERIAIS_SCHEMA, PAGAMENTOS_SCHEMA, SUPORTE_SCHEMA, TAREFAS_SCHEMA
];
