// Este arquivo é necessário para transformar o Express em uma função serverless da Vercel
import app from './index.js';

// Exporta uma função serverless que usa o Express como middleware
export default (req, res) => {
  // A Vercel executa esta função para cada solicitação de API
  return app(req, res);
};