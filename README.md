# 🚀 Portfolio Ruy Barbosa de Castro

Portfolio profissional interativo com **Menebot**, um chatbot inteligente alimentado por IA que responde perguntas sobre minha experiência profissional, projetos e habilidades técnicas.

![Portfolio Banner](https://img.shields.io/badge/Status-Production-success?style=for-the-badge)
![Node Version](https://img.shields.io/badge/Node-20.x-339933?style=for-the-badge&logo=node.js)
![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)
![AWS](https://img.shields.io/badge/AWS-Cloud-FF9900?style=for-the-badge&logo=amazon-aws)

---

## 🤖 Menebot - Principal Funcionalidade

O **Menebot** é um chatbot inteligente que utiliza tecnologias de ponta para fornecer respostas contextuais e precisas sobre minha carreira profissional:

### ✨ Características Principais

- **RAG (Retrieval-Augmented Generation)**: Busca semântica em embeddings para respostas contextuais
- **AWS Bedrock**: Powered by Meta Llama 3.1 70B Instruct para geração de texto
- **Amazon Titan Embeddings**: Vetorização de conteúdo para busca semântica
- **DynamoDB**: Armazenamento de sessões e autenticação de usuários
- **Amazon SES**: Sistema de verificação por email com códigos temporários
- **S3**: Armazenamento de embeddings versionados e documentos
- **WebSocket (Socket.io)**: Comunicação em tempo real para chat
- **Multilingual**: Suporte para Português, Inglês e Espanhol

### 🔐 Sistema de Autenticação

1. Usuário insere email
2. Código de 6 dígitos enviado via Amazon SES
3. Validação com expiração de 5 minutos
4. Rate limiting: 10 tentativas a cada 5 minutos
5. Welcome-back screen para usuários autenticados nos últimos 30 minutos
6. Email de confirmação estilizado com design moderno

### 💬 Fluxo do Chat

1. Query do usuário é enviada via WebSocket
2. Texto é convertido em embedding usando Amazon Titan
3. Busca semântica nos chunks armazenados (cosine similarity)
4. Top-K resultados mais relevantes são selecionados
5. Llama 3.1 70B gera resposta contextual baseada nos chunks
6. Resposta é streamada de volta ao usuário em tempo real
7. Animações de digitação e transições suaves

---

## 🛠️ Tech Stack

### Frontend

- **React 18** - Framework UI
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling
- **Socket.io Client** - WebSocket real-time
- **i18next** - Internacionalização (pt/en/es)
- **Framer Motion** - Animações

### Backend

- **Node.js 20** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **Socket.io** - WebSocket server
- **AWS SDK v3** - Serviços AWS
  - Bedrock Runtime (Llama 3.1 70B + Titan Embeddings)
  - DynamoDB (Usuários e sessões)
  - S3 (Embeddings e documentos)
  - SES (Email verification)
- **tsx** - TypeScript execution

### Serviços AWS Utilizados

#### 🧠 Amazon Bedrock
- **Modelo de Geração**: `us.meta.llama3-1-70b-instruct-v1:0`
- **Modelo de Embeddings**: `amazon.titan-embed-text-v1`
- **Cross-region inference profiles** para disponibilidade

#### 📦 Amazon S3
- Armazenamento de embeddings versionados
- Metadata de versões com timestamps
- PDF source document storage

#### 🗄️ Amazon DynamoDB
- Tabela: `menebot_users`
- Campos: email (PK), verified, verifiedAt, code, codeExpiresAt, requestHistory
- Session tracking: accessCount, totalTime, lastAccessAt
- Rate limiting history por usuário

#### 📧 Amazon SES
- Email de verificação com código de 6 dígitos
- Email de confirmação de contato
- Templates HTML responsivos com gradientes
- Multi-language support

---

## 📋 Pré-requisitos

- **Node.js 20.x** ou superior
- **npm** ou **yarn**
- **Conta AWS** com credenciais configuradas
- **Permissões AWS**:
  - Bedrock: `InvokeModel`
  - S3: `GetObject`, `ListObjects`
  - DynamoDB: `GetItem`, `PutItem`, `UpdateItem`, `Scan`
  - SES: `SendEmail`

---

## 🚀 Instalação e Configuração

### 1. Clone o Repositório

```bash
git clone https://github.com/RuyBarbosa22/PortfolioRuyBarbosa.git
cd PortfolioRuyBarbosa
```

### 2. Configure as Credenciais AWS

Crie os arquivos `.env` nas pastas `backend/server` e `frontend`:

#### Backend `.env` (`backend/server/.env`)

```env
# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1

# S3
S3_BUCKET_NAME=menebot-embeddings-bucket

# DynamoDB
DDB_TABLE_NAME=menebot_users

# SES
SES_FROM_EMAIL=contato@yourdomain.com

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Bedrock Models
BEDROCK_EMBEDDING_MODEL=amazon.titan-embed-text-v1
BEDROCK_GENERATION_MODEL=us.meta.llama3-1-70b-instruct-v1:0

# PDF Configuration
PDF_S3_KEY=content/YourProfile.pdf

# RAG Configuration
CHUNK_SIZE=1000
CHUNK_OVERLAP=350
TOP_K_RESULTS=6

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10
```

#### Frontend `.env` (`frontend/.env`)

```env
VITE_SERVER_URL=http://localhost:3001
```

### 3. Instale as Dependências

#### Backend

```bash
cd backend/server
nvm use 20  # Certifique-se de usar Node 20
npm install
```

#### Frontend

```bash
cd ../../frontend
npm install
```

### 4. Configure os Recursos AWS

#### 4.1 Criar Tabela DynamoDB

```bash
aws dynamodb create-table \
  --table-name menebot_users \
  --attribute-definitions AttributeName=email,AttributeType=S \
  --key-schema AttributeName=email,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

#### 4.2 Criar Bucket S3

```bash
aws s3 mb s3://menebot-embeddings-bucket --region us-east-1
```

#### 4.3 Configurar SES

1. Acesse o AWS SES Console
2. Verifique seu email de envio (sender email)
3. Se em sandbox, verifique também emails de destino de teste
4. Solicite saída do sandbox para produção

#### 4.4 Ativar Amazon Bedrock

1. Acesse o Amazon Bedrock Console
2. Navegue até "Model access"
3. Solicite acesso aos modelos:
   - Meta Llama 3.1 70B Instruct
   - Amazon Titan Embeddings

### 5. Gerar Embeddings (Primeiro Setup)

Coloque seu documento PDF no S3 e execute o script de ingestão:

```bash
cd backend/server
npm run ingest
```

Este comando irá:
- Ler o PDF do S3
- Dividir em chunks com overlap
- Gerar embeddings usando Titan
- Salvar no S3 com versionamento

---

## 🎯 Executando o Projeto

### Modo Desenvolvimento

#### Terminal 1 - Backend

```bash
cd backend/server
nvm use 20
npm run dev
```

O servidor iniciará em `http://localhost:3001`

#### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

O frontend estará disponível em `http://localhost:5173`

### Build para Produção

#### Backend

```bash
cd backend/server
npm run build
npm start
```

#### Frontend

```bash
cd frontend
npm run build
npm run preview  # Para testar o build
```

Os arquivos estáticos estarão em `frontend/dist/`

---

## 📂 Estrutura do Projeto

```
PortfolioRuyBarbosa/
├── backend/
│   └── server/
│       ├── src/
│       │   ├── server.ts              # Servidor principal Express + Socket.io
│       │   ├── ingest-pdf.ts          # Script de geração de embeddings
│       │   ├── services/
│       │   │   └── intent-matcher.ts  # Intent matching service
│       │   └── utils/
│       │       └── logger.ts          # Logging utilities
│       ├── package.json
│       ├── tsconfig.json
│       └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Menebot/              # Componente principal do chatbot
│   │   │   ├── ChatWithMenebot/      # Modal de autenticação + chat
│   │   │   ├── ContactForm/          # Formulário de contato
│   │   │   ├── Toast/                # Notificações animadas
│   │   │   ├── Navbar/               # Navegação
│   │   │   ├── HeroLeft/             # Seção hero
│   │   │   ├── About/                # Sobre mim
│   │   │   ├── Skills/               # Habilidades técnicas
│   │   │   ├── MyStory/              # Minha história
│   │   │   └── ProjectsCarousel/     # Carrossel de projetos
│   │   ├── context/
│   │   │   └── MenebotChatContext.tsx # Context API para chat
│   │   ├── utils/
│   │   │   └── metrics.ts            # Métricas e analytics
│   │   ├── i18n.ts                   # Configuração de idiomas
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── .env
│
└── README.md
```

---

## 🔧 Scripts Disponíveis

### Backend

```bash
npm run dev          # Modo desenvolvimento com hot-reload
npm run build        # Build TypeScript para JavaScript
npm start            # Executar build de produção
npm run ingest       # Gerar embeddings do PDF
npm run count-users  # Contar usuários no DynamoDB
npm test             # Executar testes com Vitest
```

### Frontend

```bash
npm run dev       # Servidor de desenvolvimento Vite
npm run build     # Build de produção
npm run preview   # Preview do build
npm run lint      # Executar ESLint
```

---

## 🌐 Funcionalidades Adicionais

### 📧 Sistema de Contato

- Formulário com validação completa (email, telefone, campos obrigatórios)
- Email de notificação para múltiplos destinatários
- Email de confirmação automático para o usuário
- Toast animado com feedback visual
- Suporte multilingual

### 📊 Analytics e Métricas

- Contagem de visitas ao site
- Tracking de sessões de usuários
- Tempo total de uso do Menebot
- Número de acessos por usuário
- Métricas armazenadas no DynamoDB

### 🎨 UI/UX

- Design moderno com gradientes animados
- Animações suaves com CSS e Framer Motion
- Scrollbar customizada com tema roxo
- Modo responsivo para mobile/tablet/desktop
- Animações de typing indicator no chat
- Polaroid carousel para projetos
- Flip cards interativos nas skills

---

## 🐛 Troubleshooting

### Erro: "Could not send code"

- Verifique se o email SES está verificado
- Confirme as credenciais AWS no `.env`
- Verifique se o SES está fora do sandbox

### Erro: "Embeddings not found"

- Execute `npm run ingest` no backend
- Verifique se o bucket S3 existe e tem permissões corretas
- Confirme o nome do bucket no `.env`

### Erro: "Access denied to Bedrock"

- Solicite acesso aos modelos no console Bedrock
- Verifique as permissões IAM da sua conta
- Aguarde aprovação (pode levar alguns minutos)

### Servidor não inicia com "SyntaxError"

- Certifique-se de estar usando Node 20.x: `nvm use 20`
- Limpe node_modules: `rm -rf node_modules && npm install`
- Verifique o tsconfig.json

---

## 📄 Licença

MIT License - Ruy Barbosa de Castro

---

## 👤 Autor

**Ruy Barbosa de Castro**

- Portfolio: [ruybarbosa.dev](https://ruybarbosa.dev)
- LinkedIn: [Ruy Barbosa de Castro](https://linkedin.com/in/ruy-barbosa)
- GitHub: [@RuyBarbosa22](https://github.com/RuyBarbosa22)
- Email: contato@ruybarbosa.dev

---

## 🙏 Agradecimentos

- AWS Bedrock team pela incrível plataforma de IA
- Meta AI pelo modelo Llama 3.1
- Comunidade React e TypeScript
- Todos que testaram e deram feedback

---

<div align="center">

**⭐ Se você gostou deste projeto, considere dar uma estrela!**

Made with 💜 by Ruy Barbosa de Castro

</div>
