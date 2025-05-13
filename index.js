const { Client, Events, GatewayIntentBits, SlashCommandBuilder, Collection, Message, ButtonBuilder, ButtonStyle } = require("discord.js");
const {token} = require("./config.json")
const fs = require('node:fs')

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildPresences
	],
});

client.commands = getCommands('./commands');
client.quickActions = getQuickActions('./quick-actions')
client.autoReactions = {
    'man': '🫃',
    'men': ['🧔‍♂️', '👨‍🦲']
}

const quickActionNameList = Array.from( client.quickActions.keys() );
let str = '';
for (const name of quickActionNameList) {
    if (quickActionNameList.indexOf(name) == quickActionNameList.length - 1) {
        str += name;
        break;
    }
    str += `${name}, `
}
client.quickActionNames = str

client.once(Events.ClientReady, (c) => {
    console.log(`Logged in as ${c.user.tag}`);
    updateMemberCount()
});

client.on(Events.InteractionCreate, (interaction) => {

    console.log(`Interaction: ${interaction.customId || interaction} | ran by ${interaction.user.tag} or ${interaction.user.id}`)

    if (!interaction.isChatInputCommand()) {
        buttons(interaction)
        return;
    }

    if (interaction.commandName === 'quick-actions') {
        interaction.reply({ content:`List of quickActions\n(to use type: "![ACTION]")\n${client.quickActionNames}`, ephemeral: true });
    }

    let command = client.commands.get(interaction.commandName);

    try{
        if(interaction.replied) return;
        command.execute({ interaction: interaction, client: client });
    } catch (error) {
        console.error(error);
    }

    //console.log(interaction)

});

client.on(Events.MessageCreate, (message) => {
    if (message.author.bot) return;

    console.log(`${message.author.displayName}: ${message.content}`)
    if (message.content.startsWith('!')) {
        quickActions(message);
        return;
    } else if (message.channel.id == '1352704486334005279') {
        message.react('🔥')
        message.react('❌')
    } else {
        analyze(message);
    }

})

client.on("guildMemberAdd", (message, member) => {
    updateMemberCount()
    const channel = client.channels.cache.get('1317492286526849044');
    const userId = message.user.id
    message.roles.add('1318278455275684051')
    
    channel.send(`**Welcome to the Freebuild Discord Server <@${userId}>**\nMake sure to get your ping roles in <#1317521070579912777>`);
});

client.on("messageReactionAdd", (message, reaction, user) => {
})

client.on("threadCreate", (thread) => {
    console.log(thread)
    thread.join()
})

client.login(token);

function buttons(interaction) {

    if (interaction.customId) {

        client.commands.get(interaction.customId.split(':')[0]).buttons(interaction)

    }
}

function cleanString(str, clean) {

    let returnString = ''
    for (i in [...Array(str.length).keys()]) {
        if ((clean.includes(str[i]))) {
            returnString += str[i]
        }
    }
    return returnString
}

function analyze(message) {
    var content = message.content
    var abc = 'abcdefghijklmnopqrstuvwxyz 1234567890'
    abc = abc.split('')
    content = cleanString(content, abc)

    words = content.toLowerCase().split(' ')
    for (const key in client.autoReactions) {
        if (words.includes(key)) {
            if (Array.isArray(client.autoReactions[key])) {
                for (const i in client.autoReactions[key]) {
                    message.react(client.autoReactions[key][i])
                }
            } else {
                message.react(client.autoReactions[key])
            }
        }
    }
}

function quickActions(message) {
    content = message.content.substr(1)
    words = content.split(' ')

    let quickAction = client.quickActions.get(words[0]);

    if (!quickAction) {
        message.reply(`Couldn't find this quickAction!`)
        return;
    }

    try {
        quickAction.execute({ message:message, client:client });
    } catch(error){
        console.error(error);
    }
}

async function updateMemberCount() {

    const channel = client.channels.cache.get('1354140504391942215')
    const guild = client.guilds.cache.get('1317474648748986460');
    const members = await guild.members.list({ limit:1000 })
    const memberCount = [...members].length
    channel.setName(`Members: ${memberCount}`)

}

function getCommands(dir) {
    let commands = new Collection();
    const commandFiles = getFiles(dir)

    for (const commandFile of commandFiles) {
        const command = require(commandFile);
        commands.set(command.data.toJSON().name, command)
    }
    return commands;
}

function getFiles(dir) {

    const files = fs.readdirSync(dir, {
        withFileTypes: true
    })
    let commandFiles = [];

    for (const file of files) {
        if(file.isDirectory()) {
            commandFiles = [
                ...commandFiles,
                ...getFiles(`${dir}/${file.name}`)
            ]
        } else if (file.name.endsWith(".js")) {
            commandFiles.push(`${dir}/${file.name}`)
        }
    }
    return commandFiles;
}

function getQuickActions(dir) {
    let actions = new Collection();
    const actionFiles = getFiles(dir);

    for (const actionFile of actionFiles) {
        const action = require(actionFile);
        actions.set(action.name, action)
    }
    return actions
}