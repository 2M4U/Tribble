const { EmbedBuilder } = require('discord.js');
const { Row, ButtonOption, RowTypes } = require('discord.js-menu-buttons');
const config = require('../../config.json');
const { OnTicketEnding } = require('../../events/tribble/OnTicketEnding');
const { OnTOSAccept } = require('../../events/tribble/OnTOSAccept');

module.exports = {
    name: "TOS",
    content: new EmbedBuilder()
        .setTitle(config.TOS_TITLE)
        .setColor(config.TOS_COLOR)
        .setDescription(config.TOS_DESCRIPTION.toString()),
    rows: [new Row([
        new ButtonOption({ customId: "agreeTOS", style: "PRIMARY", label: "Agree" }, async interaction => {
            interaction.deferUpdate();
            const tosAccept = OnTOSAccept.bind(menu, config.SHOP_MODE);
            tosAccept();
        }),
        new ButtonOption({ customId: "declineTOS", style: "SECONDARY", label: "Decline" }, async interaction => {
            interaction.deferUpdate();
            const endTicket = OnTicketEnding.bind(ticket, interaction.channel, false);
            endTicket();
        })], RowTypes.ButtonMenu)]
}