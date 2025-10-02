
// Importa a biblioteca do Supabase
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURE AQUI ---
// Substitua com as suas credenciais REAIS do Supabase
const supabaseUrl = 'https://zfabaltrntazdvrmnisi.supabase.co';
const supabaseAnonKey = 'sb_publishable_Z1urlArXGbcnq1RXgES_Dw_X0yGihSO';

// Substitua com um email e senha de um usuário que REALMENTE existe no seu banco
const userEmail = 'bot@lobeliasbot.com';
const userPassword = 'Popopiloko@1';
// --------------------

// Cria o cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// A função de login é assíncrona, então a colocamos dentro de uma função `async`
async function testarLogin() {
  console.log('Tentando fazer login...');

  try {
    // Await é crucial! Esperamos a resposta do Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: userPassword, 
    });

    // 1. Verifica se o Supabase retornou um erro específico
    if (error) {
      console.error('❌ Erro retornado pelo Supabase:');
      console.error(error.message); // A mensagem de erro é a parte mais importante!
      return;
    }

    // 2. Verifica se os dados (data) e a sessão existem
    if (data && data.session) {
      console.log('✅ Login realizado com sucesso!');
      console.log('Usuário:', data.user.email);
      console.log('🔑 Access Token (JWT):');
      console.log(data.session.access_token);
    } else {
        console.warn('🤔 Ocorreu algo inesperado. Nenhum erro, mas também nenhum dado de sessão retornado.');
    }

  } catch (err) {
    // 3. Captura qualquer outro erro que possa ocorrer (ex: problema de rede)
    console.error('💥 Ocorreu um erro catastrófico na execução do script:');
    console.error(err);
  }
}

// Executa a função
testarLogin();