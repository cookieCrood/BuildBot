
module.exports = {
    name: 'say',
    
    execute(stuff) {
        content = stuff.message.content
        text = content.substr(5);

        if (text == '') {
            message.reply( { content: '[ERROR] Cannot !say empty message!', ephemeral: true } )
            return;
        }
        
        stuff.message.delete();
        stuff.message.channel.send(text);
    } 
}