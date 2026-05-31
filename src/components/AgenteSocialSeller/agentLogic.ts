// Simulador do Agente Virtual Social Seller - ILG

export function generateAiMessage(
  canal: string,
  situacao: string,
  produto: string,
  contexto: string,
  mensagemRecebida: string
) {
  // Base knowledge integration
  const nomeTarget = 'Profissional'; // Could be extracted from context
  
  let baseContext = '';
  if (produto) {
    baseContext = `Sobre a ${produto}, o foco é habilitar você a entregar soluções corporativas claras e estruturadas. `;
  }

  // Generate 3 contextual versions based on user's prompt requirements:
  return {
    consultiva: generateConsultiva(canal, situacao, produto, contexto, mensagemRecebida),
    direta: generateDireta(canal, situacao, produto, contexto, mensagemRecebida),
    leve: generateLeve(canal, situacao, produto, contexto, mensagemRecebida)
  };
}

function generateConsultiva(canal: string, situacao: string, produto: string, contexto: string, mensagemRecebida: string) {
  return `Olá! Tudo bem? ${mensagemRecebida ? `Li com atenção sua mensagem onde você comenta que "${mensagemRecebida}".` : 'Notei seu perfil e vi que temos muita sinergia na área de desenvolvimento humano.'}

Muitas profissionais (psicólogas, coaches e analistas) que converso diariamente me relatam exatamente isso: sabem muito, têm ampla experiência, mas sentem dificuldade na hora de estruturar esse conhecimento para o mercado B2B, na linguagem que a empresa (o RH e o líder) realmente quer comprar.

Meu papel aqui no Instituto Liana Gomes é exatamente ajudar nisso. Queria entender um pouco mais o seu momento hoje: você já atende empresas e empresas te procuram ativamente, ou seu foco ainda é mais a pessoa física?

Estou à disposição caso queira trocar uma ideia sobre como estruturar sua esteira de serviços corporativos. 
Qualquer dúvida, me fala!`;
}

function generateDireta(canal: string, situacao: string, produto: string, contexto: string, mensagemRecebida: string) {
  return `Olá! Tudo bem?
Aproveitando o nosso contato por aqui, percebi que o seu perfil dialoga muito com o que construímos no Instituto Liana Gomes.

Se você já possui experiência sólida em desenvolvimento humano mas esbarra na hora de transformar isso em programas corporativos vendáveis e estruturados, acredito que podemos estruturar uma solução para você.

${produto ? `Muitos alunos começam com a ${produto} justamente para ganhar essa tração com os RHs.` : 'Nossa especialidade é ajudar profissionais a se posicionarem estrategicamente para o B2B.'}

Toparia uma breve conversa (por aqui ou WhatsApp) para eu entender seu foco de mercado atual e te mostrar como essa transição funciona na prática?

Aguardo seu retorno!`;
}

function generateLeve(canal: string, situacao: string, produto: string, contexto: string, mensagemRecebida: string) {
  return `Oi! Que bom nos conectarmos por aqui no ${canal}! 👋

${mensagemRecebida ? 'Obrigada pela sua mensagem, faz muito sentido.' : 'Vi sua trajetória e acompanho discussões muito parecidas com outras profissionais de desenvolvimento humano.'}

Nós do Instituto Liana Gomes ajudamos muito profissionais com seu perfil a destravarem a entrada e as vendas em empresas, embalando melhor o que já sabem fazer. Se um dia pensar em solidificar seu posicionamento B2B ou criar trilhas de treinamentos corporativos (como liderança ou comportamental), será um prazer conversar sem compromisso.

Por enquanto, fico feliz pela conexão. Vamos acompanhando os conteúdos! Um abraço.`;
}
