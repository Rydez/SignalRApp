
var MapFabric = {
    initialize: function (gameCanvas) {
        var _this = this;
        _this._gameCanvas = gameCanvas;
        
        // In units of tiles
        _this._mapWidth = 16;
        _this._mapHeight = 46;

        // In units of pixels
        _this._tileWidth = 80;
        _this._tileHeight = 40;
        _this._xOrigin = -0.5 * _this._tileWidth;
        _this._yOrigin = -0.5 * _this._tileHeight;
    },

    createMap: function () {
        var _this = this;
        var tileGroup = new fabric.Group();
        for (var i = 0; i < _this._mapHeight; i++) {
            for (var j = 0; j < _this._mapWidth; j++) {
                var xOffSet = (i % 2 === 0) ? 0 : 0.5 * _this._tileWidth;

                var leftPosition = _this._xOrigin + xOffSet + j * _this._tileWidth;
                var topPosition = _this._yOrigin + i * 0.5 * _this._tileHeight;
                var tile = _this.getTile(leftPosition, topPosition);

                tileGroup.add(tile);
            }
        }
        _this._gameCanvas.add(tileGroup);
        _this._gameCanvas.renderAll();
    },

    getTile: function (leftPosition, topPosition) {
        var randLevel = Math.floor(Math.random() * (150 - 60 + 1) + 60);
        var rgbPiece = randLevel.toString();
        var rgbColor = 'rgb(' + rgbPiece + ',' + rgbPiece + ',' + rgbPiece + ')';

        var tile = new fabric.Path('M 0 20 L 40 0 L 80 20 L 40 40 z');
        tile.set({ left: leftPosition, top: topPosition, fill: rgbColor });

        return tile;
    }
};