const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName('clean')
    .setDescription('Clear all messages from a USER in the list of X last messages.')
    .addUserOption((option) => 
        option
            .setName('user')
            .setDescription('User of which the messages will be deleted')
            .setRequired(true)
        )
    .addNumberOption((option) =>
        option
            .setName('limit')
            .setDescription('Limit of messages being listed for deletion')
            .setRequired(true)
            .setMinValue(0)
            .setMaxValue(100)),

    async execute(stuff) {
        const interaction = stuff.interaction
        if (!(interaction.user.id === '783404892039282709')) {
            interaction.reply({ content: 'You lack the permissions to execute this command!', ephemeral: true })
            return
        }

        const user = interaction.options.getUser('user')
        const max = interaction.options.getNumber('limit')

        let deletedCount = 0

        interaction.channel.messages.fetch({ limit: 100 }).then(messages => {

        for (let message of messages) {
            message = message[1]
            if (deletedCount >= max) {
                break
            }
            if (message.author.id === user.id) {
                message.delete()
                deletedCount++
            }        
        }
        interaction.reply({ content:`Successfully cleared ${deletedCount} messages sent by <@${user.id}>`, ephemeral:true })
        stuff.client.channels.cache.get('1322870159408627744').send(`Successfully cleared ${deletedCount} messages sent by <@${user.id}>`)
        })
    }
}
