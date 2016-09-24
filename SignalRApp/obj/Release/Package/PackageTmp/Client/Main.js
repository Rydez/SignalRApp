$(function () {
    // Declare a proxy to reference the hub.
    var gameProxy = $.connection.gameHub;

    // PlayeyManager contains server calling functions
    var playerManager = Object.create(PlayerManager);
    playerManager.initialize(gameProxy);

    

    // Start the connection.
    $.connection.hub.start().done(function () {
        // Get and set the players name
        var name = prompt('Enter name:', '');
        gameProxy.server.namePlayer(name);

        // Sync The new client with other clients
        gameProxy.server.syncPlayers();

        $(document).keydown(function (event) {
            gameProxy.server.movePlayer(event.which);
        });
    });
});