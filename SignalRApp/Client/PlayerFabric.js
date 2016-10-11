
var PlayerFabric = {
    initialize: function (gameCanvas, structureObjects,
                          canvasDimensions, gameConstants) {

        this.fabricUtilities = Object.create(FabricUtilities);

        this._gameCanvas = gameCanvas;

        this._structureObjects = structureObjects;

        this._playerSprite;

        // In units of pixels
        this._tileWidth = gameConstants.tileWidth;
        this._tileHeight = gameConstants.tileHeight;

        this.mapLeftShift = 0;
        this.mapTopShift = 0;

        this._canvasPixelWidth = canvasDimensions.width;
        this._canvasPixelHeight = canvasDimensions.height;

        // Off set the player pos to stand on tile
        this._xOffSet = 7;
        this._yOffSet = -40;
    },

    setCanvasWidth: function (canvasDimensions) {
        this._canvasPixelWidth = canvasDimensions.width;
        this._canvasPixelHeight = canvasDimensions.height;
    },

    setMapShifts: function (shifts) {
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

                _this.fabricUtilities.setObjectVisibility(obj,
                                         leftPlayer, topPlayer,
                                         this._canvasPixelWidth,
                                         this._canvasPixelHeight);

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

        var structObjs = this._structureObjects;

        // Loop through structures to find if the player
        // is within a structure or intersecting with it
        for (var i = 0; i < structObjs.length; i++) {
            if (playerObj.intersectsWithObject(structObjs[i]) ||
                playerObj.isContainedWithinObject(structObjs[i])) {
                // Determine to bring player forward, or send backward.
                var playerDepth = this.calculatePlayerDepth(playerObj, structObjs[i]);
                if (playerDepth === 'inFront') {
                    this._gameCanvas.bringToFront(playerObj);
                }
                else {
                    this._gameCanvas.bringToFront(structObjs[i]);
                }
            }
        }
    },

    calculatePlayerDepth: function (playerObj, structObj) {

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
        var structTileWidth = Math.round(structObj.getWidth() / this._tileWidth);

        // Calculate the middle of the base of the structure.
        // This is the widest part of the structure sprite.
        var yStructBaseMidPoint = yBottomOfStruct - structTileWidth * 0.5 * this._tileHeight;

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
