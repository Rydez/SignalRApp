
var CursorFabric = {
    initialize: function (gameCanvas, gameConstants, structureIndices) {
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
        if (KeyCode == 87) {
            if (xIdx - yIdx > 1 && xIdx + yIdx < 2*mWidth - 4) {
                _this._yCursorIndex += 1;
                if (_this.cursorCollision(_this._xCursorIndex, _this._yCursorIndex)) {
                    _this._yCursorIndex -= 1;
                }
            }
        }

        // a = 65
        if (KeyCode == 65) {
            if (xIdx - yIdx > 1 && xIdx + yIdx > 1) {
                _this._xCursorIndex -= 1;
                if (_this.cursorCollision(_this._xCursorIndex, _this._yCursorIndex)) {
                    _this._xCursorIndex += 1;
                }
            }
        }

        // s = 83
        if (KeyCode == 83) {
            if (xIdx + yIdx > 1 && xIdx - yIdx < mHeight - 4) {
                _this._yCursorIndex -= 1;
                if (_this.cursorCollision(_this._xCursorIndex, _this._yCursorIndex)) {
                    _this._yCursorIndex += 1;
                }
            }
        }

        // d = 68
        if (KeyCode == 68) {
            if (xIdx - yIdx < mHeight - 4 && xIdx + yIdx < 2*mWidth - 4) {
                _this._xCursorIndex += 1;
                if (_this.cursorCollision(_this._xCursorIndex, _this._yCursorIndex)) {
                    _this._xCursorIndex -= 1;
                }
            }
        }

        // Update the tile position
        _this.xCursorPos = 0.5 * _this._tileWidth * (_this._xCursorIndex + _this._yCursorIndex);
        _this.yCursorPos = 0.5 * _this._tileHeight * (_this._xCursorIndex - _this._yCursorIndex);
        _this._cursor.set({
            left: _this.xCursorPos,
            top: _this.yCursorPos
        });
        _this._cursor.setCoords();
        _this._gameCanvas.renderAll();
    }
};