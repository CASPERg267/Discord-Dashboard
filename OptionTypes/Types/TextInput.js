module.exports = ({placeholder,useEmojiPicker=true,allowGuildEmojis=true}) => {
    return {
        type: 'TextInput',
        placeholder,
        useEmojiPicker,
        allowGuildEmojis
    }
}
