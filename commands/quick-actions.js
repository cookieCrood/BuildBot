const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName('quick-actions')
    .setDescription('Lists all available quickActions'),
    
    async execute(interaction) {
      return;
    }

}