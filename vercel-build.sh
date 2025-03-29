#!/bin/bash

# Tornar o script executável
chmod +x ./vercel-build.sh

# Build do frontend 
echo "Construindo o frontend..."
npx vite build

# Prepara ambiente para build do serverless
echo "Configurando ambiente serverless..."
mkdir -p dist/api

# Construir API para formato serverless
echo "Construindo serverless functions..."
cp -r server dist/api/server
cp -r shared dist/api/shared
cp api/index.js dist/api/index.js
cp api/_serverless.js dist/api/_serverless.js 
mv dist/assets dist/client-assets

# Adiciona informação de ambiente
echo "NODE_ENV=production" > .env.production

echo "Build concluída com sucesso!"