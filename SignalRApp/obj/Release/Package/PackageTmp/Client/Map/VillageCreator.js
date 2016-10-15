

var VillageCreator = {

    initialize: function (gameCanvas, canvasDimensions, gameConstants) {
                this._gameCanvas = gameCanvas;
        
        this.structureObjects = [];

        // In units of tiles
        this._mapWidth = gameConstants.mapWidth;
        this._mapHeight = gameConstants.mapHeight;

        // In units of pixels
        this._canvasPixelWidth = canvasDimensions.width;
        this._canvasPixelHeight = canvasDimensions.height;
        this._tileWidth = gameConstants.tileWidth;
        this._tileHeight = gameConstants.tileHeight;
        this._xOrigin = -0.5 * this._tileWidth;
        this._yOrigin = -0.5 * this._tileHeight;

        this.createMap();
    },

    createMap: function () {
        this.createLand();
        this.createStructures();
        //this._gameCanvas.renderAll();
    },

    createLand: function () {
        for (var i = 0; i < this._mapHeight; i++) {
            for (var j = 0; j < this._mapWidth; j++) {
                // Off set every other row
                var xOffSet = (i % 2 === 0) ? 0 : 0.5 * this._tileWidth;

                // Calculate position in units of pixels
                var leftPosition = this._xOrigin + xOffSet + j * this._tileWidth;
                var topPosition = this._yOrigin + i * 0.5 * this._tileHeight;

                // Create the tile
                //this.getTile(leftPosition, topPosition);
                this.addGrassTile(leftPosition, topPosition);
            }
        }
    },

    createStructures: function () {
        this.structureIndices = [];

        var structures = Object.create(Structures);
        structureInfo = structures.structureInfo;

        for (var i = 0; i < structureInfo.length; i++) {
            // 's' is shorthand for structureInfo[i]
            var s = structureInfo[i];
            this.structureTemplate(s.name, s.xIndex, s.yIndex,
                                    s.width, s.height, s.xOffSet,
                                    s.yOffSet);

            //TODO//
            // Move this stuff into a function called coverStructureIndices
            var tilesWide = s.width / this._tileWidth;

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
            this.structureIndices.push(coveredIndices);
        }
    },

    // Creates randomly gray tiles
    getTile: function (leftPosition, topPosition) {

        // Get a random number between 150 and 60 for tile color
        var randLevel = Math.floor(Math.random() * (150 - 60 + 1) + 60);
        var rgbPiece = randLevel.toString();
        var rgbColor = 'rgb(' + rgbPiece + ',' + rgbPiece + ',' + rgbPiece + ')';

        var tile = new fabric.Path('M 0 20 L 40 0 L 80 20 L 40 40 z');
        tile.set({ left: leftPosition, top: topPosition, fill: rgbColor });
        this._gameCanvas.add(tile);
        //return tile;
    },

    addGrassTile: function (leftPosition, topPosition) {
        var _this = this;
        var grassTile = new fabric.Image.fromURL('Client/images/grass_tile.png', function (img) {
            var grassTileImage = img.set({
                left: leftPosition,
                top: topPosition
            });
            _this._gameCanvas.add(grassTileImage);

            // Cache once last grass tile added
            if (_this._gameCanvas.getObjects().length === _this._mapWidth * _this._mapHeight) {
                _this.cacheLand();
            }
        });
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

    cacheLand: function () {

        // Expand canvas to create an image of entire canvas
        this._gameCanvas.setWidth(this._mapWidth * this._tileWidth - 0.5 * this._tileWidth);
        this._gameCanvas.setHeight(this._mapHeight * 0.5 * this._tileHeight - 0.5 * this._tileHeight);

        // Create png URL of canvas
        var cachedLandImage = this._gameCanvas.toDataURL('png');

        // Remove the tile objects
        this._gameCanvas.clear();

        // Set canvas back to correct size
        this._gameCanvas.setWidth(this._canvasPixelWidth);
        this._gameCanvas.setHeight(this._canvasPixelHeight);

        // Set background with image of tiles
        var _this = this;
        var backgroundImage = new fabric.Image.fromURL(cachedLandImage, function (img) {
            var landImg = img.set({
                id: 'landBackground'
            });
            _this.villageBackground = landImg;
            _this._gameCanvas.add(_this.villageBackground);
        });
    },

    getStructureIndices: function () {
        return this.structureIndices;
    },

    getStructureObjects: function () {
        return this.structureObjects;
    },
};