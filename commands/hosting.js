const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName('hosting')
    .setDescription('Informs the server that TheCookie__ is hosting.'),
    
    async execute(stuff) {
        const interaction = stuff.interaction
        const client = stuff.client
        if (interaction.user.id == '783404892039282709') {
            const channel = client.channels.cache.get('1317516491469619240')
            interaction.reply({ content: 'Done!', ephemeral: true })
            channel.send('<@&1317520828568571954> Hosting!')
        } else {
            interaction.reply({ content: 'You do not have permission to use this command!', ephemeral: true })
        }
    }

}
