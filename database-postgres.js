import { randomUUID } from "node:crypto";
import sql from "./db.js";

export class DatabasePostgres {
    #menu = new Map();

    async dadosSessao(userId){
        const dados = await sql`select u.id,u.papel,u.loja_id,l.nome as loja_nome,l.telefone as loja_telefone,l.endereco as loja_endereco from perfis u left join lojas l on l.id = u.loja_id where u.id = ${userId}`

        
        return dados
    }
    async list(lojaId) {
        let menu;

        if (lojaId) {
            // Usa template do postgres com ilike
            menu = await sql`select * from produtos where loja_id=${lojaId}`
        } else {
            return "sem produtos nessa loja"
        }

        // Aqui estava o erro: você estava retornando 'videos' que não existe
        return menu;
    }

    async update(id, loja_id,video) {
        const lojaId = loja_id
        const { nome, descricao, preco} = video
        
        await sql`update produtos set nome = ${nome}, descricao = ${descricao}, preco= ${preco} where id = ${id} and loja_id = ${lojaId}`
    }

    async listarPedidos(lojaId){
        let pedidos

        if (lojaId) {
            pedidos = await sql`select * from pedidos where loja_id = ${lojaId}`
        } else {
            return "Erro"
        }

        return pedidos
    }

    async criarPedido(loja_id,cliente_nome,cliente_telefone,endereco_entrega,metodo_pagamento,total){
        const pedidoId = randomUUID()
        await sql`INSERT INTO pedidos (id, loja_id, cliente_nome, cliente_telefone, endereco_entrega, metodo_pagamento, total) VALUES (${pedidoId},${loja_id}, ${cliente_nome}, ${cliente_telefone}, ${endereco_entrega}, ${metodo_pagamento}, ${total})`

        return pedidoId
    }


    async criarItemPedido(pedido_id, nome, quantidade, preco_unitario){
        await sql`INSERT INTO pedido_itens (pedido_id, nome, quantidade, preco_unitario) VALUES (${pedido_id},${nome},${quantidade},${preco_unitario})`
    }

    async mudarStatusPedido(pedido_id, status){

        await sql`update pedidos set status = ${status} WHERE id = ${pedido_id}`

        return
    }
}
