
var MapFabric = {
    initialize: function (gameCanvas, canvasDimensions,
                          gameConstants) {
        var _this = this;
        _this._gameCanvas = gameCanvas;
        
        _this.structureObjects = [];

        // In units of tiles
        _this._mapWidth = gameConstants.mapWidth;
        _this._mapHeight = gameConstants.mapHeight;

        // In units of pixels
        _this._canvasPixelWidth = canvasDimensions.width;
        _this._canvasPixelHeight = canvasDimensions.height;

        // In units of pixels
        _this._tileWidth = 80;
        _this._tileHeight = 40;
        _this._xOrigin = -0.5 * _this._tileWidth;
        _this._yOrigin = -0.5 * _this._tileHeight;
        _this._leftShift = 0;
        _this._topShift = 0;

        _this.createMap();
    },

    syncWithWindow: function (canvasDimensions) {
        var _this = this;

        _this._canvasPixelWidth = canvasDimensions.width;
        _this._canvasPixelHeight = canvasDimensions.height;
    },

    createMap: function () {
        var _this = this;
        _this.createLand();
        _this.createStructures();
        _this._gameCanvas.renderAll();
    },

    createStructures: function () {
        var _this = this;
        _this.structureIndices = [];

        //TODO//
        // Probably should move this to a
        // configuration/constants file
        var structureInfo = [
            {
                name: 'stable',
                xIndex: 6,
                yIndex: -5,
                width: 240,
                height: 190,
                xOffSet: -8,
                yOffSet: -2
            }, {
                name: 'blacksmith',
                xIndex: 18,
                yIndex: 3,
                width: 240,
                height: 204,
                xOffSet: -8,
                yOffSet: -2
            }, {
                name: 'archery_range',
                xIndex: 18,
                yIndex: -5,
                width: 240,
                height: 175,
                xOffSet: -8,
                yOffSet: -2
            }, {
                name: 'barracks',
                xIndex: 27,
                yIndex: -5,
                width: 240,
                height: 190,
                xOffSet: -8,
                yOffSet: -2
            }, {
                name: 'house1',
                xIndex: 18,
                yIndex: -12,
                width: 160,
                height: 127,
                xOffSet: -8,
                yOffSet: 8
            }, {
                name: 'house1b',
                xIndex: 19,
                yIndex: -17,
                width: 160,
                height: 128,
                xOffSet: -8,
                yOffSet: 8
            }, {
                name: 'house1c',
                xIndex: 23,
                yIndex: -15,
                width: 160,
                height: 123,
                xOffSet: -8,
                yOffSet: 8
            }
        ];
        
        for (var i = 0; i < structureInfo.length; i++) {
            // 's' is shorthand for structureInfo[i]
            var s = structureInfo[i];
            _this.structureTemplate(s.name, s.xIndex, s.yIndex,
                                    s.width, s.height, s.xOffSet,
                                    s.yOffSet);

            //TODO//
            // Move this stuff into a function called coverStructureIndices
            var tilesWide = s.width / _this._tileWidth;

            // Move to lower corner to start dirtying
            var xStartIndex = Math.ceil(s.xIndex);
            var yStartIndex = Math.floor(s.yIndex) + (tilesWide - 1);

            // Assuming N*N structure, locate covered tiles
            var coveredIndices = [];
            for (var j = 0; j < tilesWide; j++) {
                for (var k = 0; k < tilesWide; k++) {
                    var coveredIndex = {
                        xIndex: xStartIndex - j,
                        yIndex: yStartIndex + k
                    };
                    coveredIndices.push(coveredIndex);
                }
            }
            _this.structureIndices.push(coveredIndices);
        }
    },

    getStructureIndices: function() {
        var _this = this;
        return _this.structureIndices;
    },

    getStructureObjects: function() {
        var _this = this;
        return _this.structureObjects;
    },

    getMapShifts: function () {
        var _this = this;
        var shifts = {
            left: _this._leftShift,
            top: _this._topShift
        };
        return shifts;
    },

    structureTemplate: function (name, xIndex, yIndex, width, height, xOffSet, yOffSet) {
        var _this = this;

        var newStructure = new fabric.Image.fromURL('Client/images/' + name + '.png', function (img) {

            // Set lower left corner of image to tile indices   
            var structureImage = img.set({
                left: xOffSet + 0.5 * _this._tileWidth * (xIndex + yIndex),
                top: yOffSet + 0.5 * _this._tileHeight * (xIndex - yIndex) - height
            });
            _this.structureObjects.push(structureImage);
            _this._gameCanvas.add(structureImage);
        });
    },

    createLand: function () {
        var _this = this;
        for (var i = 0; i < _this._mapHeight; i++) {
            for (var j = 0; j < _this._mapWidth; j++) {
                // Off set every other row
                var xOffSet = (i % 2 === 0) ? 0 : 0.5 * _this._tileWidth;

                // Calculate position in units of pixels
                var leftPosition = _this._xOrigin + xOffSet + j * _this._tileWidth;
                var topPosition = _this._yOrigin + i * 0.5 * _this._tileHeight;

                // Create the tile
                var tile = _this.getTile(leftPosition, topPosition);

                _this._gameCanvas.add(tile);
            }
        }

        // Convert land tiles into 
        // background image
        _this.cacheLand();
    },

    cacheLand: function () {
        var _this = this;

        // Expand canvas to create an image of entire canvas
        _this._gameCanvas.setWidth(_this._mapWidth * _this._tileWidth - 0.5 * _this._tileWidth);
        _this._gameCanvas.setHeight(_this._mapHeight * 0.5 * _this._tileHeight - 0.5 * _this._tileHeight);

        // Create png URL of canvas
        var cachedLandImage = _this._gameCanvas.toDataURL('png');

        // Remove the tile objects
        _this._gameCanvas.clear();

        // Set canvas back to correct size
        _this._gameCanvas.setWidth(_this._canvasPixelWidth);
        _this._gameCanvas.setHeight(_this._canvasPixelHeight);

        // Set background with image of tiles
        var backgroundImage = new fabric.Image.fromURL(cachedLandImage, function (img) {
            var img = img.set({
                id: 'landBackground'
            });

            _this._gameCanvas.add(img);
            img.sendToBack();
            _this._gameCanvas.renderAll();
        });
    },

    getTile: function (leftPosition, topPosition) {
        // Get a random number betwe
        var randLevel = Math.floor(Math.random() * (150 - 60 + 1) + 60);
        var rgbPiece = randLevel.toString();
        var rgbColor = 'rgb(' + rgbPiece + ',' + rgbPiece + ',' + rgbPiece + ')';

        var tile = new fabric.Path('M 0 20 L 40 0 L 80 20 L 40 40 z');
        tile.set({ left: leftPosition, top: topPosition, fill: rgbColor });
        return tile;
    },

    controlMap: function (KeyCode) {
        var _this = this;

        // Best to have delta set to a number
        // which divides evenly into the width
        // and height of the map
        var delta = 20;
        var leftDelta = 0;
        var topDelta = 0;

        // Up is 38
        if (KeyCode === 38) {
            topDelta = -delta;
        }
        
        // Left is 37
        else if (KeyCode === 37) {
            leftDelta = -delta;
        }

        // Down is 40
        else if (KeyCode === 40) {
            topDelta = delta;
        }

        // Right is 39
        else if (KeyCode === 39) {
            leftDelta = delta;
        }

        // Exit is no map movement key pressed
        else {
            return;
        }

        _this.updateMapPosition(leftDelta, topDelta);
    },

    // This might not belong in mapFabric. Maybe
    // too general for that. This function is also
    // used in canvasManager
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

    updateMapPosition: function (leftDelta, topDelta) {
        var _this = this;

        var canvasObjects = _this._gameCanvas.getObjects();

        var atBoundary = _this.checkForBoundary(canvasObjects, leftDelta, topDelta);

        if (atBoundary) {
            return;
        }

        for (var i = 0; i < canvasObjects.length; i++) {

            var currentLeft = canvasObjects[i].getLeft();
            var currentTop = canvasObjects[i].getTop();

            _this.setObjectVisibility(canvasObjects[i],
                                      currentLeft,
                                      currentTop);

            // Update bbject positions
            canvasObjects[i].set({
                left: currentLeft + leftDelta,
                top: currentTop + topDelta
            });
            canvasObjects[i].setCoords();
        }

        // Update current map shifts
        _this._leftShift += leftDelta;
        _this._topShift += topDelta;

        _this._gameCanvas.renderAll();
    },

    checkForBoundary: function (canvasObjects, leftDelta, topDelta) {
        var _this = this;

        for (var i = 0; i < canvasObjects.length; i++) {
            // Obj is shorthand for canvasObjects[i]
            var obj       = canvasObjects[i];
            var objLeft   = obj.getLeft();
            var objTop    = obj.getTop();
            var objWidth  = obj.getWidth();
            var objHeight = obj.getHeight();

            var atBoundary = false;

            // Check first and last tile for boundaries
            // Exit if boundary will by overstepped
            if (obj.id && obj.id === 'landBackground') {
                if (objLeft + leftDelta > 0 ||
                    objTop  + topDelta  > 0 ||
                    objLeft + objWidth  + leftDelta < _this._canvasPixelWidth ||
                    objTop  + objHeight + topDelta  < _this._canvasPixelHeight) {
                    atBoundary = true;
                    return atBoundary;
                }
            }
        }
    }
};