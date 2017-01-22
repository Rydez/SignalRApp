

var CanvasManager = {
    initialize: function () {

        this.fabricUtilities = Object.create(FabricUtilities);

        this.overBoundary = false;

        // In units of tiles
        this.mapWidth = 32;
        this.mapHeight = 92;

        // In units of pixels
        this.tileWidth = 80;
        this.tileHeight = 40;
        this._canvasPixelWidth;
        this._canvasPixelHeight;

        // Indices to determine starting pos
        this.xStartIndex = 9;
        this.yStartIndex = 0;

        // Reference the canvas
        this.gameCanvas = new fabric.Canvas('game-canvas');

        this.setCanvasProperties();
    },

    getCanvas: function () {
        return this.gameCanvas;
    },

    getDimensions: function () {
        var dimensions = {
            width: this._canvasPixelWidth,
            height: this._canvasPixelHeight
        }

        return dimensions;
    },

    setCanvasProperties: function () {

        // Optimization configurations

        // Commented to enable correct event targets
        //this.gameCanvas.skipTargetFind = true;
        this.gameCanvas.renderOnAddRemove = false;
        this.gameCanvas.stateful = false;
        this.gameCanvas.selection = false;
        this.gameCanvas.backgroundColor = 'rgb(66, 48, 19)';
        this.gameCanvas.hoverCursor = 'default';
        this.gameCanvas.defaultCursor = 'default';
        this.calculateCanvasSize();
    },

    calculateCanvasSize: function () {

        var containerWidth = $('#main-container').width();
        var containerHeight = $('#main-container').height();

        // Round canvas dimensions down so that
        // the dimensions are an even number of
        // tile halves
        this._canvasPixelWidth = Math.floor(containerWidth / (0.5 * this.tileWidth)) * 0.5 * this.tileWidth;
        this._canvasPixelHeight = Math.floor(containerHeight / (0.5 * this.tileHeight)) * 0.5 * this.tileHeight;

        this.gameCanvas.setWidth(this._canvasPixelWidth);
        this.gameCanvas.setHeight(this._canvasPixelHeight);

        this.gameCanvas.calcOffset();

        var canvasDimensions = {
            width: this._canvasPixelWidth,
            height: this._canvasPixelHeight
        };

        return canvasDimensions;
    },

    mapShiftAdjustment: function () {

        // Adjust map shift so that map is within
        // boundaries when browser is expanded on the right
        // and bottom when the map has been scrolled completely
        // to the right or bottom
        var canvasObjects = this.gameCanvas.getObjects();

        this.overBoundary = false;
        var xOverBoundary = 0;
        var yOverBoundary = 0;
        for (var i = 0; i < canvasObjects.length; i++) {
            if (canvasObjects[i].id && canvasObjects[i].id === 'landBackground') {
                var backgroundLeft = canvasObjects[i].getLeft();
                var backgroundTop = canvasObjects[i].getTop();
                var backgroundWidth = canvasObjects[i].width;
                var backgroundHeight = canvasObjects[i].height;
                if (backgroundLeft + backgroundWidth < this._canvasPixelWidth) {
                    xOverBoundary = this._canvasPixelWidth - (backgroundLeft + backgroundWidth);
                    this.overBoundary = true;
                }

                if (backgroundTop + backgroundHeight < this._canvasPixelHeight) {
                    yOverBoundary = this._canvasPixelHeight - (backgroundTop + backgroundHeight);
                    this.overBoundary = true;
                }
            }
        }

        var shiftAdjustment = {
            left: xOverBoundary,
            top: yOverBoundary
        };

        return shiftAdjustment;
    },

    updateFabricProperties: function (shiftAdjustment) {

        var canvasObjects = this.gameCanvas.getObjects();

        for (var i = 0; i < canvasObjects.length; i++) {
            var currentLeft = canvasObjects[i].getLeft();
            var currentTop = canvasObjects[i].getTop();

            if (this.overBoundary) {
                var xAdjusted = currentLeft + shiftAdjustment.left;
                var yAdjusted = currentTop + shiftAdjustment.top;

                // Update object positions
                canvasObjects[i].set({
                    left: xAdjusted,
                    top: yAdjusted
                });

                canvasObjects[i].setCoords();
            }
            this.fabricUtilities.setObjectVisibility(canvasObjects[i],
                                   xAdjusted, yAdjusted, this._canvasPixelWidth,
                                   this._canvasPixelHeight);
        }
        this.gameCanvas.renderAll();
    },

    resizeCanvas: function (map, player, party, cursor) {
        var canvasDimensions = this.calculateCanvasSize();

        // Get necessary adjustment from browser expansion
        var shiftAdjustment = this.mapShiftAdjustment();

        // Sync up elements with correct adjustments
        map.mapController._leftShift += shiftAdjustment.left;
        map.mapController._topShift += shiftAdjustment.top;
        map.mapController.syncComponentsWithMap(player, party, cursor);

        // Update the positions and visibilities 
        // upon browser expansion
        this.updateFabricProperties(shiftAdjustment);
    }
};