

var CanvasManager = {
    initialize: function () {
        var _this = this;

        _this.overBoundary = false;

        // In units of tiles
        _this.mapWidth = 32;
        _this.mapHeight = 92;

        // In units of pixels
        _this.tileWidth = 80;
        _this.tileHeight = 40;
        _this._canvasPixelWidth;
        _this._canvasPixelHeight;

        // Indices to determine starting pos
        _this.xStartIndex = 6;
        _this.yStartIndex = 0;

        // Reference the canvas
        _this.gameCanvas = new fabric.StaticCanvas('game-canvas');

        _this.setCanvasProperties();
    },

    getCanvas: function () {
        var _this = this;

        return _this.gameCanvas;
    },

    getDimensions: function () {
        var _this = this;

        var dimensions = {
            width: _this._canvasPixelWidth,
            height: _this._canvasPixelHeight
        }

        return dimensions;
    },

    setCanvasProperties: function () {
        var _this = this;

        // Optimization configurations
        _this.gameCanvas.renderOnAddRemove = false;
        _this.gameCanvas.stateful = false;
        _this.gameCanvas.skipTargetFind = true;
        _this.gameCanvas.backgroundColor = "white";
        _this.calculateCanvasSize();
    },

    calculateCanvasSize: function () {
        var _this = this;

        var containerWidth = $('#main-container').width();
        var containerHeight = $('#main-container').height();

        // Round canvas dimensions down so that
        // the dimensions are an even number of
        // tile halves
        _this._canvasPixelWidth = Math.floor(containerWidth / (0.5 * _this.tileWidth)) * 0.5 * _this.tileWidth;
        _this._canvasPixelHeight = Math.floor(containerHeight / (0.5 * _this.tileHeight)) * 0.5 * _this.tileHeight;

        _this.gameCanvas.setWidth(_this._canvasPixelWidth);
        _this.gameCanvas.setHeight(_this._canvasPixelHeight);

        _this.gameCanvas.calcOffset();

        var canvasDimensions = {
            width: _this._canvasPixelWidth,
            height: _this._canvasPixelHeight
        };

        return canvasDimensions;
    },

    mapShiftAdjustment: function () {
        var _this = this;

        // Adjust map shift so that map is within
        // boundaries when browser is expanded
        var canvasObjects = _this.gameCanvas.getObjects();

        _this.overBoundary = false;
        var xOverBoundary = 0;
        var yOverBoundary = 0;
        for (var i = 0; i < canvasObjects.length; i++) {
            var currentLeft = canvasObjects[i].getLeft();
            var currentTop = canvasObjects[i].getTop();
            if (canvasObjects[i].id && canvasObjects[i].id === 'lastTile') {
                if (currentLeft - (_this.tileWidth / 2) < _this._canvasPixelWidth) {
                    xOverBoundary = (_this._canvasPixelWidth - currentLeft) - (_this.tileWidth / 2);
                    _this.overBoundary = true;
                }

                if (currentTop - (_this.tileHeight / 2) < _this._canvasPixelHeight) {
                    yOverBoundary = (_this._canvasPixelHeight - currentTop) - (_this.tileHeight / 2);
                    _this.overBoundary = true;
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
        var _this = this;

        var canvasObjects = _this.gameCanvas.getObjects();

        for (var i = 0; i < canvasObjects.length; i++) {
            var currentLeft = canvasObjects[i].getLeft();
            var currentTop = canvasObjects[i].getTop();

            if (_this.overBoundary) {
                var xAdjusted = currentLeft + shiftAdjustment.xOverBoundary;
                var yAdjusted = currentTop + shiftAdjustment.yOverBoundary;

                // Update object positions
                canvasObjects[i].set({
                    left: xAdjusted,
                    top: yAdjusted
                });

                canvasObjects[i].setCoords();
            }
            _this.setObjectVisibility(canvasObjects[i],
                                      xAdjusted,
                                      yAdjusted);
        }
        _this.gameCanvas.renderAll();
    },

    // This might not belong here. Is duplicate from mapFabric
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

    resizeCanvas: function () {
        var _this = this;

        var canvasDimensions = _this.calculateCanvasSize();

        // Get necessary adjustment from browser expansion
        var shiftAdjustment = _this.mapShiftAdjustment();

        // Update the positions and visibilities 
        // upon browser expansion
        _this.updateFabricProperties(shiftAdjustment);

    }
};