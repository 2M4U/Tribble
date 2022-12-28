class PaymentProviderInfo {
    name;
    friendlyName;
    email;
    messageQuery;
    constructor(name, friendlyName, email, messageQuery) {
        this.name = name;
        this.friendlyName = friendlyName;
        this.email = email;
        this.messageQuery = messageQuery;
    }
}

module.exports = PaymentProviderInfo;
