
var PlayerManager = {
    initialize: function (gameProxy, gameCanvas,
                          gameConstants, structureIndices,
                          structureObjects) {
        var _this = this;

        _this._gameProxy = gameProxy;

        // Constants to determine starting pos
        //var xStart = 6;
        //var yStart = 0;

        // Player Fabric
        var playerFabric = Object.create(PlayerFabric);
        playerFabric.initialize(gameCanvas, structureObjects);

        // CursorFabric
        _this._cursorFabric = Object.create(CursorFabric);
        _this._cursorFabric.initialize(gameCanvas, gameConstants, structureIndices);
        //TODO//
        // This should be moved into initialize
        _this._cursorFabric.createCursor();

        // PlayerSignal contains server calling functions
        var playerSignal = Object.create(PlayerSignal);
        playerSignal.initialize(_this._gameProxy, playerFabric);
    },

    //TODO//
    // Should move this into PlayerSignal
    controlPlayer: function (KeyCode) {
        var _this = this;
        _this._cursorFabric.moveCursor(KeyCode);

        // Only move player if enter was pressed
        if (KeyCode == 13) {
            var _cursor = _this._cursorFabric;
            _this._gameProxy.server.movePlayer(KeyCode, 
                _cursor._xCursorIndex, _cursor._yCursorIndex);
        }
    }
};