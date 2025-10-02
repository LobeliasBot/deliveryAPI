const fastify = require('fastify')({ logger: true });
const { createClient } = require('@supabase/supabase-js');
const { DatabasePostgres } = require('./database-postgres.js')
require('dotenv').config();

const database = new DatabasePostgres();

// Inicializa o cliente Supabase no backend
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY || 'chave_anon_opcional');

// AUtententicação
async function authenticate(request, reply) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return reply.status(401).send({ error: 'Nenhum token de autorização fornecido.' });
    }

    // O cabeçalho deve ser no formato "Bearer <token>"
    const token = authHeader.split(' ')[1];

    if (!token) {
        return reply.status(401).send({ error: 'Token mal formatado.' });
    }

    // A mágica acontece aqui! O Supabase verifica o token usando o segredo.
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      fastify.log.error(error);
      return reply.status(401).send({ error: 'Falha na autenticação: ' + error.message });
    }

    if (!user) {
        return reply.status(401).send({ error: 'Token inválido ou expirado.' });
    }

    // Anexa o usuário ao objeto de requisição para uso posterior na rota
    request.user = user;

  } catch (err) {
    fastify.log.error(err);
    reply.status(500).send({ error: 'Erro interno no servidor durante a autenticação.' });
  }
}
// --- Definição das Rotas ---

// ------------- Rotas de Login -------------
// POST /auth/login
fastify.post('/auth/login',  async (request, reply) => {

  const supabaseUrl = 'https://zfabaltrntazdvrmnisi.supabase.co';
  const supabaseAnonKey = 'sb_publishable_Z1urlArXGbcnq1RXgES_Dw_X0yGihSO';
  
  const {email , senha} = request.body;

  let token = '';

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: senha,
    });

    if (error) {
      return reply.status(400).send();
    }

    if (data && data.session) {
      token = data.session.access_token;
      userId = data.session.user.id;

      dados = await database.dadosSessao(userId)
      
      return{
        jwt: token,
        dados
      }
      const retorno ={
        jwt: token,
        userID: userID,
        papel: dados.papel,
        loja: dados.loja_id
          ? {
              lojaID: dados.loja_id,
              telefone: dados.loja_telefone,
              endereco: dados.endereco
            }
          : null,
      }
      
    } else {
        return reply.status(402).send();
    }
    
  } catch (error) {
    
  }

})



// ------------- Rotas de Cardapio -------------
// GET /menu
fastify.get('/menu', async (request, reply) => {
  const lojaId = request.query.lojaId;

  const menu = await database.list(lojaId);

  return menu;
})

//PUT /menu/:id
fastify.put('/menu/:lojaId/:id', async (request, reply) => {
  const produtoId = request.params.id
  const lojaId = request.params.lojaId
  const {nome, descricao, preco} = request.body

  await database.update(produtoId, lojaId, {
    nome,
    descricao,
    preco,
  })
})


// ------------- Rotas de Pedido -------------
//GET /pedidos
fastify.get('/pedidos', async (request, reply) => {
  const {lojaId} = request.query

  const pedidos = await database.listarPedidos(lojaId)

  return pedidos
})

//Post /pedidos
fastify.post('/pedidos', async (request, reply) => {
  const {
    loja_id,
    cliente_nome,
    cliente_telefone,
    endereco_entrega,
    metodo_pagamento,
    total,
    itens
  } = request.body

  const pedidoId  = await database.criarPedido(loja_id,cliente_nome,cliente_telefone,endereco_entrega,metodo_pagamento,total,itens)
  
  console.log(pedidoId)

  for (const it of itens){
    await database.criarItemPedido(pedidoId, it.nome, it.quantidade, it.preco_unitario)
  }

  return reply.status(201).send()
})

//Patch Atualiza Pedidos
fastify.patch('/pedidos/:id/status', async (request, reply) => {
  const pedidoId = request.params.id
  const status = request.body.status

  await database.mudarStatusPedido(pedidoId, status)

  return reply.status(201).send()
})























// 1. Rota pública (não precisa de autenticação)
fastify.get('/', async (request, reply) => {
  return { message: 'Bem-vindo à nossa API pública!' };
});

// 2. Rota protegida (requer um JWT válido)
// Usamos o `preHandler` para executar nossa função `authenticate` antes da lógica da rota.
fastify.get('/me', { preHandler: [authenticate] }, async (request, reply) => {
  // Como o hook `authenticate` foi executado, `request.user` está disponível aqui.
  return {
    message: 'Este é um dado protegido!',
    user: request.user
  };
});


// --- Iniciar o Servidor ---

fastify.listen({
    host: '0.0.0.0',
    port:process.env.PORT ?? 3333
})