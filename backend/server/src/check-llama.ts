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

async function checkLlamaAccess() {
  console.log('\n🦙 Verificando acesso ao Meta Llama 3.1 70B...\n');
  
  try {
    const response = await bedrock.send(new ListFoundationModelsCommand({}));
    
    const llama70b = response.modelSummaries?.find(m => 
      m.modelId === 'meta.llama3-1-70b-instruct-v1:0'
    );
    
    const llamaModels = response.modelSummaries?.filter(m => 
      m.modelId?.includes('llama')
    ) || [];
    
    console.log('📋 Status do Meta Llama 3.1 70B:\n');
    
    if (llama70b) {
      console.log('   ✅ Meta Llama 3.1 70B Instruct');
      console.log(`      Model ID: ${llama70b.modelId}`);
      console.log(`      Status: Available`);
      console.log(`      Provider: ${llama70b.providerName || 'Meta'}`);
      
      console.log('\n🎉 PERFEITO! Acesso ao Llama 3.1 70B concedido!');
      console.log('   Agora você pode migrar o código.\n');
      
      console.log('📝 Próximos passos:');
      console.log('   1. Avise o Copilot: "Acesso liberado!"');
      console.log('   2. Vamos atualizar o código');
      console.log('   3. Re-gerar embeddings (npm run ingest)');
      console.log('   4. Testar respostas\n');
      
    } else {
      console.log('   ❌ Meta Llama 3.1 70B Instruct');
      console.log('      Status: Access not granted');
      
      console.log('\n⚠️  ATENÇÃO: Acesso ainda não liberado!\n');
      console.log('📍 Como solicitar acesso:');
      console.log('   1. Acesse: https://console.aws.amazon.com/bedrock');
      console.log('   2. Região: us-east-1');
      console.log('   3. Clique em "Model catalog" no menu lateral');
      console.log('   4. Procure "Meta Llama 3.1 70B Instruct"');
      console.log('   5. Clique no card do modelo');
      console.log('   6. Clique "Request model access"');
      console.log('   7. Aguarde aprovação (geralmente instantânea)\n');
      
      console.log('⏰ Aprovação leva ~2-5 minutos');
      console.log('   Execute este script novamente depois!\n');
    }
    
    if (llamaModels.length > 0) {
      console.log('📦 Outros modelos Llama disponíveis:\n');
      llamaModels.forEach(model => {
        const available = model.modelId === llama70b?.modelId;
        console.log(`   ${available ? '✅' : '📦'} ${model.modelName || model.modelId}`);
        console.log(`      ID: ${model.modelId}`);
      });
      console.log('');
    }
    
  } catch (error: any) {
    console.error('❌ Erro ao conectar ao Bedrock:', error.message);
    console.log('\n💡 Possíveis causas:');
    console.log('   - Credenciais AWS incorretas (.env)');
    console.log('   - Região não suporta Bedrock (use us-east-1)');
    console.log('   - Usuário IAM sem permissão para Bedrock');
    console.log('\n🔧 Solução:');
    console.log('   - Verifique AWS_ACCESS_KEY_ID no .env');
    console.log('   - Verifique AWS_SECRET_ACCESS_KEY no .env');
    console.log('   - Verifique AWS_REGION=us-east-1 no .env\n');
  }
}

checkLlamaAccess();
