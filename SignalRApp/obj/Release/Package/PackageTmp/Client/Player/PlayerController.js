

var PlayerController = {
    initialize: function (gameProxy, gameCanvas, structureObjects,
                          canvasDimensions, gameConstants) {

        this.fabricUtilities = Object.create(FabricUtilities);
        this.playerUtilities = Object.create(PlayerUtilities);
        this.playerUtilities.initialize(gameCanvas, structureObjects, gameConstants);

        this._gameProxy = gameProxy;

        this._gameCanvas = gameCanvas;

        this.stepIncrement = 0;
        this.pathSteps = [];
        this.playerIsMoving = false;

        this._structureObjects = structureObjects;

        // In units of pixels
        this._tileWidth = gameConstants.tileWidth;
        this._tileHeight = gameConstants.tileHeight;
        this._canvasPixelWidth = canvasDimensions.width;
        this._canvasPixelHeight = canvasDimensions.height;
        this.mapLeftShift = 0;
        this.mapTopShift = 0;
    },

    syncWithCursor: function (pathSteps) {

        this.pathSteps = pathSteps;
    },

    syncWithWindow: function (canvasDimensions) {
        this._canvasPixelWidth = canvasDimensions.width;
        this._canvasPixelHeight = canvasDimensions.height;
    },

    syncWithMap: function (shifts) {
        this.mapLeftShift = shifts.left;
        this.mapTopShift = shifts.top;
    },

    traversePath: function () {

        this.playerIsMoving = true;

        var _pathSteps = this.pathSteps
        var _stepIncrement = this.stepIncrement

        var _this = this;
        function takePathStep() {
            if (_stepIncrement < _pathSteps.length) {
                var currentStep = _pathSteps[_stepIncrement];

                var xStepIndex = currentStep.xStepIndex;
                var yStepIndex = currentStep.yStepIndex;

                _this._gameProxy.server.movePlayer(xStepIndex, yStepIndex);

                _stepIncrement += 1;

                setTimeout(takePathStep, 100);
            }
            else {
                _this.playerIsMoving = false;
            }
        }
        setTimeout(takePathStep, 100);
    },

    controlPlayer: function (KeyCode, cursorFabric) {

        // Only move player if enter was pressed
        if (KeyCode === 13 && this.playerIsMoving === false) {
            this.traversePath();
            cursorFabric.resetPathSteps();
        }
    },
    
    movePlayerSprite: function (id, xPos, yPos) {
        var _this = this;
        _this._gameCanvas.forEachObject(function (obj) {
            if (obj.id && obj.id === id) {
                var leftPlayer = _this.mapLeftShift + xPos;
                var topPlayer = _this.mapTopShift + yPos;

                _this.fabricUtilities.setObjectVisibility(obj, leftPlayer, topPlayer,
                        this._canvasPixelWidth, this._canvasPixelHeight);

                obj.set({
                    left: leftPlayer,
                    top: topPlayer
                });
                obj.setCoords();

                // Handle when the player is behind or
                // in front of a structure
                _this.playerUtilities.handleStructureCollision(obj, _this._structureObjects,
                        _this._gameCanvas);

                _this._gameCanvas.renderAll();
            }
        });
    }
};