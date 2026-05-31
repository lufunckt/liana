import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

const seedPessoas = [
  {
    id: 'p1', nome: 'Alessandra', telefone: '75 8144-5758', email: 'alessandra@example.com', origem: 'Instagram', 
    tipoPessoa: 'lead', produtoInteresse: 'TREINAMENTO ASSÉDIO / COMBO', produtoComprado: '', turma: '',
    status: 'perdido', temperatura: 'frio', responsavel: 'Fabi', 
    ultimaInteracao: '2026-05-26', proximoContato: '', 
    observacoes: 'Disse não ter capacidade de investimento e que não tem interesse no momento.',
    tags: ['Turma 1']
  },
  {
    id: 'p2', nome: 'Ana Kekligian', telefone: '11 94756-5478', origem: 'Indicação',
    tipoPessoa: 'lead', produtoInteresse: 'TREINAMENTO ASSÉDIO / COMBO',
    status: 'em negociação', temperatura: 'quente', responsavel: 'Fabi',
    ultimaInteracao: '2026-05-26', proximoContato: '2026-05-29',
    observacoes: 'Disse estar sem dinheiro mas que está analisando se entra. Retomar contato até dia 29.',
    obcecao: 'Financeira'
  },
  {
    id: 'p3', nome: 'Viviane Diniz', telefone: '11 98354-5830', origem: 'Site',
    tipoPessoa: 'aluna', produtoComprado: 'COMBO 1 - Negócios + Rodas de Conversa + Treinamento Assédio',
    turma: 'Turma 1', responsavel: 'Mara', status: 'concluído', temperatura: 'quente',
    formaPagamento: 'Eduzz', entrouGrupo: true, respondeuInicial: true, respondeuBonus: false,
    acessoNutror: true, acessoMRP: true
  },
  {
    id: 'p4', nome: 'Renata', telefone: '11 98383-9885', email: 'contato@lidherec.com',
    tipoPessoa: 'aluna', produtoComprado: 'Formação em NR-1, Master Trainer de Líderes',
    turma: 'Pacote 2', responsavel: 'Equipe', status: 'em acompanhamento', temperatura: 'morno',
    entrouGrupo: false, respondeuInicial: false, acessoNutror: false, acessoMRP: true,
    observacoes: '19/12: Estou entrando em contato apenas para me colocar à disposição.'
  }
];

const seedTarefasSuporte = [
  {
    id: 'ts1', titulo: 'Liberar Formação para Josiane Cristina Costa', categoria: 'administrativo',
    tipo: 'tarefa', pessoaId: 'p2', responsavel: 'Financeiro', prioridade: 'alta', prazo: '2026-05-04',
    status: 'a fazer', descricao: 'A Formação só será liberada depois do pagamento do dia 04'
  },
  {
    id: 'ts2', titulo: 'Follow up com Ana Kekligian', categoria: 'comercial',
    tipo: 'tarefa', pessoaId: 'p2', responsavel: 'Fabi', prioridade: 'alta', prazo: '2026-05-29',
    status: 'a fazer'
  },
  {
    id: 'ts3', titulo: 'Unificar contas de email do Willian', categoria: 'acesso',
    tipo: 'suporte', responsavel: 'Núria', prioridade: 'média', status: 'em análise',
    descricao: 'Aluno relatou dificuldade séria de acesso pois os cursos estão espalhados em 4 e-mails diferentes.'
  }
];

const seedMateriais = [
  { id: 'm1', nome: 'Bônus - Ebook', categoria: 'ebook', link: 'https://drive.google.com/...', responsavel: 'Liana', status: 'aprovado' },
  { id: 'm2', nome: 'Planilha MRP Tracker', categoria: 'materiais editáveis', link: 'https://docs.google.com/spreadsheets/...', responsavel: 'Núria', status: 'concluído' }
];

const seedPagamentos = [
  { id: 'pag1', aluno: 'Viviane Diniz', formacao: 'COMBO 1 - Negócios + Rodas de Conversa + Treinamento Assédio', valorCombinado: 1250.00, status: 'pago', vencimento: '2026-05-15', comprovante: 'https://comprovantes.example.com/vivi.pdf', observacoes: 'Pagamento integral via Eduzz sem pendências.', responsavel: 'Ana' },
  { id: 'pag2', aluno: 'Renata', formacao: 'Formação em NR-1, Master Trainer de Líderes', valorCombinado: 800.00, status: 'parcial', vencimento: '2026-06-05', comprovante: '', observacoes: 'Entrada de R$ 400 paga. Falta segunda parcela de R$ 400 para vencimento em 05/06.', responsavel: 'Financeiro' },
  { id: 'pag3', aluno: 'Ana Kekligian', formacao: 'TREINAMENTO ASSÉDIO / COMBO', valorCombinado: 950.00, status: 'pendente', vencimento: '2026-05-30', comprovante: '', observacoes: 'Aguardando confirmação do PIX de sinal.', responsavel: 'Ana' }
];

const seedPerfis = [
  {
    id: 'liana',
    nome: 'Liana Gomes',
    cargo: 'Fundadora & Diretora Geral',
    foto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300&h=300',
    perfil: 'Advogada especialista em Compliance de Gênero, Combate ao Assédio Corporativo e Desenvolvimento de Mulheres Líderes.',
    linkedin: 'liana-gomes-compliance',
    instagram: 'lianagomes.ilg',
    email: 'liana@institutolianagomes.com.br',
    telefone: '11 99999-5555'
  },
  {
    id: 'ana',
    nome: 'Ana',
    cargo: 'Head de Negócios & Comercial',
    foto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300&h=300',
    perfil: 'Responsável pelo gerenciamento do CRM do Instituto, conversão de novos leads quentes, negociações de combos corporativos e faturamento inicial.',
    linkedin: 'ana-ilg-comercial',
    instagram: 'ana.comercial',
    email: 'comercial@institutolianagomes.com.br',
    telefone: '11 98888-4444'
  },
  {
    id: 'nuria',
    nome: 'Núria',
    cargo: 'Client Success, Mídias & Operação',
    foto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300&h=300',
    perfil: 'Supervisora de Onboarding de novas alunas. Responsável por liberar acessos ao Nutror, alimentar o MRP Tracker, além de coordenar pautas de mídia e Instagram.',
    linkedin: 'nuria-ilg-suporte',
    instagram: 'nuria.suporte',
    email: 'nuria@institutolianagomes.com.br',
    telefone: '11 97777-3333'
  },
  {
    id: 'luiza',
    nome: 'Luiza',
    cargo: 'Tech Lead / Administradora',
    foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300&h=300',
    perfil: 'Arquiteta de software e mantenedora deste Portal Integrado. Gerencia as integrações de banco de dados, regras e logs operacionais.',
    linkedin: 'luiza-ft',
    instagram: 'luiza.tech',
    email: 'luizaftessele@gmail.com',
    telefone: '11 96666-2222'
  }
];

export async function seedDatabase() {
  for (const p of seedPessoas) {
    await setDoc(doc(db, 'pessoas', p.id), p);
  }
  for (const ts of seedTarefasSuporte) {
    await setDoc(doc(db, 'tarefas_suporte', ts.id), ts);
  }
  for (const m of seedMateriais) {
    await setDoc(doc(db, 'materiais', m.id), m);
  }
  for (const pag of seedPagamentos) {
    await setDoc(doc(db, 'pagamentos', pag.id), pag);
  }
  for (const perf of seedPerfis) {
    await setDoc(doc(db, 'perfis', perf.id), perf);
  }
  console.log('Seeding completed!');
}
