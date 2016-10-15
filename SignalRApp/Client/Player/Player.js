
var Player = {
    initialize: function (gameProxy, gameCanvas, gameConstants,
            structureObjects, canvasDimensions) {

        this.playerController = Object.create(PlayerController);
        this.playerController.initialize(gameProxy, gameCanvas, structureObjects,
                canvasDimensions, gameConstants);

        this.playerCreator = Object.create(PlayerCreator);
        this.playerCreator.initialize(gameCanvas, structureObjects,
                canvasDimensions, gameConstants);

        // PlayerSignal contains server calling functions
        this.playerSignal = Object.create(PlayerSignal);
        this.playerSignal.initialize(gameProxy, this.playerCreator, this.playerController);
    }
};