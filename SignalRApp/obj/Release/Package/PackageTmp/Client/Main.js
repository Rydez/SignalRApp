//MAJOR TODO//
// Should not use 'var _this = this;'
// so much. This should be used for functions
// within methods. But, on the surface scope
// of the method, 'this' shouyld refer to the
// object the method is being called on.

$(function () {

    //TODO//
    // Should probably move all magic
    // numbers to this object
    var gameConstants = {

        //TODO//
        // These need to be moved into 
        // appropriate locations. Currently
        // not being used. This may not be a good solution
        zIndezMap: 1,
        zIndexCursor: 2,
        zIndexPathTiles: 3,
    
        // In units of tiles
        mapWidth: 32,
        mapHeight: 92,

        // In units of pixels
        tileWidth: 80,
        tileHeight: 40,

        // Indices to determine starting pos
        xStartIndex: 6,
        yStartIndex: 0
    };

    // Declare a proxy to reference the hub.
    var gameProxy = $.connection.gameHub;

    var canvasManager = Object.create(CanvasManager);
    canvasManager.initialize();

    //Map fabric
    var mapFabric = Object.create(MapFabric);
    mapFabric.initialize(canvasManager.getCanvas(),
                         canvasManager.getDimensions(),
                         gameConstants);

    // Initialize the player stuff
    var playerManager = Object.create(PlayerManager);
    playerManager.initialize(gameProxy, canvasManager.getCanvas(),
                             gameConstants,
                             mapFabric.getStructureObjects(),
                             canvasManager.getDimensions());

    // CursorFabric
    var cursorFabric = Object.create(CursorFabric);
    cursorFabric.initialize(canvasManager.getCanvas(), gameConstants,
                             mapFabric.getStructureIndices(),
                             canvasManager.getDimensions());

    // Start the connection
    $.connection.hub.start().done(function () {
        // Get and set the players name
        var name = prompt('Enter name:', '');
        gameProxy.server.namePlayer(name);

        // Sync The new client with other clients
        gameProxy.server.syncPlayers();

        $(window).resize(function () {
            canvasManager.resizeCanvas();
            mapFabric.syncWithWindow(canvasManager.getDimensions());
            cursorFabric.syncWithWindow(canvasManager.getDimensions());
            playerManager.syncWithWindow(canvasManager.getDimensions());
        });

        //TODO//
        // Key checking should be done out here, would
        // be more readable and modular. For example, 
        // could move cursorFabric.resetPathSteps() out here.
        $(document).keydown(function (event) {

            cursorFabric.moveCursor(event.which);
            if (event.which === 27) {
                cursorFabric.uncreatePath();
            }

            //TODO//
            // Should probably just pass the cursor
            // object rather than both the cursor and
            // the cursor indices
            playerManager.controlPlayer(event.which,
                                        cursorFabric.getCursorIndices(),
                                        cursorFabric);
            
            mapFabric.controlMap(event.which);

            //TODO//
            // Clean this up and put the following
            // into an update/sync function
            var mapShifts = mapFabric.getMapShifts();
            cursorFabric.syncWithMap(mapShifts);
            playerManager.syncWithMap(mapShifts);

            var pathSteps = cursorFabric.getPathSteps();
            playerManager.syncWithCursor(pathSteps);
        });
    });
});