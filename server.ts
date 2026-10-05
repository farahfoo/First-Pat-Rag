import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Route 1: Performs compliance and risk analysis on transaction requests
  app.post('/api/explain', async (req, res) => {
    const { transaction } = req.body;
    if (!transaction) {
      return res.status(400).json({ error: 'Transaction data is required.' });
    }

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        const isHighAmount = transaction.amount > 50000;
        const score = isHighAmount ? 7 : (transaction.urgency === 'High' ? 5 : 2);
        const rating = score >= 7 ? 'Elevated Risk' : (score >= 4 ? 'Moderate Risk' : 'Safe / Routine');
        const anomalies = [];
        if (isHighAmount) anomalies.push('Transaction exceeds typical operational limit of $50,000.');
        if (transaction.beneficiary.toLowerCase().includes('bot') || transaction.beneficiary.toLowerCase().includes('pool')) {
          anomalies.push('Beneficiary is an automated system or liquidity protocol.');
        }
        if (anomalies.length === 0) anomalies.push('None detected. Transaction parameters are fully standard.');

        return res.json({
          riskScore: score,
          auditRating: rating,
          summary: `Static Compliance Check: ${transaction.type} payment to ${transaction.beneficiary} for ${transaction.currency} ${transaction.amount.toLocaleString()} is currently marked as ${transaction.urgency.toLowerCase()} urgency.`,
          flaggedAnomalies: anomalies,
          recommendation: score >= 7 
            ? 'Hold for dual-approval. High value transfers require verification of the beneficiary bank credentials.' 
            : 'Recommend immediate release. Fits standard monthly patterns.'
        });
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
        model: 'gemini-3.8-flash',
        contents: `Conduct a rigorous financial compliance, fraud risk, and business logic analysis of the following transaction request:
${JSON.stringify(transaction, null, 2)}

Produce a highly realistic compliance report. Focus on anomalies, beneficiary legitimacy, currency matching, amount thresholds, and authorization logic. Output valid JSON matching the exact schema. Do not output anything other than JSON.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              riskScore: {
                type: Type.INTEGER,
                description: 'Numeric risk score from 1 to 10.'
              },
              auditRating: {
                type: Type.STRING,
                description: 'Risk categorization label.'
              },
              summary: {
                type: Type.STRING,
                description: 'A 2-3 sentence financial summary details.'
              },
              flaggedAnomalies: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'List of specific anomalous factors found.'
              },
              recommendation: {
                type: Type.STRING,
                description: 'Actionable executive command.'
              }
            },
            required: ['riskScore', 'auditRating', 'summary', 'flaggedAnomalies', 'recommendation']
          }
        }
      });

      const textOutput = response.text || '{}';
      const cleanJson = textOutput.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      res.json(JSON.parse(cleanJson));
    } catch (error: any) {
      console.error('Compliance AI Audit Service Error:', error);
      res.status(500).json({ error: 'Failed to perform AI analysis.' });
    }
  });

  // API Route 2: Chat Support Assistant powered by Gemini
  app.post('/api/chat', async (req, res) => {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Conversation history is required.' });
    }

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        // High quality static helper reply when API Key is missing
        const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';
        let reply = "I am the Stitch Assistant. I can help you with payment setups, SARB reporting requirements, and threshold overrides. Since we are in sandbox mode without a live key, let me know if you would like me to simulate key rotations, payout releases, or custom merchant setups!";
        if (lastMsg.includes('limit') || lastMsg.includes('threshold')) {
          reply = "Standard corporate payout limits are set to $50,000 daily. You can adjust this threshold dynamically within your Profile settings inside this panel or request a permanent quota increase from compliance.";
        } else if (lastMsg.includes('sarb') || lastMsg.includes('sanish') || lastMsg.includes('regulation')) {
          reply = "Under SARB regulations, cross-border payments exceeding R1,000,000 require electronic reporting. The Stitch API automates this reporting via direct ledger linkages.";
        }
        return res.json({ reply });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Prepare Gemini contents payload
      const contents = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: contents,
        config: {
          systemInstruction: `You are "Stitch Compliance Support Assistant", an expert AI assistant for Stitch (stitch.money), a leading African payment infrastructure provider. 
You assist merchant teams (such as Farah Enterprise, represented by farahfoo@gmail.com) in setting up instant EFTs, payouts, tokenization, card collections, resolving transaction holds, SARB regulations, and optimizing compliance. 
Keep answers highly professional, under 3 sentences, extremely concise, friendly, and practical.`,
          temperature: 0.7
        }
      });

      res.json({ reply: response.text || 'I am ready to help you with your Stitch payment queries.' });
    } catch (error: any) {
      console.error('Compliance Chat Service Error:', error);
      res.status(500).json({ error: 'Failed to process support message.' });
    }
  });

  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    });
    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const indexHtmlPath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(indexHtmlPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`[Stitch API Server] Listening on http://localhost:${port}`);
  });
}

startServer();
