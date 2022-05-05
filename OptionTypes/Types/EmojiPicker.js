module.exports = ({defaultValue,showGuildEmojis=true,}) => {
    return {
        type: 'EmojiPicker',
        defaultValue,
        showGuildEmojis,
    }
}
