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
            // Add new player to remotes clients
            _context.Clients.AllExcept(connectionId).addPlayerToRoom(connectionId, newPlayer.name, newPlayer.xPos, newPlayer.yPos);

        }

        public void AddPlayersToClient(string connectionId)
        {
            // Add players to new client
            foreach (Player player in IdPlayerPairs.Values)
            {
                _context.Clients.Client(connectionId).addPlayerToRoom(player.ConnectionId, player.name, player.xPos, player.yPos);
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

        public void StartingPosition()
        {
            // Add players to new client
            foreach (Player player in IdPlayerPairs.Values)
            {
                
            }
        }
    }
}