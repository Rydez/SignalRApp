using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using System.Collections.Concurrent;

namespace SignalRApp.Server
{
    public class PlayerManager
    {
        private readonly IHubContext _context;

        public static ConcurrentDictionary<string, Player> IdPlayerPairs = new ConcurrentDictionary<string, Player>();

        public PlayerManager(IHubContext context)
        {
            _context = context;
        }

        // Create a player for new client, and add remote players
        public void InitializePlayer(string connectionId)
        {
            // Create player
            Player newPlayer = new Player() { ConnectionId = connectionId };
            IdPlayerPairs.TryAdd(connectionId, newPlayer);
        }

        public void AddClientToRemotePlayers(string connectionId)
        {
            Player newPlayer;
            IdPlayerPairs.TryGetValue(connectionId, out newPlayer);

            bool isLocalPlayer = false;

            // Add new player to remotes clients
            _context.Clients.AllExcept(connectionId).addPlayerToRoom(isLocalPlayer, 
                connectionId, newPlayer.name, newPlayer.xPos, newPlayer.yPos,
                newPlayer.level, newPlayer.gold, newPlayer.health, newPlayer.mana);
        }

        public void AddPlayersToClient(string connectionId)
        {
            bool isLocalPlayer = false;

            // Add players to new client
            foreach (Player player in IdPlayerPairs.Values)
            {

                // Check if local player is adding self
                if(connectionId == player.ConnectionId)
                {
                    isLocalPlayer = true;
                }
                _context.Clients.Client(connectionId).addPlayerToRoom(isLocalPlayer,
                    player.ConnectionId, player.name, player.xPos, player.yPos, 
                    player.level, player.gold, player.health, player.mana);
                isLocalPlayer = false;
            }
        }

        // Remove a player
        public void TerminatePlayer(string connectionId)
        {
            // Get disconnected player
            Player disconnectedPlayer;
            IdPlayerPairs.TryRemove(connectionId, out disconnectedPlayer);

            // Remove disconnected player
            _context.Clients.All.removePlayerFromRoom(disconnectedPlayer.ConnectionId);
        }

        public void SetName(string name, string connectionId)
        {
            Player unnamedPlayer;
            IdPlayerPairs.TryGetValue(connectionId, out unnamedPlayer);

            unnamedPlayer.name = name;
        }

        public string GetName(string connectionId)
        {
            Player namedPlayer;
            IdPlayerPairs.TryGetValue(connectionId, out namedPlayer);

            return namedPlayer.name;
        }

        // Move a player
        public void Move(string connectionId, double xStepIndex, double yStepIndex)
        {
            // Get the player which has moved
            Player movingPlayer;
            IdPlayerPairs.TryGetValue(connectionId, out movingPlayer);

            // Update player position to that of the cursor
            movingPlayer.goToNextStep(xStepIndex, yStepIndex);

            // Update all clients with the movement
            _context.Clients.All.movePlayer(connectionId, movingPlayer.xPos, movingPlayer.yPos);
        }

        public void RemoteDisplayInfo(string remoteConnectionId, string localConnectionId)
        {
            Player selectedPlayer;
            IdPlayerPairs.TryGetValue(remoteConnectionId, out selectedPlayer);


            // Check if local player is adding self
            bool isLocalPlayer = false;
            if (remoteConnectionId == localConnectionId)
            {
                isLocalPlayer = true;
            }
            _context.Clients.Client(localConnectionId).createRemotePlayerDisplay(isLocalPlayer,
                       selectedPlayer.ConnectionId, selectedPlayer.name, selectedPlayer.level,
                       selectedPlayer.gold, selectedPlayer.health, selectedPlayer.mana);
        }
    }
}