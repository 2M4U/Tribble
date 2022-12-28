const { EmbedBuilder } = require("discord.js");
const { ButtonOption, Row, RowTypes, Page } = require("discord.js-menu-buttons");
const { OnPaymentSent } = require("../../events/tribble/OnPaymentSent");
const { OnProductSelect } = require("../../events/tribble/OnProductSelect");
const { OnTicketEnding } = require("../../events/tribble/OnTicketEnding");
const config = require("./../../config.json");

populateDescriptionInfo = function () {
    if (ticket.payment.name == 'cashapp') {
        return `Send the **exact** amount of \`${ticket.product.price} ${config.PAYMENT_CURRENCY}\` to \`$${config.CASHAPP_USERNAME}\` on Cash App.\n\nFor the note, type the **exact** code below: \`\`\`${identifier}\`\`\``;
    } else if (ticket.payment.name == 'paypal') {
        return `Please send the **exact** amount of \`${ticket.product.price} ${config.PAYMENT_CURRENCY}\` to ${config.PAYPALME_LINK}.\n\nFor the note, type the **exact** code below: \`\`\`${identifier}\`\`\``;
    } else {
        venmoDescription = `Please send the **exact** amount of \`${ticket.product.price} ${config.PAYMENT_CURRENCY}\`  to \`@${config.VENMO_USERNAME}\` on Venmo.\n\nFor the note, type the **exact** code below: \`\`\`${identifier}\`\`\``;
        if (config.VENMO_4_DIGITS) {
            venmoDescription = venmoDescription + `\nIf Venmo asks for last 4 digits: \`${config.VENMO_4_DIGITS}\``;
        }
        return venmoDescription;
    }
}

const populatePaymentInstructionInfo = function () {
    return new EmbedBuilder()
        .setTitle(`You're purchasing the ${ticket.product.name} product using ${ticket.payment.friendlyName}`)
        .setDescription(populateDescriptionInfo())
        .setColor(config.MENU_COLOR)
}

const createPaymentInstructionPage = function () {
    page = {
        name: "payment-instructions",
        content: populatePaymentInstructionInfo(),
        rows: [new Row([new ButtonOption({
            customId: "try-payment-search",
            style: "SUCCESS",
            label: "Check for payment"
        }, async interaction => {
            interaction.deferUpdate();
            const checkForPayment = OnPaymentSent.bind(ticket);
            checkForPayment();
        }), new ButtonOption({
            customId: "cancel-transaction",
            style: "DANGER",
            label: "Cancel Transaction"
        }, async interaction => {
            interaction.deferUpdate();
            const cancelTransaction = OnTicketEnding.bind(null, ticket.channel, false);
            cancelTransaction();
        }), new ButtonOption({
            customId: "return-to-payment-selection",
            style: "SECONDARY",
            label: "Back"
        }, async interaction => {
            interaction.deferUpdate();
            const returnToPaymentSelect = OnProductSelect.bind(ticket, ticket.product.name);
            returnToPaymentSelect();
        })], RowTypes.ButtonMenu)]
    }
    return new Page(page.name, page.content, page.rows, ticket.pagesMap.size);
};

module.exports = { createPaymentInstructionPage };
