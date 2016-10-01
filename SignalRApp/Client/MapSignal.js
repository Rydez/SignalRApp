
var MapSignal = {
    
    initialize: function (gameProxy, gameCanvas) {
        var _this = this;

        //Map fabric
        var mapFabric = Object.create(MapFabric);
        mapFabric.initialize(gameCanvas);
        mapFabric.createMap();

        _this._clientProxy = gameProxy;

        // Move Map
        _this._clientProxy.client.moveMap = function () {
            // Currently not implemented,
            // need better performance first.
        }
    }


};