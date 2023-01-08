const OnProductSelect = async (productName) => {
    ticket.setProduct(ticket.productsMap.get(productName));
    menu.setPage(ticket.pagesMap.get(`payment-selection`));
};

module.exports = { OnProductSelect };
