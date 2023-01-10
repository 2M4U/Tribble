class Ticket {
    user;
    menu;
    channel;
    client;
    identifier;
    pagesMap;
    productsMap;
    paymentsMap;
    product;
    payment;
    paymentFound = false;
    constructor(user, menu, channel, client, identifier, pagesMap, productsMap, paymentsMap) {
        this.user = user;
        this.menu = menu;
        this.channel = channel;
        this.client = client;
        this.identifier = identifier;
        this.pagesMap = pagesMap;
        this.productsMap = productsMap;
        this.paymentsMap = paymentsMap;
    }
    setPayment(payment) {
        this.payment = payment;
    }
    setProduct(product) {
        this.product = product;
    }
}

module.exports = Ticket;