
var PlayerFabric = {
    initialize: function (gameCanvas, structureObjects,
                          canvasDimensions) {
        var _this = this;
        _this._gameCanvas = gameCanvas;

        _this._structureObjects = structureObjects;

        _this._playerSprite;

        // In units of pixels
        _this._tileWidth = 80;
        _this._tileHeight = 40;

        _this.mapLeftShift = 0;
        _this.mapTopShift = 0;

        _this._canvasPixelWidth = canvasDimensions.width;
        _this._canvasPixelHeight = canvasDimensions.height;

        // Off set the player pos to stand on tile
        _this._xOffSet = 7;
        _this._yOffSet = -40;
    },

    setCanvasWidth: function () {
        var _this = this;

        _this._canvasPixelWidth = canvasDimensions.width;
        _this._canvasPixelHeight = canvasDimensions.height;
    },

    setMapShifts: function (shifts) {
        var _this = this;

        _this.mapLeftShift = shifts.left;
        _this.mapTopShift = shifts.top;

        //// Update the structures with 
        //// the correct positions
        //for (var i = 0; i < _this._structureObjects.length; i++) {
        //    var structObj = _this._structureObjects[i]

        //    structObj.set({
        //        left: shifts.left + structObj.getLeft(),
        //        top: shifts.top + structObj.getTop()
        //    });
        //}
    },

    setObjectVisibility: function (obj, left, top) {
        var _this = this;

        // Don't render objects outside of canvas
        if (left > _this._canvasPixelWidth ||
            top > _this._canvasPixelHeight ||
            left + obj.getWidth() < 0 ||
            top + obj.getHeight() < 0) {
            obj.visible = false;
        }
        else {
            obj.visible = true;
        }
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
                left: _this.mapLeftShift + xPos,
                top: _this.mapTopShift + yPos
            });

            _this._playerSprite = playerFabricGroup;
            _this._gameCanvas.add(_this._playerSprite);
            _this.handleStructureCollision(_this._playerSprite);
            _this._gameCanvas.renderAll();
        });
    },

    
    movePlayerSprite: function (id, xPos, yPos) {
        var _this = this;
        _this._gameCanvas.forEachObject(function (obj) {
            if (obj.id && obj.id === id) {
                var leftPlayer = _this.mapLeftShift + xPos;
                var topPlayer = _this.mapTopShift + yPos;
                _this.setObjectVisibility(obj, leftPlayer, topPlayer);

                obj.set({
                    left: leftPlayer,
                    top: topPlayer
                });
                obj.setCoords();

                // Handle when the player is behind or
                // in front of a structure
                _this.handleStructureCollision(obj);

                _this._gameCanvas.renderAll();
            }
        });
    },

    handleStructureCollision: function (playerObj) {
        var _this = this;

        var structObjs = _this._structureObjects;

        // Loop through structures to find if the player
        // is within a structure or intersecting with it
        for (var i = 0; i < structObjs.length; i++) {
            if (playerObj.intersectsWithObject(structObjs[i]) ||
                playerObj.isContainedWithinObject(structObjs[i])) {
                // Determine to bring player forward, or send backward.
                var playerDepth = _this.calculatePlayerDepth(playerObj, structObjs[i]);
                if (playerDepth === 'inFront') {
                    _this._gameCanvas.bringToFront(playerObj);
                }
                else {
                    _this._gameCanvas.bringToFront(structObjs[i]);
                }
            }
        }
    },

    calculatePlayerDepth: function (playerObj, structObj) {
        var _this = this;

        // Start with player in front
        var depth = 'inFront';

        // Get the vertical position of the player
        // from lower left corner of player sprite
        var yPlayerPos = playerObj.getTop();
        var playerHeight = playerObj.getHeight();
        var yBottomOfPlayer = yPlayerPos + playerHeight;
        
        // Get the vertical position of the structure
        // from lower left corner of structure sprite
        var yStructPos = structObj.getTop();
        var structHeight = structObj.getHeight();
        var yBottomOfStruct = yStructPos + structHeight;

        // Get the width of the structure in units of tiles
        var structTileWidth = Math.round(structObj.getWidth() / _this._tileWidth);

        // Calculate the middle of the base of the structure.
        // This is the widest part of the structure sprite.
        var yStructBaseMidPoint = yBottomOfStruct - structTileWidth * 0.5 * _this._tileHeight;

        // Add bias to having player behind rather than infront
        var BEHIND_BIAS_OFF_SET = 30;
        
        // If the player is above this middle, then the
        // player is behind the structure
        if (yBottomOfPlayer < yStructBaseMidPoint + BEHIND_BIAS_OFF_SET) {
            depth = 'behind';
        }
        return depth;
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
