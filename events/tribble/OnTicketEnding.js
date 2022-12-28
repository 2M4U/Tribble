const enmap = require('enmap');
const settings = new enmap({ name: "settings", autoFetch: true, cloneLevel: "deep", fetchAll: true });

const OnTicketEnding = async (channel, isFinishing) => {
    if (ticket.menu != null) {
        // Race condition
        // The issue here is that when the menu tries to clear the buttons, the menu may already be deleted.
        // Skipping clearing buttons solves this, but I think the solution would be to return a promise from the stop method once the buttons have been cleared.
        ticket.menu.stopWithoutClearingButtons();
        ticket.menu.delete();
    }
    if (channel) {
        channel.delete();
    }
    if (isFinishing) {
        settings.delete(`${ticket.user.id}`);
    }
}

module.exports = { OnTicketEnding };