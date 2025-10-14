import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { config } from 'dotenv';
import { Readable } from 'stream';
import pdf from 'pdf-parse';

config();

const s3Client = new S3Client({ 
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

async function testIngest() {
  try {
    console.log('\n🧪 TESTE DE INGEST - Modo Debug\n');
    
    const bucket = process.env.S3_BUCKET_NAME || 'menebot-embeddings-bucket';
    const key = process.env.PDF_S3_KEY || 'content/RuyBarbosa_Consolidated_Profile_Final_Draft.pdf';
    
    // Passo 1: Baixar PDF
    console.log('1️⃣  Baixando PDF do S3...');
    console.log(`   Bucket: ${bucket}`);
    console.log(`   Key: ${key}`);
    
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const response = await s3Client.send(command);
    
    console.log('   ✅ PDF baixado! Convertendo stream...');
    
    // Converter stream para buffer
    const chunks: any[] = [];
    const stream = response.Body as Readable;
    
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    
    const buffer = Buffer.concat(chunks);
    console.log(`   ✅ Buffer criado: ${Math.round(buffer.length / 1024)} KB\n`);
    
    // Passo 2: Extrair texto
    console.log('2️⃣  Extraindo texto do PDF...');
    const data = await pdf(buffer);
    
    console.log(`   ✅ Texto extraído: ${data.text.length} caracteres`);
    console.log(`   📄 Páginas: ${data.numpages}`);
    console.log(`   📝 Preview: ${data.text.substring(0, 200)}...\n`);
    
    // Passo 3: Dividir em chunks
    console.log('3️⃣  Dividindo em chunks...');
    const CHUNK_SIZE = 800;
    const CHUNK_OVERLAP = 200;
    
    const chunks_text: string[] = [];
    for (let i = 0; i < data.text.length; i += CHUNK_SIZE - CHUNK_OVERLAP) {
      chunks_text.push(data.text.slice(i, i + CHUNK_SIZE));
    }
    
    console.log(`   ✅ ${chunks_text.length} chunks criados\n`);
    
    console.log('🎉 TESTE CONCLUÍDO COM SUCESSO!');
    console.log('\n📊 Resumo:');
    console.log(`   - PDF: ${Math.round(buffer.length / 1024)} KB`);
    console.log(`   - Texto: ${data.text.length} caracteres`);
    console.log(`   - Chunks: ${chunks_text.length}`);
    console.log(`   - Chunk médio: ~${Math.round(data.text.length / chunks_text.length)} caracteres\n`);
    
  } catch (error: any) {
    console.error('\n❌ ERRO:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testIngest();
