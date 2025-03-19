const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js")


module.exports = {
    name: 'msg',
    
    async execute(stuff) {
        const message = stuff.message
        const channel = message.channel

        message.delete();

        if (!message.author.id === '783404892039282709') {
            message.reply({ content: 'You lack the permissions to execute this command!', ephemeral: true })
            return
        }

        const host = new ButtonBuilder()
			.setCustomId('host')
			.setLabel('Host')
            .setStyle(ButtonStyle.Primary)
        
        const event = new ButtonBuilder()
            .setCustomId('event')
            .setLabel('Events')
            .setStyle(ButtonStyle.Primary)
        
        const row = new ActionRowBuilder()
			.addComponents(host, event);

        message.channel.send({ content: "Click the Buttons below to toggle being pinged for the specific Events", components: [row] })
        
    } 
}