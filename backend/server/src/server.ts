import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { config } from 'dotenv';
import rateLimit from 'express-rate-limit';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { DynamoDBClient, GetItemCommand, PutItemCommand, UpdateItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { Readable } from 'stream';
import { tryIntentMatch } from './services/intent-matcher.js';

config();

// Email translations
const emailTranslations = {
  pt: {
    subject: 'Seu código de verificação Menebot',
    title: 'Código de verificação Menebot',
    description: 'Use este código para validar seu e-mail e iniciar uma conversa com o Menebot.',
    expiresMessage: 'Este código expira em',
    minutes: '5 minutos',
    warningText: 'Se você não solicitou este código, ignore este e-mail.',
    footer: 'Menebot — criado por',
    backToSite: 'Voltar ao site',
    plainText: 'Seu código de verificação Menebot é: {code}\n\nEste código expira em 5 minutos.'
  },
  en: {
    subject: 'Your Menebot verification code',
    title: 'Menebot verification code',
    description: 'Use this code to validate your email and start a conversation with Menebot.',
    expiresMessage: 'This code expires in',
    minutes: '5 minutes',
    warningText: 'If you did not request this code, please ignore this email.',
    footer: 'Menebot — created by',
    backToSite: 'Back to site',
    plainText: 'Your Menebot verification code is: {code}\n\nThis code expires in 5 minutes.'
  },
  es: {
    subject: 'Tu código de verificación Menebot',
    title: 'Código de verificación Menebot',
    description: 'Usa este código para validar tu correo electrónico e iniciar una conversación con Menebot.',
    expiresMessage: 'Este código expira en',
    minutes: '5 minutos',
    warningText: 'Si no solicitaste este código, ignora este correo electrónico.',
    footer: 'Menebot — creado por',
    backToSite: 'Volver al sitio',
    plainText: 'Tu código de verificación Menebot es: {code}\n\nEste código expira en 5 minutos.'
  }
};

// Contact confirmation email translations
const contactEmailTranslations = {
  pt: {
    subject: 'Obrigado por entrar em contato!',
    title: 'Mensagem recebida!',
    greeting: 'Olá',
    message: 'Recebi sua mensagem e entrarei em contato em breve.',
    details: 'Detalhes da sua mensagem:',
    subject_label: 'Assunto',
    message_label: 'Mensagem',
    footer: 'Atenciosamente, Ruy Barbosa de Castro',
    backToSite: 'Voltar ao site',
  },
  en: {
    subject: 'Thank you for contacting me!',
    title: 'Message received!',
    greeting: 'Hello',
    message: 'I received your message and will get back to you soon.',
    details: 'Your message details:',
    subject_label: 'Subject',
    message_label: 'Message',
    footer: 'Best regards, Ruy Barbosa de Castro',
    backToSite: 'Back to site',
  },
  es: {
    subject: '¡Gracias por contactarme!',
    title: '¡Mensaje recibido!',
    greeting: 'Hola',
    message: 'Recibí tu mensaje y me pondré en contacto pronto.',
    details: 'Detalles de tu mensaje:',
    subject_label: 'Asunto',
    message_label: 'Mensaje',
    footer: 'Atentamente, Ruy Barbosa de Castro',
    backToSite: 'Volver al sitio',
  }
};

// Function to generate email HTML based on language
function generateEmailHtml(code: string, language: 'pt' | 'en' | 'es', frontendUrl: string): string {
  const t = emailTranslations[language];
  const langAttr = language === 'pt' ? 'pt-BR' : language === 'es' ? 'es-ES' : 'en-US';
  
  return `
<!DOCTYPE html>
<html lang="${langAttr}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1a0b2e 0%, #0f0518 100%); border-radius: 16px; border: 1px solid rgba(125, 68, 255, 0.3); box-shadow: 0 8px 32px rgba(125, 68, 255, 0.15); overflow: hidden;">
          
          <!-- Header com Menebot -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center;">
              <!-- Emoji fallback centralizado, sem círculo -->
              <div style="font-size: 64px; margin: 0 auto 20px; line-height: 1;">
                🤖
              </div>
              <h1 style="color: #7d44ff; font-size: 28px; margin: 0; font-weight: 700; letter-spacing: -0.5px;">${t.title}</h1>
            </td>
          </tr>

          <!-- Conteúdo -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <p style="color: #e5e5ea; font-size: 16px; line-height: 1.6; margin: 0 0 25px; text-align: center;">
                ${t.description}
              </p>
            </td>
          </tr>

          <!-- Código de verificação -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7d44ff 100%); padding: 20px 40px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 16px rgba(125, 68, 255, 0.4);">
                      <span style="color: #ffffff; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">${code}</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Aviso de expiração -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: rgba(125, 68, 255, 0.1); border-radius: 8px; border: 1px solid rgba(125, 68, 255, 0.2);">
                <tr>
                  <td style="padding: 16px 20px; text-align: center;">
                    <p style="color: #a78bfa; font-size: 14px; margin: 0; line-height: 1.5;">
                      ⏱️ ${t.expiresMessage} <strong style="color: #c4b5fd;">${t.minutes}</strong>. ${t.warningText}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid rgba(125, 68, 255, 0.2);">
              <p style="color: #6b7280; font-size: 12px; line-height: 1.6; margin: 0; text-align: center;">
                ${t.footer} <strong style="color: #9ca3af;">Ruy Barbosa de Castro</strong>
              </p>
              <p style="color: #6b7280; font-size: 12px; line-height: 1.6; margin: 8px 0 0; text-align: center;">
                <a href="${frontendUrl}" style="color: #7d44ff; text-decoration: none;">${t.backToSite}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// Function to generate contact confirmation email HTML
function generateContactConfirmationHtml(
  name: string,
  subject: string,
  message: string,
  language: 'pt' | 'en' | 'es',
  frontendUrl: string
): string {
  const t = contactEmailTranslations[language];
  const langAttr = language === 'pt' ? 'pt-BR' : language === 'es' ? 'es-ES' : 'en-US';
  
  return `
<!DOCTYPE html>
<html lang="${langAttr}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1a0b2e 0%, #0f0518 100%); border-radius: 16px; border: 1px solid rgba(125, 68, 255, 0.3); box-shadow: 0 8px 32px rgba(125, 68, 255, 0.15); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center;">
              <div style="font-size: 64px; margin: 0 auto 20px; line-height: 1;">
                ✉️
              </div>
              <h1 style="color: #7d44ff; font-size: 28px; margin: 0; font-weight: 700; letter-spacing: -0.5px;">${t.title}</h1>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 0 40px 20px;">
              <p style="color: #e5e7eb; font-size: 16px; line-height: 1.6; margin: 0; text-align: center;">
                ${t.greeting} <strong style="color: #c4b5fd;">${name}</strong>,
              </p>
            </td>
          </tr>

          <!-- Main message -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <p style="color: #d1d5db; font-size: 15px; line-height: 1.6; margin: 0; text-align: center;">
                ${t.message}
              </p>
            </td>
          </tr>

          <!-- Message details box -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: rgba(125, 68, 255, 0.1); border-radius: 12px; border: 1px solid rgba(125, 68, 255, 0.2);">
                <tr>
                  <td style="padding: 24px;">
                    <p style="color: #a78bfa; font-size: 14px; font-weight: 600; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 0.5px;">
                      ${t.details}
                    </p>
                    
                    <p style="color: #9ca3af; font-size: 13px; margin: 0 0 6px; font-weight: 600;">
                      ${t.subject_label}:
                    </p>
                    <p style="color: #e5e7eb; font-size: 15px; margin: 0 0 20px; line-height: 1.5;">
                      ${subject}
                    </p>
                    
                    <p style="color: #9ca3af; font-size: 13px; margin: 0 0 6px; font-weight: 600;">
                      ${t.message_label}:
                    </p>
                    <p style="color: #e5e7eb; font-size: 15px; margin: 0; line-height: 1.6; white-space: pre-wrap;">
                      ${message}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid rgba(125, 68, 255, 0.2);">
              <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin: 0 0 8px; text-align: center; font-weight: 500;">
                ${t.footer}
              </p>
              <p style="color: #6b7280; font-size: 12px; line-height: 1.6; margin: 0; text-align: center;">
                <a href="${frontendUrl}" style="color: #7d44ff; text-decoration: none; font-weight: 500;">${t.backToSite}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

interface Chunk {
  text: string;
  embedding: number[];
  index: number;
}

interface EmbeddingsData {
  version: string;
  timestamp: number;
  chunks: Chunk[];
  metadata: {
    chunkSize: number;
    chunkOverlap: number;
    totalChunks: number;
    model: string;
  };
}

interface Metadata {
  current_version: string;
  versions: string[];
  last_update: number;
}

interface Message {
  message: string;
  email: string;
}

// Configurações
const PORT = process.env.PORT || 3001;
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const S3_BUCKET = process.env.S3_BUCKET_NAME!;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const TOP_K = parseInt(process.env.TOP_K_RESULTS || '6');
const GENERATION_MODEL = process.env.BEDROCK_GENERATION_MODEL || 'us.meta.llama3-1-70b-instruct-v1:0';

// Clients AWS
const s3Client = new S3Client({ region: AWS_REGION });
const bedrockClient = new BedrockRuntimeClient({ region: AWS_REGION });
const sesClient = new SESClient({ region: AWS_REGION });
const ddbClient = new DynamoDBClient({ region: AWS_REGION });

// DynamoDB table name (store user verification + emails)
const DDB_TABLE = process.env.DDB_TABLE_NAME || 'menebot_users';
const SES_FROM_EMAIL = process.env.SES_FROM_EMAIL || `no-reply@${process.env.FRONTEND_URL?.replace(/https?:\/\//,'') || 'example.com'}`;

// Cache de embeddings em memória
let embeddingsCache: Chunk[] = [];

/**
 * Similaridade de cosseno entre dois vetores
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vetores devem ter o mesmo tamanho');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

/**
 * Carrega embeddings do S3
 */
async function loadEmbeddings(): Promise<void> {
  console.log('📥 Carregando embeddings do S3...');

  try {
    // 1. Carregar metadata para obter versão atual
    const metadataCommand = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: 'embeddings/metadata.json',
    });

    const metadataResponse = await s3Client.send(metadataCommand);
    const metadataStream = metadataResponse.Body as Readable;
    const metadataChunks: Buffer[] = [];
    for await (const chunk of metadataStream) {
      metadataChunks.push(chunk);
    }
    const metadataStr = Buffer.concat(metadataChunks).toString('utf-8');
    const metadata: Metadata = JSON.parse(metadataStr);

    console.log(`📌 Versão atual: ${metadata.current_version}`);

    // 2. Carregar embeddings da versão atual
    const embeddingsCommand = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: `embeddings/${metadata.current_version}`,
    });

    const embeddingsResponse = await s3Client.send(embeddingsCommand);
    const embeddingsStream = embeddingsResponse.Body as Readable;
    const embeddingsChunks: Buffer[] = [];
    for await (const chunk of embeddingsStream) {
      embeddingsChunks.push(chunk);
    }
    const embeddingsStr = Buffer.concat(embeddingsChunks).toString('utf-8');
    const embeddingsData: EmbeddingsData = JSON.parse(embeddingsStr);

    embeddingsCache = embeddingsData.chunks;

    console.log(`✅ ${embeddingsCache.length} chunks carregados em memória`);
  } catch (error) {
    console.error('❌ Erro ao carregar embeddings:', error);
    console.log('⚠️  Servidor rodando sem embeddings. Execute "npm run ingest" primeiro.');
  }
}

/**
 * Gera embedding usando Bedrock Titan
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const payload = {
    inputText: text,
  };

  const command = new InvokeModelCommand({
    modelId: process.env.BEDROCK_EMBEDDING_MODEL || 'amazon.titan-embed-text-v1',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(payload),
  });

  const response = await bedrockClient.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));

  return responseBody.embedding;
}

/**
 * Busca os top-K chunks mais similares
 */
function findTopKChunks(queryEmbedding: number[], k: number = TOP_K): Chunk[] {
  const similarities = embeddingsCache.map((chunk) => ({
    chunk,
    similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));

  // Ordena por similaridade decrescente
  similarities.sort((a, b) => b.similarity - a.similarity);

  // Retorna top-K
  return similarities.slice(0, k).map((item) => item.chunk);
}

/**
 * Detecta idioma da mensagem
 */
function detectLanguage(text: string): 'pt-BR' | 'en-US' | 'es-AR' {
  const lowerText = text.toLowerCase();

  // Palavras-chave para detecção
  const ptKeywords = ['você', 'vc', 'seu', 'sua', 'como', 'que', 'está', 'tem', 'pode', 'qual', 'onde'];
  const esKeywords = ['usted', 'tu', 'su', 'cómo', 'qué', 'está', 'tiene', 'puede', 'cuál', 'dónde', 'hola'];
  const enKeywords = ['you', 'your', 'how', 'what', 'is', 'are', 'have', 'can', 'which', 'where', 'hello'];

  let ptCount = 0;
  let esCount = 0;
  let enCount = 0;

  ptKeywords.forEach((keyword) => {
    if (lowerText.includes(keyword)) ptCount++;
  });

  esKeywords.forEach((keyword) => {
    if (lowerText.includes(keyword)) esCount++;
  });

  enKeywords.forEach((keyword) => {
    if (lowerText.includes(keyword)) enCount++;
  });

  // Retorna idioma com mais matches
  if (ptCount >= esCount && ptCount >= enCount) return 'pt-BR';
  if (esCount >= enCount) return 'es-AR';
  return 'en-US';
}

/**
 * Gera resposta usando Bedrock (Llama 3.1 70B)
 */
async function generateResponse(query: string, context: string, language: string): Promise<string> {
  const languageNames = {
    'pt-BR': 'português brasileiro',
    'en-US': 'inglês',
    'es-AR': 'espanhol'
  };
  
  // Detecta dados sensíveis na query
  const privacyPatterns = [
    /\b\d{3}[\.\-]?\d{3}[\.\-]?\d{3}[\.\-]?\d{2}\b/g,  // CPF
    /\b\d{2}[\.\-]?\d{3}[\.\-]?\d{3}[\/\-]?\d{4}[\.\-]?\d{2}\b/g,  // CNPJ
    /\bcliente[:\s]+\d+/gi,  // "cliente: 123456" ou "cliente 123456"
    /\bnúmero\s+(?:do\s+)?cliente[:\s]*\d+/gi,  // "número do cliente: 123"
    /\bid\s+(?:do\s+)?cliente[:\s]*\d+/gi,  // "id do cliente: 123"
    /\b\d{10,15}\b/g  // Números longos suspeitos (IDs, telefones, etc)
  ];
  
  const hasSensitiveData = privacyPatterns.some(pattern => pattern.test(query));
  
  if (hasSensitiveData) {
    const privacyResponse = {
      'pt-BR': '🔒 Desculpe, mas não posso compartilhar informações sensíveis como números de clientes, CPFs ou dados privados. Essas informações são confidenciais e protegidas por políticas de privacidade.',
      'en-US': '🔒 Sorry, but I cannot share sensitive information such as client numbers, CPFs, or private data. This information is confidential and protected by privacy policies.',
      'es-AR': '🔒 Lo siento, pero no puedo compartir información sensible como números de clientes, CPFs o datos privados. Esta información es confidencial y está protegida por políticas de privacidad.'
    };
    return privacyResponse[language as keyof typeof privacyResponse] || privacyResponse['pt-BR'];
  }
  
  const systemPrompt = `Você é Menebot, o assistente virtual criado por Ruy Barbosa de Castro para responder perguntas sobre ele — tanto no contexto profissional quanto pessoal.
Seu objetivo é conversar de forma natural, simpática e inteligente, transmitindo informações factuais sobre o Ruy de modo agradável, conciso e humano.
Você fala sobre o Ruy, e não como se fosse ele.
Quando apropriado, adote um tom leve, curioso e divertido — especialmente em perguntas sobre curiosidades, comportamentos ou preferências pessoais. Se a pergunta estiver fora do escopo desse contexto, você deve recusar educadamente e 
não tentar gerar uma resposta baseada em conhecimento externo, web ou dedução livre.

CONTEXTO FORNECIDO:
${context}

INSTRUÇÕES DE COMPORTAMENTO:

1. **Analise e Sintetize**
   - Leia todo o contexto acima e extraia apenas as informações relevantes para responder a pergunta.
   - Reformule com suas próprias palavras, não copie trechos literais.

2. **Estilo de Resposta**
   - Se a pergunta for profissional → responda com tom técnico, claro e confiante (sem exageros).
   - Se a pergunta for pessoal → responda com tom bem-humorado, leve e simpático, mantendo naturalidade.
   - Evite soar robótico, frio ou impessoal.

3. **Idioma**
   - Responda SEMPRE em ${languageNames[language as keyof typeof languageNames] || 'português'}, mesmo que o contexto esteja em outro idioma.
   - Use expressões naturais do idioma detectado.

4. **Formato e Tamanho**
   - Use no máximo 3 a 5 frases.
   - Seja direto, natural e dinâmico.
   - Nunca use listas ou formatação técnica, apenas texto conversacional.

5. **Personalidade**
   - Fale como se fosse um amigo que conhece o Ruy muito bem.
   - Refira-se sempre a ele como "o Ruy" (nunca "eu").
   - Pode usar emojis leves, como 🙂 ou 😄, quando apropriado.

6. **Quando a informação não estiver disponível**
   - Para fatos objetivos (idade, datas, empresas, etc.): "Não tenho essa informação específica no momento 🤔"
   - Para perguntas de opinião ou comportamento: "Ele não chegou a me contar sobre isso, mas ele provavelmente..."
   - Nunca invente dados factuais (como cargos, empresas, valores, etc.).

7. **Privacidade e Segurança**
   - Nunca revele informações pessoais, números, IDs, CPFs, e-mails de terceiros, dados sensíveis ou qualquer coisa não presente no contexto.
   - Se o usuário solicitar algo sensível, diga que não pode compartilhar informações confidenciais e sugira conversar pessoalmente com o Ruy.

8. **Tom e Empatia**
   - Adapte-se ao humor da conversa.
   - Seja simpático, positivo e cordial.
   - Quando a pergunta for informal, responda de forma leve e descontraída.
   - Quando a pergunta for técnica, responda com clareza, foco e profissionalismo.

IMPORTANTE: Você fala SOBRE o Ruy, não como se fosse ele. Use "o Ruy" ou "ele" ao se referir a ele!`;

  const userMessage = `Pergunta do usuário: ${query}`;

  // Llama usa formato de prompt diferente do Claude
  const llamaPrompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>

${systemPrompt}<|eot_id|><|start_header_id|>user<|end_header_id|>

${userMessage}<|eot_id|><|start_header_id|>assistant<|end_header_id|>`;

  const payload = {
    prompt: llamaPrompt,
    max_gen_len: 250,  // Llama tende a ser mais verboso, limitamos aqui
    temperature: 0.7,
    top_p: 0.9,
  };

  const command = new InvokeModelCommand({
    modelId: GENERATION_MODEL,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(payload),
  });

  const response = await bedrockClient.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));

  return responseBody.generation.trim();
}

/**
 * Rate limiter por IP
 */
const socketRateLimiter = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10');
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000');

  const userLimit = socketRateLimiter.get(ip);

  if (!userLimit || now > userLimit.resetTime) {
    socketRateLimiter.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (userLimit.count >= limit) {
    return false;
  }

  userLimit.count++;
  return true;
}

/**
 * Inicializa servidor
 */
async function startServer() {
  // Carrega embeddings na inicialização
  await loadEmbeddings();

  const app = express();
  const httpServer = createServer(app);

  // Middleware CORS - Apenas localhost
  app.use(cors({ 
    origin: FRONTEND_URL,
    credentials: true 
  }));
  app.use(express.json());

  // Rate limiter para HTTP
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10'),
    message: 'Muitas requisições. Tente novamente mais tarde.',
  });

  app.use('/api/', limiter);

  // Health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      embeddings: embeddingsCache.length,
      timestamp: Date.now(),
    });
  });

  // Get metrics (verified users count)
  app.get('/api/metrics', async (req, res) => {
    try {
      // Scan DynamoDB to count verified users
      const scanCmd = new ScanCommand({
        TableName: DDB_TABLE,
        FilterExpression: 'verified = :true',
        ExpressionAttributeValues: marshall({ ':true': true }),
        ProjectionExpression: 'email',
      });
      
      const result = await ddbClient.send(scanCmd);
      const verifiedUsers = (result.Items as any[])?.length || 0;

      res.json({
        verifiedUsers,
        visits: verifiedUsers, // For backward compatibility
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Error fetching metrics', error);
      res.status(500).json({ message: 'Could not fetch metrics' });
    }
  });

  // Post visit metric (currently no-op, but endpoint exists for frontend)
  app.post('/api/metrics/visit', async (req, res) => {
    try {
      // For now, just acknowledge the visit
      // In the future, could track anonymous visits in DDB
      res.json({ ok: true });
    } catch (error) {
      console.error('Error recording visit', error);
      res.status(500).json({ message: 'Could not record visit' });
    }
  });

  // Check if user was recently authenticated (within 30 minutes)
  app.post('/api/auth/check-recent', async (req, res) => {
    try {
      const { email } = req.body || {};
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ message: 'Missing email' });
      }

      const getCmd = new GetItemCommand({ TableName: DDB_TABLE, Key: marshall({ email }) });
      const existing = await ddbClient.send(getCmd);
      
      if (!existing || !existing.Item) {
        return res.json({ recentlyAuthenticated: false });
      }

      const item = unmarshall(existing.Item as any) as any;
      const now = Date.now();
      const thirtyMinutes = 30 * 60 * 1000;

      // Check if user is verified and was verified within last 30 minutes
      if (item.verified && item.verifiedAt && (now - item.verifiedAt) < thirtyMinutes) {
        return res.json({ recentlyAuthenticated: true });
      }

      return res.json({ recentlyAuthenticated: false });
    } catch (error) {
      console.error('Error checking recent auth', error);
      return res.status(500).json({ message: 'Could not check authentication' });
    }
  });

  // Request verification code (step 1)
  app.post('/api/auth/request-code', async (req, res) => {
    try {
      const body = (req.body || {}) as { email?: unknown; language?: 'pt' | 'en' | 'es' };
      const email = typeof body.email === 'string' ? body.email : undefined;
      const langInput = body.language ?? 'pt';

      if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        return res.status(400).json({ message: 'Invalid email' });
      }

      const lang: 'pt' | 'en' | 'es' = ['pt', 'en', 'es'].includes(langInput) ? langInput : 'pt';

      const getCmd = new GetItemCommand({ TableName: DDB_TABLE, Key: marshall({ email }) });
      const existing = await ddbClient.send(getCmd);
      const now = Date.now();
      let code = '';
      
      if (existing && existing.Item) {
        const item = unmarshall(existing.Item as any) as any;
        
        // Enhanced rate limiting: 10 requests in 5 minutes
        const fiveMinutes = 5 * 60 * 1000;
        const requestHistory = item.requestHistory || [];
        
        // Filter requests within last 5 minutes
        const recentRequests = requestHistory.filter((timestamp: number) => now - timestamp < fiveMinutes);
        
        if (recentRequests.length >= 10) {
          return res.status(429).json({ message: 'Too many requests, try again in 5 minutes' });
        }
        
        // Also check basic cooldown (1 minute between requests)
        if (item.lastSentAt && now - item.lastSentAt < 60_000) {
          return res.status(429).json({ message: 'Too many requests, try again later' });
        }
        
        // Update request history
        recentRequests.push(now);
        
        // generate 6-digit numeric code
        code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = now + 5 * 60 * 1000; // 5 minutes

        // Store/update item in DynamoDB with request history
        const put = new PutItemCommand({
          TableName: DDB_TABLE,
          Item: marshall({
            email,
            code,
            codeExpiresAt: expiresAt,
            verified: item.verified || false,
            verifiedAt: item.verifiedAt,
            createdAt: item.createdAt,
            lastSentAt: now,
            requestHistory: recentRequests,
          }, { removeUndefinedValues: true }),
        });

        await ddbClient.send(put);
      } else {
        // New user
        code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = now + 5 * 60 * 1000; // 5 minutes

        const put = new PutItemCommand({
          TableName: DDB_TABLE,
          Item: marshall({
            email,
            code,
            codeExpiresAt: expiresAt,
            verified: false,
            createdAt: now,
            lastSentAt: now,
            requestHistory: [now],
          }, { removeUndefinedValues: true }),
        });

        await ddbClient.send(put);
      }

      // Send email via SES with styled HTML based on language
      const t = emailTranslations[lang];
      const bodyText = t.plainText.replace('{code}', code);
      const bodyHtml = generateEmailHtml(code, lang, FRONTEND_URL);

      const sendCmd = new SendEmailCommand({
        Source: SES_FROM_EMAIL,
        Destination: { ToAddresses: [email] },
        Message: {
          Subject: { Data: t.subject },
          Body: { 
            Text: { Data: bodyText },
            Html: { Data: bodyHtml }
          },
        },
      });

      await sesClient.send(sendCmd);

      return res.json({ ok: true });
    } catch (error) {
      console.error('Error sending verification code', error);
      return res.status(500).json({ message: 'Could not send code' });
    }
  });

  // Verify code (step 2)
  app.post('/api/auth/verify-code', async (req, res) => {
    try {
      const { email, code } = req.body || {};
      if (!email || !code) return res.status(400).json({ message: 'Missing email or code' });

      const getCmd = new GetItemCommand({ TableName: DDB_TABLE, Key: marshall({ email }) });
      const existing = await ddbClient.send(getCmd);
      if (!existing || !existing.Item) return res.status(400).json({ message: 'No code requested for this email' });

      const item = unmarshall(existing.Item as any) as any;
      const now = Date.now();
      if (!item.code || !item.codeExpiresAt || now > item.codeExpiresAt) {
        return res.status(400).json({ message: 'Code expired or not found' });
      }

      if (item.code !== String(code)) {
        return res.status(400).json({ message: 'Invalid code' });
      }

      // mark verified: set verified and verifiedAt, remove code and codeExpiresAt
      const updateCmd = new UpdateItemCommand({
        TableName: DDB_TABLE,
        Key: marshall({ email }),
        UpdateExpression: 'SET verified = :v, verifiedAt = :ts REMOVE code, codeExpiresAt',
        ExpressionAttributeValues: marshall({ ':v': true, ':ts': now }),
      });
      await ddbClient.send(updateCmd);

      return res.json({ ok: true });
    } catch (error) {
      console.error('Error verifying code', error);
      return res.status(500).json({ message: 'Verification failed' });
    }
  });

  // Session start: increments accessCount and records current session start
  app.post('/api/auth/session-start', async (req, res) => {
    try {
      const { email } = req.body || {};
      if (!email || typeof email !== 'string') return res.status(400).json({ message: 'Missing email' });

      const sessionId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`;
      const now = Date.now();

      // Update item: set lastAccessAt, currentSessionId/start, increment accessCount
      const updateParams = new UpdateItemCommand({
        TableName: DDB_TABLE,
        Key: marshall({ email }),
        UpdateExpression: 'SET lastAccessAt = :now, currentSessionId = :sid, currentSessionStart = :now REMOVE code, codeExpiresAt',
        ExpressionAttributeValues: marshall({ ':now': now, ':sid': sessionId }),
      });

      // Also ADD accessCount :inc (use a separate call because UpdateExpression can combine)
      // DynamoDB supports ADD in the same operation, but marshall will handle values; we'll perform another update with ADD to increment safely
      await ddbClient.send(updateParams);

      // increment accessCount (ADD)
      const addParams = new UpdateItemCommand({
        TableName: DDB_TABLE,
        Key: marshall({ email }),
        UpdateExpression: 'ADD accessCount :inc',
        ExpressionAttributeValues: marshall({ ':inc': 1 }),
      });
      await ddbClient.send(addParams);

      return res.json({ ok: true, sessionId });
    } catch (error) {
      console.error('Error starting session', error);
      return res.status(500).json({ message: 'Could not start session' });
    }
  });

  // Session end: calculate duration and add to totalTime
  app.post('/api/auth/session-end', async (req, res) => {
    try {
      const { email, sessionId } = req.body || {};
      if (!email || !sessionId) return res.status(400).json({ message: 'Missing email or sessionId' });

      // Get current item
      const getCmd = new GetItemCommand({ TableName: DDB_TABLE, Key: marshall({ email }) });
      const existing = await ddbClient.send(getCmd);
      if (!existing || !existing.Item) return res.status(400).json({ message: 'No session found' });

      const item = unmarshall(existing.Item as any) as any;
      if (!item.currentSessionId || item.currentSessionId !== sessionId || !item.currentSessionStart) {
        return res.status(400).json({ message: 'Session mismatch or already closed' });
      }

      const now = Date.now();
      const duration = now - item.currentSessionStart; // ms

      // Update: add duration to totalTime (ADD), remove currentSessionId/currentSessionStart
      const updateCmd = new UpdateItemCommand({
        TableName: DDB_TABLE,
        Key: marshall({ email }),
        UpdateExpression: 'SET updatedAt = :now REMOVE currentSessionId, currentSessionStart ADD totalTime :dur',
        ExpressionAttributeValues: marshall({ ':now': now, ':dur': duration }),
      });
      await ddbClient.send(updateCmd);

      return res.json({ ok: true, duration });
    } catch (error) {
      console.error('Error ending session', error);
      return res.status(500).json({ message: 'Could not end session' });
    }
  });

  // Contact form endpoint
  app.post('/api/contact', async (req, res) => {
    try {
      const { name, email, phone, subject, message, language } = req.body || {};
      
      // Validations
      if (!name || !email || !phone || !subject || !message) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email' });
      }

      // Phone validation (10-11 digits)
      const phoneRegex = /^\d{10,11}$/;
      const cleanPhone = phone.replace(/\D/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        return res.status(400).json({ message: 'Invalid phone number' });
      }

      const lang: 'pt' | 'en' | 'es' = ['pt', 'en', 'es'].includes(language) ? language : 'pt';

      // Send notification email to you (both addresses)
      const notificationHtml = `
        <h2>Nova mensagem de contato</h2>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telefone:</strong> ${phone}</p>
        <p><strong>Assunto:</strong> ${subject}</p>
        <p><strong>Mensagem:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `;

      const notificationCmd = new SendEmailCommand({
        Source: SES_FROM_EMAIL,
        Destination: { 
          ToAddresses: ['contato@ruybarbosa.dev', 'ruybarbao@gmail.com']
        },
        Message: {
          Subject: { Data: `[Portfolio] ${subject}` },
          Body: { 
            Html: { Data: notificationHtml }
          },
        },
      });

      await sesClient.send(notificationCmd);

      // Send confirmation email to user
      const confirmationHtml = generateContactConfirmationHtml(name, subject, message, lang, FRONTEND_URL);
      const t = contactEmailTranslations[lang];

      const confirmationCmd = new SendEmailCommand({
        Source: SES_FROM_EMAIL,
        Destination: { ToAddresses: [email] },
        Message: {
          Subject: { Data: t.subject },
          Body: { 
            Html: { Data: confirmationHtml }
          },
        },
      });

      await sesClient.send(confirmationCmd);

      return res.json({ ok: true });
    } catch (error) {
      console.error('Error sending contact email', error);
      return res.status(500).json({ message: 'Could not send message' });
    }
  });

  // Socket.io - Apenas localhost
  const io = new Server(httpServer, {
    cors: {
      origin: FRONTEND_URL,
      credentials: true,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    const clientIp = socket.handshake.address;
    console.log(`🔌 Cliente conectado: ${socket.id} (${clientIp})`);

    socket.on('message', async (data: Message) => {
      try {
        console.log(`💬 Mensagem de ${data.email}: ${data.message}`);

        // Rate limiting
        if (!checkRateLimit(clientIp)) {
          socket.emit('error', { message: 'Rate limit excedido. Aguarde um momento.' });
          return;
        }

        // Validação
        if (!data.message || !data.email) {
          socket.emit('error', { message: 'Mensagem e email são obrigatórios.' });
          return;
        }

        // Check whether email is verified (must complete two-step verification)
        try {
          const vCmd = new GetItemCommand({ TableName: DDB_TABLE, Key: marshall({ email: data.email }) });
          const vRes = await ddbClient.send(vCmd);
          const vItem = vRes && vRes.Item ? unmarshall(vRes.Item as any) as any : null;
          if (!vItem || !vItem.verified) {
            socket.emit('error', { message: 'Email not verified. Please request a code and verify before using Menebot.' });
            return;
          }
        } catch (e) {
          console.error('Error checking verification', e);
          socket.emit('error', { message: 'Verification check failed. Try again later.' });
          return;
        }

        // 1. Detecta idioma
        const language = detectLanguage(data.message);

        // 2. Tentar match de intent (fallback rápido)
        console.log('🔍 Verificando intent matching...');
        const intentAnswer = tryIntentMatch(data.message);
        
        if (intentAnswer) {
          // Resposta direta do FAQ (cache, sem custo Bedrock)
          console.log('⚡ Usando resposta cached do FAQ');
          socket.emit('response', {
            message: intentAnswer,
            language,
          });
          return;
        }

        // 3. Intent não encontrado, usar RAG normal
        console.log('🧠 Usando RAG (busca + geração)');

        if (embeddingsCache.length === 0) {
          const noEmbeddingsMessage: Record<string, string> = {
            'pt-BR': 'Desculpe, ainda estou aprendendo sobre esse assunto! 🤖 Tente perguntar sobre tecnologias, projetos ou experiência profissional do Ruy.',
            'en-US': 'Sorry, I\'m still learning about that topic! 🤖 Try asking about Ruy\'s technologies, projects or professional experience.',
            'es-AR': '¡Lo siento, todavía estoy aprendiendo sobre ese tema! 🤖 Intenta preguntar sobre las tecnologías, proyectos o experiencia profesional de Ruy.'
          };
          
          socket.emit('response', {
            message: noEmbeddingsMessage[language] || noEmbeddingsMessage['pt-BR'],
            language,
          });
          return;
        }

        // 4. Gera embedding da query
        console.log('🔍 Gerando embedding da query...');
        const queryEmbedding = await generateEmbedding(data.message);

        // 5. Busca top-K chunks similares
        console.log(`📊 Buscando top-${TOP_K} chunks mais relevantes...`);
        const topChunks = findTopKChunks(queryEmbedding);
        
        // Log dos chunks encontrados (preview)
        topChunks.forEach((chunk, idx) => {
          const preview = chunk.text.substring(0, 100).replace(/\n/g, ' ');
          console.log(`   [${idx + 1}] ${preview}...`);
        });

        // 6. Monta contexto
        const context = topChunks.map((chunk) => chunk.text).join('\n\n---\n\n');

        // 7. Gera resposta
        console.log('🤖 Gerando resposta com Llama 3.1 70B...');
        const response = await generateResponse(data.message, context, language);

        // 8. Envia resposta
        socket.emit('response', {
          message: response,
          language,
        });

        console.log(`✅ Resposta enviada (${language})`);
      } catch (error) {
        console.error('❌ Erro ao processar mensagem:', error);
        socket.emit('error', {
          message: 'Erro ao processar sua mensagem. Tente novamente.',
        });
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Cliente desconectado: ${socket.id}`);
    });
  });

  httpServer.listen(Number(PORT), () => {
    console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
  });
}

// Inicia servidor
startServer().catch((error) => {
  console.error('❌ Erro ao iniciar servidor:', error);
  process.exit(1);
});
