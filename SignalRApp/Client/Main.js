



$(function () {

    // Declare a proxy to reference the hub.
    this.gameProxy = $.connection.gameHub;

    var game = Object.create(Game);
    game.initialize(this.gameProxy);

    var account = Object.create(Account);
    account.initialize(this.gameProxy);

    // Start the connection
    $.connection.hub.start().done(function () {

        //TODO: remove this promise but keep start() I think

        //game.start();

    });
});