

//TODO: Clean up the liberal use of renderAll() so that it's only used when necessary

//TODO: Add reconnection handling for players in groups and in the wilderness.


$(function () {

    // Declare a proxy to reference the hub.
    this.gameProxy = $.connection.gameHub;

    var game = Object.create(Game);
    game.initialize(this.gameProxy);

    var account = Object.create(Account);
    account.initialize(this.gameProxy);

    // Start the connection
    $.connection.hub.start();
});