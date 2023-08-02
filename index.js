// Load environment variables from .env file
require('dotenv/config');

// Import necessary classes from the discord.js library and openai library
const { Client, IntentsBitField } = require('discord.js');
const { Configuration, OpenAIApi } = require('openai');

// Create a new Discord client with specified intents
const client = new Client({
    intents:[
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

// Event: When the bot is ready and connected to Discord
client.on('ready', () => {
    console.log("The bot is Online!");
});

// Create a configuration object with the OpenAI API key
const configuration = new Configuration({
    apiKey: process.env.API_KEY,
})

// Create an instance of the OpenAIApi with the configuration
const openai = new OpenAIApi(configuration);

// Event: When a new message is created in any channel the bot can access
client.on('messageCreate', async (message) => {
    // Ignore messages from other bots
    if (message.author.bot) return;

    // Check if the message is from the specified channel
    if (message.channel.id !== process.env.CHANNEL_ID) return;

    // Ignore messages that start with '!'
    if (message.content.startsWith('!')) return;

    // Create a conversation log with a system message as the starting point
    let conversationLog = [{ role: 'system', content: "You are friendly chatbot." }];

    // Simulate typing before sending the response
    await message.channel.sendTyping();

    // Fetch the previous 10 messages in the channel
    let prevMessages = await message.channel.messages.fetch({ limit: 10 });

    // Reverse the order of messages to get the most recent first
    prevMessages.reverse();

    // Iterate through the previous messages
    prevMessages.forEach((msg) => {
        // Ignore messages that start with '!'
        if (message.content.startsWith('!')) return;

        // Ignore messages from other bots and from users other than the message author
        if (msg.author.id !== client.user.id && message.author.bot) return;
        if (msg.author.id !== message.author.id) return;

        // Add user messages to the conversation log
        conversationLog.push({
            role: 'user',
            content: msg.content,
        })
    });
    
    // Call the OpenAI API to generate a response using the conversation log
    const result = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: conversationLog,
    })

    // Send the generated response back to the user
    message.reply(result.data.choices[0].message);
});

// Log in to Discord with the bot token from the environment variable
client.login(process.env.TOKEN);
