module.exports = ({fastify,settings}) => {
    fastify.route({
        method: 'POST',
        url: '/api/@guilds',
        schema: {
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        error: { type: 'string' },
                        guilds: {
                            type: 'array',
                        },
                        permissionsRequired: {
                            type: 'array',
                        }
                    }
                },
                400: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                        message: { type: 'string' }
                    }
                }
            }
        },
        handler: async (req,res) => {
            const {uuid} = req.body;
            const User = await settings.tokenStore.get(uuid);
            if(!User)
                return res.code(406).send({
                    error: true,
                    message: 'ERROR_NO_TOKEN',
                });
            const UserGuilds = await fastify.oauth.getUserGuilds(User.token.access_token);
            let Guilds = [];
            for(const guild of UserGuilds){
                Guilds.push(new Promise(async (resolve, reject) => {
                    let onGuild = null;
                    try{
                        await fastify.discordJSClient.guilds.fetch(guild.id);
                        onGuild = true;
                    }catch(err){
                        onGuild = false;
                    }
                    resolve({...UserGuilds.find(g=>g.id==guild.id),onGuild});
                }))
            }
            Guilds = await Promise.all(Guilds);
            return {
                success: true,
                guilds: Guilds,
                permissionsRequired: [0x8]
            };
        }
    })
}
