
var Game = {

    initialize: function (gameProxy) {

        this.gameProxy = gameProxy;

        this.gameConstants = Object.create(GameConstants);

        this.canvasManager = Object.create(CanvasManager);
        this.canvasManager.initialize();

        this.map = Object.create(Map);
        this.map.initialize(this.canvasManager.getCanvas(), this.canvasManager.getDimensions(),
                this.gameConstants);

        this.player = Object.create(Player);
        this.player.initialize(this.gameProxy, this.canvasManager.getCanvas(),
                this.gameConstants, this.map.villageCreator.getStructureObjects(),
                this.canvasManager.getDimensions());

        this.cursorFabric = Object.create(CursorFabric);
        this.cursorFabric.initialize(this.canvasManager.getCanvas(), this.gameConstants,
                this.map.villageCreator.getStructureIndices(),
                this.canvasManager.getDimensions());

        this.chat = Object.create(Chat);
        this.chat.initialize(this.gameProxy);

        this.party = Object.create(Party);
        this.party.initialize(this.gameProxy, this.canvasManager, this.canvasManager.getCanvas());

        // Lone signal function
        var _this = this;
        gameProxy.client.startGame = function () {
            _this.start();
        };
    },

    start: function () {

        // Sync The new client with other clients
        this.gameProxy.server.syncPlayers();

        this.mouseBindings();
        this.keyboardBindings();
        this.windowBindings();
        this.show();
    },

    show: function () {

        // Set z indices, render, and show
        this.cursorFabric._cursor.moveTo(1);
        this.canvasManager.getCanvas().renderAll();

        // Unhide main container
        $('#main-container').css('display', 'block');

        // Hide account container
        $('#account-container').css('display', 'none');

        // Hide registration container
        $('#registration-container').css('display', 'none');
    },

    mouseBindings: function () {
        var _this = this;

        // Handle mouse clicks
        this.canvasManager.getCanvas().on('mouse:up', function (event) {
            var objId = event.target.id;

            if (objId) {
                if (objId.indexOf('PlayerDisplay') !== -1) {
                    _this.player.playerDisplay.addPlayerDisplayOptions(objId, event);
                }
                else if (objId.indexOf('inviteOption') !== -1) {
                    _this.gameProxy.server.invitePlayer(objId.split(':')[1]);
                }
                else if (objId.indexOf('leaveOption') !== -1) {
                    _this.gameProxy.server.leaveParty();
                }
                else if (objId.indexOf('playerInPartyConfirmation') !== -1) {
                    _this.party.removePlayerInPartyResponse();
                }
                else if (objId.indexOf('acceptInvitation') !== -1) {
                    _this.gameProxy.server.acceptInvitation();
                    _this.party.removeInvitation();
                }
                else if (objId.indexOf('rejectInvitation') !== -1) {
                    _this.gameProxy.server.rejectInvitation();
                    _this.party.removeInvitation();
                }
                else {

                    // Remove pre existing player display before adding new one
                    _this.player.playerDisplay.removeRemotePlayerDisplay();
                    _this.player.playerDisplay.addRemotePlayerDisplay(objId);
                }
            }
        });

        // Handle mouse hover out
        this.canvasManager.getCanvas().on('mouse:out', function (event) {
            _this.player.playerDisplay.unhighlightInviteOption(event);
        });

        // Handle mouse hover in
        this.canvasManager.getCanvas().on('mouse:over', function (event) {
            _this.player.playerDisplay.removePlayerDisplayOptions(event);
            _this.player.playerDisplay.highlightInviteOption(event);
        });
    },

    keyboardBindings: function () {
        var _this = this;

        // Handle key downs
        $(document).keydown(function (event) {

            // check if player is chatting
            var isChatting = _this.chat.checkPlayerChatting();
            if (isChatting) {
                _this.chat.sendMessageToAll(event.which);
                _this.chat.unfocusChat(event.which);
            }
            else {
                _this.map.mapController.controlMap(event.which);
                _this.cursorFabric.uncreatePath(event.which);
                _this.cursorFabric.moveCursor(event.which);
                _this.player.playerController.controlPlayer(event.which, _this.cursorFabric);
            }

            var mapShifts = _this.map.mapController.getMapShifts();
            _this.cursorFabric.syncWithMap(mapShifts);
            _this.player.playerController.syncWithMap(mapShifts);
            _this.player.playerCreator.syncWithMap(mapShifts);
            _this.player.playerDisplay.syncWithMap(mapShifts);
            _this.party.syncWithMap(mapShifts);

            var pathSteps = _this.cursorFabric.getPathSteps();
            _this.player.playerController.syncWithCursor(pathSteps);
        });
    },

    windowBindings: function () {
        var _this = this;

        // Handle resizing the window and canvas
        $(window).resize(function () {
            _this.canvasManager.resizeCanvas();
            _this.map.mapController.syncWithWindow(_this.canvasManager.getDimensions());
            _this.cursorFabric.syncWithWindow(_this.canvasManager.getDimensions());
            _this.player.playerController.syncWithWindow(_this.canvasManager.getDimensions());
        });
    }

};