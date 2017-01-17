

var Party = {

    initialize: function (gameProxy, canvasManager) {

        this.canvasManager = canvasManager;

        this._gameCanvas = canvasManager.getCanvas();

        this.localPartyMenuOpen;
        this.remotePartyMenuOpen;

        this.invitationRect;
        this.invitationText;
        this.acceptButton;
        this.acceptButtonText;
        this.rejectButton;
        this.rejectButtonText;

        this.playerInPartyRect;
        this.playerInPartyText;
        this.playerInPartyConfirmationButton;
        this.playerInPartyButtonText;

        this.readyCheck;

        this.memberDisplayGroups = [];

        var _this = this;

        // TODO: put these in a PartySignal file
        gameProxy.client.invitePlayerToParty = function (nameOfInviter) {
            if (!_this.invitationRect) {
                _this.createInvitation(nameOfInviter);
                _this.remotePartyMenuOpen = true;
            }
            else if (!_this.remotePartyMenuOpen) {
                _this._gameCanvas.add(_this.invitationRect);
                _this._gameCanvas.add(_this.invitationText);
                _this._gameCanvas.add(_this.acceptButton);
                _this._gameCanvas.add(_this.acceptButtonText);
                _this._gameCanvas.add(_this.rejectButton);
                _this._gameCanvas.add(_this.rejectButtonText);

                _this.invitationRect.bringToFront();
                _this.invitationText.bringToFront();
                _this.acceptButton.bringToFront();
                _this.acceptButtonText.bringToFront();
                _this.rejectButton.bringToFront();
                _this.rejectButtonText.bringToFront();
                _this.remotePartyMenuOpen = true;
            }
        };
        
        gameProxy.client.playerIsAlreadyInAParty = function () {
            if (!_this.playerInPartyRect) {
                _this.createPlayerInPartyResponse();
                _this.localPartyMenuOpen = true;
            }
            else if (!_this.localPartyMenuOpen) {
                _this._gameCanvas.add(_this.playerInPartyRect);
                _this._gameCanvas.add(_this.playerInPartyText);
                _this._gameCanvas.add(_this.playerInPartyConfirmationButton);
                _this._gameCanvas.add(_this.playerInPartyButtonText);

                _this.playerInPartyRect.bringToFront();
                _this.playerInPartyText.bringToFront();
                _this.playerInPartyConfirmationButton.bringToFront();
                _this.playerInPartyButtonText.bringToFront();
                _this.localPartyMenuOpen = true;
            }
        };

        gameProxy.client.addPartyMembersToNewMember = function (partyMembers) {
            for (var i = 0; i < partyMembers.length; i++) {
                _this.createMemberDisplay(partyMembers[i]);
            }
        };

        gameProxy.client.addReadyOptionForNewMember = function () {
            _this.createReadyCheck();
        };

        gameProxy.client.addNewMemberToPartyMembers = function (newPartyMember) {
            _this.createMemberDisplay(newPartyMember);
        };

        gameProxy.client.removePartyMembersFromLeavingMember = function () {
            for (var i = 0; i < _this.memberDisplayGroups.length; i++) {
                _this._gameCanvas.remove(_this.memberDisplayGroups[i].memberDisplayGroup);
            }
            _this._gameCanvas.renderAll();
            _this.memberDisplayGroups = [];
        };

        gameProxy.client.removeLeavingMemberReadyCheck = function () {
            _this._gameCanvas.remove(_this.readyCheck.readyCheckGroup);
        };

        gameProxy.client.removeLeavingMemberFromPartyMembers = function (leavingMemberId) {
            for (var i = 0; i < _this.memberDisplayGroups.length; i++) {
                if (_this.memberDisplayGroups[i].memberDisplayGroup.id.split(':')[1] === leavingMemberId) {
                    _this._gameCanvas.remove(_this.memberDisplayGroups[i].memberDisplayGroup);
                    _this.memberDisplayGroups.splice(i, 1);
                }
            }
            _this._gameCanvas.renderAll();
        };

        gameProxy.client.changeLocalPlayerReadiness = function (isReadyForWilderness) {
            var readinessColor = 'rgba(255, 0, 21, 1)';
            if (isReadyForWilderness) {
                readinessColor = 'rgba(2, 204, 18, 1)';
            }
            _this.readyCheck.readyCheckGroup.item(0).set({
                fill: readinessColor
            });
            _this._gameCanvas.renderAll();
        };

        gameProxy.client.changeRemotePlayerReadiness = function (remotePlayerId, isReadyForWilderness) {
            var readinessColor = 'rgba(255, 0, 21, 1)';
            if (isReadyForWilderness) {
                readinessColor = 'rgba(2, 204, 18, 1)';
            }

            for (var i = 0; i < _this.memberDisplayGroups.length; i++) {
                if (_this.memberDisplayGroups[i].memberDisplayGroup.id.split(':')[1] === remotePlayerId) {
                    _this.memberDisplayGroups[i].memberDisplayGroup.item(1).set({
                        fill: readinessColor
                    });
                    _this._gameCanvas.renderAll();
                }
            }
        };

        gameProxy.client.reAddGroupSprites = function () {
            for (var i = 0; i < _this.memberDisplayGroups.length; i++) {
                _this._gameCanvas.add(_this.memberDisplayGroups[i].memberDisplayGroup);
            }

            _this._gameCanvas.renderAll();
        };
    },

    syncWithMap: function () {
        if (this.memberDisplayGroups.length > 0) {
            for (var i = 0; i < this.memberDisplayGroups.length; i++) {
                this.memberDisplayGroups[i].memberDisplayGroup.set({
                    left: this.memberDisplayGroups[i].leftDisplayMargin,
                    top: this.memberDisplayGroups[i].topDisplayMargin
                });

                this.readyCheck.readyCheckGroup.set({
                    left: this.readyCheck.leftMargin,
                    top: this.readyCheck.topMargin
                });
            }
        }
        this._gameCanvas.renderAll();
    },

    createReadyCheck: function () {
        var leftMargin = 25;
        var topMargin = 130;

        var readinessRectWidth = 15;
        var readinessRectHeight = 15;

        var readinessRect = new fabric.Rect({
            left: 10,
            top: 0,
            width: readinessRectWidth,
            height: readinessRectHeight,
            fill: 'rgba(255, 0, 21, 1)'
        });

        var readinessText = new fabric.Text('Ready for The Wilderness?', {
            fontSize: 16,
            fill: 'white',
            left: 30,
            top: 0
        });

        var readyCheckGroup = new fabric.Group([readinessRect, readinessText], {
            id: 'readyCheck',
            left: leftMargin,
            top: topMargin,
        });

        readyCheckGroup.setShadow({
            color: 'rgba(0,0,0,0.6)',
            blur: 10,
            offsetX: 5,
            offsetY: 5,
            fillShadow: true,
            strokeShadow: true
        });

        var readyCheck = {
            readyCheckGroup: readyCheckGroup,
            leftMargin: leftMargin,
            topMargin: topMargin
        };

        this.readyCheck = readyCheck;
        this._gameCanvas.add(readyCheckGroup);
        readyCheckGroup.selectable = false;
        readyCheckGroup.bringToFront();
    },

    createMemberDisplay: function (partyMember) {

        var memberDisplayWidth = 140;
        var memberDisplayHeight = 60;

        var readinessRectWidth = 15;
        var readinessRectHeight = 15;

        var playerDisplayOffset = 160;

        var memberDisplaySpacing = 10;

        var leftDisplayMargin = 15;
        var topDisplayMargin = playerDisplayOffset + this.memberDisplayGroups.length * (memberDisplayHeight + memberDisplaySpacing);

        var memberDisplayRect = new fabric.Rect({
            left: 0,
            top: 0,
            width: memberDisplayWidth,
            height: memberDisplayHeight,
            fill: 'rgba(10, 10, 10, 0.8)'
        });

        var readinessColor = 'rgba(255, 0, 21, 1)';
        if (partyMember.isReadyForWilderness) {
            readinessColor = 'rgba(2, 204, 18, 1)';
        }

        var readinessRect = new fabric.Rect({
            left: 10,
            top: 10,
            width: readinessRectWidth,
            height: readinessRectHeight,
            fill: readinessColor
        });

        var playerName = new fabric.Text(partyMember.name, {
            fontSize: 16,
            fill: 'white',
            left: 30,
            top: 10
        });

        var playerLevel = new fabric.Text('Lv. ' + partyMember.level.toString(), {
            fontSize: 14,
            fill: 'white',
            left: 10,
            top: 35
        });

        var healthBar = new fabric.Rect({
            left: 50,
            top: 30,
            width: 80,
            height: 9,
            fill: 'rgba(175, 47, 47, 1)'
        });

        var manaBar = new fabric.Rect({
            left: 50,
            top: 40,
            width: 80,
            height: 9,
            fill: 'rgba(37, 92, 140, 1)'
        });

        var memberDisplayGroup = new fabric.Group([memberDisplayRect, readinessRect,
                                                   playerName, playerLevel, healthBar, manaBar], {
            id: 'memberDisplay:' + partyMember.id,
            left: leftDisplayMargin,
            top: topDisplayMargin,
        });

        memberDisplayGroup.setShadow({
            color: 'rgba(0,0,0,0.6)',
            blur: 10,
            offsetX: 5,
            offsetY: 5,
            fillShadow: true,
            strokeShadow: true
        });

        var memberDisplayGroupInfo = {
            memberDisplayGroup: memberDisplayGroup,
            leftDisplayMargin: leftDisplayMargin,
            topDisplayMargin: topDisplayMargin
        };

        this.memberDisplayGroups.push(memberDisplayGroupInfo);
        this._gameCanvas.add(memberDisplayGroup);
        memberDisplayGroup.selectable = false;
        memberDisplayGroup.bringToFront();
    },

    createInvitation: function (nameOfInviter) {
        var canvasDimensions = this.canvasManager.getDimensions();
        var canvasWidth = canvasDimensions.width;
        var canvasHeight = canvasDimensions.height;

        var invitationRectWidth = 350;
        var invitationRectHeight = 200;

        var buttonWidth = 80;
        var buttonHeight = 40;

        var responseMessage = nameOfInviter + ' wants to invite you to a party.'

        var invitationRect = new fabric.Rect({
            left: canvasWidth / 2 - invitationRectWidth / 2,
            top: canvasHeight / 2 - invitationRectHeight / 2,
            width: invitationRectWidth,
            height: invitationRectHeight,
            fill: 'rgba(10, 10, 10, 0.8)'
        });

        var invitationText = new fabric.Text(responseMessage, {
            fontSize: 20,
            fill: 'rgba(255, 255, 255, 0.5)',
            left: canvasWidth / 2 - invitationRectWidth / 2 + 40,
            top: canvasHeight / 2 - invitationRectHeight / 2 + 40
        });

        var acceptButton = new fabric.Rect({
            id: 'acceptInvitationButton',
            left: canvasWidth / 2 - buttonWidth / 2 - 90,
            top: canvasHeight / 2 - buttonHeight / 2 + 10,
            width: buttonWidth,
            height: buttonHeight,
            fill: 'rgba(0, 0, 0, 1)'
        });

        var acceptButtonText = new fabric.Text('Accept', {
            id: 'acceptInvitationText',
            fontSize: 15,
            fill: 'rgba(255, 255, 255, 0.5)',
            left: canvasWidth / 2 - buttonWidth / 2 - 80,
            top: canvasHeight / 2 - buttonHeight / 2 + 20
        });

        var rejectButton = new fabric.Rect({
            id: 'rejectInvitationButton',
            left: canvasWidth / 2 - buttonWidth / 2 + 10,
            top: canvasHeight / 2 - buttonHeight / 2 + 10,
            width: buttonWidth,
            height: buttonHeight,
            fill: 'rgba(0, 0, 0, 1)'
        });

        var rejectButtonText = new fabric.Text('Reject', {
            id: 'rejectInvitationText',
            fontSize: 15,
            fill: 'rgba(255, 255, 255, 0.5)',
            left: canvasWidth / 2 - buttonWidth / 2 + 20,
            top: canvasHeight / 2 - buttonHeight / 2 + 20
        });

        this.invitationRect = invitationRect;
        this.invitationText = invitationText;
        this.acceptButton = acceptButton;
        this.acceptButtonText = acceptButtonText;
        this.rejectButton = rejectButton;
        this.rejectButtonText = rejectButtonText;

        this._gameCanvas.add(this.invitationRect);
        this._gameCanvas.add(this.invitationText);
        this._gameCanvas.add(this.acceptButton);
        this._gameCanvas.add(this.acceptButtonText);
        this._gameCanvas.add(this.rejectButton);
        this._gameCanvas.add(this.rejectButtonText);

        this.invitationRect.selectable = false;
        this.invitationText.selectable = false;
        this.acceptButton.selectable = false;
        this.acceptButtonText.selectable = false;
        this.rejectButton.selectable = false;
        this.rejectButtonText.selectable = false;

        this.invitationRect.bringToFront();
        this.invitationText.bringToFront();
        this.acceptButton.bringToFront();
        this.acceptButtonText.bringToFront();
        this.rejectButton.bringToFront();
        this.rejectButtonText.bringToFront();
    },

    createPlayerInPartyResponse: function () {
        var canvasDimensions = this.canvasManager.getDimensions();
        var canvasWidth = canvasDimensions.width;
        var canvasHeight = canvasDimensions.height;

        var responseRectWidth = 300;
        var responseRectHeight = 150;

        var responseButtonWidth = 80;
        var responseButtonHeight = 40;

        var responseMessage = 'Player is already in a party.'

        var playerInPartyRect = new fabric.Rect({
            left: canvasWidth / 2 - responseRectWidth / 2,
            top: canvasHeight / 2 - responseRectHeight / 2,
            width: responseRectWidth,
            height: responseRectHeight,
            fill: 'rgba(10, 10, 10, 0.8)'
        });

        var playerInPartyText = new fabric.Text(responseMessage, {
            fontSize: 20,
            fill: 'rgba(255, 255, 255, 0.5)',
            left: canvasWidth / 2 - responseRectWidth / 2 + 40,
            top: canvasHeight / 2 - responseRectHeight / 2 + 40
        });

        var playerInPartyConfirmationButton = new fabric.Rect({
            id: 'playerInPartyConfirmationButton',
            left: canvasWidth / 2 - responseButtonWidth / 2,
            top: canvasHeight / 2 - responseButtonHeight / 2 + 10,
            width: responseButtonWidth,
            height: responseButtonHeight,
            fill: 'rgba(0, 0, 0, 1)'
        });

        var playerInPartyButtonText = new fabric.Text('Okay', {
            id: 'playerInPartyConfirmationText',
            fontSize: 15,
            fill: 'rgba(255, 255, 255, 0.5)',
            left: canvasWidth / 2 - responseButtonWidth / 2 + 10,
            top: canvasHeight / 2 - responseButtonHeight / 2 + 20
        });

        this.playerInPartyRect = playerInPartyRect;
        this.playerInPartyText = playerInPartyText;
        this.playerInPartyConfirmationButton = playerInPartyConfirmationButton;
        this.playerInPartyButtonText = playerInPartyButtonText;

        this._gameCanvas.add(this.playerInPartyRect);
        this._gameCanvas.add(this.playerInPartyText);
        this._gameCanvas.add(this.playerInPartyConfirmationButton);
        this._gameCanvas.add(this.playerInPartyButtonText);

        this.playerInPartyRect.selectable = false;
        this.playerInPartyText.selectable = false;
        this.playerInPartyConfirmationButton.selectable = false;
        this.playerInPartyButtonText.selectable = false;

        this.playerInPartyRect.bringToFront();
        this.playerInPartyText.bringToFront();
        this.playerInPartyConfirmationButton.bringToFront();
        this.playerInPartyButtonText.bringToFront();
    },

    removeInvitation: function () {
        this._gameCanvas.remove(this.invitationRect);
        this._gameCanvas.remove(this.invitationText);
        this._gameCanvas.remove(this.acceptButton);
        this._gameCanvas.remove(this.acceptButtonText);
        this._gameCanvas.remove(this.rejectButton);
        this._gameCanvas.remove(this.rejectButtonText);
        this._gameCanvas.renderAll();
        this.remotePartyMenuOpen = false;
    },

    removePlayerInPartyResponse: function () {
        this._gameCanvas.remove(this.playerInPartyRect);
        this._gameCanvas.remove(this.playerInPartyText);
        this._gameCanvas.remove(this.playerInPartyConfirmationButton);
        this._gameCanvas.remove(this.playerInPartyButtonText);
        this._gameCanvas.renderAll();
        this.localPartyMenuOpen = false;
    }
}