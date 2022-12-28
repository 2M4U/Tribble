const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const enmap = require('enmap');
const settings = new enmap({ name: "settings", autoFetch: true, cloneLevel: "deep", fetchAll: true });
const Logger = require('leekslazylogger');
const log = new Logger({ name: "Tribble", keepSilent: true });
const config = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('panel')
        .setDescription('Creates a new panel'),
    async execute(interaction) {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ticketCreate')
                    .setStyle(ButtonStyle.Primary)
                    .setLabel(config.PANEL_BUTTON_TEXT)
                    .setEmoji(config.PANEL_BUTTON_EMOJI)
            );
        let channel = interaction.channel;
        let messageID = settings.get('panel_message_id');
        let channelID = settings.get('panel_channel_id');
        if (!channelID) {
            settings.set('panel_channel_id', channel.id);
            channelID = settings.get('panel_channel_id');
        }
        if (messageID) {
            settings.set('panel_message_id', '');
        }
        embed = new EmbedBuilder()
            .setColor(config.PANEL_COLOR)
            .setTitle(config.PANEL_TITLE)
            .setDescription(config.PANEL_DESCRIPTION)
            .setFooter({ text: config.PANEL_FOOTER })
            .setThumbnail(config.PANEL_THUMBNAIL)
        panel = await interaction.reply({
            embed: [embed], components: [row]
        });
        log.info('New panel created successfully')
        settings.set('panel_message_id', panel.id)
    },
};