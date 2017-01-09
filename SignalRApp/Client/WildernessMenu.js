
var WildernessMenu = {

    initialize: function (gameProxy, canvasManager) {
        var _this = this;

        this.canvasManager = canvasManager;

        this._gameCanvas = this.canvasManager.getCanvas();

        this.notReadyRect;
        this.notReadyText;
        this.notReadyConfirmationButton;
        this.notReadyButtonText;

        gameProxy.client.notReadyForWilderness = function (notReadyStatus) {
            _this.createNotReadyResponse(notReadyStatus);
        };

        gameProxy.client.enterWildernessConfirmation = function () {
            _this.createEnterConfirmationResponse();
        };
    },

    createNotReadyResponse: function (notReadyStatus) {
        var canvasDimensions = this.canvasManager.getDimensions();
        var canvasWidth = canvasDimensions.width;
        var canvasHeight = canvasDimensions.height;

        var responseRectWidth = 300;
        var responseRectHeight = 150;

        var responseButtonWidth = 80;
        var responseButtonHeight = 40;

        if (notReadyStatus === 'pendingParty') {
            var responseMessage = 'Accept or reject your party invitation.'
        }
        else {
            var responseMessage = 'One or more members of your group are not ready.'
        }

        var notReadyRect = new fabric.Rect({
            left: canvasWidth / 2 - responseRectWidth / 2,
            top: canvasHeight / 2 - responseRectHeight / 2,
            width: responseRectWidth,
            height: responseRectHeight,
            fill: 'rgba(10, 10, 10, 0.8)'
        });

        var notReadyText = new fabric.Text(responseMessage, {
            fontSize: 20,
            fill: 'rgba(255, 255, 255, 0.5)',
            left: canvasWidth / 2 - responseRectWidth / 2 + 40,
            top: canvasHeight / 2 - responseRectHeight / 2 + 40
        });

        var notReadyConfirmationButton = new fabric.Rect({
            id: 'notReadyConfirmationButton',
            left: canvasWidth / 2 - responseButtonWidth / 2,
            top: canvasHeight / 2 - responseButtonHeight / 2 + 10,
            width: responseButtonWidth,
            height: responseButtonHeight,
            fill: 'rgba(0, 0, 0, 1)'
        });

        var notReadyButtonText = new fabric.Text('Okay', {
            id: 'notReadyConfirmationText',
            fontSize: 15,
            fill: 'rgba(255, 255, 255, 0.5)',
            left: canvasWidth / 2 - responseButtonWidth / 2 + 10,
            top: canvasHeight / 2 - responseButtonHeight / 2 + 20
        });

        this.notReadyRect = notReadyRect;
        this.notReadyText = notReadyText;
        this.notReadyConfirmationButton = notReadyConfirmationButton;
        this.notReadyButtonText = notReadyButtonText;

        this._gameCanvas.add(this.notReadyRect);
        this._gameCanvas.add(this.notReadyText);
        this._gameCanvas.add(this.notReadyConfirmationButton);
        this._gameCanvas.add(this.notReadyButtonText);

        this.notReadyRect.selectable = false;
        this.notReadyText.selectable = false;
        this.notReadyConfirmationButton.selectable = false;
        this.notReadyButtonText.selectable = false;

        this.notReadyRect.bringToFront();
        this.notReadyText.bringToFront();
        this.notReadyConfirmationButton.bringToFront();
        this.notReadyButtonText.bringToFront();
    },

    createEnterConfirmationResponse: function () {
        console.log('Prompt wilderness enter confirmation');
    },

    removeNotReadyResponse: function () {
        this._gameCanvas.remove(this.notReadyRect);
        this._gameCanvas.remove(this.notReadyText);
        this._gameCanvas.remove(this.notReadyConfirmationButton);
        this._gameCanvas.remove(this.notReadyButtonText);
        this._gameCanvas.renderAll();
    }

};