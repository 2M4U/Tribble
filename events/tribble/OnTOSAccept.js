const OnTOSAccept = async (isShopMode) => {
    if (isShopMode) {
        menu.setPage(ticket.pagesMap.get("products"))
    } else {
        menu.setPage(ticket.pagesMap.get("payment"));
    }
}

module.exports = { OnTOSAccept };