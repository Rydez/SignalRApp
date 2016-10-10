
var CursorFabric = {
    initialize: function (gameCanvas, gameConstants, structureIndices,
                          canvasDimensions) {
        var _this = this;
        _this._gameCanvas = gameCanvas;

        _this._structureIndices = structureIndices;

        // In units of tiles
        _this._mapWidth = gameConstants.mapWidth;
        _this._mapHeight = gameConstants.mapHeight;

        // In units of pixels
        _this._tileWidth = 80;
        _this._tileHeight = 40;

        _this._xCursorIndex = gameConstants.xStartIndex;
        _this._yCursorIndex = gameConstants.yStartIndex;

        _this.xCursorPos = 0.5 * _this._tileWidth * (_this._xCursorIndex + _this._yCursorIndex);
        _this.yCursorPos = 0.5 * _this._tileHeight * (_this._xCursorIndex - _this._yCursorIndex);

        _this.mapLeftShift = 0;
        _this.mapTopShift = 0;

        _this._canvasPixelWidth = canvasDimensions.width;
        _this._canvasPixelHeight = canvasDimensions.height;

        // Steps to traverse
        _this.pathSteps = [];
        _this.pathTiles = [];

        _this.createCursor();
    },

    resetPathSteps: function () {
        var _this = this;

        _this.pathSteps = [];
        for (var i = 0; i < _this.pathTiles.length; i++) {
            _this._gameCanvas.remove(_this.pathTiles[i]);
        }
        _this._gameCanvas.renderAll();
    },

    syncWithWindow: function (canvasDimensions) {
        var _this = this;

        _this._canvasPixelWidth = canvasDimensions.width;
        _this._canvasPixelHeight = canvasDimensions.height;
    },

    syncWithMap: function (shifts) {
        var _this = this;

        _this.mapLeftShift = shifts.left;
        _this.mapTopShift = shifts.top;
    },

    getPathSteps: function () {
        var _this = this;

        return _this.pathSteps;
    },

    getCursorIndices: function () {
        var _this = this;

        var indices = {
            xIndex: _this._xCursorIndex,
            yIndex: _this._yCursorIndex
        };

        return indices;
    },

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

    createCursor: function () {
        var _this = this;

        var cursor = new fabric.Path('M 0 20 L 40 0 L 80 20 L 40 40 z');
        cursor.set({
            left: _this.xCursorPos,
            top: _this.yCursorPos,
            stroke: 'white',
            strokeWidth: 3,
            opacity: 0.7
        });
        _this._cursor = cursor;
        _this._gameCanvas.add(_this._cursor);
        _this._gameCanvas.renderAll();
    },

    cursorCollision: function (xCursorIndex, yCursorIndex) {
        var _this = this;

        var isCollided = false;
        var allStructureIndices = _this._structureIndices;

        
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
        var _this = this;

        // For first step add the player's position
        if (_this.pathSteps.length === 0) {
            var firstStep = {
                xStepIndex: xOldIndex,
                yStepIndex: yOldIndex
            }
            _this.pathSteps.push(firstStep);
        }

        // Always add the end position
        var newStep = {
            xStepIndex: _this._xCursorIndex,
            yStepIndex: _this._yCursorIndex
        }
        _this.pathSteps.push(newStep);

        // Add to list of path tiles
        var pathTile = new fabric.Path('M 0 20 L 40 0 L 80 20 L 40 40 z');
        pathTile.set({
            left: _this._cursor.getLeft(),
            top: _this._cursor.getTop(),
            fill: 'rgb(186, 44, 44)',
            opacity: 0.5
        });
        _this.pathTiles.push(pathTile);
        _this._gameCanvas.add(pathTile);

        // Bring the path tiles above the land image.
        // Land image is first, so cursor is second.
        pathTile.moveTo(2);
    },

    updateCursorPosition: function () {
        var _this = this;

        _this.xCursorPos = 0.5 * _this._tileWidth * (_this._xCursorIndex + _this._yCursorIndex);
        _this.yCursorPos = 0.5 * _this._tileHeight * (_this._xCursorIndex - _this._yCursorIndex);
        var leftCursor = _this.mapLeftShift + _this.xCursorPos;
        var topCursor = _this.mapTopShift + _this.yCursorPos;
        _this.setObjectVisibility(_this._cursor, leftCursor, topCursor);
        _this._cursor.set({
            left: leftCursor,
            top: topCursor
        });
        _this._cursor.setCoords();
    },

    uncreatePath: function () {
        var _this = this;

        var stepObj = _this.pathSteps[0];
        _this._xCursorIndex = stepObj.xStepIndex;
        _this._yCursorIndex = stepObj.yStepIndex;
        
        _this.updateCursorPosition();

        _this.resetPathSteps();
    },

    moveCursor: function (KeyCode) {
        var _this = this;
        
        // Use these shorthand indices for boundary checking
        var xIdx    = _this._xCursorIndex;
        var yIdx    = _this._yCursorIndex;
        var mWidth  = _this._mapWidth;
        var mHeight = _this._mapHeight;
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
                _this._yCursorIndex += 1;
                if (_this.cursorCollision(_this._xCursorIndex, _this._yCursorIndex)) {
                    _this._yCursorIndex -= 1;
                    return;
                }
            }
        }

        // a = 65
        else if (KeyCode === 65) {
            if (xIdx - yIdx > 1 && xIdx + yIdx > 1) {
                _this._xCursorIndex -= 1;
                if (_this.cursorCollision(_this._xCursorIndex, _this._yCursorIndex)) {
                    _this._xCursorIndex += 1;
                    return;
                }
            }
        }

        // s = 83
        else if (KeyCode === 83) {
            if (xIdx + yIdx > 1 && xIdx - yIdx < mHeight - 4) {
                _this._yCursorIndex -= 1;
                if (_this.cursorCollision(_this._xCursorIndex, _this._yCursorIndex)) {
                    _this._yCursorIndex += 1;
                    return;
                }
            }
        }

        // d = 68
        else if (KeyCode === 68) {
            if (xIdx - yIdx < mHeight - 4 && xIdx + yIdx < 2*mWidth - 4) {
                _this._xCursorIndex += 1;
                if (_this.cursorCollision(_this._xCursorIndex, _this._yCursorIndex)) {
                    _this._xCursorIndex -= 1;
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
        _this.addPathStep(xIdx, yIdx);

        // Update the cursor position
        _this.updateCursorPosition();

        // Rerender after updates
        _this._gameCanvas.renderAll();
    }
};