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

            const erroredOptions=[];

            const Categories = Object.keys(options);
            for(const Category of Categories){
                const Options = Object.keys(options[Category]);
                for(const Option of Options){
                    const OptionData = options[Category][Option];
                    const OptionFunc = (options_func.find(c=>c.id == Category)?.options || []).find(o=>o.id == Option);

                    if(
                        OptionFunc.optionType.type == 'TextInput'
                    ){
                        const res = await OptionFunc.setValue({
                            newData: OptionData,
                            guild_id,
                            member_id: User.id,
                            optionsReferences,
                        });
                        if(res.error){
                            erroredOptions.push({...res,category_id:Category,option_id: Option});
                        }
                    }

                }
            }

            return {
                success: true,
                erroredOptions: erroredOptions[0] ? erroredOptions : null,
            };
        }
    })
}
