

var PlayerController = {
    initialize: function (playerHubProxy, gameCanvas, structureObjects,
                          structureIndices, canvasDimensions, gameConstants) {

        this.fabricUtilities = Object.create(FabricUtilities);
        this.playerUtilities = Object.create(PlayerUtilities);
        this.playerUtilities.initialize(gameCanvas, structureObjects, gameConstants);

        this.playerHubProxy = playerHubProxy;

        this._gameCanvas = gameCanvas;

        this.structureIndices = structureIndices;

        this.stepIncrement = 0;
        this.pathSteps = [];
        this.playerIsMoving = false;

        this.xPos;
        this.yPos;

        this.fps = gameConstants.fps;
        this.isInVillage = true;
        this.maxVelocity = gameConstants.maxVelocity;
        this.acceleration = gameConstants.acceleration;
        this.currentVelocity = {
            up: 0,
            down: 0,
            left: 0,
            right: 0
        };
        this.currentDirection = {
            up: false,
            down: false,
            left: false,
            right: false
        };

        this._structureObjects = structureObjects;

        // In units of pixels
        this.xPlayerOffset = gameConstants.xPlayerOffset;
        this.yPlayerOffset = gameConstants.yPlayerOffset;
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

    playerCollision: function (xPos, yPos) {
        var isCollided = false;
        var allStructureIndices = this.structureIndices;

        // Calculate the tile index that the player is on
        var xIdx = (xPos - this.xPlayerOffset) / this._tileWidth +
                   (yPos - this.yPlayerOffset) / this._tileHeight;
        var yIdx = (xPos - this.xPlayerOffset) / this._tileWidth -
                   (yPos - this.yPlayerOffset) / this._tileHeight;

        for (var i = 0; i < allStructureIndices.length; i++) {

            var singleStructureIndices = allStructureIndices[i];
            for (var j = 0; j < singleStructureIndices.length; j++) {
                 
                var coveredTile = singleStructureIndices[j];
                if (Math.round(xIdx) === coveredTile.xIndex &&
                    Math.round(yIdx) === coveredTile.yIndex) {
                    isCollided = true;
                }
            }
        }
        return isCollided;
    },

    villageMovementLoop: function () {

        // Player movement loops for village
        var _this = this;
        function movementLoop() {
            for (direction in _this.currentDirection) {

                // Accelerate
                if (_this.currentDirection[direction]) {
                    if (_this.currentVelocity[direction] < _this.maxVelocity) {
                        _this.currentVelocity[direction] += _this.acceleration;
                    }
                }

                // Decelerate
                else {
                    if (_this.currentVelocity[direction] > 0) {
                        _this.currentVelocity[direction] -= _this.acceleration;
                    }
                }
            }

            // Move player accordingly
            var newX = _this.xPos + 
                       _this.currentVelocity["right"] - 
                       _this.currentVelocity["left"];
            var newY = _this.yPos + 
                       _this.currentVelocity["down"] - 
                       _this.currentVelocity["up"];
            if (!_this.playerCollision(newX, newY)) {
                _this.playerHubProxy.server.movePlayerInVillage(_this.currentVelocity);
            }

            if (_this.isInVillage) {
                setTimeout(movementLoop, 1000/_this.fps);
            }
        }
        movementLoop();
    },

    changeDirection: function (keyCode, keyDirection) {

        // w = 87
        if (keyCode === 87) {
            if (keyDirection === 'up') {
                this.currentDirection.up = false;
            }
            else if (keyDirection === 'down') {
                this.currentDirection.up = true;
            }
        }

        // a = 65
        else if (keyCode === 65) {
            if (keyDirection === 'up') {
                this.currentDirection.left = false;
            }
            else if (keyDirection === 'down') {
                this.currentDirection.left = true;
            }
        }

        // s = 83
        else if (keyCode === 83) {
            if (keyDirection === 'up') {
                this.currentDirection.down = false;
            }
            else if (keyDirection === 'down') {
                this.currentDirection.down = true;
            }
        }

        // d = 68
        else if (keyCode === 68) {
            if (keyDirection === 'up') {
                this.currentDirection.right = false;
            }
            else if (keyDirection === 'down') {
                this.currentDirection.right = true;
            }
        }
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

                _this.playerHubProxy.server.movePlayer(xStepIndex, yStepIndex);

                _stepIncrement += 1;

                setTimeout(takePathStep, 100);
            }
            else {
                _this.playerIsMoving = false;
            }
        }
        setTimeout(takePathStep, 100);
    },

    selectMovementPath: function (KeyCode, cursorFabric) {

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
                _this.xPos = xPos;
                _this.yPos = yPos;
                _this.fabricUtilities.setObjectVisibility(obj, leftPlayer, topPlayer,
                        _this._canvasPixelWidth, _this._canvasPixelHeight);

                obj.set({
                    left: leftPlayer,
                    top: topPlayer
                });
                obj.setCoords();

                // Handle when the player is behind or
                // in front of a structure
                _this.playerUtilities.handleStructureCollision(obj, _this._structureObjects);

                _this._gameCanvas.renderAll();
            }
        });
    }
};