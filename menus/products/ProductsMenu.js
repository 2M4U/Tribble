const config = require('../../config.json');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { Row, ButtonOption, RowTypes } = require('discord.js-menu-buttons');

buttons = []
const PopulateProductsMenuButtons = function () {
    buttonRow = [];
    for (var i = 0; i < config.ITEMS_TO_SELL.length; i++) {
        product = config.ITEMS_TO_SELL[i];
        productButtonEmoji = config.PRODUCTS_REACTS[i];
        buttonRow[i] = new ButtonOption({
            customId: `${product}`,
            style: "SECONDARY",
            label: `${productButtonEmoji}`
        }, (interaction) => {
            console.log("Test");
        });
    }
    return buttonRow;
}

const PopulateProductsMenuFields = function () {
    productFields = [];
    for (var i = 0; i < config.ITEMS_TO_SELL.length; i++) {
        var field = {
            "name": config.ITEMS_TO_SELL[i],
            "value": config.ITEMS_DESCRIPTIONS[i],
            "inline": true
        }
        productFields[i] = field;
    }
    return productFields;
}

class ProductsMenu {
    page;
    constructor() {
        PopulateProductsMenuButtons();
        page = {
            name: "products",
            content: new EmbedBuilder()
                .setTitle(config.PRODUCTS_TITLE)
                .setColor(config.PANEL_COLOR)
                .setDescription(config.PRODUCTS_DESCRIPTION)
                .setFields(PopulateProductsMenuFields()),
            rows: [new Row(PopulateProductsMenuButtons(), RowTypes.ButtonMenu)]
        };
    }
}

// TODO: Working on setting up modules for each menu to architect codebase.
// Need to make it where we can export the object and dynamically create product buttons based on items in shop

module.exports = { ProductsMenu };