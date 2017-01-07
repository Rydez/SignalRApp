

var PlayerDisplay = {

    // TODO: Awful lot of magic numbers in here. Create a constants section

    initialize: function (gameCanvas, gameProxy) {
        this._gameCanvas = gameCanvas;
        this._gameProxy = gameProxy;

        this.leftLocalDisplayMargin = 10;
        this.topLocalDisplayMargin = 10;
        this.leftRemoteDisplayMargin = 300;
        this.topRemoteDisplayMargin = 10;

        this.localPlayerDisplay;
        this.remotePlayerDisplay;
        this.displayOptions;
        this.options;


    },

    syncWithMap: function (shifts) {
        if (this.localPlayerDisplay) {
            this.localPlayerDisplay.set({
                left: this.leftLocalDisplayMargin,
                top: this.topLocalDisplayMargin
            });
        }

        if (this.remotePlayerDisplay) {
            this.remotePlayerDisplay.set({
                left: this.leftRemoteDisplayMargin,
                top: this.topRemoteDisplayMargin
            });
        }

        this._gameCanvas.renderAll();
    },

    addRemotePlayerDisplay: function (remotePlayerId) {
        this._gameProxy.server.getRemotePlayerDisplayInfo(remotePlayerId);
    },

    removeRemotePlayerDisplay: function () {
        if (this.remotePlayerDisplay) {
            this._gameCanvas.remove(this.remotePlayerDisplay);
            this.remotePlayerDisplay = null;
        }
    },

    addPlayerDisplayOptions: function (objId, event) {
        var objType = objId.split(':')[0];
        var associatedPlayerId = objId.split(':')[1];

        if (objType === 'remotePlayerDisplay' || objType === 'localPlayerDisplay') {

            var optionObj = {};
            if (objType === 'remotePlayerDisplay') {
                optionObj.text = 'Invite to party';
                optionObj.id = 'inviteOption:' + associatedPlayerId;
            }
            else if (objType === 'localPlayerDisplay') {
                optionObj.text = 'Leave party';
                optionObj.id = 'leaveOption:' + associatedPlayerId;
            }

            var displayOptions = new fabric.Rect({
                id: 'displayOptions',
                left: event.e.x - 130,
                top: event.e.y - 10,
                width: 110,
                height: 50,
                fill: 'rgba(10, 10, 10, 0.8)'
            });

            var options = new fabric.Text(optionObj.text, {
                id: optionObj.id,
                fontSize: 15,
                fill: 'rgba(255, 255, 255, 0.5)',
                left: event.e.x - 120,
                top: event.e.y - 5
            });

            this.options = options;
            this.displayOptions = displayOptions;

            this._gameCanvas.add(this.displayOptions);
            this._gameCanvas.add(this.options);

            this.displayOptions.selectable = false;
            this.options.selectable = false;

            this.displayOptions.bringToFront();
            this.options.bringToFront();
        }
    },

    removePlayerDisplayOptions: function (event) {
        if (!event.target.id) {
            this._gameCanvas.remove(this.displayOptions)
            this._gameCanvas.remove(this.options);
            this._gameCanvas.renderAll();
        }
        else if (event.target.id !== 'displayOptions' &&
                 event.target.id.indexOf('inviteOption') === -1 &&
                 event.target.id.indexOf('leaveOption') === -1) {
            this._gameCanvas.remove(this.displayOptions)
            this._gameCanvas.remove(this.options);
            this._gameCanvas.renderAll();
        }
    },

    highlightInviteOption: function (event) {
        if (event.target && event.target.id &&
            (event.target.id.indexOf('inviteOption') !== -1 ||
            event.target.id.indexOf('leaveOption') !== -1)) {

            event.target.setFill('rgba(255, 255, 255, 0.9)');
            this._gameCanvas.renderAll();
        }
    },

    unhighlightInviteOption: function (event) {
        if (event.target && event.target.id &&
            (event.target.id.indexOf('inviteOption') !== -1 ||
            event.target.id.indexOf('leaveOption') !== -1)) {

            event.target.setFill('rgba(255, 255, 255, 0.5)');
            this._gameCanvas.renderAll();
        }
    },

    //TODO//
    // Refactor this into more functions and handle the primary vs
    // secondary displays with less duplication
    createPlayerDisplay: function (isLocalPlayer, id, name, level, gold, health, mana, isSecondary) {


        var _this = this;
        var playerDisplay = new fabric.Image.fromURL('Client/images/player_display.png', function (displayImg) {

            var displayImg = displayImg.set({
                scaleX: 0.4,
                scaleY: 0.4
            });

            var playerPortrait = new fabric.Image.fromURL('Client/images/stick-player.png', function (portraitImg) {

                var portraitImg = portraitImg.set({
                    left: 20,
                    top: 20
                });

                var playerName = new fabric.Text(name, {
                    fontSize: 20,
                    fill: 'black',
                    left: 100,
                    top: 10
                });

                var playerLevel = new fabric.Text('Lv. ' + level.toString(), {
                    fontSize: 15,
                    fill: 'black',
                    left: 100,
                    top: 85
                });

                var playerGold = new fabric.Text('Gold ' + gold.toString(), {
                    fontSize: 15,
                    fill: 'black',
                    left: 150,
                    top: 85
                });

                var healthBar = new fabric.Rect({
                    left: 100,
                    top: 40,
                    width: 110,
                    height: 12,
                    fill: 'rgba(175, 47, 47, 1)'
                });

                var manaBar = new fabric.Rect({
                    left: 100,
                    top: 60,
                    width: 110,
                    height: 12,
                    fill: 'rgba(37, 92, 140, 1)'
                });

                if (isSecondary) {
                    var leftDisplayMargin = _this.leftRemoteDisplayMargin;
                    var topDisplayMargin = _this.topRemoteDisplayMargin;
                }
                else {
                    var leftDisplayMargin = _this.leftLocalDisplayMargin;
                    var topDisplayMargin = _this.topLocalDisplayMargin;
                }

                if (isLocalPlayer) {
                    var idPrefix = 'local';
                }
                else {
                    var idPrefix = 'remote';
                }

                var playerDisplayGroup = new fabric.Group([displayImg, portraitImg, playerName,
                                                playerLevel, playerGold, healthBar, manaBar], {
                    id: idPrefix + 'PlayerDisplay:' + id,
                    left: leftDisplayMargin,
                    top: topDisplayMargin,
                });

                playerDisplayGroup.setShadow({
                    color: 'rgba(0,0,0,0.6)',
                    blur: 10,
                    offsetX: 5,
                    offsetY: 5,
                    fillShadow: true,
                    strokeShadow: true
                });

                if (isSecondary) {
                    _this.remotePlayerDisplay = playerDisplayGroup;
                    _this._gameCanvas.add(_this.remotePlayerDisplay);
                    _this.remotePlayerDisplay.selectable = false;
                    _this.remotePlayerDisplay.bringToFront();
                }
                else {
                    _this.localPlayerDisplay = playerDisplayGroup;
                    _this._gameCanvas.add(_this.localPlayerDisplay);
                    _this.localPlayerDisplay.selectable = false;
                    _this.localPlayerDisplay.bringToFront();
                }
            });
        });
    }
};