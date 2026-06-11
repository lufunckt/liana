# Guia de Publicação Gratuita - Central Operacional ILG

Para manter o sistema 100% funcional sem custos iniciais, recomendamos a seguinte combinação:

## 1. Hospedagem do Sistema (Frontend + Backend)
**Plataforma: [Render.com](https://render.com/)**
- **Por que?** Permite rodar o servidor Node.js (Express) gratuitamente.
- **Como configurar:**
  1. Conecte seu repositório GitHub ao Render.
  2. Crie um novo "Web Service".
  3. O Render detectará o arquivo `render.yaml` que eu adicionei.
  4. Configure as Variáveis de Ambiente no painel do Render:
     - `GEMINI_API_KEY`: Sua chave da Google AI Studio.
     - `NODE_ENV`: `production`
- **Nota:** No plano gratuito, o servidor "dorme" após 15 min de inatividade e leva alguns segundos para acordar no primeiro acesso.

## 2. Banco de Dados e Autenticação
**Plataforma: [Firebase](https://console.firebase.google.com/)**
- **Plano Spark (Gratuito):** Oferece limites generosos para Firestore (banco) e Authentication (login).
- O projeto já está configurado para usar o Firebase que você forneceu. Certifique-se de que o **Google Sign-in** está ativado no console do Firebase.

## 3. Inteligência Artificial (IA)
**Plataforma: [Google AI Studio](https://aistudio.google.com/)**
- O modelo `gemini-1.5-flash` possui um nível gratuito (Free Tier) com limites de requisições por minuto que são suficientes para uso interno da equipe.

## Passos para Publicar Agora:
1. Suba este código para um repositório no GitHub (Privado).
2. Acesse o Render.com e crie o Web Service apontando para esse repo.
3. Adicione a `GEMINI_API_KEY` nas configurações.
4. O sistema estará online no endereço `https://seu-app.onrender.com`.

---
*Dica: Para o WhatsApp funcionar 100%, você precisará de uma API externa (como Evolution API), que geralmente requer um servidor (VPS). Para uso básico, as funções de CRM e IA já funcionarão apenas com Render + Firebase.*
