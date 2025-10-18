import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { config } from 'dotenv';

config();

const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const GENERATION_MODEL = process.env.BEDROCK_GENERATION_MODEL || 'meta.llama3-1-70b-instruct-v1:0';

const bedrockClient = new BedrockRuntimeClient({ region: AWS_REGION });

async function testLlama() {
  try {
    console.log(`🧪 Testando Llama 3.1 70B...`);
    console.log(`📍 Região: ${AWS_REGION}`);
    console.log(`🤖 Modelo: ${GENERATION_MODEL}`);
    
    const llamaPrompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>

Você é um assistente amigável.<|eot_id|><|start_header_id|>user<|end_header_id|>

Diga olá!<|eot_id|><|start_header_id|>assistant<|end_header_id|>`;

    const payload = {
      prompt: llamaPrompt,
      max_gen_len: 50,
      temperature: 0.7,
      top_p: 0.9,
    };

    console.log(`📤 Enviando request...`);
    
    const command = new InvokeModelCommand({
      modelId: GENERATION_MODEL,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload),
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    console.log(`✅ Resposta recebida:`);
    console.log(responseBody);
    console.log(`\n💬 Texto: ${responseBody.generation}`);
    
  } catch (error) {
    console.error(`❌ Erro ao testar Llama:`);
    console.error(error);
    
    if (error instanceof Error) {
      console.error(`\n📝 Mensagem: ${error.message}`);
      console.error(`📝 Nome: ${error.name}`);
    }
  }
}

testLlama();
