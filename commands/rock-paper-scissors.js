const { SlashCommandBuilder, EmbedBuilder, escapeHeading, ButtonStyle, ButtonBuilder, ActionRowBuilder } = require("discord.js");
const fs = require('fs')

const choiceList = ['Scissors :scissors:', 'Rock :rock:', 'Paper :roll_of_paper:']
const path = './commands/assets/rock-paper-scissors-storage.json'

module.exports = {
    data: new SlashCommandBuilder()
    .setName('rock-paper-scissors')
    .setDescription('Plays a game of Rock, Paper, Scissors')
    .addSubcommand((subCommand) =>
        subCommand
            .setName('pvb')
            .setDescription('Play against BuildBot')
            .addStringOption((option) =>
                option
                    .setName('pick')
                    .setDescription('Your pick')
                    .setRequired(true)
                    .addChoices(
                        { name: 'Scissors', value: '0' },
                        { name: 'Rock',  value: '1' },
                        { name: 'Paper', value: '2' }
                    )
            ))
    .addSubcommand((subCommand) =>
        subCommand
            .setName('pvp')
            .setDescription('Challenge another user to a game of Rock-Paper-Scissors')
            .addUserOption((option) =>
                option
                    .setName('opponent')
                    .setDescription('Your oppponent for this game')
                    .setRequired(true))
            .addStringOption((option) =>
                option
                    .setName('pick')
                    .setDescription('Your pick')
                    .setRequired(true)
                    .addChoices(
                        { name: 'Scissors', value: '0' },
                        { name: 'Rock',  value: '1' },
                        { name: 'Paper', value: '2' }
                    )
            )),
    
    async execute(stuff) {
        const interaction = stuff.interaction

        const user = interaction.user;

        const userChoice = interaction.options.getString('pick');

        const subCommand = interaction.options.getSubcommand()

        if (subCommand == 'pvb') {

            const botChoice = Math.floor(Math.random() * 3);

            const defaultMsg = `<@${user.id}>: ${choiceList[userChoice]}\n<@1317485647652585513>: ${choiceList[botChoice]}\n `

            if (userChoice == botChoice) {
                interaction.reply(defaultMsg + '-> Tie')
                return;
            } else if ((botChoice + 1) % 3 == userChoice) {
                interaction.reply(defaultMsg + `-> <@${user.id}> won!`)
                return;
            } else {
                interaction.reply(defaultMsg + '-> <@1317485647652585513> won!')
            }

        } else if (subCommand == 'pvp') {

            const storage = JSON.parse(fs.readFileSync(path))

            const user2 = interaction.options.getUser('opponent')

            if (user.id == user2.id) {
                interaction.reply({ content: 'You can\'t play against yourself! Try `/rock-paper-scissors pvb`', ephemeral: true })
                return
            }

            storage.maxGameId += 1

            storage.games[String(storage.maxGameId)] = {
                "p1Id": user.id,
                "p1Pick": userChoice,
                "p2Id": user2.id,
                "p2Pick": null
            }

            const message = `>>> ### Hey, <@${user2.id}>\nYou've been challenged to a game of\nrock-paper-scissors by <@${user.id}>!\n\nClick the buttons below to choose your pick`

            const scissors = new ButtonBuilder()
                        .setCustomId(`rock-paper-scissors:0:${storage.maxGameId}`)
                        .setEmoji({ name:'✂️' })
                        .setStyle(ButtonStyle.Primary)
            const rock = new ButtonBuilder()
                        .setCustomId(`rock-paper-scissors:1:${storage.maxGameId}`)
                        .setEmoji({ name:'🪨' })
                        .setStyle(ButtonStyle.Primary)
            const paper = new ButtonBuilder()
                        .setCustomId(`rock-paper-scissors:2:${storage.maxGameId}`)
                        .setEmoji({ name:'🧻' })
                        .setStyle(ButtonStyle.Primary)
            const cancel = new ButtonBuilder()
                        .setCustomId(`rock-paper-scissors:-1:${storage.maxGameId}`)
                        .setEmoji({ name:'🚫' })
                        .setStyle(ButtonStyle.Secondary)    

            const row = new ActionRowBuilder()
                .addComponents(scissors, rock, paper, cancel)
            
            interaction.channel.send({ content: message, ephemeral: true, components: [row] })
            interaction.reply({ content:'Successfully sent challenge', ephemeral: true })

            fs.writeFileSync(path, JSON.stringify(storage))

        }
    },

    async buttons(interaction) {

        const storage = JSON.parse(fs.readFileSync(path))
        const args = interaction.customId.split(':')

        const game = storage.games[args[2]]

        if (game.p2Pick) {
            interaction.reply({ content: 'This game already ended!', ephemeral: true })
            return
        }

        if (args[1] == -1) {
            interaction.message.delete()

            switch (interaction.user.id) {
                case game.p1Id:
                    interaction.reply({ content: 'Cancelled outgoing challenge', ephemeral: true })
                    break
                case game.p2Id:
                    interaction.reply({ content: `Declined challenge from <@${game.p1Id}>`, ephemeral: true })
                    break
                default:
                    interaction.reply({ content: 'You are not a player in this match', ephemeral: true })
            }

            delete storage.games[args[2]]

            fs.writeFileSync(path, JSON.stringify(storage))

            return
        }

        if (interaction.user.id != game.p2Id) {
            interaction.reply({ content: 'You are not a player in this match or you have already chosen your pick', ephemeral: true })
            return
        }

        game.p2Pick = args[1]

        const p1 = parseInt(game.p1Pick)
        const p2 = parseInt(game.p2Pick)

        const defaultMsg = `<@${game.p1Id}>: ${choiceList[p1]}\n<@${game.p2Id}>: ${choiceList[p2]}\n `

        if (p1 == p2) {
            interaction.reply(defaultMsg + '-> Tie')
        } else if ((p2 + 1) % 3 == p1) {
            interaction.reply(defaultMsg + `-> <@${game.p1Id}> won!`)
        } else {
            interaction.reply(defaultMsg + `-> <@${game.p2Id}> won!`)
        }

        fs.writeFileSync(path, JSON.stringify(storage))
    }
}

