

//TODO: Clean up the liberal use of renderAll() so that it's only used when necessary

//TODO: Add reconnection handling for players in groups and in the wilderness.

//TODO: Handle disconnecting while in group

//BUG: Don't open multiple prompts when clicked multiple times

//BUG: Scroll to the right side of the land and then stretch the right side
// of the browser outward

//TOTEST: Try adding self to party

//TOTEST: Try accepting invite after moving far away

//TOTEST: Try ready checking after attempting to leave the village



$(function () {

    // Declare a proxy to reference the hub.
    var gameProxy = $.connection.gameHub;
    var playerHubProxy = $.connection.playerHub;

    var game = Object.create(Game);
    game.initialize(gameProxy, playerHubProxy);

    var account = Object.create(Account);
    account.initialize(gameProxy);

    // Start the connection
    $.connection.hub.start();
});