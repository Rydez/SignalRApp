

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

        private static Dictionary<string, List<string>> GroupIdAndListOfPlayerIds = new Dictionary<string, List<string>>();

        struct PartyMemberInfo
        {
            public string id;
            public string name;
            public int level;
            public int health;
            public int mana;
        };

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

        public void InvitePlayerToParty(string connectionId, string playerToInviteId)
        {
            Player playerInvited;
            IdPlayerPairs.TryGetValue(playerToInviteId, out playerInvited);

            Player playerInviter;
            IdPlayerPairs.TryGetValue(connectionId, out playerInviter);

            string partyName;

            // Determine if the inviter is already in a group
            if (string.IsNullOrEmpty(playerInviter.partyName))
            {
                List<string> playerIds = new List<string>();
                playerIds.Add(connectionId);
                partyName = "party:" + playerInviter.ConnectionId;
                playerInviter.partyName = partyName;
                GroupIdAndListOfPlayerIds.Add(partyName, playerIds);
                _context.Groups.Add(connectionId, partyName);
            }
            else
            {
                partyName = playerInviter.partyName;
            }

            // Return that player is already in group if the player has a 
            // partyName and that party contains more 1 player
            if (!string.IsNullOrEmpty(playerInvited.partyName) && 
                GroupIdAndListOfPlayerIds[playerInvited.partyName].Count > 1)
            {
                _context.Clients.Client(connectionId).playerIsAlreadyInAParty();
            }
            else
            {
                playerInvited.pendingPartyName = partyName;
                _context.Clients.Client(playerToInviteId).invitePlayerToParty(playerInviter.name);
            }
        }

        public void AcceptInvitation(string connectionId)
        {
            Player playerInvited;
            IdPlayerPairs.TryGetValue(connectionId, out playerInvited);
            
            if (!string.IsNullOrEmpty(playerInvited.partyName))
            {
                GroupIdAndListOfPlayerIds.Remove(playerInvited.partyName);
            }

            playerInvited.partyName = playerInvited.pendingPartyName;
            _context.Groups.Add(connectionId, playerInvited.pendingPartyName);

            PartyMemberInfo newPartyMember;
            newPartyMember.level = playerInvited.level;
            newPartyMember.health = playerInvited.health;
            newPartyMember.mana = playerInvited.mana;
            newPartyMember.name = playerInvited.name;
            newPartyMember.id = playerInvited.ConnectionId;

            List<PartyMemberInfo> partyMembers = new List<PartyMemberInfo>();
            for (int i = 0; i < GroupIdAndListOfPlayerIds[playerInvited.pendingPartyName].Count; i++)
            {
                Player partyMember;
                IdPlayerPairs.TryGetValue(GroupIdAndListOfPlayerIds[playerInvited.pendingPartyName][i], out partyMember);

                PartyMemberInfo partyMemberInfo = new PartyMemberInfo();
                partyMemberInfo.level = partyMember.level;
                partyMemberInfo.health = partyMember.health;
                partyMemberInfo.mana = partyMember.mana;
                partyMemberInfo.name = partyMember.name;
                partyMemberInfo.id = partyMember.ConnectionId;
                partyMembers.Add(partyMemberInfo);
            }

            _context.Clients.Client(connectionId).addPartyMembersToNewMember(partyMembers);
            _context.Clients.Group(playerInvited.partyName, connectionId).addNewMemberToPartyMembers(newPartyMember);

            GroupIdAndListOfPlayerIds[playerInvited.pendingPartyName].Add(connectionId);
            playerInvited.pendingPartyName = "";
        }

        public void RejectInvitation(string connectionId)
        {
            Player playerInvited;
            IdPlayerPairs.TryGetValue(connectionId, out playerInvited);

            playerInvited.pendingPartyName = "";
        }

        public void LeaveParty(string connectionId)
        {
            Player leavingPlayer;
            IdPlayerPairs.TryGetValue(connectionId, out leavingPlayer);

            _context.Clients.Client(connectionId).removePartyMembersFromLeavingMember();
            _context.Clients.Group(leavingPlayer.partyName, connectionId).removeLeavingMemberFromPartyMembers(connectionId);

            GroupIdAndListOfPlayerIds[leavingPlayer.partyName].Remove(connectionId);

            // If after leaving there is only one player left, then disband the party
            if (GroupIdAndListOfPlayerIds[leavingPlayer.partyName].Count == 1)
            {
                Player lastPlayerInParty;
                IdPlayerPairs.TryGetValue(GroupIdAndListOfPlayerIds[leavingPlayer.partyName][0], out lastPlayerInParty);

                lastPlayerInParty.partyName = "";
                GroupIdAndListOfPlayerIds.Remove(leavingPlayer.partyName);
            }

            leavingPlayer.partyName = "";
        }
    }
}