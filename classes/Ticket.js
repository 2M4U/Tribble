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
    paymentFound;
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
    setMenu(menu) {
        this.menu = menu;
    }
    setPayment(payment) {
        this.payment = payment;
    }
    setProduct(product) {
        this.product = product;
    }
}

module.exports = Ticket;