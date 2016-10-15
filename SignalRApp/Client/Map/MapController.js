

var MapController = {

    initialize: function (gameCanvas, canvasDimensions) {
        this.fabricUtilities = Object.create(FabricUtilities);

        this._gameCanvas = gameCanvas;

        this._canvasPixelWidth = canvasDimensions.width;
        this._canvasPixelHeight = canvasDimensions.height;

        this._leftShift = 0;
        this._topShift = 0;
    },

    getMapShifts: function () {
        var shifts = {
            left: this._leftShift,
            top: this._topShift
        };
        return shifts;
    },

    syncWithWindow: function (canvasDimensions) {
        this._canvasPixelWidth = canvasDimensions.width;
        this._canvasPixelHeight = canvasDimensions.height;
    },

    controlMap: function (KeyCode) {

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

        this.updateMapPosition(leftDelta, topDelta);
    },

    updateMapPosition: function (leftDelta, topDelta) {
        var canvasObjects = this._gameCanvas.getObjects();

        var atBoundary = this.checkForBoundary(canvasObjects, leftDelta, topDelta);

        if (atBoundary) {
            return;
        }

        for (var i = 0; i < canvasObjects.length; i++) {

            var currentLeft = canvasObjects[i].getLeft();
            var currentTop = canvasObjects[i].getTop();

            this.fabricUtilities.setObjectVisibility(canvasObjects[i],
                    currentLeft, currentTop,
                    this._canvasPixelWidth,
                    this._canvasPixelHeight);

            // Update bbject positions
            canvasObjects[i].set({
                left: currentLeft + leftDelta,
                top: currentTop + topDelta
            });
            canvasObjects[i].setCoords();
        }

        // Update current map shifts
        this._leftShift += leftDelta;
        this._topShift += topDelta;

        this._gameCanvas.renderAll();
    },

    checkForBoundary: function (canvasObjects, leftDelta, topDelta) {

        for (var i = 0; i < canvasObjects.length; i++) {
            // Obj is shorthand for canvasObjects[i]
            var obj = canvasObjects[i];
            var objLeft = obj.getLeft();
            var objTop = obj.getTop();
            var objWidth = obj.getWidth();
            var objHeight = obj.getHeight();

            var atBoundary = false;

            // Check first and last tile for boundaries
            // Exit if boundary will by overstepped
            if (obj.id && obj.id === 'landBackground') {
                if (objLeft + leftDelta > 0 ||
                    objTop + topDelta > 0 ||
                    objLeft + objWidth + leftDelta < this._canvasPixelWidth ||
                    objTop + objHeight + topDelta < this._canvasPixelHeight) {
                    atBoundary = true;
                    return atBoundary;
                }
            }
        }
    }

};