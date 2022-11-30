const { Page } = require("discord.js-menu-buttons");
const { createPaymentInstructionPage } = require("../../pages/payments/PaymentInstructionsPage");

const OnPaymentForProductSelected = function () {
    const createPaymentPage = createPaymentInstructionPage.bind(ticket);
    paymentPage = createPaymentPage();
    // NB: adding a new page isn't officially supported - this is a bit hacky.
    // Here we're dynamically creating the payment-instructions page.
    ticket.menu.pages[ticket.pagesMap.size] = paymentPage;
    ticket.pagesMap.set("payment-instructions", ticket.pagesMap.size);
    ticket.menu.setPage(ticket.pagesMap.get("payment-instructions"))
}

module.exports = { OnPaymentForProductSelected };