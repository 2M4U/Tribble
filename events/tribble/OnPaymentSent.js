const { google: Google } = require('googleapis');

const searchForPayment = async function searchForPayment(auth, payment, code, providerInfo) {
    let valid;
    let fromAddress = providerInfo.email;
    let query = providerInfo.messageQuery;
    let price = providerInfo.paymentString;
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
                switch (payment) {
                    case 'cashapp':
                        if (subject.match(`^[^$]*${query} (\\${price}) for (${code})$`).length == 3) {
                            // user sent correct amount + didn't fake note, all three match groups matched
                            valid = true;
                        } else {
                            // user either didn't send correct amount or faked note
                            valid = false;
                        }
                        break;
                    default:
                        // venmo/paypal
                        if (subject.includes`${code}`) {
                            // malicious email, venmo/paypal doesn't send the note in the subject
                            valid = false;
                        } else if (subject.includes(`${query} ${price}`)) {
                            // TODO: check body
                            valid = true;
                        }
                        break;
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
}

const OnPaymentSent = async () => {
    try {
        // TODO: Finish up payment logic
        menu.setPage(ticket.pagesMap.get("payment-searching"));
        searchForPayment(auth, ticket.payment.name, ticket.identifier, ticket.payment).then((result) => {
            if (menu && result) {
                menu.setPage(menusMap.get("success"));
                ticketMember.roles.add(purchasedRole).catch(log.error);
            } else if (menu) {
                menu.setPage(menusMap.get("fail"));
            } else {
                return;
            }
        })
    } catch (error) {
        log.error(error)
    }
}

module.exports = { OnPaymentSent };
