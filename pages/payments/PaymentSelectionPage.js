const { EmbedBuilder } = require("discord.js");
const { Row, RowTypes, ButtonOption } = require("discord.js-menu-buttons");
const config = require("../../config.json");
const { OnPaymentForProductSelected } = require("../../events/tribble/OnPaymentForProductSelected");
const { OnTOSAccept } = require("../../events/tribble/OnTOSAccept");

const populatePaymentSelectionPageButtons = function () {
    buttonRow = [];
    ticket = undefined;
    const showPaymentInstructions = OnPaymentForProductSelected.bind(ticket);
    if (config.USE_CASHAPP) {
        buttonRow.push(new ButtonOption({
            customId: "cashapp",
            style: "PRIMARY",
            label: "CashApp"
        }, async interaction => {
            interaction.deferUpdate();
            ticket.setPayment(ticket.paymentsMap.get("cashapp"));
            showPaymentInstructions();
        }));
    }
    if (config.USE_PAYPAL) {
        buttonRow.push(new ButtonOption({
            customId: "paypal",
            style: "PRIMARY",
            label: "PayPal"
        }, async interaction => {
            interaction.deferUpdate();
            ticket.setPayment(ticket.paymentsMap.get("paypal"));
            showPaymentInstructions();
        }));
    }
    if (config.USE_VENMO) {
        buttonRow.push(new ButtonOption({
            customId: "venmo",
            style: "PRIMARY",
            label: "Venmo"
        }, async interaction => {
            interaction.deferUpdate();
            ticket.setPayment(ticket.paymentsMap.get("venmo"));
            showPaymentInstructions();
        }));

    }
    if (config.SHOP_MODE) {
        buttonRow.push(new ButtonOption({
            customId: "back-to-product-selection",
            style: "SECONDARY",
            label: "Back"
        }, async interaction => {
            interaction.deferUpdate();
            const returnToProductSelection = OnTOSAccept.bind(menu, config.SHOP_MODE);
            returnToProductSelection();
        }));
    }
    return buttonRow;
}

module.exports = {
    name: "payment-selection",
    content: new EmbedBuilder()
        .setTitle("Select a Payment Method")
        .setColor(config.MENU_COLOR)
        .setDescription("Select one of the payment methods offered below:"),
    rows: [new Row(populatePaymentSelectionPageButtons(), RowTypes.ButtonMenu)]
};