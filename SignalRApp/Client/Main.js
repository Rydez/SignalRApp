

$(function () {

    // Declare a proxy to reference the hub.
    var gameProxy = $.connection.gameHub;

    var gameConstants = Object.create(GameConstants);

    var canvasManager = Object.create(CanvasManager);
    canvasManager.initialize();

    var map = Object.create(Map);
    map.initialize(canvasManager.getCanvas(), canvasManager.getDimensions(),
            gameConstants);

    var player = Object.create(Player);
    player.initialize(gameProxy, canvasManager.getCanvas(),
            gameConstants, map.villageCreator.getStructureObjects(),
            canvasManager.getDimensions());

    var cursorFabric = Object.create(CursorFabric);
    cursorFabric.initialize(canvasManager.getCanvas(), gameConstants,
            map.villageCreator.getStructureIndices(),
            canvasManager.getDimensions());

    var chat = Object.create(Chat);
    chat.initialize(gameProxy);

    // Start the connection
    $.connection.hub.start().done(function () {

        // Get and set the players name
        var name = prompt('Enter name:', '');
        gameProxy.server.namePlayer(name);

        // Sync The new client with other clients
        gameProxy.server.syncPlayers();

        // Set z indices, render, and show
        map.villageCreator.villageBackground.moveTo(0);
        cursorFabric._cursor.moveTo(1);
        canvasManager.getCanvas().renderAll();
        $('#main-container').css('display', 'block');

        // Handle mouse clicks
        canvasManager.getCanvas().on('mouse:up', function (event) {
            var objId = event.target.id;

            if (objId.indexOf('PlayerDisplay') !== -1) {
                player.playerDisplay.addPlayerDisplayOptions(objId, event);
            }
            else {

                // Remove pre existing player display before adding new one
                player.playerDisplay.removeRemotePlayerDisplay();
                player.playerDisplay.addRemotePlayerDisplay(objId);
            }
        });

        // Handle mouse hover out
        canvasManager.getCanvas().on('mouse:out', function (event) {
            player.playerDisplay.unhighlightInviteOption(event);
        });

        // Handle mouse hover in
        canvasManager.getCanvas().on('mouse:over', function (event) {
            player.playerDisplay.removePlayerDisplayOptions(event);
            player.playerDisplay.highlightInviteOption(event);
        });

        // Handle resizing the window and canvas
        $(window).resize(function () {
            canvasManager.resizeCanvas();
            map.mapController.syncWithWindow(canvasManager.getDimensions());
            cursorFabric.syncWithWindow(canvasManager.getDimensions());
            player.playerController.syncWithWindow(canvasManager.getDimensions());
        });

        // Handle key downs
        $(document).keydown(function (event) {

            // check if player is chatting
            var isChatting = chat.checkPlayerChatting();
            if (isChatting) {
                chat.sendMessageToAll(event.which);
                chat.unfocusChat(event.which);
            }
            else {
                map.mapController.controlMap(event.which);
                cursorFabric.uncreatePath(event.which);
                cursorFabric.moveCursor(event.which);
                player.playerController.controlPlayer(event.which, cursorFabric);
            }

            var mapShifts = map.mapController.getMapShifts();
            cursorFabric.syncWithMap(mapShifts);
            player.playerController.syncWithMap(mapShifts);
            player.playerCreator.syncWithMap(mapShifts);
            player.playerDisplay.syncWithMap(mapShifts);

            var pathSteps = cursorFabric.getPathSteps();
            player.playerController.syncWithCursor(pathSteps);
        });
    });
});