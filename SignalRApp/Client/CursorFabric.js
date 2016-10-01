
var CursorFabric = {
    initialize: function (gameCanvas, xStart, yStart) {
        var _this = this;
        _this._gameCanvas = gameCanvas;

        // In units of pixels
        _this._tileWidth = 80;
        _this._tileHeight = 40;

        _this._xCursorIndex = xStart;
        _this._yCursorIndex = yStart;

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

    moveCursor: function (KeyCode) {
        var _this = this;
        // Change its position
        // w = 87
        if (KeyCode == 87) {
            _this._yCursorIndex += 1;

        }
        // a = 65
        if (KeyCode == 65) {
            _this._xCursorIndex -= 1;

        }
        // s = 83
        if (KeyCode == 83) {
            _this._yCursorIndex -= 1;
        }
        // d = 68
        if (KeyCode == 68) {
            _this._xCursorIndex += 1;
        }
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