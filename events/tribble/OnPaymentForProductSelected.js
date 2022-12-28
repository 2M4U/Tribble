const { createPaymentInstructionPage } = require("../../pages/payments/PaymentInstructionsPage");

const OnPaymentForProductSelected = async function () {
    const createPaymentPage = createPaymentInstructionPage.bind(ticket);
    paymentPage = createPaymentPage();
    // NB: adding a new page isn't officially supported - this is a bit hacky.
    // Here we're dynamically creating the payment-instructions page.
    if (ticket.pagesMap.get("payment-instructions")) {
        index = ticket.pagesMap.get("payment-instructions");
        ticket.menu.pages[index] = paymentPage;
        ticket.pagesMap.set("payment-instructions", index)
        ticket.menu.setPage(index);
    } else {
        ticket.menu.pages[ticket.pagesMap.size] = paymentPage;
        ticket.pagesMap.set("payment-instructions", ticket.pagesMap.size);
        ticket.menu.setPage(ticket.pagesMap.get("payment-instructions"))
    }
}

module.exports = { OnPaymentForProductSelected };