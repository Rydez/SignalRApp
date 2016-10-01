$(function () {


    // Reference the canvas
    var gameCanvas = new fabric.StaticCanvas('game-canvas');
    gameCanvas.renderOnAddRemove = false;
    gameCanvas.stateful = false;

    //Canvas width is equal to:
    // NumTiles*TileWidth - 0.5*TileWidth
    gameCanvas.setWidth(1240);
    //Canvas height is equal to:
    // 0.5*TileHeight*(NumTiles - 1)
    gameCanvas.setHeight(900);
    gameCanvas.backgroundColor = "white";

    // Declare a proxy to reference the hub.
    var gameProxy = $.connection.gameHub;

    // MapSignal 
    var mapSignal = Object.create(MapSignal);
    mapSignal.initialize(gameProxy, gameCanvas);

    // Initialize the player stuff
    var playerManager = Object.create(PlayerManager);
    playerManager.initialize(gameProxy, gameCanvas);


    // Start the connection.
    $.connection.hub.start().done(function () {
        // Get and set the players name
        var name = prompt('Enter name:', '');
        gameProxy.server.namePlayer(name);

        // Sync The new client with other clients
        gameProxy.server.syncPlayers();

        $(document).keydown(function (event) {
            playerManager.controlPlayer(event.which);
        });
    });
});