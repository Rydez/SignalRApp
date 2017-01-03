
var Account = {

    initialize: function (gameProxy) {

        this.gameProxy = gameProxy;

        var _this = this;

        $("#login-button").click(function () {
            _this.submitLogin();
        });

        $("#sign-up-button").click(function () {
            _this.switchToSignUp();
        });

        $("#submit-button").click(function () {
            _this.submitRegistration();
        });

        $("#back-to-login-button").click(function () {
            _this.switchToLogin();
        });

    },

    submitLogin: function () {
        this.gameProxy.server.loginPlayer(
            document.getElementById('login-username-input').value,
            document.getElementById('login-password-input').value);
    },

    switchToSignUp: function () {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('registration-container').style.display = 'block';
    },

    submitRegistration: function () {
        this.gameProxy.server.registerPlayer(
            document.getElementById('registration-username-input').value,
            document.getElementById('registration-password-input').value);
    },

    switchToLogin: function () {
        document.getElementById('login-container').style.display = 'block';
        document.getElementById('registration-container').style.display = 'none';
    }

};