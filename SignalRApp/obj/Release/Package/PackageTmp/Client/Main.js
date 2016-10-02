$(function () {
    var gameConstants = {
        // In units of tiles
        mapWidth: 16,
        mapHeight: 46,

        // Indices to determine starting pos
        xStartIndex: 6,
        yStartIndex: 0
    };

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
    //TODO//
    // Remove the mapfabric initialization from
    // mapsignal and put both into a map manager
    var mapSignal = Object.create(MapSignal);
    mapSignal.initialize(gameProxy, gameCanvas, gameConstants);

    //Map fabric
    var mapFabric = Object.create(MapFabric);
    mapFabric.initialize(gameCanvas, gameConstants);
    mapFabric.createMap();

    //TODO//
    // Should probably remove cursor from
    //player manager and use getters to initiate it

    // Initialize the player stuff
    var playerManager = Object.create(PlayerManager);
    playerManager.initialize(gameProxy, gameCanvas, gameConstants,
                             mapFabric.getStructureIndices(),
                             mapFabric.getStructureObjects());


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