# 🔧 Correção de Erros CORS em Produção

**Data:** 12 de novembro de 2025  
**Problema:** Erros CORS bloqueando requisições do frontend para backend  
**Status:** ✅ Corrigido

---

## 🚨 Problema Identificado

### Erros no Console do Browser:
```
Access to fetch at 'https://www.ruybarbosa.dev/api/metrics/visit' from origin 'https://ruybarbosa.dev' 
has been blocked by CORS policy: Response to preflight request doesn't pass access control check: 
The 'Access-Control-Allow-Origin' header has a value 'http://localhost:5173' that is not equal to 
the supplied origin.
```

### Causa Raiz:
O backend estava configurado para aceitar **apenas uma origem** (localhost), mas em produção existem **múltiplas variações** da URL:
- `https://www.ruybarbosa.dev`
- `https://www.ruybarbosa.dev/`
- `https://ruybarbosa.dev`
- `https://ruybarbosa.dev/`
- `http://localhost:5173` (dev)

---

## ✅ Correções Implementadas

### 1. **Configuração CORS Dinâmica (Backend)**

**Antes:**
```typescript
// ❌ Aceita apenas uma URL
app.use(cors({ 
  origin: FRONTEND_URL,
  credentials: true 
}));
```

**Depois:**
```typescript
// ✅ Aceita múltiplas origens com validação
const allowedOrigins = [
  'http://localhost:5173',
  'https://www.ruybarbosa.dev',
  'https://ruybarbosa.dev',
  process.env.FRONTEND_URL
].filter(Boolean) as string[];

app.use(cors({ 
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    const normalizedOrigin = origin.replace(/\/$/, '');
    const normalizedAllowed = allowedOrigins.map(o => o.replace(/\/$/, ''));
    
    if (normalizedAllowed.includes(normalizedOrigin)) {
      callback(null, true);
    } else {
      console.warn(`🚫 CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 2. **Socket.IO CORS (Backend)**

Mesma lógica aplicada ao Socket.IO:
```typescript
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      // Validação dinâmica de origens
      // ... mesmo código acima
    },
    credentials: true,
    methods: ['GET', 'POST'],
  },
});
```

### 3. **Normalização de URLs**

- Remove trailing slashes (`/`) para comparação
- Suporta variações com e sem `www`
- Aceita requisições sem origem (mobile apps, Postman, etc)

---

## 🚀 Passos para Deploy

### 1. **No Servidor EC2 (Backend)**

```bash
# 1. Conectar ao servidor
ssh -i sua-chave.pem ubuntu@ip-do-servidor

# 2. Navegar até o diretório do backend
cd /var/www/html/PortfolioRuyBarbosa/backend/server

# 3. Fazer pull das mudanças
git pull origin master

# 4. Verificar/Criar arquivo .env com configurações de produção
nano .env
```

**Conteúdo necessário do `.env` (backend):**
```bash
# AWS Configuration
AWS_REGION=us-east-1
S3_BUCKET_NAME=menebot-embeddings-bucket

# Server Configuration
PORT=3001
NODE_ENV=production

# Frontend URL (IMPORTANTE: usar URL de produção)
FRONTEND_URL=https://www.ruybarbosa.dev

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10

# Bedrock Configuration
BEDROCK_EMBEDDING_MODEL=amazon.titan-embed-text-v1
BEDROCK_GENERATION_MODEL=us.meta.llama3-1-70b-instruct-v1:0

# PDF Configuration
PDF_S3_KEY=curriculum/curriculum.pdf

# RAG Configuration
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
TOP_K_RESULTS=6

# Email & Verification (SES + DynamoDB)
SES_FROM_EMAIL=no-reply@ruybarbosa.dev
SES_CONTACT_EMAILS=contato@ruybarbosa.dev,ruybarbao@gmail.com
DDB_TABLE_NAME=menebot_users
```

```bash
# 5. Instalar dependências (se houver novas)
npm install

# 6. Build do projeto
npm run build

# 7. Reiniciar o servidor (PM2)
pm2 restart menebot-server

# 8. Verificar logs
pm2 logs menebot-server --lines 50
```

### 2. **Verificar Frontend (Se Necessário)**

```bash
# Navegar até o frontend
cd /var/www/html/PortfolioRuyBarbosa/frontend

# Verificar .env
cat .env
```

**Deve conter:**
```bash
VITE_SERVER_URL=https://www.ruybarbosa.dev
VITE_API_BASE=https://www.ruybarbosa.dev
```

---

## 🧪 Testes Pós-Deploy

### 1. **Testar Health Check**
```bash
curl https://www.ruybarbosa.dev/health
```

**Esperado:**
```json
{
  "status": "ok",
  "embeddings": 123,
  "timestamp": 1699999999999
}
```

### 2. **Testar CORS (Browser Console)**

Abrir DevTools no site e executar:
```javascript
fetch('https://www.ruybarbosa.dev/api/metrics', {
  method: 'GET',
  credentials: 'include'
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

**Esperado:** Resposta JSON sem erros CORS

### 3. **Testar Socket.IO**

Abrir o Menebot e enviar uma mensagem. Verificar logs do servidor:
```bash
pm2 logs menebot-server --lines 20
```

**Esperado:**
```
🔌 Cliente conectado: abc123 (192.168.1.1)
💬 Mensagem de user@example.com: olá
✅ Mensagem aprovada - sem ofensas detectadas
```

---

## 📊 Validação de Sucesso

### ✅ Checklist:

- [ ] Backend aceita requisições de `https://www.ruybarbosa.dev`
- [ ] Backend aceita requisições de `https://ruybarbosa.dev`
- [ ] Socket.IO conecta sem erros CORS
- [ ] Health check responde corretamente
- [ ] API `/api/metrics` responde sem erros
- [ ] Menebot envia/recebe mensagens normalmente
- [ ] Nenhum erro CORS no console do browser
- [ ] Logs do PM2 não mostram avisos de CORS bloqueado

---

## 🔍 Troubleshooting

### Se ainda houver erros CORS:

#### 1. **Verificar logs do servidor**
```bash
pm2 logs menebot-server --lines 100 | grep CORS
```

Se aparecer: `🚫 CORS blocked origin: <URL>`
- Adicione essa URL ao array `allowedOrigins` no código

#### 2. **Verificar variável de ambiente**
```bash
pm2 describe menebot-server | grep FRONTEND_URL
```

Deve mostrar: `FRONTEND_URL: https://www.ruybarbosa.dev`

#### 3. **Verificar Nginx (se aplicável)**

Se estiver usando Nginx como proxy reverso, adicionar headers CORS:
```nginx
location / {
    proxy_pass http://localhost:3001;
    
    # Headers CORS (adicionar se necessário)
    add_header 'Access-Control-Allow-Origin' '$http_origin' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
    
    # Preflight requests
    if ($request_method = 'OPTIONS') {
        return 204;
    }
}
```

#### 4. **Limpar cache do navegador**

Às vezes o navegador cacheia headers CORS antigos:
- Chrome/Edge: DevTools > Application > Clear Storage > Clear site data
- Firefox: DevTools > Storage > Clear All

---

## 📝 Arquivos Modificados

- ✅ `backend/server/src/server.ts` - Lógica CORS dinâmica
- ✅ `backend/server/.env.example` - Template atualizado
- ✅ `CORS_FIX_DEPLOYMENT.md` - Este guia (novo)

---

## 🎯 Resultado Esperado

Após o deploy, **todos os erros CORS devem desaparecer** e o site deve funcionar normalmente:

- ✅ Menebot conecta e responde
- ✅ Métricas carregam
- ✅ Formulário de contato funciona
- ✅ Verificação de email funciona
- ✅ Nenhum erro no console do browser

---

## 📞 Suporte

Se problemas persistirem:

1. Envie os logs do PM2:
   ```bash
   pm2 logs menebot-server --lines 200 > logs.txt
   ```

2. Capture screenshot dos erros no DevTools

3. Verifique configurações DNS (A record, CNAME)

4. Teste com `curl -I https://www.ruybarbosa.dev/health` para ver headers

---

**Status Final:** ✅ Pronto para deploy  
**Tempo Estimado de Deploy:** 5-10 minutos  
**Downtime Esperado:** < 1 minuto (durante restart do PM2)
