module.exports = ({fastify,settings,options,optionsReferences}) => {
    fastify.route({
        method: 'POST',
        url: '/api/@guild',
        handler: async (req,res) => {
            const {uuid,guild_id} = req.body;
            const User = await settings.tokenStore.get(uuid);
            if(!User)
                return res.code(406).send({
                    error: true,
                    message: 'ERROR_NO_TOKEN',
                });

            const Options = {};

            for(const Category of options){
                Options[Category.id] = {
                    id: Category.id,
                    name: Category.name,
                    options: [],
                };
                for(const Option of Category.options){
                    const value = await Option.getValue({guild_id, member_id: User.id, optionsReferences});
                    const allowed = await Option.allowed({guild_id, member_id: User.id, optionsReferences});

                    let additionalSettings = {};

                    /*
                        Additional Settings: EmojiPicker
                            - TextInput.optionType.useEmojiPicker - use emoji picker with input?
                            - TextInput.optionType.allowGuildEmojis - display guild emojis list with emoji picker?
                     */

                    if(Option.optionType.type == 'TextInput' && Option.optionType.useEmojiPicker){
                        if(Option.optionType.allowGuildEmojis) {
                            additionalSettings.guildEmojisList = ((fastify
                                .discordJSClient
                                .guilds?.cache?.get(guild_id) || {})
                                .emojis?.cache || []).map(e=>({
                                    name: e.name,
                                    id: e.id,
                                    animated: e.animated,
                                    shortcodes: [e.id],
                                    url: `https://cdn.discordapp.com/emojis/${e.id}.${e.animated ? 'gif' : 'png'}`,
                                    category: 'Guild Emojis',
                                }));
                        }
                    }

                    Options[Category.id].options.push({
                        id: Option.id,
                        name: Option.name,
                        description: Option.description,
                        disabled: Option.disabled,
                        clientValidation: Option.clientValidation?.toString() || null,
                        value,
                        allowed,
                        optionType: Option.optionType,
                        additionalSettings,
                    });
                }
            }

            return {
                success: true,
                options: Object.values(Options),
            };
        }
    })
}
