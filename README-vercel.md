# Deploy na Vercel - TripCheck

Este documento contém instruções para fazer o deploy do aplicativo TripCheck na Vercel. A aplicação foi adaptada para funcionar na Vercel com funções serverless.

## Pré-requisitos

1. Uma conta na [Vercel](https://vercel.com)
2. O [Vercel CLI](https://vercel.com/cli) instalado (opcional, mas recomendado)
3. Repositório do projeto no GitHub, GitLab ou Bitbucket

## Passos para Deploy

### 1. Prepare o Repositório

Certifique-se de que seu repositório contenha os seguintes arquivos:

- `vercel.json` - Configuração para a Vercel
- `api/index.js` - API do Express adaptada para serverless
- `api/_serverless.js` - Adaptador Serverless
- `vercel-build.sh` - Script de build

### 2. Configurar Variáveis de Ambiente

Na interface da Vercel, você precisará configurar as seguintes variáveis de ambiente:

- `SESSION_SECRET` - Uma string aleatória para a segurança das sessões
- `NODE_ENV` - Definido como "production" para produção

### 3. Deploy via Dashboard da Vercel

1. Faça login no [dashboard da Vercel](https://vercel.com/dashboard)
2. Clique em "New Project"
3. Importe seu repositório
4. Na tela de configuração:
   - Framework Preset: Outros (não Node.js)
   - Build Command: `./vercel-build.sh`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. Expanda "Environment Variables" e adicione as variáveis necessárias
6. Clique em "Deploy"

### 4. Deploy via CLI (Alternativa)

Execute os seguintes comandos:

```bash
# Instale a CLI da Vercel se ainda não tiver
npm i -g vercel

# Faça login na Vercel
vercel login

# Deploy para ambiente de desenvolvimento
vercel

# Deploy para produção
vercel --prod
```

## Verificando o Deploy

Após o deploy, você receberá um URL da Vercel para acessar seu aplicativo.

## Solução de Problemas Comuns

### Erros de Sessão

Se houver problemas com as sessões, verifique:

1. Se a variável `SESSION_SECRET` está corretamente definida
2. Se os cookies estão configurados adequadamente para o domínio

### API não Responde

Se a API não estiver respondendo:

1. Verifique os logs na dashboard da Vercel
2. Confira se as funções serverless estão sendo corretamente buildadas
3. Verifique se o arquivo `vercel.json` tem as regras de rewrite corretas

### Problemas com CORS

Se houver problemas com CORS:

1. Verifique se o middleware CORS está habilitado
2. Configure o CORS para permitir sua origem específica