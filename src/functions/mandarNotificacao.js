const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');
require('dotenv').config();
const client = new CosmosClient({ connectionString: process.env.COSMOS_DB_CONNECTION_STRING });
const database = client.database('cozinhaComigo');
const container = database.container('utilizadores');

app.http('mandarNotificacao', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const { idDono, idReceita, idUtilizadorGostou } = await request.json();
        
        try {

            const { resource: utilizador } = await container.item(idDono, idDono).read();

            if (!utilizador) {
                return {
                    status: 404,
                    body: 'Utilizador não encontrado'
                };
            }

            const novaNotificacao = {
                UtilizadorGostou: idUtilizadorGostou,
                IdReceita: idReceita,
                lida: false
            };

            utilizador.Notificações = utilizador.Notificações || [];
            utilizador.Notificações.push(novaNotificacao);

            await container.items.upsert(utilizador);

            return {
                status: 200,
                body: `Notficacao enviada`
            };
        } catch (error) {
            return {
                status: 400,
                body: 'Erro a enviar notificacao'
            };
        }
    }
});
