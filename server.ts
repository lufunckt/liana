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
