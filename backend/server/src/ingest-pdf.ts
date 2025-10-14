import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import pdf from 'pdf-parse';
import { config } from 'dotenv';
import { Readable } from 'stream';

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

const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const S3_BUCKET = process.env.S3_BUCKET_NAME!;
const PDF_S3_KEY = process.env.PDF_S3_KEY || 'content/CV - Ruy Barbosa.pdf';
const CHUNK_SIZE = parseInt(process.env.CHUNK_SIZE || '800');
const CHUNK_OVERLAP = parseInt(process.env.CHUNK_OVERLAP || '200');
const EMBEDDING_MODEL = process.env.BEDROCK_EMBEDDING_MODEL || 'amazon.titan-embed-text-v1';

const s3Client = new S3Client({ region: AWS_REGION });
const bedrockClient = new BedrockRuntimeClient({ region: AWS_REGION });

/**
 * Baixa o PDF do S3
 */
async function downloadPdfFromS3(): Promise<Buffer> {
  console.log(`📥 Baixando PDF do S3: s3://${S3_BUCKET}/${PDF_S3_KEY}`);
  
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: PDF_S3_KEY,
  });

  const response = await s3Client.send(command);
  const stream = response.Body as Readable;
  
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  
  return Buffer.concat(chunks);
}

/**
 * Extrai texto do PDF
 */
async function extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
  console.log('📄 Extraindo texto do PDF...');
  const data = await pdf(pdfBuffer);
  console.log(`✅ Texto extraído: ${data.text.length} caracteres`);
  return data.text;
}

/**
 * Divide texto em chunks com overlap
 */
export function chunkText(text: string, chunkSize: number = CHUNK_SIZE, overlap: number = CHUNK_OVERLAP): string[] {
  console.log(`✂️  Dividindo texto em chunks (tamanho: ${chunkSize}, overlap: ${overlap})...`);
  
  // Normaliza espaços e quebras de linha
  const normalizedText = text.replace(/\s+/g, ' ').trim();
  
  const chunks: string[] = [];
  let start = 0;

  while (start < normalizedText.length) {
    const end = Math.min(start + chunkSize, normalizedText.length);
    const chunk = normalizedText.slice(start, end).trim();
    
    if (chunk.length > 50) { // Ignora chunks muito pequenos
      chunks.push(chunk);
    }
    
    start += chunkSize - overlap;
    
    // Evita loops infinitos
    if (start <= chunks.length * (chunkSize - overlap) - overlap) {
      start = chunks.length * (chunkSize - overlap);
    }
  }

  console.log(`✅ ${chunks.length} chunks criados`);
  return chunks;
}

/**
 * Gera embedding usando Bedrock Titan
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const payload = {
    inputText: text,
  };

  const command = new InvokeModelCommand({
    modelId: EMBEDDING_MODEL,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(payload),
  });

  const response = await bedrockClient.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  
  return responseBody.embedding;
}

/**
 * Gera embeddings para todos os chunks com rate limiting
 */
async function generateEmbeddings(chunks: string[]): Promise<Chunk[]> {
  console.log(`🧠 Gerando embeddings para ${chunks.length} chunks...`);
  
  const embeddedChunks: Chunk[] = [];
  
  for (let i = 0; i < chunks.length; i++) {
    console.log(`  [${i + 1}/${chunks.length}] Gerando embedding...`);
    
    const embedding = await generateEmbedding(chunks[i]);
    embeddedChunks.push({
      text: chunks[i],
      embedding,
      index: i,
    });
    
    // Rate limiting: aguarda 100ms entre requests
    if (i < chunks.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log(`✅ Embeddings gerados com sucesso`);
  return embeddedChunks;
}

/**
 * Salva embeddings no S3 com versionamento
 */
async function saveEmbeddingsToS3(embeddedChunks: Chunk[]): Promise<string> {
  const timestamp = Date.now();
  const version = `embeddings-v${timestamp}.json`;
  
  const embeddingsData: EmbeddingsData = {
    version,
    timestamp,
    chunks: embeddedChunks,
    metadata: {
      chunkSize: CHUNK_SIZE,
      chunkOverlap: CHUNK_OVERLAP,
      totalChunks: embeddedChunks.length,
      model: EMBEDDING_MODEL,
    },
  };

  console.log(`💾 Salvando embeddings no S3: s3://${S3_BUCKET}/embeddings/${version}`);
  
  // Salva arquivo de embeddings
  await s3Client.send(new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: `embeddings/${version}`,
    Body: JSON.stringify(embeddingsData),
    ContentType: 'application/json',
  }));

  console.log(`✅ Embeddings salvos com sucesso`);
  return version;
}

/**
 * Atualiza metadata.json com a versão atual
 */
async function updateMetadata(version: string): Promise<void> {
  console.log('📝 Atualizando metadata.json...');
  
  let metadata: Metadata;
  
  try {
    // Tenta carregar metadata existente
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: 'embeddings/metadata.json',
    });
    const response = await s3Client.send(command);
    const stream = response.Body as Readable;
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const data = Buffer.concat(chunks).toString('utf-8');
    metadata = JSON.parse(data);
    
    // Adiciona nova versão
    metadata.versions.push(version);
  } catch (error) {
    // Se não existir, cria novo
    metadata = {
      current_version: version,
      versions: [version],
      last_update: Date.now(),
    };
  }

  metadata.current_version = version;
  metadata.last_update = Date.now();

  // Salva metadata atualizado
  await s3Client.send(new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: 'embeddings/metadata.json',
    Body: JSON.stringify(metadata, null, 2),
    ContentType: 'application/json',
  }));

  console.log('✅ Metadata atualizado com sucesso');
}

/**
 * Função principal de ingestão
 */
async function ingestPdf() {
  console.log('🚀 Iniciando ingestão do PDF...\n');

  try {
    // 1. Download PDF
    const pdfBuffer = await downloadPdfFromS3();

    // 2. Extrai texto
    const text = await extractTextFromPdf(pdfBuffer);

    // 3. Chunking
    const chunks = chunkText(text);

    // 4. Gera embeddings
    const embeddedChunks = await generateEmbeddings(chunks);

    // 5. Salva no S3
    const version = await saveEmbeddingsToS3(embeddedChunks);

    // 6. Atualiza metadata
    await updateMetadata(version);

    console.log('\n✨ Ingestão concluída com sucesso!');
    console.log(`📊 Versão: ${version}`);
    console.log(`📦 Total de chunks: ${chunks.length}`);
    
  } catch (error) {
    console.error('❌ Erro durante a ingestão:', error);
    process.exit(1);
  }
}

// Executa sempre
console.log('🚀 Iniciando processo de ingestão...\n');
ingestPdf();
