# Guia de Instalação e Deploy - TripCheck

Este guia contém instruções detalhadas para instalar, configurar e fazer deploy do aplicativo TripCheck em diferentes ambientes.

## Índice

1. [Desenvolvimento Local](#desenvolvimento-local)
2. [Deploy na Vercel](#deploy-na-vercel)
3. [Configuração de Banco de Dados](#configuração-de-banco-de-dados)
4. [Variáveis de Ambiente](#variáveis-de-ambiente)
5. [Solução de Problemas](#solução-de-problemas)

## Desenvolvimento Local

### Pré-requisitos

1. **Node.js e npm**: Versão 18 ou superior
2. **Git**: Para clonar o repositório

### Passos para Instalação

```bash
# Clone o repositório
git clone [URL-DO-SEU-REPOSITÓRIO]
cd [NOME-DA-PASTA-DO-PROJETO]

# Instale as dependências
npm install

# Configure as variáveis de ambiente (opcional para desenvolvimento)
echo "SESSION_SECRET=sua_chave_secreta_aleatoria" > .env

# Inicie o servidor de desenvolvimento
npm run dev
```

O aplicativo estará disponível em `http://localhost:5000`

## Deploy na Vercel

A Vercel oferece uma plataforma serverless ideal para este tipo de aplicação.

### Pré-requisitos

1. Uma conta na [Vercel](https://vercel.com)
2. Seu código em um repositório Git (GitHub, GitLab, Bitbucket)

### Preparação para Deploy

1. **Verifique os arquivos de configuração do Vercel**:
   - `vercel.json` - Configuração principal
   - `api/index.js` - API Express adaptada
   - `api/_serverless.js` - Adaptador Serverless

2. **Certifique-se de que seu código está usando as URLs corretas**:
   - Verifique se `client/src/lib/config.ts` está configurado
   - Confirme que `queryClient.ts` está usando URLs relativas em produção

### Deploy via Dashboard Vercel

1. Faça login no [dashboard da Vercel](https://vercel.com/dashboard)
2. Clique em "New Project"
3. Importe seu repositório
4. Configure o projeto:
   - Framework Preset: Outros (não Node.js)
   - Build Command: `./vercel-build.sh`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. Adicione as variáveis de ambiente (veja a seção Variáveis de Ambiente)
6. Clique em "Deploy"

### Deploy via CLI Vercel

```bash
# Instale a CLI da Vercel
npm i -g vercel

# Faça login na Vercel
vercel login

# Deploy para desenvolvimento
vercel

# Deploy para produção
vercel --prod
```

## Configuração de Banco de Dados

Para ambientes de produção, recomendamos usar PostgreSQL. Ver `DATABASE-VERCEL.md` para instruções detalhadas.

### Opções de Banco de Dados

1. **Neon Database**: PostgreSQL serverless
2. **Supabase**: PostgreSQL gerenciado
3. **Railway**: PostgreSQL escalável
4. **ElephantSQL**: Planos gratuitos e pagos

### Configuração Básica

1. Crie uma instância de banco de dados
2. Obtenha a string de conexão
3. Adicione como variável de ambiente `DATABASE_URL`
4. O código está preparado para usar `DatabaseStorage` automaticamente

## Variáveis de Ambiente

### Desenvolvimento

Para desenvolvimento local, crie um arquivo `.env` na raiz do projeto:

```
SESSION_SECRET=chave_aleatoria_longa
NODE_ENV=development
```

### Produção (Vercel)

Configure estas variáveis no dashboard da Vercel:

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `SESSION_SECRET` | Chave para criptografar sessões | Sim |
| `NODE_ENV` | Ambiente (production) | Sim |
| `DATABASE_URL` | String de conexão PostgreSQL | Não* |

\* Obrigatória apenas se estiver usando um banco de dados em vez de armazenamento em memória

## Solução de Problemas

### Problemas Comuns no Desenvolvimento Local

1. **Porta já em uso**: Modifique o arquivo `server/index.ts` para usar outra porta
2. **Erros de módulo**: Execute `rm -rf node_modules && npm install`
3. **Problemas com node-gyp**: Instale as ferramentas de build apropriadas para seu SO

### Problemas Comuns no Deploy Vercel

1. **Falha no Build**: Verifique os logs de build para entender o erro
2. **API não responde**: Verifique as configurações do `vercel.json`
3. **Problemas de CORS**: Verifique se o middleware CORS está habilitado
4. **Sessões não persistem**: Verifique a configuração das sessões e cookies

Para outros problemas, consulte a [documentação da Vercel](https://vercel.com/docs).