const { EmbedBuilder } = require("discord.js");
const { Row, ButtonOption } = require("discord.js-menu-buttons");
const { OnTicketEnding } = require("../../events/tribble/OnTicketEnding");

module.exports = {
    name: "success",
    content: new EmbedBuilder()
        .setTitle("Payment Successful")
        .setDescription(`Your payment was successfully received. You have been granted the \`${purchasedRole}\` role. Thank you!`),
    rows: [new Row([new ButtonOption({
        customId: "successfulTicketFinishing",
        style: "SUCCESS",
        label: "Close ticket"
    }, (interaction) => {
        interaction.deferUpdate();
        endTicket = OnTicketEnding.bind(null, interaction.channel, true);
        endTicket();
    })])]
};

// TODO: Determine outcome for page dependent on searchEmail result

// const { EmbedBuilder } = require("discord.js");
// const { Row, ButtonOption } = require("discord.js-menu-buttons");
// const config = require('../../config.json');

// module.exports = {
//     name: "fail",
//     content: new EmbedBuilder()
//         .setTitle("Payment unsuccessful")
//         .setColor(config.MENU_COLOR)
//         .setDescription("Payment was not able to be confirmed. You can try to check for the payment again after you've sent it."),
//     rows: [new Row([new ButtonOption({
//         customId: "return-to-payment-instructions",
//         style: "SECONDARY",
//         label: "Back"
//     }, (interaction) => {
//         interaction.deferUpdate();

//     }), new ButtonOption({
//         customId: "retry-payment-search",
//         style: "SECONDARY",
//         label: "Search for payment again"
//     }, (interaction) => {
//         interaction.deferUpdate();

//     })])]
// };