const OnTicketEnding = async (channel, isFinishing) => {
    if (menu != null) {
        menu.stop();
        menu.delete();
    }
    if (channel) {
        channel.delete();
    }
    if (isFinishing) {
        settings.delete(`${user.id}`);
    }
}

module.exports = { OnTicketEnding };