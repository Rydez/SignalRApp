

var Wilderness = {

    initialize: function (gameProxy, gameCanvas, canvasDimensions, structureObjects,
                        villageBackground, allPlayersOnCanvas, gameConstants, villageCursor) {
        this.gameProxy = gameProxy;
        this.gameCanvas = gameCanvas;
        this.canvasDimensions = canvasDimensions;
        this.gameConstants = gameConstants;

        this.tileWidth = gameConstants.tileWidth;
        this.tileHeight = gameConstants.tileHeight;

        this.xTileOrigin = gameConstants.xTileOrigin;
        this.yTileOrigin = gameConstants.yTileOrigin;

        this.canvasPixelWidth = canvasDimensions.width;
        this.canvasPixelHeight = canvasDimensions.height;

        this.structureObjects = structureObjects;
        this.villageBackground = villageBackground;
        this.villageCursor = villageCursor;

        this.allPlayersOnCanvas = allPlayersOnCanvas;

        this.structureIndices = [];

        this.numberOfGrassTiles = 0;

        //var _this = this;
        //gameProxy.client.switchToWilderness = function (wildernessInfo) {
        //    _this.wildernessWidth = wildernessInfo.wildernessWidth;
        //    _this.wildernessHeight = wildernessInfo.wildernessHeight;

        //    _this.structureObjects = wildernessInfo.wildernessStructureObjects;

        //    _this.clearVillage();
        //    _this.createWilderness();

        //    _this.wildernessCursor = Object.create(CursorFabric);
        //    _this.wildernessCursor.initialize(_this.gameCanvas, _this.gameConstants,
        //            _this.structureIndices, _this.canvasDimensions);

        //    // Add players in party
        //    _this.gameProxy.server.addPartyMembers();

        //    _this.gameCanvas.renderAll();
        //};
    },

    clearVillageAndCreateWilderness: function (wildernessInfo) {
        this.wildernessWidth = wildernessInfo.wildernessWidth;
        this.wildernessHeight = wildernessInfo.wildernessHeight;

        this.wildernessStructureInfo = wildernessInfo.wildernessStructureObjects;

        this.clearVillage();
        this.createWilderness();

        //this.wildernessCursor = Object.create(CursorFabric);
        //this.wildernessCursor.initialize(this.gameCanvas, this.gameConstants,
        //        this.structureIndices, this.canvasDimensions);
        //this.wildernessCursor._cursor.moveTo(1);

        // Add players in party
        this.gameProxy.server.addPartyMembers();


        this.gameCanvas.renderAll();
    },

    // TODO: Consider moving this to the villageCreator
    clearVillage: function () {
        
        this.structureObjects.length = 0;

        // Clear everything so that background can be cached
        this.gameCanvas.clear();

        //// Clear village and structures
        //this.gameCanvas.remove(this.villageBackground);
        //for (var i = 0; i < this.structureObjects.length; i++) {
        //    this.gameCanvas.remove(this.structureObjects[i]);
        //}

        //// Clear all players
        //for (var i = 0; i < this.allPlayersOnCanvas.length; i++) {
        //    this.gameCanvas.remove(this.allPlayersOnCanvas[i]);
        //}

        //// Clear village cursor
        //this.gameCanvas.remove(this.villageCursor);
    },

    createWilderness: function () {
        this.createLand();
        this.createStructures(this.wildernessStructureInfo, this.structureIndices);
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
                this.addGrassTile(leftPosition, topPosition);
                //this.numberOfGrassTiles += 1;

                //// Cache on last grass tile
                //if (this.numberOfGrassTiles === this.wildernessWidth * this.wildernessHeight) {
                //    this.cacheLand();
                //}
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

        this.numberOfGrassTiles += 1;

        // Cache on last grass tile
        if (this.numberOfGrassTiles === this.wildernessWidth * this.wildernessHeight) {
            this.cacheLand();
        }
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
            //_this.gameCanvas.sendToBack(_this.wildernessBackground);

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