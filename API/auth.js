module.exports = ({fastify,settings}) => {
    fastify.route({
        method: 'GET',
        url: '/api/auth',
        schema: {
            response: {
                200: {
                    type: 'object',
                    properties: {
                        uuid: { type: 'string' }
                    }
                },
            }
        },
        handler: async (req,res) => {
            const token = await fastify.DiscordOAuth2.getAccessTokenFromAuthorizationCodeFlow(req);
            let UserData = await fastify.oauth.getUser(token.access_token);
            UserData.avatar ? UserData.avatarURL = `https://cdn.discordapp.com/avatars/${UserData.id}/${UserData.avatar}.png?size=1024` : UserData.avatarURL = null;
            const uuid = fastify.uuidv4();
            await settings.tokenStore.set(uuid, {token, UserData});
            res.redirect(`${settings.clientUrl}/auth?uuid=${uuid}`);
            return {uuid};
        }
    })
}
