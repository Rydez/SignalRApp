

using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using System.Collections.Concurrent;
using MySql.Data.MySqlClient;

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
        public void InitializePlayer(string connectionId, string name)
        {
            string connString = System.Configuration.ConfigurationManager.ConnectionStrings["WebAppConnString"].ToString();
            MySqlConnection conn = new MySqlConnection(connString);

            int gold = 0;
            int health = 0;
            int mana = 0;
            int level = 0;
            
            try
            {
                conn.Open();
                string cmdText = "SELECT gold, health, mana, level FROM user WHERE name = @name";
                MySqlCommand cmd = new MySqlCommand(cmdText, conn);
                cmd.Parameters.AddWithValue("@name", name);

                MySqlDataReader infoReader = cmd.ExecuteReader();
                while (infoReader.Read())
                {
                    gold = infoReader.GetInt16("gold");
                    health = infoReader.GetInt16("health");
                    mana = infoReader.GetInt16("mana");
                    level = infoReader.GetInt16("level");
                }
                cmd.Dispose();
                conn.Close();
            }
            catch (MySqlException exception)
            {
                throw exception;
            }

            // Create player
            Player newPlayer = new Player() {
                ConnectionId = connectionId,
                name = name,
                gold = gold,
                health = health,
                mana = mana,
                level = level
            };
            IdPlayerPairs.TryAdd(connectionId, newPlayer);

            _context.Clients.Client(connectionId).startGame();
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

        //public void Register(string name, string password, string repeatedPassword, 
        //                     string connectionId)
        //{
        //    //Player unnamedPlayer;
        //    //IdPlayerPairs.TryGetValue(connectionId, out unnamedPlayer);

        //    //unnamedPlayer.name = name;

        //    unnamedPlayer.dbNameInsert(name);
        //}

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