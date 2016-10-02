
var PlayerFabric = {
    initialize: function (gameCanvas) {
        var _this = this;
        _this._gameCanvas = gameCanvas;

        // In units of pixels
        _this._tileWidth = 80;
        _this._tileHeight = 40;

        // Off set the player pos to stand on tile
        _this._xOffSet = 7;
        _this._yOffSet = -40;
    },

    //TODO//
    //Currently the xPos and yPos args arent being used
    //Instead the player's pos is set on front-end.
    //Move this to back-end.
    createPlayerSprite: function (id, name, xPos, yPos) {
        var _this = this;
        var playerImage = new fabric.Image.fromURL('Client/images/stick-player.png', function (img) {
        
            var stickImage = img.set({
                originX: 'center',
                originY: 'center',
            });

            var playerLabel = new fabric.Text(name, {
                fontSize: 25,
                fill: 'white',
                originX: 'center',
                originY: 'center',
                top: 50
            });

            var playerFabricGroup = new fabric.Group([stickImage, playerLabel], {
                id: id,
                left: xPos,
                top: yPos
            });

            _this._playerSprite = playerFabricGroup;
            _this._gameCanvas.add(_this._playerSprite);
            _this._gameCanvas.renderAll();
        });
    },

    movePlayerSprite: function (id, xPos, yPos) {
        var _this = this;
        _this._gameCanvas.forEachObject(function (obj) {
            if (obj.id && obj.id === id) {
                obj.set({
                    left: xPos,
                    top: yPos
                });
                obj.setCoords();
                _this._gameCanvas.renderAll();
            }
        });
    },

    removePlayerSprite: function (id) {
        var _this = this;
        _this._gameCanvas.forEachObject(function (obj) {
            if (obj.id && obj.id === id) {
                _this._gameCanvas.remove(obj);
                _this._gameCanvas.renderAll();
            }
        });
    }
};
