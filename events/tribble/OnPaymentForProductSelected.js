const { createPaymentInstructionPage } = require("../../pages/payments/PaymentInstructionsPage");

const OnPaymentForProductSelected = async function () {
    existingPaymentInstructionIndex = ticket.menu.pages.findIndex(page => page.name === 'payment-instructions')
    if (existingPaymentInstructionIndex != -1) {
        // existing index, delete old
        ticket.menu.deletePage(existingPaymentInstructionIndex);
        ticket.pagesMap.delete('payment-instructions');
    }
    const createPaymentPage = createPaymentInstructionPage.bind(ticket);
    paymentPage = createPaymentPage();
    ticket.menu.addPages(paymentPage);
    ticket.pagesMap.set('payment-instructions', paymentPage.index);
    ticket.menu.setPage(ticket.pagesMap.get('payment-instructions'));

}

module.exports = { OnPaymentForProductSelected };
