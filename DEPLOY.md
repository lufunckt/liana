# Guia de Publicação - Central Operacional ILG

Para manter o sistema 100% funcional, siga estas etapas de configuração.

## 1. Hospedagem do Sistema (Frontend + Backend)
**Plataforma: [Render.com](https://render.com/)**
- **Como configurar:**
  1. Conecte seu repositório GitHub ao Render.
  2. Crie um novo "Web Service".
  3. O Render detectará o arquivo `render.yaml`.
  4. Nas configurações (Settings), adicione as Variáveis de Ambiente:
     - `GEMINI_API_KEY`: Sua chave da Google AI Studio.
     - `NODE_ENV`: `production`
- **URL do seu app:** `https://liana-kd4x.onrender.com/`

## 2. Configuração Crítica do Firebase (Para o Login Funcionar)
**Se o login não passar da tela inicial, é provável que o domínio não esteja autorizado.**

1. Acesse o [Console do Firebase](https://console.firebase.google.com/).
2. Selecione seu projeto.
3. No menu lateral, vá em **Build > Authentication**.
4. Clique na aba **Settings**.
5. No menu lateral de Settings, clique em **Authorized domains**.
6. Clique em **Add domain** e adicione:
   - `liana-kd4x.onrender.com`
7. Certifique-se de que o provedor **Google** está ativo em **Sign-in method**.

## 3. Banco de Dados e IA
- **Firestore:** O sistema usa o Firestore no plano Spark (Gratuito).
- **IA:** O modelo `gemini-1.5-flash` é usado para processar reuniões e mensagens. Certifique-se de que a `GEMINI_API_KEY` está configurada no Render.

## Resumo de Problemas Comuns:
- **"Acesso Negado":** O e-mail usado não está na lista de e-mails permitidos no arquivo `src/App.tsx`.
- **Botão de Login não faz nada:** Verifique se o bloqueador de pop-ups do navegador está desativado.
- **Erro de Domínio não autorizado:** Siga o passo 2 acima.

---
*Desenvolvido para Instituto Liana Gomes*
