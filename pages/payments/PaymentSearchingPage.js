const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "payment-searching",
    content: new EmbedBuilder()
        .setTitle("Checking for payment...")
        .setDescription("Searching for a payment matching your information..."),
    rows: []
};