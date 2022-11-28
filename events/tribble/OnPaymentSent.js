const { google: Google } = require('googleapis');

exports.CheckForEmail = async function checkForEmail(auth, payment, code, providerInfo) {
    let valid;
    let fromAddress = providerInfo.find(object => object.name === payment).email;
    let query = providerInfo.find(object => object.name === payment).messageQuery;
    let price = providerInfo.find(object => object.name === payment).paymentString;
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
        } else if (emails.length > 1 || emails.length < 1) {
            log.warn("Either no email was found or multiple emails were found with the provided code.");
            valid = false;
        }
    } else {
        valid = false;
    }
    return valid;
}

exports.OnPaymentSent = async () => {
    try {
        menu.setPage(menusMap.get("confirmation"));
        checkForEmail(auth, selectedPayment, identifier, providerInfo).then((result) => {
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
