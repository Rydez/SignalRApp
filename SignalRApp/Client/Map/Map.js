
var Map = {

    initialize: function (gameCanvas, canvasDimensions, gameConstants) {

        this.villageCreator = Object.create(VillageCreator);
        this.villageCreator.initialize(gameCanvas, canvasDimensions, gameConstants);

        this.mapController = Object.create(MapController);
        this.mapController.initialize(gameCanvas, canvasDimensions);
    }
};