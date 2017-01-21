
var Game = {

    initialize: function (gameProxy, playerHubProxy, wildernessHubProxy,
                          chatHubProxy) {

        this.isInWilderness = false;

        this.gameProxy = gameProxy;
        this.playerHubProxy = playerHubProxy;
        this.wildernessHubProxy = wildernessHubProxy;

        this.gameConstants = Object.create(GameConstants);
        this.gameConstants.initialize();

        this.canvasManager = Object.create(CanvasManager);
        this.canvasManager.initialize();

        this.map = Object.create(Map);
        this.map.initialize(this.canvasManager.getCanvas(), this.canvasManager.getDimensions(),
                this.gameConstants);

        this.player = Object.create(Player);
        this.player.initialize(gameProxy, playerHubProxy, this.canvasManager.getCanvas(),
                this.gameConstants, this.map.villageCreator.getStructureObjects(),
                this.canvasManager.getDimensions());

        this.structureMenuManager = Object.create(StructureMenuManager);
        this.structureMenuManager.initialize(gameProxy, playerHubProxy, this.canvasManager,
                this.map.villageCreator.getStructureObjects());

        this.cursorFabric = Object.create(CursorFabric);
        this.cursorFabric.initialize(this.canvasManager.getCanvas(), this.gameConstants,
                this.map.villageCreator.getStructureIndices(),
                this.canvasManager.getDimensions());

        this.chat = Object.create(Chat);
        this.chat.initialize(gameProxy, chatHubProxy);

        this.party = Object.create(Party);
        this.party.initialize(gameProxy, this.canvasManager, this.canvasManager.getCanvas());
        
        var _this = this;
        gameProxy.client.startGame = function () {
            _this.startGame();
        };

        gameProxy.client.createAndEnterWilderness = function (wildernessInfo) {

            _this.wilderness = Object.create(Wilderness);
            _this.wilderness.initialize(_this.wildernessHubProxy, _this.canvasManager.getCanvas(),
                                       _this.canvasManager.getDimensions(),
                                       _this.map.villageCreator.structureObjects,
                                       _this.gameConstants, wildernessInfo);

            _this.isInWilderness = true;
        };

        gameProxy.client.something = function () {

            console.log('goddamnit');
        };
    },

    startGame: function () {

        // Sync The new client with other clients 
        // (Really starts creation of all players)
        this.playerHubProxy.server.addAllPlayers();

        this.mouseBindings();
        this.setKeyboardBindings();
        this.setWindowBindings();
        this.showGame();
    },

    showGame: function () {

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

            if (event.target && event.target.id) {
                var objId = event.target.id;

                if (objId.indexOf('PlayerDisplay') !== -1) {
                    _this.player.playerDisplay.addPlayerDisplayOptions(objId, event);
                }
                else if (objId.indexOf('inviteOption') !== -1) {
                    _this.playerHubProxy.server.invitePlayer(objId.split(':')[1]);
                }
                else if (objId.indexOf('leaveOption') !== -1) {
                    _this.playerHubProxy.server.leaveParty();
                }
                else if (objId.indexOf('playerInPartyConfirmation') !== -1) {
                    _this.party.removePlayerInPartyResponse();
                }
                else if (objId.indexOf('acceptInvitation') !== -1) {
                    _this.playerHubProxy.server.acceptInvitation();
                    _this.party.removeInvitation();
                }
                else if (objId.indexOf('rejectInvitation') !== -1) {
                    _this.playerHubProxy.server.rejectInvitation();
                    _this.party.removeInvitation();
                }
                else if (objId.indexOf('readyCheck') !== -1) {
                    _this.playerHubProxy.server.changeReadyStatus();
                }
                else if (objId.indexOf('notReadyConfirmation') !== -1) {
                    _this.structureMenuManager.wildernessMenu.removeNotReadyResponse();
                }
                else if (objId.indexOf('enterWilderness') !== -1) {
                    _this.wildernessHubProxy.server.switchToWilderness();
                }
                else if (objId.indexOf('cancelWilderness') !== -1) {
                    _this.structureMenuManager.wildernessMenu.removeEnterConfirmationResponse();
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

    setKeyboardBindings: function () {
        if (!this.isInWilderness) {
            this.player.playerController.villageMovementLoop();
        }

        // Handle key downs
        var _this = this;
        $(document).keydown(function (event) {
            if (_this.isInWilderness) {
                _this.wildernessKeyboardBindings(event, _this.wilderness.wildernessCursor);
            }
            else {
                _this.villageKeyboardBindings(event, _this.cursorFabric);
                _this.player.playerController.changeDirection(event.which, 'down');
            }
        });

        $(document).keyup(function (event) {
            if (!_this.isInWilderness) {
                _this.player.playerController.changeDirection(event.which, 'up');
            }
        });
    },

    setWindowBindings: function () {
        var _this = this;

        // Window resizes
        $(window).resize(function () {
            if (_this.isInWilderness) {
                _this.windowBindings(_this.wilderness.wildernessCursor);
            }
            else {
                _this.windowBindings(_this.cursorFabric);
            }

        });
    },

    villageKeyboardBindings: function (event, cursor) {

        // check if player is chatting
        var isChatting = this.chat.checkPlayerChatting();
        if (isChatting) {
            this.chat.sendMessageToAll(event.which);
            this.chat.unfocusChat(event.which);
        }
        else {
            this.map.mapController.controlMap(event.which);
            this.structureMenuManager.promptMenu(event.which, this.player.playerCreator.playerSprite);
        }

        this.map.mapController.syncComponentsWithMap(this.player, this.party, cursor);
    },

    wildernessKeyboardBindings: function (event, cursor) {

        // check if player is chatting
        var isChatting = this.chat.checkPlayerChatting();
        if (isChatting) {
            this.chat.sendMessageToAll(event.which);
            this.chat.unfocusChat(event.which);
        }
        else {
            this.map.mapController.controlMap(event.which);
            cursor.uncreatePath(event.which);
            cursor.moveCursor(event.which);
            this.player.playerController.selectMovementPath(event.which, cursor);
            this.structureMenuManager.promptMenu(event.which, this.player.playerCreator.playerSprite);
        }

        this.map.mapController.syncComponentsWithMap(this.player, this.party, cursor);

        var pathSteps = cursor.getPathSteps();
        this.player.playerController.syncWithCursor(pathSteps);
    },

    windowBindings: function (cursor) {
        var _this = this;

        _this.canvasManager.resizeCanvas(_this.map, _this.player, _this.party, cursor);
        _this.map.mapController.syncWithWindow(_this.canvasManager.getDimensions());
        _this.cursorFabric.syncWithWindow(_this.canvasManager.getDimensions());
        _this.player.playerController.syncWithWindow(_this.canvasManager.getDimensions());
    }

};