
var PlayerSignal = {

    // Initialize functions for server to call
    initialize: function (gameProxy, playerCreator, playerController, playerDisplay) {

        // Create player
        gameProxy.client.addPlayerToRoom = function (isLocalPlayer, id, name, xPos, yPos, level,
                                                     gold, health, mana) {
            if (playerCreator.playerSprite && isLocalPlayer) {
                playerCreator.reAddPlayer();
            }
            else {
                playerCreator.createPlayer(isLocalPlayer, id, name, xPos, yPos, level, gold,
                          health, mana);
            }
        };

        // Create remote player display
        gameProxy.client.createRemotePlayerDisplay = function (isLocalPlayer, id, name, level, gold,
                                                               health, mana) {
            var isSecondary = true;
            playerDisplay.createPlayerDisplay(isLocalPlayer, id, name, level, gold, health, mana, isSecondary);
        };

        // Remove player
        gameProxy.client.removePlayerFromRoom = function (id) {
            playerCreator.removePlayerSprite(id);
        };

        // Move player
        gameProxy.client.moveRemotePlayers = function (serializedOtherPlayerMovements) {
            var otherPlayerMovements = JSON.parse(serializedOtherPlayerMovements);
            if (playerCreator && playerCreator.playerSprite) {
                playerController.updateRemotePlayerMovements(otherPlayerMovements);
                playerController.moveRemotePlayerSprites();
            }
        };
    }
};
