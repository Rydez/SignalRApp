
var PlayerManager = {
    _clientProxy: null,

    // Initialize functions for server to call
    initialize: function (gameProxy) {
        this._clientProxy = gameProxy;

        // Create player
        this._clientProxy.client.addPlayerToRoom = function (id, name, xPos, yPos) {
            $('#Game-Area')
                .prepend($('<div><p>' + name + '</p></div>')
                .attr('id', id)
                .css({ position: 'absolute', left: xPos, top: yPos }));
        }

        // Remove player
        this._clientProxy.client.removePlayerFromRoom = function (id) {
            $('#' + id).remove();
        }

        // Move player
        this._clientProxy.client.movePlayer = function (id, xPos, yPos) {
            $('#' + id).css({ left: xPos, top: yPos });
        }
    }
};
