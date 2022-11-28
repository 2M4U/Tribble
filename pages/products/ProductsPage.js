const config = require('../../config.json');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, Embed } = require('discord.js');
const { Row, ButtonOption, RowTypes } = require('discord.js-menu-buttons');
const { OnTicketEnding } = require('../../events/tribble/OnTicketEnding');

buttons = []
const populateProductsPageButtons = function () {
    buttonRow = [];
    productNames = config.ITEMS_TO_SELL.split(',');
    productButtonEmojis = config.PRODUCTS_EMOJIS.split(',');
    for (var i = 0; i < productNames.length; i++) {
        productName = productNames[i];
        productButtonLabel = productButtonEmojis[i];
        if (config.SHOW_PRODUCT_NAME_ON_PRODUCT_BUTTON) {
            productButtonLabel = productButtonLabel + ` ${productName}`;
        }
        buttonRow[i] = new ButtonOption({
            customId: `${productName}`,
            style: "PRIMARY",
            label: `${productButtonLabel}`
        }, (interaction) => {
            console.log("Test");
        });
    }
    buttonRow[productNames.length] = new ButtonOption({
        customId: "cancelledTicketInProductsPage",
        style: "SECONDARY",
        label: "❌"
    }, (interaction) => {
        interaction.deferUpdate();
        const endTicket = OnTicketEnding.bind(ticket, interaction.channel, false);
        endTicket();
    });
    return buttonRow;
}

module.exports = {
    name: "products",
    content: new EmbedBuilder()
        .setTitle(config.PRODUCTS_TITLE)
        .setColor(config.PANEL_COLOR)
        .setDescription(config.PRODUCTS_DESCRIPTION),
    rows: [new Row(populateProductsPageButtons(), RowTypes.ButtonMenu)]
};
