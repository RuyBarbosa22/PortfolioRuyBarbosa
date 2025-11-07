#!/bin/bash

set -e

echo "Iniciando deploy do Portfolio..."

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' 

PROJECT_DIR="/var/www/html/PortfolioRuyBarbosa"

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

if ! command_exists node; then
    echo -e "${RED}❌ Node.js não está instalado!${NC}"
    exit 1
fi

if ! command_exists pm2; then
    echo -e "${BLUE}📦 Instalando PM2 globalmente...${NC}"
    sudo npm install -g pm2
fi

cd "$PROJECT_DIR"

echo -e "${BLUE}📥 Atualizando código do GitHub...${NC}"
git fetch origin
git reset --hard origin/master

echo -e "${GREEN}✅ Código atualizado!${NC}"

# ==================== BACKEND ====================
echo -e "\n${BLUE}🔧 Configurando Backend...${NC}"
cd "$PROJECT_DIR/backend/server"

if [ ! -f .env ]; then
    echo -e "${RED}⚠️  Arquivo .env não encontrado no backend!${NC}"
    echo "Crie o arquivo backend/server/.env com as credenciais AWS"
    exit 1
fi

echo "📦 Instalando dependências do backend..."
npm install --production

echo "🏗️  Compilando TypeScript do backend..."
npm run build

echo -e "${GREEN}✅ Backend configurado!${NC}"

# ==================== FRONTEND ====================
echo -e "\n${BLUE}🔧 Configurando Frontend...${NC}"
cd "$PROJECT_DIR/frontend"

if [ ! -f .env ]; then
    echo -e "${RED}⚠️  Arquivo .env não encontrado no frontend!${NC}"
    echo "Crie o arquivo frontend/.env com VITE_SERVER_URL"
    exit 1
fi

echo "📦 Instalando dependências do frontend..."
npm install

echo "🏗️  Buildando frontend para produção..."
npm run build

if ! command_exists serve; then
    echo "📦 Instalando serve globalmente..."
    sudo npm install -g serve
fi

echo -e "${GREEN}✅ Frontend configurado!${NC}"

# ==================== PM2 ====================
echo -e "\n${BLUE}🚀 Configurando PM2...${NC}"
cd "$PROJECT_DIR"

sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2

pm2 delete all 2>/dev/null || true

echo "🔄 Iniciando aplicações com PM2..."
pm2 start ecosystem.config.js

pm2 save

sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER

echo -e "\n${GREEN}✅ Deploy concluído com sucesso!${NC}"
echo -e "\n${BLUE}📊 Status dos processos:${NC}"
pm2 status

echo -e "\n${BLUE}📝 Comandos úteis:${NC}"
echo "  pm2 status          - Ver status dos processos"
echo "  pm2 logs            - Ver logs em tempo real"
echo "  pm2 logs backend    - Ver logs apenas do backend"
echo "  pm2 logs frontend   - Ver logs apenas do frontend"
echo "  pm2 restart all     - Reiniciar todos os processos"
echo "  pm2 stop all        - Parar todos os processos"
echo "  pm2 monit           - Monitor em tempo real"
