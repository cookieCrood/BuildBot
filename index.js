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
});

client.on(Events.InteractionCreate, (interaction) => {
    if (!interaction.isChatInputCommand()) {
        buttons(interaction)
        return;
    }

    console.log(`Interaction: ${interaction}`)

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
    } else {
        analyze(message);
    }

})

client.on("guildMemberAdd", (message, member) => {
    const channel = client.channels.cache.get('1317492286526849044');
    const userId = message.user.id
    message.roles.add('1318278455275684051')
    
    channel.send(`**Welcome to the Freebuild Discord Server <@${userId}>**\nMake sure to get your ping roles in <#1317521070579912777>`);
});

client.on("messageReactionAdd", (message, reaction, user) => {
    console.log('got!')
})

client.login(token);

function buttons(interaction) {
    const member = interaction.member
    if (interaction.customId === 'host') {
        console.log(`Ineraction: Toggle Host | user: ${member.displayName} or ${member.id}`)

        const hasHost = member.roles.cache.some(r => r.name === "Host Ping")

        if (hasHost) {
            member.roles.remove('1317520828568571954')
            interaction.reply({ content: 'Removed Host Ping role', ephemeral: true })
        } else if (!hasHost) {
            member.roles.add('1317520828568571954')
            interaction.reply({ content: 'Added Host Ping role', ephemeral: true })
        }
    } else if (interaction.customId === 'event') {
        console.log(`Ineraction: Toggle Event | user: ${member.displayName} or ${member.id}`)

        const hasEvent = member.roles.cache.some(r => r.name === "Event Ping")

        if (hasEvent) {
            member.roles.remove('1325161991702057172')
            interaction.reply({ content: 'Removed Event Ping role', ephemeral: true })
        } else if (!hasEvent) {
            member.roles.add('1325161991702057172')
            interaction.reply({ content: 'Added Event Ping role', ephemeral: true })
        }
    }
}

function analyze(message) {
    content = message.content
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