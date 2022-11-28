const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('close')
        .setDescription('Closes a created ticket'),
    async execute(interaction) {
        interaction.channel.delete();
    },
}