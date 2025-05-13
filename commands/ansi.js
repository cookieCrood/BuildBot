const { SlashCommandBuilder } = require("discord.js");
const fs = require('fs');
const { stringify } = require("querystring");

function makeSendable(string) {

    let newString = ''

    for (const char of string) {

        if (char == '∫') {
            newString += '\n'
        } else if (char == 'µ') {
            newString += '\u001b'
        } else if (char == '_') {
            newString += ' '
        } else {
            newString += char
        }
    }

    return newString

}

function parseFormat(string) {

    string = string.toLowerCase()

    argList = string.replace(' ', '').split(',')

    for (const arg of argList) {
        if (!(['normal', 'bold', 'underlined'].includes(arg))) {
            return false;
        }
    }

    return argList

}

function parseColor(string) {

    string = string.toLowerCase()

    if (!([
        'gray',
        'red',
        'green',
        'yellow',
        'blue',
        'pink',
        'cyan',
        'white'
    ].includes(string))) {
        return false
    } 

    return string

}

function parseNewLine(string) {

    let newString = ''

    for (const char of string) {
        if (char == '|') {
            newString += '∫'
        } else {
            newString += char
        }
    }

    return newString

}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ansi')
        .setDescription('Advanced Styled Text')



        .addSubcommand((subCommand) => 
            subCommand
                .setName('add')
                .setDescription('Add a piece of styled text.')

                .addStringOption((option) =>
                    option
                        .setName('format')
                        .setDescription('Format of the text')
                        .setRequired(true))
                
                .addStringOption((option) =>
                    option
                        .setName('color')
                        .setDescription('Color of the text')
                        .setRequired(true))
                
                .addStringOption((option) => 
                    option
                        .setName('text')
                        .setDescription('Styled Text')
                        .setRequired(true)))



        .addSubcommand((subCommand) => 
            subCommand
                .setName('send')
                .setDescription('Send the assembled message to this channel.'))

        .addSubcommand((subCommand) => 
            subCommand
                .setName('clear')
                .setDescription('Clear your stored ANSI'))
        
        .addSubcommand((subCommand) => 
            subCommand
                .setName('info')
                .setDescription('Get info about the /ansi command')),
    
    execute(stuff) {
        const interaction = stuff.interaction
        const subCommand = interaction.options.getSubcommand()

        let read = JSON.parse(fs.readFileSync('./commands/assets/ansi-storage.json'))
        const write = './commands/assets/ansi-storage.json'

        const stored = read[interaction.user.id] || '```ansi∫'

        if (subCommand == 'add') {

            const formatMap = new Map()
            formatMap.set('normal', '0'),
            formatMap.set('bold', '1')
            formatMap.set('underlined', '4')

            const colorMap = new Map()
            colorMap.set('gray', '30')
            colorMap.set('red', '31')
            colorMap.set('green', '32')
            colorMap.set('yellow', '33')
            colorMap.set('blue', '34')
            colorMap.set('pink', '35')
            colorMap.set('cyan', '36')
            colorMap.set('white', '37')

            let format = ''
            let color
            const text = parseNewLine(interaction.options.getString('text'))

            const parsedFormat = parseFormat(interaction.options.getString('format'))
            const parsedColor = parseColor(interaction.options.getString('color'))

            if (!parsedFormat) {

                interaction.reply({ content: `Error while parsing inputted format! Please run /ansi info for more information.`, ephemeral: true })
                return

            } else {

                for (const arg of parsedFormat) {
                    format += formatMap.get(arg) + ';'
                }
                format = format.substring(0, format.length - 1)

            }



            if (!parsedColor) {

                interaction.reply({ content: 'Error while parsing inputted color! Please run "/ansi info" for more information.', ephemeral: true })
                return

            } else {

                color = colorMap.get(parsedColor)

            }

            const message = `µ[0;${format};${color}m${text}` 
            const newStored = stored + message

            if (newStored.length > 1950) {
                interaction.reply({ content:'Error while merging snippets! Resulting message too long.', ephemeral: true })
                return
            }

            read[interaction.user.id] = newStored
            fs.writeFileSync(write, JSON.stringify(read))

            const readUpdated = JSON.parse(fs.readFileSync('./commands/assets/ansi-storage.json'))

            interaction.reply({ content: 'Your stored ANSI message is\n' + makeSendable(readUpdated[interaction.user.id]) + '```', ephemeral: true })
        
        } else if (subCommand == 'send') {

            if (!(read[interaction.user.id])) {
                interaction.reply('Error while parsing cached message! Can\'t send empty message')
            }

            interaction.channel.send(makeSendable(read[interaction.user.id]) + '```' + `\nAuthor: <@${interaction.user.id}>`)
            delete read[interaction.user.id]
            if (stringify(read).length === 0) {
                read = {}
            }
            fs.writeFileSync(write, JSON.stringify(read))
            interaction.reply({ content: 'Send stored ANSI and reset the stored ANSI', ephemeral: true })

        } else if (subCommand == 'info') {

            interaction.reply({ content:'Here is the <@1317485647652585513> ANSI documentation https://discord.com/channels/1317474648748986460/1358482200139403455/1358499981497205036', ephemeral: true })

        } else if (subCommand == 'clear') {

            delete read[interaction.user.id]
            if (stringify(read).length === 0) {
                read = {}
            }
            fs.writeFileSync(write, JSON.stringify(read))
            interaction.reply({ content:'Cleared your stored ANSI', ephemeral: true })

        }
    } 
}