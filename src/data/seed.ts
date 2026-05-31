import { AppData } from '../types';

export const seededData: any = {
  leads: [
    {
      id: 'l1',
      nome: 'Alessandra',
      telefone: '75 8144-5758',
      produtoInteresse: 'TREINAMENTO ASSÉDIO / COMBO',
      status: 'perdido',
      temperatura: 'frio',
      responsavel: 'Fabi',
      observacoes: 'Disse não ter capacidade de investimento e que não tem interesse no momento, mas agradeceu.',
      tags: ['Turma 1']
    },
    {
      id: 'l2',
      nome: 'Ana Kekligian',
      telefone: '11 94756-5478',
      produtoInteresse: 'TREINAMENTO ASSÉDIO / COMBO',
      status: 'em negociação',
      temperatura: 'quente',
      responsavel: 'Fabi',
      proximoFollowUp: '2026-05-29',
      observacoes: 'Disse estar sem dinheiro mas que está analisando se entra. Retomar contato até dia 29.',
      tags: ['Turma 1']
    },
    {
      id: 'l3',
      nome: 'Benônia Moreira',
      telefone: '11 99903-1344',
      status: 'contato iniciado',
      temperatura: 'frio',
      observacoes: 'Mensagem Enviada, Não respondeu 26/05/26',
      tags: ['Turma 1']
    },
    {
      id: 'l4',
      nome: 'Cidália',
      telefone: '11 98105-4241',
      status: 'em qualificação',
      temperatura: 'morno',
      proximoFollowUp: '2026-05-29',
      observacoes: 'Disse que viu superficialmente no grupo, então encaminhei gravação da aula, materiais e links.',
      tags: ['Turma 1']
    },
    {
      id: 'l5',
      nome: 'Claudia',
      telefone: '11 93929-9111',
      status: 'perdido',
      temperatura: 'frio',
      observacoes: 'Disse que viu mas que dessa vez vai deixar passar. Enviei argumentos para garantir a condição especial.',
      tags: ['Turma 1']
    },
    {
      id: 'l6',
      nome: 'Elisabete',
      telefone: '21 99759-0525',
      produtoInteresse: 'COMBO 1 - Negócios + Rodas de Conversa',
      status: 'em negociação',
      temperatura: 'quente',
      observacoes: 'Disse que tem interesse nos combos 1 ou 2 mas que está esperando o cartão virar. Ofereci a opção de parcelar a entrada.',
      tags: ['Turma 1']
    }
  ],
  alunos: [
    {
      id: 'a1',
      nome: 'Renata',
      telefone: '11 98383-9885',
      email: 'contato@lidherec.com',
      formacao: 'Formação em NR-1, Master Trainer de Líderes',
      turma: 'Pacote 2',
      statusAcesso: 'ativo',
      observacoes: '19/12: Estou entrando em contato apenas para me colocar à disposição.'
    },
    {
      id: 'a2',
      nome: 'Rochelle',
      telefone: '54 9683-1871',
      email: 'rochelegm81@gmail.com',
      formacao: 'Formação master de líderes, Formação processos individuais',
      turma: 'Pacote 3',
      statusAcesso: 'ativo',
      observacoes: '18/12: Passando para saber se está tudo certinho com os estudos nas Formações que você adquiriu na Black.'
    },
    {
      id: 'a3',
      nome: 'Leonice Holanda',
      telefone: '85 9970-3280',
      email: 'leoniceholanda7@gmail.com',
      formacao: 'Formação de Master Analista Comportamental, Formação Individual de Líderes',
      turma: 'Pacote 2',
      statusAcesso: 'ativo',
      observacoes: 'Aluna sobrecarregada, retirada de pressão. Orientada a fazer no próprio ritmo.'
    },
    {
      id: 'a4',
      nome: 'Kelly Godoy',
      telefone: '19 98188-3752',
      email: 'kellycg@uol.com.br',
      formacao: 'Renovação (Pacote 1) - Master Analista',
      turma: 'Pacote 1',
      statusAcesso: 'ativo',
      observacoes: 'Cliente desde 2019. Muito satisfeita com o contato.'
    },
    {
      id: 'a5',
      nome: 'Viviane Diniz',
      telefone: '11 98354-5830',
      formacao: 'COMBO 1 - Negócios + Rodas de Conversa + Treinamento Assédio',
      turma: 'Turma 1',
      statusAcesso: 'ativo',
      pagamento: 'quitado'
    },
    {
      id: 'a6',
      nome: 'Roberto Eleuterio',
      telefone: '14 99894-2050',
      formacao: 'TREINAMENTO ASSÉDIO',
      turma: 'Turma 1',
      statusAcesso: 'ativo',
      pagamento: 'quitado'
    },
    {
      id: 'a7',
      nome: 'Luis Otávio',
      telefone: '11 98228-7020',
      formacao: 'TREINAMENTO ASSÉDIO',
      turma: 'Turma 1',
      statusAcesso: 'ativo',
      pagamento: 'quitado'
    }
  ],
  turmas: [
    {
      id: 't1',
      nome: 'Turma 1 - Treinamento Assédio / Combos',
      formacao: 'Treinamento Assédio / Combos',
      status: 'em andamento',
      responsavel: 'Fabi / Mara'
    },
    {
      id: 't2',
      nome: 'Turma 3 - Migração',
      formacao: 'Master / NR-1 / Geral',
      status: 'em andamento'
    }
  ],
  materiais: [
    {
      id: 'm1',
      nome: 'Bônus - Ebook',
      tipo: 'ebook',
      status: 'entregue',
      responsavel: 'Núria / Liana'
    }
  ],
  pagamentos: [
    {
      id: 'p1',
      aluno: 'Elizabete Maria Vicente Aranha',
      formacao: 'COMBO 1',
      valorCombinado: 2600,
      status: 'parcial',
      observacoes: 'Entrada de R$ 2.600,00 + 5x no PIX de R$ 518,40. 1a parcela paga 15/05'
    },
    {
      id: 'p2',
      aluno: 'Lídia Bueno de Miranda',
      formacao: 'VIP / Combos',
      valorCombinado: 2600,
      status: 'parcial',
      observacoes: 'Entrada de R$ 2.600,00 + 5x no PIX de R$ 518,40. Garantimos os bônus para ela.'
    },
    {
      id: 'p3',
      aluno: 'Josiane Cristina Costa',
      valorCombinado: 1600,
      status: 'parcial',
      observacoes: 'R$ 1.000,00 hoje. 04/05 R$ 1.600,00 FEITO. A Formação só será liberada depois do pgto do dia 04.'
    },
    {
      id: 'p4',
      aluno: 'Monica',
      telefone: '61 98210-3633',
      status: 'pendente',
      observacoes: 'Deu R$ 517,00 de entrada hoje e vai fazer o restante no cartão segunda'
    }
  ],
  suporte: [
    {
      id: 's1',
      aluno: 'Willian',
      formacao: 'Várias (em 4 emails diferentes)',
      categoria: 'acesso',
      descricao: 'Aluno relatou dificuldade séria de acesso pois os cursos estão espalhados em 4 e-mails diferentes. Solicitou unificação - willianlopesmentor@gmail.com.',
      status: 'em análise',
      responsavel: 'Núria / Equipe'
    },
    {
      id: 's2',
      aluno: 'Eliene',
      telefone: '31 9607-1007',
      categoria: 'didático',
      descricao: 'Problemas iniciais técnicos resolvidos. Depois teve dúvidas pedagógicas (NR-1) sobre datas mencionadas nas aulas gravadas e exigência de TCC.',
      status: 'resolvido',
      responsavel: 'Núria',
      resposta: 'Esclarecido que aulas são de turmas anteriores. TCC é exigência do MEC.'
    }
  ],
  tarefas: [
    {
      id: 'tar1',
      titulo: 'Liberar Formação para Josiane Cristina Costa',
      area: 'administrativo',
      status: 'a fazer',
      prioridade: 'alta',
      descricao: 'A Formação só será liberada depois do pagamento do dia 04',
      responsavel: 'Financeiro / Suporte'
    },
    {
      id: 'tar2',
      titulo: 'Follow up com Ana Kekligian (Em negociação)',
      area: 'comercial',
      status: 'a fazer',
      prioridade: 'alta',
      prazo: '2026-05-29',
      responsavel: 'Fabi'
    },
    {
      id: 'tar3',
      titulo: 'Follow up com Elisabete (Em negociação)',
      area: 'comercial',
      status: 'a fazer',
      prioridade: 'alta',
      descricao: 'Oferecido parcelamento de entrada de 30%',
      responsavel: 'Comercial'
    }
  ]
};
