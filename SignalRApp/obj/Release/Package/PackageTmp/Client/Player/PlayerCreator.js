﻿
var PlayerCreator = {
    initialize: function (gameCanvas, structureObjects,
                          canvasDimensions, gameConstants,
                          playerDisplay) {

        this.playerUtilities = Object.create(PlayerUtilities);
        this.playerUtilities.initialize(gameCanvas, structureObjects, gameConstants);

        this.playerDisplay = playerDisplay;

        this.localDisplayCreated = false;

        this._gameCanvas = gameCanvas;

        this._structureObjects = structureObjects;

        this.mapLeftShift = 0;
        this.mapTopShift = 0;

        this.playerSprite;
    },

    syncWithMap: function (shifts) {
        this.mapLeftShift = shifts.left;
        this.mapTopShift = shifts.top;
    },

    createPlayer: function (isLocalPlayer, id, name, xPos, yPos, level, gold, health, mana) {
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
            _this._playerSprite.moveTo(2);
            _this.playerUtilities.handleStructureCollision(_this._playerSprite,
                    _this._structureObjects, _this._gameCanvas);

            if (isLocalPlayer && !_this.localDisplayCreated) {
                var isSecondary = false;
                _this.playerDisplay.createPlayerDisplay(isLocalPlayer, id, name, level,
                                                 gold, health, mana, isSecondary);
                _this.localDisplayCreated = true;
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
