

var Wilderness = {

    initialize: function (wildernessHubProxy, gameCanvas, canvasDimensions, structureObjects,
                            gameConstants, wildernessInfo) {

        this.wildernessHubProxy = wildernessHubProxy;
        this.gameCanvas = gameCanvas;
        this.canvasDimensions = canvasDimensions;
        this.gameConstants = gameConstants;

        this.tileWidth = gameConstants.tileWidth;
        this.tileHeight = gameConstants.tileHeight;
        this.xTileOrigin = gameConstants.xTileOrigin;
        this.yTileOrigin = gameConstants.yTileOrigin;

        this.canvasPixelWidth = canvasDimensions.width;
        this.canvasPixelHeight = canvasDimensions.height;

        this.wildernessWidth = wildernessInfo.wildernessWidth;
        this.wildernessHeight = wildernessInfo.wildernessHeight;
        this.wildernessStructureInfo = wildernessInfo.wildernessStructureObjects;

        this.structureObjects = structureObjects;

        this.structureIndices = [];

        this.numberOfGrassTiles = 0;

        this.startWilderness();
    },

    startWilderness: function () {
        this.clearVillage();
        this.createLand();
        this.createStructures(this.wildernessStructureInfo, this.structureIndices);

        // Add players in party or individual players.
        // TODO: This is a lie. A single player without a party can
        // enter the wilderness
        this.wildernessHubProxy.server.addPartyMembers();

        this.gameCanvas.renderAll();
    },

    clearVillage: function () {
        
        // Clear village objects
        this.structureObjects.length = 0;

        // Clear everything so that background can be cached
        this.gameCanvas.clear();
    },

    createLand: function () {
        for (var i = 0; i < this.wildernessHeight; i++) {
            for (var j = 0; j < this.wildernessWidth; j++) {

                // Off set every other row
                var xOffSet = (i % 2 === 0) ? 0 : 0.5 * this.tileWidth;

                // Calculate position in units of pixels
                var leftPosition = this.xTileOrigin + xOffSet + j * this.tileWidth;
                var topPosition = this.yTileOrigin + i * 0.5 * this.tileHeight;

                // Create the tile
                this.addTileAndCacheOnLastTile(leftPosition, topPosition);
            }
        }
    },

    addTileAndCacheOnLastTile: function (leftPosition, topPosition) {
        var _this = this;
        var grassTile = new fabric.Image.fromURL('Client/images/grass_tile.png', function (img) {
            var grassTileImage = img.set({
                id: 'grassTile',
                left: leftPosition,
                top: topPosition
            });
            _this.gameCanvas.add(grassTileImage);
            grassTileImage.selectable = false;

            _this.numberOfGrassTiles += 1;

            // Cache on last grass tile
            if (_this.numberOfGrassTiles === _this.wildernessWidth * _this.wildernessHeight) {
                _this.cacheLand();
            }
        });
    },

    cacheLand: function () {

        // Expand canvas to create an image of entire canvas
        this.gameCanvas.setWidth(this.wildernessWidth * this.tileWidth - 0.5 * this.tileWidth);
        this.gameCanvas.setHeight(this.wildernessHeight * 0.5 * this.tileHeight - 0.5 * this.tileHeight);

        // Create png URL of canvas
        var cachedLandImage = this.gameCanvas.toDataURL('png');

        // Remove the tile objects
        this.gameCanvas.clear();

        // Set canvas back to correct size
        this.gameCanvas.setWidth(this.canvasPixelWidth);
        this.gameCanvas.setHeight(this.canvasPixelHeight);

        // Set background with image of tiles
        var _this = this;
        var backgroundImage = new fabric.Image.fromURL(cachedLandImage, function (img) {
            var landImg = img.set({
                id: 'landBackground'
            });
            _this.wildernessBackground = landImg;
            _this.gameCanvas.add(_this.wildernessBackground);
            _this.wildernessBackground.selectable = false;

            //TODO: Should probably move this out of here.
            // consider making a next layer function
            _this.wildernessCursor = Object.create(CursorFabric);
            _this.wildernessCursor.initialize(_this.gameCanvas, _this.gameConstants,
                    _this.structureIndices, _this.canvasDimensions);

            _this.wildernessBackground.moveTo(0);
            _this.wildernessCursor._cursor.moveTo(1);
        });
    },

    createStructures: function (structureInfo, structureIndices) {


        for (var i = 0; i < structureInfo.length; i++) {

            // 's' is shorthand for structureInfo[i]
            var s = structureInfo[i];
            this.structureTemplate(s.name, s.xIndex, s.yIndex,
                                    s.width, s.height, s.xOffSet,
                                    s.yOffSet);

            //TODO//
            // Move this stuff into a function called coverStructureIndices
            var tilesWide = s.width / this.tileWidth;

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
            structureIndices.push(coveredIndices);
        }
    },

    structureTemplate: function (name, xIndex, yIndex, width, height, xOffSet, yOffSet) {
        var _this = this;
        var newStructure = new fabric.Image.fromURL('Client/images/' + name + '.png', function (img) {

            // Set lower left corner of image to tile indices   
            var structureImage = img.set({
                id: name,
                left: xOffSet + 0.5 * _this.tileWidth * (xIndex + yIndex),
                top: yOffSet + 0.5 * _this.tileHeight * (xIndex - yIndex) - height
            });
            _this.structureObjects.push(structureImage);
            _this.gameCanvas.add(structureImage);
            structureImage.selectable = false;
        });
    },

};