const { EmbedBuilder } = require('discord.js');
const { Row, ButtonOption, RowTypes } = require('discord.js-menu-buttons');
const config = require('../../config.json');
const { OnTicketEnding } = require('../../events/tribble/OnTicketEnding');

class TOSMenu {
    page;
    constructor(menu, menusMap) {
        this.page = {
            name: "TOS",
            content: new EmbedBuilder()
                .setTitle(config.TOS_TITLE)
                .setColor(config.TOS_COLOR)
                .setDescription(config.TOS_DESCRIPTION.toString()),
            rows: [new Row([
                new ButtonOption({ customId: "acceptedTOS", style: "PRIMARY", label: "✅" }, (interaction) => {
                    interaction.deferUpdate();
                    !config.SHOP_MODE ? menu.setPage(menusMap.get("payment")) : menu.setPage(menusMap.get("products"));
                }),
                new ButtonOption({ customId: "deniedTOS", style: "SECONDARY", label: "❌" }, (interaction) => {
                    interaction.deferUpdate();
                    const endTicket = OnTicketEnding.bind(menu, interaction.channel, false);
                    endTicket();
                })], RowTypes.ButtonMenu)]
        }
    }
}

module.exports = { TOSMenu };