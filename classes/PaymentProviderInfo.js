class PaymentProviderInfo {
    name;
    email;
    paymentString;
    messageQuery;
    constructor(name, email, paymentString, messageQuery) {
        this.name = name;
        this.email = email;
        this.paymentString = paymentString;
        this.messageQuery = messageQuery;
    }
}

module.exports = PaymentProviderInfo;
