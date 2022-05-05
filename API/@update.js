module.exports = ({fastify,settings,options: options_func,optionsReferences}) => {
    fastify.route({
        method: 'POST',
        url: '/api/@update',
        handler: async (req,res) => {
            const {uuid, guild_id, options} = req.body;
            const User = await settings.tokenStore.get(uuid);
            if(!User)
                return res.code(406).send({
                    error: true,
                    message: 'ERROR_NO_TOKEN',
                });

            const Categories  = Object.keys(options);
            for(const Category of Categories){
                const Options = Object.keys(options[Category]);
                for(const Option of Options){
                    const OptionData = options[Category][Option];
                    console.log(OptionData)

                    if(OptionData.type == 'TextInput'){
                        const OptionFunc = (options_func.find(c=>c.id == Category)?.options || []).find(o=>o.id == Option);
                        OptionFunc.setValue({
                            newData: OptionData.value,
                            guild_id,
                            member_id: User.id,
                            optionsReferences,
                        });
                    }

                }
            }

            console.log(options)

            return {
                success: true,
            };
        }
    })
}
