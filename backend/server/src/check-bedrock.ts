import { BedrockClient, ListFoundationModelsCommand } from '@aws-sdk/client-bedrock';
import dotenv from 'dotenv';

dotenv.config();

const bedrock = new BedrockClient({ 
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

async function checkBedrockAccess() {
  console.log('\n🔍 Verificando acesso ao Amazon Bedrock...\n');
  
  try {
    const response = await bedrock.send(new ListFoundationModelsCommand({}));
    
    console.log(`✅ Conectado ao Bedrock! ${response.modelSummaries?.length || 0} modelos listados.\n`);
    
    // Verificar modelos específicos que precisamos
    const titanEmbed = response.modelSummaries?.find(m => 
      m.modelId === 'amazon.titan-embed-text-v1'
    );
    const claudeHaiku = response.modelSummaries?.find(m => 
      m.modelId?.includes('claude-3-haiku')
    );
    
    console.log('📋 Status dos modelos necessários:\n');
    console.log(`   ${titanEmbed ? '✅' : '❌'} Titan Text Embeddings G1`);
    if (titanEmbed) {
      console.log(`      Model ID: ${titanEmbed.modelId}`);
      console.log(`      Status: Available`);
    }
    
    console.log(`\n   ${claudeHaiku ? '✅' : '❌'} Claude 3 Haiku`);
    if (claudeHaiku) {
      console.log(`      Model ID: ${claudeHaiku.modelId}`);
      console.log(`      Status: Available`);
    }
    
    if (!titanEmbed || !claudeHaiku) {
      console.log('\n⚠️  ATENÇÃO: Um ou mais modelos não estão disponíveis!');
      console.log('   Você precisa solicitar acesso no Console Bedrock.');
      console.log('\n📍 Como solicitar acesso:');
      console.log('   1. Acesse: https://console.aws.amazon.com/bedrock');
      console.log('   2. Clique em "Model catalog" no menu lateral');
      console.log('   3. Procure pelo botão "Manage model access" no topo');
      console.log('   4. Marque: Titan Embeddings + Claude 3 Haiku');
      console.log('   5. Clique em "Request model access"\n');
    } else {
      console.log('\n🎉 PERFEITO! Você já tem acesso a todos os modelos necessários!');
      console.log('   Pode executar: npm run ingest\n');
    }
    
  } catch (error: any) {
    console.error('❌ Erro ao conectar ao Bedrock:', error.message);
    console.log('\n💡 Possíveis causas:');
    console.log('   - Credenciais AWS incorretas');
    console.log('   - Região não suporta Bedrock (use us-east-1)');
    console.log('   - Usuário IAM sem permissão para Bedrock\n');
  }
}

checkBedrockAccess();
