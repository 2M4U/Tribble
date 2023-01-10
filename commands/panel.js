const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const enmap = require('enmap');
const settings = new enmap({ name: "settings", autoFetch: true, cloneLevel: "deep", fetchAll: true });
const Logger = require('leekslazylogger');
const log = new Logger({ name: "Tribble", keepSilent: true });
const config = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('panel')
        .setDescription('Creates a new ticket panel. If an existing ticket panel exists, it is deleted.'),
    async execute(interaction) {
        let messageID = settings.get('panel_message_id');
        let channelID = settings.get('panel_channel_id');
        if (channelID && messageID) {
            // existing panel, needs to be deleted
            previousPanelChannel = await interaction.guild.channels.cache.find(channel => channel.id == channelID);
            await previousPanelChannel.messages.fetch(`${messageID}`).then(message => {
                message.delete();
                log.info('Previous panel deleted successfully')
            });
        }
        settings.set('panel_channel_id', interaction.channel.id);
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ticketCreate')
                    .setStyle(ButtonStyle.Primary)
                    .setLabel(config.PANEL_BUTTON_TEXT)
                    .setEmoji(config.PANEL_BUTTON_EMOJI)
            );
        panelEmbed = new EmbedBuilder()
            .setColor(config.PANEL_COLOR)
            .setTitle(config.PANEL_TITLE)
            .setDescription(config.PANEL_DESCRIPTION)
            .setFooter({ text: config.PANEL_FOOTER })
            .setThumbnail(config.PANEL_THUMBNAIL)
        interaction.reply({
            embeds: [panelEmbed], components: [row]
        });
        log.info('New panel created successfully')
        panelMessage = await interaction.fetchReply();
        settings.set('panel_message_id', panelMessage.id);
    },
};
