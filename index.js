/**
 *
 *  @name Tribble
 *  @author Dylan Bolger (FivePixels)
 *  @license MIT
 *
 * Tribble Copyright (©) 2022 Dylan Bolger (FivePixels)
 *
 * This is free software, and you are welcome to redistribute it
 * under certain conditions. See the included LICENSE file for details.
 *
 */
const config = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

const { Product, PaymentProviderInfo, Ticket } = require('./classes');
const ProductsPage = require('./pages/products/ProductsPage');
const TOSPage = require('./pages/other/TOSPage');

const { Menu, setClient } = require('discord.js-menu-buttons');
const { Client, GatewayIntentBits, PermissionsBitField, Events, Collection, ChannelType } = require('discord.js');
const Logger = require('leekslazylogger');

const log = new Logger({ name: "Tribble", keepSilent: true });
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent], autoReconnect: true, partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const enmap = require('enmap');
const PaymentSelectionPage = require('./pages/payments/PaymentSelectionPage');
const PaymentCheckingPage = require('./pages/payments/PaymentSearchingPage');
client.commands = new Collection();

function initCommands() {
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}
initCommands();

const pagesMap = new Map();
const productsMap = new Map();
const paymentsMap = new Map();
const pages = [];

const settings = new enmap({ name: "settings", autoFetch: true, cloneLevel: "deep", fetchAll: true });

config_keys = ['DISCORD_TOKEN', 'GUILD_ID', 'TICKET_CATEGORY_ID', 'PURCHASED_ROLE_ID', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN', 'SHOP_MODE', 'ITEMS_TO_SELL', 'ITEMS_PRICES', 'ITEMS_DESCRIPTIONS', 'PAYMENT_CURRENCY', 'USE_CASHAPP', 'CASHAPP_USERNAME', 'USE_VENMO', 'VENMO_USERNAME', 'VENMO_4_DIGITS', 'USE_PAYPAL', 'PAYPALME_LINK', 'COMMAND_PREFIX', 'PRESENCE_ACTIVITY', 'PRESENCE_TYPE', 'PANEL_COLOR', 'PANEL_TITLE', 'PANEL_THUMBNAIL', 'PANEL_DESCRIPTION', 'PANEL_FOOTER', 'PANEL_BUTTON_EMOJI', 'ENABLE_TOS', 'TOS_COLOR', 'TOS_TITLE', 'TOS_DESCRIPTION', 'PRODUCTS_TITLE', 'PRODUCTS_DESCRIPTION', 'PRODUCTS_EMOJIS', 'SUCCESSFUL_PAYMENT_TITLE', 'SUCCESSFUL_PAYMENT_DESC']
for (key of config_keys) {
    if (!config.hasOwnProperty(key)) {
        log.error("Missing key in configuration: " + key + ". Please check your configuration.");
        process.exit(1);
    } else if (['DISCORD_TOKEN', 'GUILD_ID', 'TICKET_CATEGORY_ID', 'PURCHASED_ROLE_ID', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN'].includes(key)) {
        if (!config[key]) {
            log.error("Missing required value in configuration for key '" + key + "'. Please check your configuration.");
            process.exit(1);
        }
    }
}

function init() {
    productsNames = config.ITEMS_TO_SELL;
    productsDescriptions = config.ITEMS_DESCRIPTIONS;
    productsPrices = config.ITEMS_PRICES;
    productsReacts = config.PRODUCTS_EMOJIS;
    for (array_key of ["ITEMS_TO_SELL", "ITEMS_PRICES", "ITEMS_DESCRIPTIONS"]) {
        // Create arrays out of configuration's item(s) info
        config[array_key] = config[array_key].split(',');
    }

    if (!config.SHOP_MODE) {
        // Truncate items arrays to one item
        config.ITEMS_TO_SELL.length = 1;
        config.ITEMS_PRICES.length = 1;
        config.ITEMS_DESCRIPTIONS.length = 1;
    }

    if (config.USE_CASHAPP) {
        paymentsMap.set("cashapp", new PaymentProviderInfo("cashapp", "Cash App", "cash@square.com", "sent you"));
    }
    if (config.USE_PAYPAL) {
        paymentsMap.set("paypal", new PaymentProviderInfo("paypal", "PayPal", "service@paypal.com", ""));
    }
    if (config.USE_VENMO) {
        paymentsMap.set("venmo", new PaymentProviderInfo("venmo", "Venmo", "venmo@venmo.com", "paid you"));
    }

    setClient(client);
    client.login(config.DISCORD_TOKEN);
    initPageLayout();
}

init();

function initPageLayout() {
    // Sets up the pages that will be in each ticket menu.
    // Since these aren't expected to change during the life of the program, it's best to set it up once and create objects based off of it.
    for (var i = 0; i < config.ITEMS_TO_SELL.length; i++) {
        // Product(s) setup
        productsMap.set(config.ITEMS_TO_SELL[i], new Product(config.ITEMS_PRICES[i], config.ITEMS_TO_SELL[i], config.PRODUCTS_EMOJIS[i]));
    }
    if (config.ENABLE_TOS) {
        pages.push(TOSPage);
        pagesMap.set("TOS", pagesMap.size);
    }
    if (config.SHOP_MODE) {
        pages.push(ProductsPage);
        pagesMap.set("products", pagesMap.size);
    }
    if (paymentOptions = new Map([["cashapp", config.USE_CASHAPP], ["paypal", config.USE_PAYPAL], ["venmo", config.USE_VENMO]])) {
        // multiple payments
        if (Array.from(paymentOptions.values()).filter(option => option == true).length > 1) {
            pages.push(PaymentSelectionPage);
            pagesMap.set('payment-selection', pagesMap.size);
        }
    }
    pages.push(PaymentCheckingPage);
    pagesMap.set("payment-searching", pagesMap.size);
}

client.once(Events.ClientReady, () => {
    log.success(`Authenticated as ${client.user.tag}`);
    client.user.setPresence({ activity: { name: config.PRESENCE_ACTIVITY, type: config.PRESENCE_TYPE.toUpperCase() } });
    if (client.guilds.cache.get(config.GUILD_ID).members.me.permissions.has(PermissionsBitField.Flags.Administrator)) {
        log.success('Bot has the \'ADMINISTRATOR\' permission');
    } else {
        log.warn('Bot does not have \'ADMINISTRATOR\' permission');
    }
    purchasedRole = client.guilds.cache.get(config.GUILD_ID).roles.cache.get(config.PURCHASED_ROLE_ID);
});

client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isButton()) {
        if (interaction.customId === 'ticketCreate') {
            interaction.deferUpdate();
            log.info("Ticket button pressed.");
            createTicketAndStartMenu(interaction);
        }
    }

    if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`Error executing ${interaction.commandName}`);
            console.error(error);
        }
    }
});

async function createTicketAndStartMenu(interaction) {
    if (id = settings.get(`${interaction.user.id}`)) {
        if (previousChannel = interaction.message.guild.channels.cache.find(channel => channel.name === `ticket-${id}`)) {
            await previousChannel.delete();
            log.info("User's previous ticket closed.");
        }
    }
    identifier = Math.floor(100000 + Math.random() * 900000);
    channel_name = `ticket-${identifier}`;
    interaction.guild.channels.create({
        name: channel_name,
        type: ChannelType.GuildText,
        parent: config.TICKET_CATEGORY_ID,
        permissionOverwrites: [
            {
              id: interaction.guild.roles.Everyone,
              deny: [ViewChannel, SendMessages, ReadMessageHistory],
            },
            {
              id: interaction.user.id,
              allow: [ViewChannel, SendMessages, ReadMessageHistory],
            },
          ],
    }).then(async channel => {
        buyer = interaction.guild.members.cache.get(interaction.user.id);
        settings.set(`${buyer.id}`, `${identifier}`);
        menu = new Menu(channel, buyer.id, pages, 300000);
        ticket = new Ticket(interaction.member, menu, channel, client, identifier, pagesMap, productsMap, paymentsMap);
        menu.start();
        channel.send(`<@${buyer.id}>, your unique ticket code is ${identifier}.`)
    });
}
