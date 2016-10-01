
var PlayerSignal = {

    // Initialize functions for server to call
    initialize: function (gameProxy, playerFabric) {
        var _this = this;
        //TODO//
        //Probably should remove this and just have
        //the proxy as and arg, instead of reassigning it
        //to _this._clientProxy.
        _this._clientProxy = gameProxy;

        // Create player
        _this._clientProxy.client.addPlayerToRoom = function (id, name, xPos, yPos) {
            playerFabric.createPlayerSprite(id, name, xPos, yPos);
        }

        // Remove player
        _this._clientProxy.client.removePlayerFromRoom = function (id) {
            playerFabric.removePlayerSprite(id);
        }

        // Move player
        _this._clientProxy.client.movePlayer = function (id, xPos, yPos) {
            playerFabric.movePlayerSprite(id, xPos, yPos);
        }
    }
};
