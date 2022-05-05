module.exports = ({fastify,settings}) => {
    fastify.route({
        method: 'GET',
        url: '/api/alive',
        schema: {
            response: {
                200: {
                    type: 'object',
                    properties: {
                        alive: { type: 'boolean' }
                    }
                },
            }
        },
        handler: async (req,res) => {
            return {alive: true};
        }
    })
}
