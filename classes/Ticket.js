class Ticket {
    user;
    menu;
    identifier;
    pagesMap;
    constructor(user, menu, identifier, pagesMap) {
        this.user = user;
        this.menu = menu;
        this.identifier = identifier;
        this.pagesMap = pagesMap;
    }
    setMenu(menu) {
        this.menu = menu;
    }
}

module.exports = Ticket;