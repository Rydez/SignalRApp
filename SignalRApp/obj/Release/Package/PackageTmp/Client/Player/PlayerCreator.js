
var PlayerCreator = {
    initialize: function (gameCanvas, structureObjects,
                          canvasDimensions, gameConstants) {

        this.playerUtilities = Object.create(PlayerUtilities);
        this.playerUtilities.initialize(gameCanvas, structureObjects, gameConstants);

        this._gameCanvas = gameCanvas;

        this._structureObjects = structureObjects;

        this.mapLeftShift = 0;
        this.mapTopShift = 0;
    },

    syncWithMap: function (shifts) {
        this.mapLeftShift = shifts.left;
        this.mapTopShift = shifts.top;
    },

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
                top: 45
            });

            var playerFabricGroup = new fabric.Group([stickImage, playerLabel], {
                id: id,
                originX: 'center',
                originY: 'center',
                left: _this.mapLeftShift + xPos,
                top: _this.mapTopShift + yPos
            });

            _this._playerSprite = playerFabricGroup;
            _this._gameCanvas.add(_this._playerSprite);
            _this._playerSprite.selectable = false;
            _this.playerUtilities.handleStructureCollision(_this._playerSprite,
                    _this._structureObjects, _this._gameCanvas);
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
