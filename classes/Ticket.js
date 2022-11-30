class Ticket {
    user;
    menu;
    identifier;
    auth;
    pagesMap;
    productsMap;
    paymentsMap;
    product;
    payment;
    constructor(user, menu, identifier, pagesMap, productsMap, paymentsMap, auth) {
        this.user = user;
        this.menu = menu;
        this.identifier = identifier;
        this.pagesMap = pagesMap;
        this.productsMap = productsMap;
        this.paymentsMap = paymentsMap;
        this.auth = auth;
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