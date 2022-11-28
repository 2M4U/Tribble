class Product {
    // TODO: add configuration for specific payment methods for specific products
    // TODO: add role field for custom role for each product purchased
    price;
    name;
    react;
    payments;
    constructor(price, name, react) {
        this.price = price;
        this.name = name;
        this.react = react;
    }
}

module.exports = Product;
