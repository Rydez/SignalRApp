

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
        // boundaries when browser is expanded
        var canvasObjects = this.gameCanvas.getObjects();

        this.overBoundary = false;
        var xOverBoundary = 0;
        var yOverBoundary = 0;
        for (var i = 0; i < canvasObjects.length; i++) {
            var currentLeft = canvasObjects[i].getLeft();
            var currentTop = canvasObjects[i].getTop();
            if (canvasObjects[i].id && canvasObjects[i].id === 'lastTile') {
                if (currentLeft - (this.tileWidth / 2) < this._canvasPixelWidth) {
                    xOverBoundary = (this._canvasPixelWidth - currentLeft) - (this.tileWidth / 2);
                    this.overBoundary = true;
                }

                if (currentTop - (this.tileHeight / 2) < this._canvasPixelHeight) {
                    yOverBoundary = (this._canvasPixelHeight - currentTop) - (this.tileHeight / 2);
                    this.overBoundary = true;
                }
            }
        }

        var shiftAdjustment = {
            xOverBoundary: xOverBoundary,
            yOverBoundary: yOverBoundary
        };

        return shiftAdjustment;
    },

    updateFabricProperties: function (shiftAdjustment) {

        var canvasObjects = this.gameCanvas.getObjects();

        for (var i = 0; i < canvasObjects.length; i++) {
            var currentLeft = canvasObjects[i].getLeft();
            var currentTop = canvasObjects[i].getTop();

            if (this.overBoundary) {
                var xAdjusted = currentLeft + shiftAdjustment.xOverBoundary;
                var yAdjusted = currentTop + shiftAdjustment.yOverBoundary;

                // Update object positions
                canvasObjects[i].set({
                    left: xAdjusted,
                    top: yAdjusted
                });

                canvasObjects[i].setCoords();
            }
            this.fabricUtilities.setObjectVisibility(canvasObjects[i],
                                                     xAdjusted, yAdjusted,
                                                     this._canvasPixelWidth,
                                                     this._canvasPixelHeight);
        }
        this.gameCanvas.renderAll();
    },

    resizeCanvas: function () {

        var canvasDimensions = this.calculateCanvasSize();

        // Get necessary adjustment from browser expansion
        var shiftAdjustment = this.mapShiftAdjustment();

        // Update the positions and visibilities 
        // upon browser expansion
        this.updateFabricProperties(shiftAdjustment);
    }
};