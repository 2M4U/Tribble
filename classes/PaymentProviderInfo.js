class PaymentProviderInfo {
    name;
    friendlyName;
    email;
    paymentString;
    messageQuery;
    constructor(name, friendlyName, email, paymentString, messageQuery) {
        this.name = name;
        this.friendlyName = friendlyName;
        this.email = email;
        this.paymentString = paymentString;
        this.messageQuery = messageQuery;
    }
}

module.exports = PaymentProviderInfo;
