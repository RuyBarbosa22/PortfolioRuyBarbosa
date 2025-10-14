import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { config } from 'dotenv';
import rateLimit from 'express-rate-limit';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { Readable } from 'stream';
import { tryIntentMatch } from './services/intent-matcher';

config();

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
const TOP_K = parseInt(process.env.TOP_K_RESULTS || '3');
const GENERATION_MODEL = process.env.BEDROCK_GENERATION_MODEL || 'anthropic.claude-3-haiku-20240307-v1:0';

// Clients AWS
const s3Client = new S3Client({ region: AWS_REGION });
const bedrockClient = new BedrockRuntimeClient({ region: AWS_REGION });

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
 * Gera resposta usando Bedrock (Claude)
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
  
  const systemPrompt = `Você é Menebot, um assistente virtual criado por Ruy Barbosa de Castro para responder perguntas sobre ele de forma amigável e conversacional.

CONTEXTO FORNECIDO:
${context}

INSTRUÇÕES IMPORTANTES:
1. **Analise e Sintetize**: Leia TODO o contexto acima e extraia APENAS as informações relevantes para responder a pergunta específica.

2. **Responda de Forma Natural**: Não copie trechos literais. Reformule com suas próprias palavras de maneira conversacional e amigável.

3. **Seja Específico**: Se a pergunta é sobre uma coisa específica (ex: "qual comida preferida"), responda APENAS isso, não liste tudo. Datas específicas como "fevereiro de 2023" devem ser respondidas apenas com informações gerais disponíveis, sem inventar detalhes.

4. **Idioma**: Responda SEMPRE em ${languageNames[language as keyof typeof languageNames] || 'português'}, mesmo que o contexto esteja em outro idioma.

5. **Brevidade**: Use no máximo 3-4 frases. Seja direto e objetivo.

6. **Personalidade**: Seja amigável, use primeira pessoa quando falar sobre Ruy (ex: "Trabalho em..." / "I work at...").

7. **Informação Ausente**: Se o contexto NÃO contém a resposta exata:
   - Para fatos objetivos (onde trabalha, nome do cargo, datas específicas): Diga algo como "Não tenho essa informação específica no momento 🤔"
   - Para perguntas hipotéticas/comportamentais (o que faria em X situação): Infira com base no perfil. Ex: "Com base no meu perfil de desenvolvedor focado em performance, eu provavelmente..."

8. **🔒 PRIVACIDADE CRÍTICA**: NUNCA revele números de clientes, CPFs, IDs sensíveis ou dados pessoais que não estejam explicitamente no contexto fornecido. Se a pergunta contém esses dados, responda que não pode compartilhar informações confidenciais.

IMPORTANTE: Sua resposta deve parecer uma conversa natural, não um copiar-e-colar de texto!`;

  const userMessage = `Pergunta do usuário: ${query}`;

  const payload = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 400,
    temperature: 0.7, // Aumentei para respostas mais naturais
    messages: [
      {
        role: 'user',
        content: userMessage,
      },
    ],
    system: systemPrompt,
  };

  const command = new InvokeModelCommand({
    modelId: GENERATION_MODEL,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(payload),
  });

  const response = await bedrockClient.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));

  return responseBody.content[0].text;
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

  // Middleware
  app.use(cors({ origin: FRONTEND_URL, credentials: true }));
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

  // Socket.io
  const io = new Server(httpServer, {
    cors: {
      origin: FRONTEND_URL,
      credentials: true,
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
        console.log('🤖 Gerando resposta com Claude...');
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

  httpServer.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`🌐 Frontend URL: ${FRONTEND_URL}`);
  });
}

// Inicia servidor
startServer().catch((error) => {
  console.error('❌ Erro ao iniciar servidor:', error);
  process.exit(1);
});
