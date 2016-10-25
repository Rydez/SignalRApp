
var CursorFabric = {
    initialize: function (gameCanvas, gameConstants, structureIndices,
                          canvasDimensions) {

        this.fabricUtilities = Object.create(FabricUtilities);

        this._gameCanvas = gameCanvas;

        this._structureIndices = structureIndices;

        // In units of tiles
        this._mapWidth = gameConstants.mapWidth;
        this._mapHeight = gameConstants.mapHeight;

        // In units of pixels
        this._tileWidth = gameConstants.tileWidth;
        this._tileHeight = gameConstants.tileHeight;

        this._xCursorIndex = gameConstants.xStartIndex;
        this._yCursorIndex = gameConstants.yStartIndex;

        this.xCursorPos = 0.5 * this._tileWidth * (this._xCursorIndex + this._yCursorIndex);
        this.yCursorPos = 0.5 * this._tileHeight * (this._xCursorIndex - this._yCursorIndex);

        this.mapLeftShift = 0;
        this.mapTopShift = 0;

        this._canvasPixelWidth = canvasDimensions.width;
        this._canvasPixelHeight = canvasDimensions.height;

        // Steps to traverse
        this.pathSteps = [];
        this.pathTiles = [];

        this.createCursor();
    },

    resetPathSteps: function () {

        this.pathSteps = [];
        for (var i = 0; i < this.pathTiles.length; i++) {
            this._gameCanvas.remove(this.pathTiles[i]);
        }
        this._gameCanvas.renderAll();
    },

    syncWithWindow: function (canvasDimensions) {

        this._canvasPixelWidth = canvasDimensions.width;
        this._canvasPixelHeight = canvasDimensions.height;
    },

    syncWithMap: function (shifts) {

        this.mapLeftShift = shifts.left;
        this.mapTopShift = shifts.top;
    },

    getPathSteps: function () {

        return this.pathSteps;
    },

    getCursorIndices: function () {

        var indices = {
            xIndex: this._xCursorIndex,
            yIndex: this._yCursorIndex
        };

        return indices;
    },

    createCursor: function () {

        var cursor = new fabric.Path('M 0 20 L 40 0 L 80 20 L 40 40 z');
        cursor.set({
            left: this.xCursorPos,
            top: this.yCursorPos,
            stroke: 'white',
            strokeWidth: 3,
            opacity: 0.7
        });
        this._cursor = cursor;
        this._gameCanvas.add(this._cursor);
    },

    cursorCollision: function (xCursorIndex, yCursorIndex) {

        var isCollided = false;
        var allStructureIndices = this._structureIndices;

        
        for (var i = 0; i < allStructureIndices.length; i++) {
            var singleStructureIndices = allStructureIndices[i];
            for (var j = 0; j < singleStructureIndices.length; j++) {
                var coveredTile = singleStructureIndices[j];
                if (coveredTile.xIndex === xCursorIndex && coveredTile.yIndex === yCursorIndex) {
                    isCollided = true;
                }
            }
        }
        return isCollided;
    },

    addPathStep: function (xOldIndex, yOldIndex) {

        // For first step add the player's position
        if (this.pathSteps.length === 0) {
            var firstStep = {
                xStepIndex: xOldIndex,
                yStepIndex: yOldIndex
            }
            this.pathSteps.push(firstStep);
        }

        // Always add the end position
        var newStep = {
            xStepIndex: this._xCursorIndex,
            yStepIndex: this._yCursorIndex
        }
        this.pathSteps.push(newStep);

        // Add to list of path tiles
        var pathTile = new fabric.Path('M 0 20 L 40 0 L 80 20 L 40 40 z');
        pathTile.set({
            left: this._cursor.getLeft(),
            top: this._cursor.getTop(),
            fill: 'rgb(186, 44, 44)',
            opacity: 0.5
        });
        this.pathTiles.push(pathTile);
        this._gameCanvas.add(pathTile);

        // Bring the path tiles above the land image.
        // Land image is zeroth, so cursor stuff is first.
        pathTile.moveTo(1);
        pathTile.selectable = false;
    },

    updateCursorPosition: function () {

        this.xCursorPos = 0.5 * this._tileWidth * (this._xCursorIndex + this._yCursorIndex);
        this.yCursorPos = 0.5 * this._tileHeight * (this._xCursorIndex - this._yCursorIndex);
        var leftCursor = this.mapLeftShift + this.xCursorPos;
        var topCursor = this.mapTopShift + this.yCursorPos;
        this.fabricUtilities.setObjectVisibility(this._cursor,
                                         leftCursor, topCursor,
                                         this._canvasPixelWidth,
                                         this._canvasPixelHeight);

        this._cursor.set({
            left: leftCursor,
            top: topCursor
        });
        this._cursor.setCoords();
    },

    uncreatePath: function (KeyCode) {

        // 27 is key code for esc
        if (KeyCode === 27 && this.pathSteps.length !== 0) {
            var stepObj = this.pathSteps[0];
            this._xCursorIndex = stepObj.xStepIndex;
            this._yCursorIndex = stepObj.yStepIndex;
        
            this.updateCursorPosition();

            this.resetPathSteps();
        }
    },

    moveCursor: function (KeyCode) {
        
        // Use these shorthand indices for boundary checking
        var xIdx = this._xCursorIndex;
        var yIdx = this._yCursorIndex;
        var mWidth = this._mapWidth;
        var mHeight = this._mapHeight;
        // Padding extends the boundary inward

        // Change its position

        //TODO//
        // Find a better way to undo movement when
        // there is a collision so that there is 
        // less repetition. Checking collision is
        // causing slow down of cursor movement.
        // Try to break from collision check sooner

        // w = 87
        if (KeyCode === 87) {
            if (xIdx - yIdx > 1 && xIdx + yIdx < 2*mWidth - 4) {
                this._yCursorIndex += 1;
                if (this.cursorCollision(this._xCursorIndex, this._yCursorIndex)) {
                    this._yCursorIndex -= 1;
                    return;
                }
            }
        }

        // a = 65
        else if (KeyCode === 65) {
            if (xIdx - yIdx > 1 && xIdx + yIdx > 1) {
                this._xCursorIndex -= 1;
                if (this.cursorCollision(this._xCursorIndex, this._yCursorIndex)) {
                    this._xCursorIndex += 1;
                    return;
                }
            }
        }

        // s = 83
        else if (KeyCode === 83) {
            if (xIdx + yIdx > 1 && xIdx - yIdx < mHeight - 4) {
                this._yCursorIndex -= 1;
                if (this.cursorCollision(this._xCursorIndex, this._yCursorIndex)) {
                    this._yCursorIndex += 1;
                    return;
                }
            }
        }

        // d = 68
        else if (KeyCode === 68) {
            if (xIdx - yIdx < mHeight - 4 && xIdx + yIdx < 2*mWidth - 4) {
                this._xCursorIndex += 1;
                if (this.cursorCollision(this._xCursorIndex, this._yCursorIndex)) {
                    this._xCursorIndex -= 1;
                    return;
                }
            }
        }
        
        // Exit if no cursor movement key pressed
        else {
            return;
        }

        // Add a path tile at old cursor position
        // before updating the cursor position
        this.addPathStep(xIdx, yIdx);

        // Update the cursor position
        this.updateCursorPosition();

        // Rerender after updates
        this._gameCanvas.renderAll();
    }
};