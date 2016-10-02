
var MapFabric = {
    initialize: function (gameCanvas, gameConstants) {
        var _this = this;
        _this._gameCanvas = gameCanvas;
        
        _this.structureObjects = [];

        // In units of tiles
        _this._mapWidth = gameConstants.mapWidth;
        _this._mapHeight = gameConstants.mapHeight;

        // In units of pixels
        _this._tileWidth = 80;
        _this._tileHeight = 40;
        _this._xOrigin = -0.5 * _this._tileWidth;
        _this._yOrigin = -0.5 * _this._tileHeight;
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
        // Probably should move this to the top or somewhere 
        // outside of this function
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
            //TODO//
            // Fix so that zIndex isn't being
            // added to each tile obj
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
                var xOffSet = (i % 2 === 0) ? 0 : 0.5 * _this._tileWidth;

                var leftPosition = _this._xOrigin + xOffSet + j * _this._tileWidth;
                var topPosition = _this._yOrigin + i * 0.5 * _this._tileHeight;
                var tile = _this.getTile(leftPosition, topPosition);

                _this._gameCanvas.add(tile);
            }
        }
    },

    getTile: function (leftPosition, topPosition) {
        var randLevel = Math.floor(Math.random() * (150 - 60 + 1) + 60);
        var rgbPiece = randLevel.toString();
        var rgbColor = 'rgb(' + rgbPiece + ',' + rgbPiece + ',' + rgbPiece + ')';

        var tile = new fabric.Path('M 0 20 L 40 0 L 80 20 L 40 40 z');
        tile.set({ left: leftPosition, top: topPosition, fill: rgbColor });
        return tile;
    }
};