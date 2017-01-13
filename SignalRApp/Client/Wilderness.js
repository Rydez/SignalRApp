

var Wilderness = {

    initialize: function (gameProxy, gameCanvas, canvasDimensions, structureObjects,
                        villageBackground, allPlayersOnCanvas, gameConstants, villageCursor) {
        this.gameProxy = gameProxy;
        this.gameCanvas = gameCanvas;
        this.gameConstants = gameConstants;

        this.tileWidth = gameConstants.tileWidth;
        this.tileHeight = gameConstants.tileHeight;

        this.xTileOrigin = gameConstants.xTileOrigin;
        this.yTileOrigin = gameConstants.yTileOrigin;

        this.canvasPixelWidth = canvasDimensions.width;
        this.canvasPixelHeight = canvasDimensions.height;

        this.structureObjects = structureObjects;
        this.villageBackground = villageBackground;

        this.allPlayersOnCanvas = allPlayersOnCanvas;

        this.structureIndices = [];

        this.numberOfGrassTiles = 0;

        gameProxy.client.createWilderness = function (wildernessInfo) {
            _this.wildernessWidth = wildernessInfo.wildernessWidth;
            _this.wildernessHeight = wildernessInfo.wildernessHeight;

            _this.structureObjects = wildernessInfo.wildernessStructureObjects;

            _this.createWilderness();

            _this.wildernessCursor = Object.create(CursorFabric);
            _this.wildernessCursor.initialize(_this.getCanvas, _this.gameConstants,
                    _this.structureIndices, _this.canvasDimensions);

            // Add players in party
            _this.gameProxy.server.addPartyMembers();
        };
    },

    // TODO: Consider moving this to the villageCreator
    clearVillage: function () {

        // Clear village and structures
        this.gameCanvas.remove(this.villageBackground);
        for (var i = 0; i < this.structureObjects.length; i++) {
            this.gameCanvas.remove(this.structureObjects[i]);
        }

        // Clear all players
        for (var i = 0; i < this.allPlayersOnCanvas.length; i++) {
            this.gameCanvas.remove(this.allPlayersOnCanvas[i]);
        }

        // Clear village cursor
        this.gameCavnase.remove(villageCursor);
    },

    createWilderness: function () {
        this.createLand();
        this.createStructures(this.structureObjects, this.structureIndices);
    },

    createLand: function (wildernessInfo) {
        for (var i = 0; i < this.wildernessWidth; i++) {
            for (var j = 0; j < this.wildernessHeight; j++) {

                // Off set every other row
                var xOffSet = (i % 2 === 0) ? 0 : 0.5 * this.tileWidth;

                // Calculate position in units of pixels
                var leftPosition = this.xTileOrigin + xOffSet + j * this.tileWidth;
                var topPosition = this.yTileOrigin + i * 0.5 * this.tileHeight;

                // Create the tile
                this.addGrassTile(leftPosition, topPosition);
                this.numberOfGrassTiles += 1;

                // Cache on last grass tile
                if (this.numberOfGrassTiles === this.wildernessWidth * this.wildernessHeight) {
                    this.cacheLand();
                }
            }
        }
    },

    addGrassTile: function (leftPosition, topPosition) {
        var _this = this;
        var grassTile = new fabric.Image.fromURL('Client/images/grass_tile.png', function (img) {
            _this.setupGrassTile(img, leftPosition, topPosition);
        });
    },

    setupGrassTile: function (img, leftPosition, topPosition) {
        var grassTileImage = img.set({
            id: 'grassTile',
            left: leftPosition,
            top: topPosition
        });
        this.gameCanvas.add(grassTileImage);
        grassTileImage.selectable = false;
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
            _this.villageBackground = landImg;
            _this.gameCanvas.add(_this.villageBackground);
            _this.villageBackground.moveTo(0);
            _this.villageBackground.selectable = false;
        });
    },

    createStructures: function (structureObjects, structureIndices) {


        for (var i = 0; i < structureObjects.length; i++) {

            // 's' is shorthand for structureObjects[i]
            var s = structureObjects[i];
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