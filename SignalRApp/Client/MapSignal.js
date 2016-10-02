
var MapSignal = {
    
    initialize: function (gameProxy) {
        var _this = this;


        _this._clientProxy = gameProxy;

        // Move Map
        _this._clientProxy.client.moveMap = function () {
            // Currently not implemented,
            // need better performance first.
        }
    }


};