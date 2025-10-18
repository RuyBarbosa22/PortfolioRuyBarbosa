# 🚀 Guia de Execução - Localhost

**Data:** 16 de outubro de 2025  
**Modo:** Desenvolvimento Local (localhost apenas)

---

## 📋 Configuração Atual

### **Backend:**
- **Porta:** 3001
- **URL:** http://localhost:3001
- **Escuta:** Apenas localhost (não expõe na rede)

### **Frontend:**
- **Porta:** 5173
- **URL:** http://localhost:5173
- **Escuta:** Apenas localhost (não expõe na rede)

### **Conexão:**
- Frontend → Backend via WebSocket em `http://localhost:3001`
- CORS configurado para aceitar apenas `http://localhost:5173`

---

## 🎯 Como Iniciar os Servidores

### **Terminal 1 - Backend:**

```bash
# Navegar para pasta do backend
cd /home/ruy-de-castro/Área\ de\ Trabalho/RuyBarbosa/backend/server

# Ativar Node 20
source ~/.nvm/nvm.sh
nvm use 20

# Iniciar servidor
node dist/server.js
```

**Saída esperada:**
```
📥 Carregando embeddings do S3...
📌 Versão atual: embeddings-v1760630104942.json
✅ 14 chunks carregados em memória
🚀 Servidor backend rodando na porta 3001
🌐 URL: http://localhost:3001
```

---

### **Terminal 2 - Frontend:**

```bash
# Navegar para pasta do frontend
cd /home/ruy-de-castro/Área\ de\ Trabalho/RuyBarbosa/frontend

# Ativar Node 20
source ~/.nvm/nvm.sh
nvm use 20

# Iniciar servidor
npm run dev
```

**Saída esperada:**
```
VITE v7.1.9  ready in 150 ms

➜  Local:   http://localhost:5173/
➜  press h + enter to show help
```

---

## 🔄 Scripts Úteis

### **Matar processos nas portas:**

```bash
# Matar backend (porta 3001)
lsof -ti:3001 | xargs kill -9

# Matar frontend (porta 5173)
lsof -ti:5173 | xargs kill -9

# Matar ambos
lsof -ti:3001 | xargs kill -9 2>/dev/null; lsof -ti:5173 | xargs kill -9 2>/dev/null
```

### **Verificar se estão rodando:**

```bash
# Verificar backend
lsof -i :3001

# Verificar frontend
lsof -i :5173
```

### **Recompilar backend (após mudanças no código):**

```bash
cd backend/server
npm run build
```

---

## 📁 Estrutura de Arquivos

### **Configurações do Backend:**

**`.env`:**
```env
PORT=3001
FRONTEND_URL=http://localhost:5173
AWS_REGION=us-east-1
BEDROCK_GENERATION_MODEL=us.meta.llama3-1-70b-instruct-v1:0
CHUNK_SIZE=1000
CHUNK_OVERLAP=350
TOP_K_RESULTS=6
```

**`src/server.ts` (CORS):**
```typescript
app.use(cors({ 
  origin: FRONTEND_URL,  // http://localhost:5173
  credentials: true 
}));

const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_URL,  // http://localhost:5173
    credentials: true,
  },
});

httpServer.listen(Number(PORT), () => {
  console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
});
```

---

### **Configurações do Frontend:**

**`.env`:**
```env
VITE_SERVER_URL=http://localhost:3001
```

**`vite.config.ts`:**
```typescript
export default defineConfig({
  plugins: [react()],
  // Sem configuração de 'server', usa padrões (localhost:5173)
})
```

**`src/components/MenebotChat/MenebotChat.tsx`:**
```typescript
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
```

---

## ✅ Checklist de Inicialização

Antes de iniciar, verifique:

- [ ] **Node 20 instalado:** `node --version` → v20.x.x
- [ ] **Backend compilado:** Existe pasta `backend/server/dist/`
- [ ] **Embeddings gerados:** `npm run ingest` executado
- [ ] **Portas livres:** Nenhum processo usando 3001 ou 5173
- [ ] **Credenciais AWS:** `.env` tem AWS_ACCESS_KEY_ID e AWS_SECRET_ACCESS_KEY
- [ ] **Modelo Llama configurado:** `.env` tem `us.meta.llama3-1-70b-instruct-v1:0`

---

## 🧪 Testando

### **1. Teste o backend (health check):**

```bash
curl http://localhost:3001/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "embeddings": 14,
  "timestamp": 1760630104942
}
```

### **2. Teste o frontend:**

1. Abra o navegador: http://localhost:5173
2. Clique no botão do chat
3. Deve mostrar "🟢 Online"
4. Digite: "Olá"
5. Deve receber resposta do Menebot

---

## 🐛 Troubleshooting

### **Problema: "Port 3001 is already in use"**

**Solução:**
```bash
lsof -ti:3001 | xargs kill -9
```

### **Problema: "Port 5173 is already in use"**

**Solução:**
```bash
lsof -ti:5173 | xargs kill -9
```

### **Problema: "WebSocket connection failed"**

**Causa:** Backend não está rodando

**Solução:**
1. Verifique se backend está rodando: `lsof -i :3001`
2. Se não estiver, inicie: `node dist/server.js`

### **Problema: "CORS error"**

**Causa:** URLs não correspondem

**Verificar:**
- Backend `.env`: `FRONTEND_URL=http://localhost:5173`
- Frontend `.env`: `VITE_SERVER_URL=http://localhost:3001`
- Ambos devem usar `localhost`, não IP

### **Problema: "Cannot find module"**

**Solução:**
```bash
cd backend/server
npm install
npm run build
```

---

## 📝 Notas Importantes

### **✅ Vantagens do Localhost:**
- Mais simples de configurar
- Não precisa liberar firewall
- Não precisa configurar CORS complexo
- Desenvolvimento rápido

### **❌ Limitações:**
- Não pode testar em outros dispositivos (celular, tablet)
- Não pode compartilhar com outras pessoas na rede
- Apenas desenvolvimento local

### **🌐 Se Precisar de Acesso na Rede:**

Consulte os documentos:
- `LOCAL-NETWORK-GUIDE.md` - Configuração para rede local
- `MOBILE-ACCESS-GUIDE.md` - Guia de acesso mobile
- `WEBSOCKET-CORS-FIX.md` - Correções de CORS para rede

---

## 🎯 Fluxo Típico de Desenvolvimento

```bash
# 1. Fazer mudanças no código
# 2. Se mudou backend:
cd backend/server
npm run build

# 3. Reiniciar backend
lsof -ti:3001 | xargs kill -9
node dist/server.js

# 4. Se mudou frontend, Vite recarrega automaticamente (HMR)
# 5. Testar no navegador: http://localhost:5173
```

---

## 📚 Comandos Rápidos

```bash
# Iniciar tudo (em terminais separados)
# Terminal 1:
cd backend/server && source ~/.nvm/nvm.sh && nvm use 20 && node dist/server.js

# Terminal 2:
cd frontend && source ~/.nvm/nvm.sh && nvm use 20 && npm run dev

# Parar tudo
lsof -ti:3001 | xargs kill -9; lsof -ti:5173 | xargs kill -9

# Ver logs do backend
tail -f backend/server/logs/server.log  # Se tiver logging em arquivo

# Rebuild completo
cd backend/server && npm run build && cd ../../frontend && npm run build
```

---

**✨ Agora você tem um ambiente de desenvolvimento local limpo e simples!** 🚀
