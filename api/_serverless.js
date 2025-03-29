// Este arquivo é necessário para transformar o Express em uma função serverless da Vercel
const app = require('./index.js');

// Exporta uma função serverless que usa o Express como middleware
module.exports = (req, res) => {
  // A Vercel executa esta função para cada solicitação de API
  // Sem necessidade de especificar uma porta, a Vercel gerencia isso automaticamente
  return app(req, res);
};