module.exports = ({fastify,settings}) => {
    fastify.route({
        method: 'POST',
        url: '/api/@user',
        schema: {
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        error: { type: 'string' },
                        user: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                username: { type: 'string' },
                                avatar: { type: 'string' },
                                avatarURL: { type: 'string' },
                                discriminator: { type: 'string' },
                                banner: { type: 'string' },
                                banner_color: { type: 'string' },
                                accent_color: { type: 'number' },
                                locale: { type: 'string' },
                                premium_type: { type: 'number' },
                            }
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
            return {
                success: true,
                user: User.UserData,
            };
        }
    })
}
