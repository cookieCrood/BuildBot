const { SlashCommandBuilder, InteractionType } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with "Pong!"'),
    
    async execute(stuff) {
        const interaction = stuff.interaction
        interaction.reply('Pong!')  
    }

}
