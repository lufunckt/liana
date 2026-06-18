import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // App API endpoints
  
  // WhatsApp Integration Webhook (Evolution API / Z-API ready)
  app.post("/api/whatsapp/webhook", async (req, res) => {
    try {
      // The Evolution API or similar provider will send POST requests here with message statuses, new chats, etc.
      console.log("Recebido Webhook WhatsApp:", req.body);
      
      const payload = req.body;
      // Validar origin/token de segurança (a ser implementado quando configurar a API)
      const secret = process.env.WHATSAPP_WEBHOOK_SECRET;

      // ... Aqui você poderá inserir a lógica para conectar essas mensagens no Firebase (coleção 'pessoas', 'interacoes', etc.) ...

      res.status(200).json({ received: true });
    } catch (error) {
      console.error("Erro processando Webhook do WhatsApp:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.post("/api/diagnostico-mural", async (req, res) => {
    try {
      const { texto } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "A chave de API GEMINI_API_KEY não está configurada no servidor." });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Analise o resumo de reunião, conversas ou anotações fornecido a seguir. Extraia de forma objetiva e profissional as tarefas essenciais e recados/avisos importantes que devem constar no mural corporativo do Instituto Liana Gomes.

Retorne EXCLUSIVAMENTE um objeto JSON válido (sem tags markdown de bloco adicionais ou formatação extra) no seguinte formato exato:
{
  "recados": ["Escreva aqui o recado 1 de forma amigável", "Escreva aqui o recado 2"],
  "tarefas": [
    {
      "titulo": "Título sucinto da tarefa extraída",
      "prioridade": "alta",
      "responsavel": "Liana"
    }
  ]
}

A prioridade deve ser estritamente "alta", "média" ou "baixa".
O responsável deve ser uma das seguintes pessoas da equipe: "Liana", "Luiza", "Nuria", "Ana" ou "Geral".

Texto de entrada:
"${texto}"`,
        config: {
          responseMimeType: "application/json",
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("Resposta do modelo de linguagem vazia.");
      }
      
      // Clean and send JSON output
      res.json(JSON.parse(text));
    } catch (error: any) {
      console.error("Erro na chamada do Gemini:", error);
      res.status(500).json({ error: error?.message || "Erro ao processar as anotações pela IA." });
    }
  });

  // Send email notification for internal communication updates
  app.post("/api/comunicacao/notificar", async (req, res) => {
    try {
      const { senderName, channelName, text, recipients } = req.body;

      if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
        return res.status(200).json({ success: true, message: "Nenhum destinatario de e-mail especificado." });
      }

      const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
      const smtpPort = parseInt(process.env.SMTP_PORT || "587");
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      const smtpFrom = process.env.SMTP_FROM || `"Central ILG" <noreply@institutolianagomes.com.br>`;

      console.log(`[Email] Tentativa de envio de notificacao de @${senderName} em #${channelName}. Destinatarios:`, recipients);

      const htmlBody = `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #fbfbfc;">
          <div style="background-color: #0A192F; padding: 15px; border-radius: 8px 8px 0 0; text-align: center;">
            <h2 style="color: #D4AF37; margin: 0; font-size: 18px; font-family: sans-serif; letter-spacing: 1px;">INSTITUTO LIANA GOMES</h2>
            <p style="color: #94a3b8; margin: 5px 0 0 0; font-size: 11px; text-transform: uppercase;">Central de Comunicacao Interna</p>
          </div>
          <div style="padding: 20px; background-color: #ffffff; border-radius: 0 0 8px 8px;">
            <p style="font-size: 14px; color: #334155;">Ola,</p>
            <p style="font-size: 14px; color: #334155; line-height: 1.5;">
              Existe uma nova atividade na central de comunicacao. <b>${senderName}</b> enviou uma mensagem no canal <b>#${channelName}</b>:
            </p>
            <div style="margin: 20px 0; padding: 15px; background-color: #f8fafc; border-left: 4px solid #D4AF37; border-radius: 4px; font-style: italic; color: #1e293b; font-size: 13px; line-height: 1.6;">
              "${text}"
            </div>
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.APP_URL || "https://ais-pre-3iypzi7qv7ijpukcsylcjq-549193751481.us-west2.run.app"}" style="background-color: #0A192F; color: #D4AF37; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 13px; border: 1px solid #D4AF37; display: inline-block;">
                Acessar Portal ILG
              </a>
            </div>
          </div>
          <div style="margin-top: 20px; text-align: center; font-size: 11px; color: #64748b;">
            Este e um e-mail automatico enviado pelo Portal Operacional do Instituto Liana Gomes.<br/>
            Configure suas preferencias de espaco em Espacos de Trabalho.
          </div>
        </div>
      `;

      if (!smtpUser || !smtpPass) {
        // Envio simulado - Log no terminal para auditoria
        console.log("================ SIMULACAO DE E-MAIL (SMTP NAO CONFIGURADO) ================");
        console.log(`DE  : ${smtpFrom}`);
        console.log(`PARA: ${recipients.join(", ")}`);
        console.log(`ASSUNTO: Nova mensagem em #${channelName} por @${senderName}`);
        console.log(`CONTEUDO: "${text}"`);
        console.log("==========================================================================");
        return res.status(200).json({
          success: true,
          simulated: true,
          message: "Notificacao de e-mail simulada com sucesso (SMTP nao configurado)."
        });
      }

      // Envio Real via Nodemailer
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.default.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      await transporter.sendMail({
        from: smtpFrom,
        to: recipients.join(", "),
        subject: `[ILG] Nova mensagem em #${channelName} de ${senderName}`,
        html: htmlBody,
        text: `[Central ILG] @${senderName} em #${channelName}: "${text}"`
      });

      console.log(`[Email] Notificacao real via SMTP enviada com sucesso para ${recipients.length} e-mails.`);
      return res.status(200).json({ success: true, message: "E-mails enviados com sucesso." });
    } catch (error: any) {
      console.error("[Email] Erro ao processar envio de notificacoes por e-mail:", error);
      // Retornar 200 com erro nos detalhes para nao estourar a interface do chat do usuario
      return res.status(200).json({ success: false, error: error?.message || "Erro desconhecido ao despachar e-mail." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
