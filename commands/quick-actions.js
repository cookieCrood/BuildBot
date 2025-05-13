const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName('quick-actions')
    .setDescription('Lists all available quickActions'),
    
    async execute(interaction) {
      return;
    }

} // Note: This command requires some parts of the file index.js
