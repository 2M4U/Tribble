const { google: Google } = require('googleapis');
const config = require('../../config.json');
const Logger = require('leekslazylogger');

const log = new Logger({ name: "Tribble", keepSilent: true });

const searchForPayment = async function searchForPayment(payment, code, providerInfo) {
    let valid;
    let price;
    let fromAddress = providerInfo.email;
    let query = providerInfo.messageQuery;
    if (payment == 'venmo' || payment == 'paypal') {
        price = ticket.product.price;
    } else if (payment == 'cashapp') {
        if (ticket.product.price.endsWith('.00')) {
            price = ticket.product.price.substring(0, ticket.product.price.length - 3);
        } else {
            price = ticket.product.price;
        }
    }
    let auth = new Google.auth.OAuth2(config.GOOGLE_CLIENT_ID, config.GOOGLE_CLIENT_SECRET)
    auth.setCredentials({ refresh_token: config.GOOGLE_REFRESH_TOKEN });
    const gmail = Google.gmail({ version: 'v1', auth });
    const emails = (await gmail.users.messages.list({
        userId: 'me',
        q: `${query} ${code} from:${fromAddress}`
    })).data.messages;
    if (emails != undefined) {
        if (emails.length == 1) {
            log.info("An email was found with the searched parameters.");
            await gmail.users.messages.get({
                userId: 'me',
                id: `${emails[0].id}`
            }).then(email => {
                let subject = email.data.payload.headers.find(object => object.name === 'Subject').value;
                if (payment == "cashapp") {
                    if (subject.match(`^[^$]*${query} (\\${price}) for (${code})$`).length == 3) {
                        // user sent correct amount + didn't fake note, all three match groups matched
                        valid = true;
                    } else {
                        // user either didn't send correct amount or faked note
                        valid = false;
                    }
                } else {
                    // venmo/paypal
                    if (subject.includes`${code}`) {
                        // malicious email, venmo/paypal doesn't send the note in the subject
                        valid = false;
                    } else if (subject.includes(`${query} ${price}`)) {
                        // TODO: check body
                        valid = true;
                    }
                }
            });
        } else if (emails.length < 1) {
            log.warn("No emails were found using the search. Payment labeled as invalid.");
            valid = false;
        } else {
            log.warn("Multiple emails were found during the search. Payment is labeled invalid for safety.")
            valid = false;
        }
    } else {
        valid = false;
    }
    return valid;
};

async function grantAccess(client, user, roleId) {
    try {
        role = client.guilds.cache.get(config.GUILD_ID).roles.cache.get(roleId);
        user.roles.add(role);
    } catch (error) {
        log.error(error);
    }
}

const PerformPaymentSearch = async () => {
    try {
        ticket.menu.setPage(ticket.pagesMap.get("payment-searching"));
        await searchForPayment(ticket.payment.name, ticket.identifer, ticket.payment).then((found) => {
            if (found) {
                ticket.paymentFound = found;
                grantAccess(ticket.client, ticket.user, config.PURCHASED_ROLE_ID);
            }
        });
    } catch (error) {
        log.error(error);
    }
};

module.exports = { PerformPaymentSearch };
