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

dev = false; // Change this if you are contributing to Tribble.
const config = require(dev ? './dev.json' : './config.json');

const fs = require('node:fs');
const path = require('node:path');

const { Product, PaymentProviderInfo, Ticket } = require('./classes');
const ProductsPage = require('./pages/products/ProductsPage');
const TOSPage = require('./pages/other/TOSPage');

const { Menu, setClient, Row, RowTypes, ButtonOption } = require('discord.js-menu-buttons');
const { Client, GatewayIntentBits, PermissionsBitField, Events, Collection, ChannelType } = require('discord.js');
const { google: Google } = require('googleapis');
const Logger = require('leekslazylogger');

const log = new Logger({ name: "Tribble", keepSilent: true });
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent], autoReconnect: true, partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const enmap = require('enmap');
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
const productMap = new Map();
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

    setClient(client);
    client.login(config.DISCORD_TOKEN);
    auth = new Google.auth.OAuth2(config.GOOGLE_CLIENT_ID, config.GOOGLE_CLIENT_SECRET).setCredentials({ refresh_token: config.GOOGLE_REFRESH_TOKEN });
    initPageLayout();
}

init();

function initPageLayout() {
    // Sets up the pages that will be in each ticket menu.
    // Since these aren't expected to change during the life of the program, it's best to set it up once and create objects based off of it.
    if (config.ENABLE_TOS) {
        // Terms page
        pages.push(TOSPage);
        pagesMap.set("TOS", pagesMap.size);
    }
    if (config.SHOP_MODE) {
        pages.push(ProductsPage);
        pagesMap.set("products", pagesMap.size);
    }
    for (var i = 0; i < config.ITEMS_TO_SELL; i++) {
        // Product(s) setup
        productMap.set(config.ITEMS_TO_SELL[i], new Product(config.ITEMS_PRICES[i], config.ITEMS_TO_SELL[i], config.PRODUCTS_EMOJIS[i]));
    }
}

function createPaymentMenusForProduct(selectedProduct, identifier, channel) {
    providerInfo = [];
    providerInfoForProduct = [
        {
            name: `cashapp`,
            email: `cash@square.com`,
            // messageQuery checks to see if it ends in .00, if it does truncate, otherwise keep the exact decimal
            paymentAmount: `${selectedProduct.price.endsWith('.00') ? selectedProduct.price.substring(0, selectedProduct.price.length - 3) : selectedProduct.price}`,
            messageQuery: `sent you`
        },
        {
            name: `venmo`,
            email: `venmo@venmo.com`,
            paymentAmount: `${selectedProduct.price}`,
            messageQuery: `paid you`
        },
        {
            name: `paypal`,
            email: `service@paypal.com`,
            paymentAmount: `${selectedProduct.price}`,
            messageQuery: ``
        }
    ];
    for (provider in providerInfoForProduct) {
        thisProvider = providerInfoForProduct[provider];
        thisInfo = new PaymentProviderInfo(thisProvider.name, thisProvider.email, thisProvider.paymentAmount, thisProvider.messageQuery);
        providerInfo.push(thisInfo);
    }
    paymentMenus = [
        {
            name: 'cashapp',
            content: new Discord.MessageEmbed({
                title: `You\'re purchasing the ${selectedProduct.name} product using Cash App.`,
                description: `Send the **exact** amount of \`${selectedProduct.price} ${config.PAYMENT_CURRENCY}\` to \`$${config.CASHAPP_USERNAME}\` on Cash App.\n\n**__DO NOT FORGET TO SEND THE CODE IN THE NOTE.__**\n\nFor the note, type the **exact** code below: \`\`\`${identifier}\`\`\``,
                color: config.MENU_COLOR,
                fields: [
                    {
                        name: "Return to payment selection",
                        value: "◀",
                        inline: true
                    },
                    {
                        name: "Payment has been sent",
                        value: "✅",
                        inline: true
                    },
                    {
                        name: "Cancel transaction",
                        value: "❌",
                        inline: true
                    }
                ]
            }),
            rows: [
                new Row([new ButtonOption({
                    customId: "123",
                    style: "PRIMARY",
                    label: "✅"
                },
                    (interaction) => {
                        interaction.deferUpdate();
                        onPaymentSent;
                    })])
            ]
        },
        {
            name: 'venmo',
            content: new Discord.MessageEmbed({
                title: `You\'re purchasing the ${selectedProduct.name} product using Venmo.`,
                description: `Please send the **exact** amount of \`${selectedProduct.price} ${config.PAYMENT_CURRENCY}\`  to \`@${config.VENMO_USERNAME}\` on Venmo.\n\n**__DO NOT FORGET TO SEND THE CODE IN THE NOTE.__**\n\nFor the note, type the **exact** code below: \`\`\`${identifier}\`\`\`\nIf Venmo asks for last 4 digits: \`${config.VENMO_4_DIGITS}\``,
                color: config.MENU_COLOR,
                fields: [
                    {
                        name: "Return to payment selection",
                        value: "◀",
                        inline: true
                    },
                    {
                        name: "Payment has been sent",
                        value: "✅",
                        inline: true
                    },
                    {
                        name: "Cancel transaction",
                        value: "❌",
                        inline: true
                    }
                ]
            }),
            reactions: {
                '◀': 'payment',
                '✅': onPaymentSent,
                '❌': onTicketEnding.bind(null, channel, false)
            }
        },
        {
            name: 'paypal',
            content: new Discord.MessageEmbed({
                title: `You\'re purchasing the ${selectedProduct.name} product using PayPal.`,
                description: `Please send the **exact** amount of \`${selectedProduct.price} ${config.PAYMENT_CURRENCY}\` to ${config.PAYPALME_LINK}.\n\n**__DO NOT FORGET TO SEND THE CODE IN THE NOTE.__**\n\nFor the note, type the **exact** code below: \`\`\`${identifier}\`\`\``,
                color: config.MENU_COLOR,
                fields: [
                    {
                        name: "Return to payment selection",
                        value: "◀",
                        inline: true
                    },
                    {
                        name: "Payment has been sent",
                        value: "✅",
                        inline: true
                    },
                    {
                        name: "Cancel transaction",
                        value: "❌",
                        inline: true
                    }
                ]
            }),
            reactions: {
                '◀': 'payment',
                '✅': onPaymentSent,
                '❌': onTicketEnding.bind(null, channel, false)
            }
        }
    ];
    for (payment in paymentMenus) {
        thisPayment = paymentMenus[payment];
        menus.push(thisPayment)
        pagesMap.set(thisPayment.name, (pagesMap.size).toString())
    }
    return paymentMenus;
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
            log.info("Ticket button pressed.");
            if (id = settings.get(`${interaction.user.id}`)) {
                if (previousChannel = interaction.message.guild.channels.cache.find(channel => channel.name === `ticket-${id}`)) {
                    previousChannel.delete();
                    log.info("User's previous ticket closed.");
                }
            }
            identifier = Math.floor(100000 + Math.random() * 900000);
            channel_name = `ticket-${identifier}`;
            interaction.guild.channels.create({
                name: channel_name,
                type: ChannelType.GuildText,
                parent: config.TICKET_CATEGORY_ID
            }).then(async channel => {
                buyer = interaction.guild.members.cache.get(interaction.user.id);
                settings.set(`${buyer.id}`, `${identifier}`);
                menu = new Menu(channel, buyer.id, pages, 300000);
                ticket = new Ticket(interaction.user, menu, identifier, pagesMap);
                menu.start();
            });
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

client.on('messageReactionAdd', async (reaction, user) => {
    var ticket = `ticket`;
    reaction.message.guild.channels.create(ticket, {
        parent: config.TICKET_CATEGORY_ID,
        permissionOverwrites: [{
            id: user.id,
            allow: ["VIEW_CHANNEL"],
            deny: ["SEND_MESSAGES"]
        },
        {
            id: reaction.message.guild.roles.everyone,
            deny: ["VIEW_CHANNEL"]
        }
        ],
        type: 'text'
    }).then(async channel => {
        ticketMember = reaction.message.guild.members.cache.get(user.id)
        identifier = identifier;
        settings.set(`${user.id}`, `${identifier}`);
        // configure paymentFields in menu
        var paymentFields = [{
            name: "Cash App",
            value: "🇨",
            inline: true
        },
        {
            name: "Venmo",
            value: "🇻",
            inline: true
        },
        {
            name: "PayPal",
            value: "🇵",
            inline: true
        }]
        var paymentReacts = {
            '🇨': async () => {
                selectedPayment = "cashapp";
                menu.setPage(pagesMap.get("cashapp"));
            },
            '🇻': async () => {
                selectedPayment = "venmo";
                menu.setPage(pagesMap.get("venmo"));
            },
            '🇵': async () => {
                selectedPayment = "paypal";
                menu.setPage(pagesMap.get("paypal"));
            },
            '◀': async () => {
                selectedPaymentProduct = null;
                menu.setPage(pagesMap.get("products"));
            },
            '❌': onTicketEnding.bind(null, channel, false)
        }
        if (!config.SHOP_MODE) {
            delete paymentReacts['◀'];
        }
        // NB: There may be a cleaner way to do this
        if (!config.USE_CASHAPP) {
            paymentFields.splice(paymentFields.findIndex(({ name }) => name === "Cash App"), 1);
            delete paymentReacts['🇨'];
        }
        if (!config.USE_VENMO) {
            paymentFields.splice(paymentFields.findIndex(({ name }) => name === "Venmo"), 1);
            delete paymentReacts['🇻'];
        }
        if (!config.USE_PAYPAL) {
            paymentFields.splice(paymentFields.findIndex(({ name }) => name === "PayPal"), 1);
            delete paymentReacts['🇵'];
        }
        if (config.SHOP_MODE) {
            for (var i = 0; i <= productsNames.length; i++) {
                product = productsNames[i];
                if (i == productsNames.length) {
                    productMenuReacts['❌'] = onTicketEnding.bind(null, channel, false);
                    break;
                }
                let thisReact = productsReacts[i];
                productMenuReacts[thisReact] = async () => {
                    indexOfReact = productsReacts.indexOf(thisReact);
                    selectedProduct = productMap.get(productsNames[indexOfReact]);
                    menu.setPage(pagesMap.get("payment"));
                    menu.addPages(createPaymentMenusForProduct(selectedProduct, identifier, channel));
                }
            }
        }
        // const productsMenu = {
        //     name: 'products',
        //     content: new Discord.MessageEmbed({
        //         title: config.PRODUCTS_TITLE,
        //         color: config.MENU_COLOR,
        //         description: config.PRODUCTS_DESCRIPTION,
        //         fields: productFields,
        //     }),
        //     reactions: productMenuReacts
        // }
        const paymentsMenu = {
            name: 'payment',
            content: new Discord.MessageEmbed({
                title: 'Select a Payment Method',
                color: config.MENU_COLOR,
                description: 'React with the payment method you are using to make the purchase.\n\n',
                fields: paymentFields
            }),
            reactions: paymentReacts
        }
        // if (config.ENABLE_TOS) {
        //     menus.push(new TOSMenu(menu, menusMap).page);
        // }
        if (config.SHOP_MODE) {
            populateButtons();
            menus.push(new ProductsMenu())
        }
        menus.push(paymentsMenu)
        if (!config.SHOP_MODE) {
            selectedProduct = productMap.values().next().value; // gets the first product in map
            createPaymentMenusForProduct(selectedProduct, identifier, channel);
        }
        const pages = [
            {
                name: 'confirmation',
                color: config.MENU_COLOR,
                content: new Discord.MessageEmbed({
                    title: `Checking for payment...`,
                    description: 'Checking for your payment...',
                })
            },
            {
                name: 'fail',
                color: config.MENU_COLOR,
                content: new Discord.MessageEmbed({
                    title: `Payment unsuccessful`,
                    description: 'No payment detected. Try to check for the payment again after you\'ve sent it.',
                    fields: [
                        {
                            name: "Return to payment instructions",
                            value: "◀",
                            inline: true
                        },
                        {
                            name: "Check for payment again",
                            value: "🔄",
                            inline: true
                        },

                    ]
                }),
                reactions: {
                    '◀': async () => {
                        switch (selectedPayment) {
                            case "cashapp":
                                menu.setPage(pagesMap.get("cashapp"));
                                break;
                            case "venmo":
                                menu.setPage(pagesMap.get("venmo"));
                                break;
                            case "paypal":
                                menu.setPage(pagesMap.get("paypal"));
                                break;
                        }
                    },
                    '🔄': onPaymentSent
                }
            },
            {
                name: 'success',
                color: config.MENU_COLOR,
                content: new Discord.MessageEmbed({
                    title: `Payment Successful`,
                    description: `Your payment has been received! You have been granted access to the \`${purchasedRole.name}\` role. Thank you!`,
                    fields: [
                        {
                            name: "Close ticket",
                            value: "✅",
                            inline: true
                        }
                    ]
                }),
                reactions: {
                    '✅': onTicketEnding.bind(null, channel, true)
                }
            }
        ]
        for (pageIndex in pages) {
            menus.push(pages[pageIndex]);
        }
        for (menu in menus) {
            pagesMap.set(menus[menu].name, menu)
        }
        menu = new Menu(channel, user.id, menus, 300000);
        menu.start();
        channel.send(`<@${user.id}>, your unique ticket code is \`${identifier}\`. **DO NOT FORGET TO SEND THE CODE.**`)
    }).catch(log.error)
})