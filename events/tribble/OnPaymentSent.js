const { EmbedBuilder, ButtonStyle } = require("discord.js");
const { ButtonOption, Row, RowTypes, Page } = require("discord.js-menu-buttons");
const { PerformPaymentSearch } = require('./PaymentSearchEvent');
const { OnTicketEnding } = require('../tribble/OnTicketEnding');
const config = require('../../config.json');

const createResultsPage = async function () {
    page = {
        name: "payment-results",
        content: new EmbedBuilder()
            .setTitle(ticket.paymentFound ? config.SUCCESSFUL_PAYMENT_TITLE : config.UNSUCCESSFUL_PAYMENT_TITLE)
            .setDescription(ticket.paymentFound ? config.SUCCESSFUL_PAYMENT_DESC : config.UNSUCCESSFUL_PAYMENT_DESC),
        rows: [new Row(await populateButtonRow(), RowTypes.ButtonMenu)]
    }
    return new Page(page.name, page.content, page.rows, ticket.pagesMap.size);
};

const populateButtonRow = async function () {
    buttonRow = [];
    if (ticket.paymentFound) {
        buttonRow.push(new ButtonOption({
            customId: "payment-search-success-close",
            label: "Close Ticket",
            style: ButtonStyle.Success,
        }, async interaction => {
            interaction.deferUpdate();
            const endTicket = OnTicketEnding.bind(ticket, interaction.channel, true);
            endTicket();
        }));
    } else {
        buttonRow.push(new ButtonOption({
            customId: "payment-search-fail-search-again",
            label: "Check for payment again",
            style: ButtonStyle.Primary,
        }, async interaction => {
            interaction.deferUpdate();
            const retrySearch = PerformPaymentSearch.bind(ticket);
            retrySearch();
            goToResultsPage();
        }));
        buttonRow.push(new ButtonOption({
            customId: "payment-search-fail-back-to-instructions",
            label: "Go back to instructions",
            style: ButtonStyle.Secondary,
        }, async interaction => {
            interaction.deferUpdate();
            ticket.menu.setPage(ticket.pagesMap.get("payment-instructions"));
        }));
    }
    return buttonRow;
}


const addResultsPageToMenu = async function () {
    resultsPage = await createResultsPage();
    if (ticket.pagesMap.get("payment-results")) {
        index = ticket.pagesMap.get("payment-results");
        ticket.menu.pages[index] = resultsPage;
        ticket.pagesMap.set("payment-results", index);
    } else {
        ticket.menu.pages[ticket.pagesMap.size] = resultsPage;
        ticket.pagesMap.set("payment-results", ticket.pagesMap.size);
    }
}

const goToResultsPage = async function () {
    ticket.menu.setPage(ticket.pagesMap.get("payment-results"));
}

const OnPaymentSent = async () => {
    const performSearch = PerformPaymentSearch.bind(ticket);
    await performSearch();
    await addResultsPageToMenu();
    await goToResultsPage();
}

module.exports = { OnPaymentSent, goToResultsPage };
