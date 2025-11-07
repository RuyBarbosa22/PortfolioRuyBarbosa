# 🚀 Guia de Deploy na EC2 - Portfolio Ruy Barbosa

## 📋 Pré-requisitos na EC2

### 1. Instalar Node.js 20 (via nvm)
```bash
# Instalar nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Instalar Node.js 20
nvm install 20
nvm use 20
nvm alias default 20

# Verificar
node --version  # Deve mostrar v20.x.x
```

### 2. Instalar PM2 globalmente
```bash
sudo npm install -g pm2
```

### 3. Instalar serve (para servir o frontend)
```bash
sudo npm install -g serve
```

## 🔧 Configuração Inicial

### 1. Clonar o repositório (se ainda não clonou)
```bash
cd /var/www/html
sudo git clone https://github.com/RuyBarbosa22/PortfolioRuyBarbosa.git
sudo chown -R ubuntu:ubuntu PortfolioRuyBarbosa
cd PortfolioRuyBarbosa
```

### 2. Criar arquivos .env

**Backend (.env):**
```bash
nano backend/server/.env
```
```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=sua_access_key_aqui
AWS_SECRET_ACCESS_KEY=sua_secret_key_aqui

# Bedrock Configuration
BEDROCK_MODEL_ID=us.meta.llama3-1-70b-instruct-v1:0
BEDROCK_EMBEDDING_MODEL_ID=amazon.titan-embed-text-v2:0

# DynamoDB
DYNAMODB_TABLE_NAME=RuyPortfolioUsers

# S3
S3_BUCKET_NAME=ruyportfolio-embeddings
S3_KEY_EMBEDDINGS=embeddings/embeddings_v3.json

# Server
PORT=3001
NODE_ENV=production

# CORS Origins (separe por vírgula se tiver múltiplos)
CORS_ORIGINS=http://seu-ip-ou-dominio:3000,http://localhost:3000

# SES (Email)
SES_FROM_EMAIL=contato@ruybarbosa.dev
SES_CONTACT_EMAILS=contato@ruybarbosa.dev,ruybarbao@gmail.com
```

**Frontend (.env):**
```bash
nano frontend/.env
```
```env
# URL do servidor backend
VITE_SERVER_URL=http://seu-ip-ec2:3001
```

## 🚀 Deploy Automático

### Executar o script de deploy
```bash
cd /var/www/html/PortfolioRuyBarbosa
chmod +x deploy.sh
./deploy.sh
```

O script vai:
1. ✅ Atualizar o código do GitHub
2. ✅ Instalar dependências do backend
3. ✅ Compilar o backend (TypeScript → JavaScript)
4. ✅ Instalar dependências do frontend
5. ✅ Buildar o frontend para produção
6. ✅ Iniciar backend e frontend com PM2
7. ✅ Configurar PM2 para auto-start no boot

## 📊 Comandos PM2 Úteis

```bash
# Ver status dos processos
pm2 status

# Ver logs em tempo real
pm2 logs

# Ver logs apenas do backend
pm2 logs portfolio-backend

# Ver logs apenas do frontend
pm2 logs portfolio-frontend

# Reiniciar todos os processos
pm2 restart all

# Reiniciar apenas o backend
pm2 restart portfolio-backend

# Reiniciar apenas o frontend
pm2 restart portfolio-frontend

# Parar todos os processos
pm2 stop all

# Monitor em tempo real (CPU, memória)
pm2 monit

# Deletar todos os processos
pm2 delete all

# Salvar configuração atual
pm2 save

# Ver processos que vão iniciar no boot
pm2 startup
```

## 🔄 Atualizações Futuras

Sempre que fizer mudanças no código e subir para o GitHub:

```bash
cd /var/www/html/PortfolioRuyBarbosa
./deploy.sh
```

## 🔒 Segurança - Security Groups AWS

Certifique-se que sua EC2 tem as seguintes portas abertas:

- **3000** (Frontend) - HTTP
- **3001** (Backend) - WebSocket/HTTP
- **22** (SSH)
- **80** (HTTP - opcional, via Nginx)
- **443** (HTTPS - opcional, via Nginx com SSL)

## 🌐 Nginx (Opcional - Recomendado para Produção)

Se quiser usar Nginx como proxy reverso:

```bash
# Instalar Nginx
sudo apt update
sudo apt install nginx -y

# Criar configuração
sudo nano /etc/nginx/sites-available/portfolio
```

Configuração Nginx:
```nginx
server {
    listen 80;
    server_name seu-dominio.com;  # ou seu IP

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Ativar o site
sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

## 🐛 Troubleshooting

### Backend não inicia
```bash
# Ver logs do backend
pm2 logs portfolio-backend --lines 100

# Verificar se o .env existe
cat backend/server/.env

# Verificar se compilou
ls backend/server/dist/server.js
```

### Frontend não inicia
```bash
# Ver logs do frontend
pm2 logs portfolio-frontend --lines 100

# Verificar se buildou
ls frontend/dist/index.html

# Testar manualmente
cd frontend
npx serve -s dist -l 3000
```

### PM2 não inicia no boot
```bash
# Reconfigurar startup
pm2 unstartup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
pm2 save
```

### Portas já em uso
```bash
# Ver o que está usando a porta
sudo lsof -i :3001  # Backend
sudo lsof -i :3000  # Frontend

# Matar processo
sudo kill -9 <PID>
```

## 📝 Checklist Pós-Deploy

- [ ] Backend rodando: `curl http://localhost:3001/api/health`
- [ ] Frontend rodando: `curl http://localhost:3000`
- [ ] PM2 configurado para auto-start: `pm2 list`
- [ ] Logs sem erros: `pm2 logs --lines 50`
- [ ] Security Groups configurados no AWS Console
- [ ] .env files configurados corretamente
- [ ] Credenciais AWS válidas e com permissões corretas

## 🎉 Pronto!

Seu portfolio está rodando em produção! Acesse:
- Frontend: `http://seu-ip-ec2:3000`
- Backend API: `http://seu-ip-ec2:3001`
