

using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using System.Collections.Concurrent;
using MySql.Data.MySqlClient;
using Newtonsoft.Json;
using System.Threading;
using System.Threading.Tasks;

namespace SignalRApp.Server
{
    public class PlayerManager
    {
        private readonly IHubContext _context;

        public static ConcurrentDictionary<string, Player> IdPlayerPairs = new ConcurrentDictionary<string, Player>();

        private static Dictionary<string, List<string>> PartyNameAndListOfPlayerIds = new Dictionary<string, List<string>>();

        private static Dictionary<string, string> PendingPartyNameAndPlayerId = new Dictionary<string, string>();

        private static bool serverStarted = false;

        // Update delay in seconds
        private const int updateDelay = 3;

        struct PartyMemberInfo
        {
            public string id;
            public string name;
            public int level;
            public int health;
            public int mana;
            public bool isReadyForWilderness;
        };

        public PlayerManager(IHubContext context)
        {
            _context = context;
            
            if (serverStarted == false)
            {
                RemoteMovementLoop();
                serverStarted = true;
            }
        }

        public async Task RemoteMovementLoop()
        {
            await Task.Run(() =>
            {
                SendMovementsToClients();
            });
        }

        public void SendMovementsToClients()
        {
            Dictionary<string, List<List<int>>> playerMovements = new Dictionary<string, List<List<int>>>();
            while (true)
            {
                Thread.Sleep(updateDelay * 1000);
                foreach (KeyValuePair<string, Player> idPlayerPair in IdPlayerPairs)
                {
                    string playerId = idPlayerPair.Key;
                    Player player = idPlayerPair.Value;

                    playerMovements.Add(playerId, player.storedMovements);
                }
                if (IdPlayerPairs.Count > 1)
                {
                    string serializedDict = JsonConvert.SerializeObject(playerMovements);
                    _context.Clients.All.moveRemotePlayers(serializedDict);
                }
                foreach (KeyValuePair<string, Player> idPlayerPair in IdPlayerPairs)
                {
                    string playerId = idPlayerPair.Key;
                    Player player = idPlayerPair.Value;
                    player.storedMovements.Clear();
                }
                playerMovements.Clear();
            }
        }

        // Get info ready to start game for client
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

        public void AddClientToPartyMembers(string connectionId)
        {
            Player clientPlayer;
            IdPlayerPairs.TryGetValue(connectionId, out clientPlayer);

            bool isLocalPlayer = false;

            // Add new player to remotes clients
            string partyName = GetPartyName(connectionId);
            if (string.IsNullOrEmpty(partyName))
            {
                _context.Clients.Client(connectionId).addPlayerToRoom(isLocalPlayer,
                connectionId, clientPlayer.name, clientPlayer.xPos, clientPlayer.yPos,
                clientPlayer.level, clientPlayer.gold, clientPlayer.health, clientPlayer.mana);
                return;
            }

            _context.Clients.Group(clientPlayer.partyName, connectionId).addPlayerToRoom(isLocalPlayer,
            connectionId, clientPlayer.name, clientPlayer.xPos, clientPlayer.yPos,
            clientPlayer.level, clientPlayer.gold, clientPlayer.health, clientPlayer.mana);
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

        public void AddPartyMembersToClient(string connectionId)
        {
            Player clientPlayer;
            IdPlayerPairs.TryGetValue(connectionId, out clientPlayer);

            bool isLocalPlayer = false;

            int numOfPartyMembers = PartyNameAndListOfPlayerIds[clientPlayer.partyName].Count;

            // Add members to client
            for (int i = 0; i < numOfPartyMembers; i++)
            {
                string memberId = PartyNameAndListOfPlayerIds[clientPlayer.partyName][i];

                Player partyMember;
                IdPlayerPairs.TryGetValue(memberId, out partyMember);

                // Check if local player is adding self
                if (memberId == partyMember.ConnectionId)
                {
                    isLocalPlayer = true;
                }
                _context.Clients.Client(connectionId).addPlayerToRoom(isLocalPlayer,
                    partyMember.ConnectionId, partyMember.name, partyMember.xPos, partyMember.yPos,
                    partyMember.level, partyMember.gold, partyMember.health, partyMember.mana);

                isLocalPlayer = false;
            }
        }

        public void ReAddGroupSprites(string connectionId)
        {
            _context.Clients.Client(connectionId).reAddGroupSprites();
        }

        // Remove a player
        public void TerminatePlayer(string connectionId)
        {

            Player disconnectingPlayer;
            if (IdPlayerPairs.TryGetValue(connectionId, out disconnectingPlayer))
            {
                if (!string.IsNullOrEmpty(disconnectingPlayer.partyName))
                {
                    LeaveParty(connectionId);
                }

                // Remove disconnected player
                _context.Clients.All.removePlayerFromRoom(disconnectingPlayer.ConnectionId);

                // Get disconnected player
                Player disconnectedPlayer;
                IdPlayerPairs.TryRemove(connectionId, out disconnectedPlayer);
            }
        }

        public string GetName(string connectionId)
        {
            Player namedPlayer;
            IdPlayerPairs.TryGetValue(connectionId, out namedPlayer);

            return namedPlayer.name;
        }
        
        public void Move(string connectionId, double xStepIndex, double yStepIndex)
        {

            // Get the player which has moved
            Player movingPlayer;
            IdPlayerPairs.TryGetValue(connectionId, out movingPlayer);

            // Update player position to that of the cursor
            movingPlayer.goToNextStep(xStepIndex, yStepIndex);

            // Update all clients with the movement
            _context.Clients.AllExcept(connectionId).movePlayer(connectionId, movingPlayer.xPos, movingPlayer.yPos);
        }

        public void StoreLocalPlayerMovements(string connectionId, List<List<int>> localPlayerMovements)
        {
            // Get the player which has moved
            Player movingPlayer;
            if (IdPlayerPairs.TryGetValue(connectionId, out movingPlayer))
            {
                // Update with most recent location
                movingPlayer.xPos = localPlayerMovements[localPlayerMovements.Count - 1][0];
                movingPlayer.yPos = localPlayerMovements[localPlayerMovements.Count - 1][1];

                if (IdPlayerPairs.Count <= 1)
                {
                    return;
                }

                movingPlayer.storedMovements.AddRange(localPlayerMovements);
            }
        }

        //public void MoveInVillage(string connectionId, Dictionary<string, int> velocities)
        //{

        //    // Get the player which has moved
        //    Player movingPlayer;
        //    IdPlayerPairs.TryGetValue(connectionId, out movingPlayer);
            
        //    movingPlayer.updateVillagePosition(velocities);

        //    // Update all clients with the movement
        //    _context.Clients.AllExcept(connectionId).movePlayer(connectionId, movingPlayer.xPos, movingPlayer.yPos);
        //}

        public void RemoteDisplayInfo(string remoteConnectionId, string localConnectionId)
        {
            Player selectedPlayer;
            if (IdPlayerPairs.TryGetValue(remoteConnectionId, out selectedPlayer))
            {

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

        public void InvitePlayerToParty(string connectionId, string playerToInviteId)
        {
            Player playerInvited;
            IdPlayerPairs.TryGetValue(playerToInviteId, out playerInvited);

            Player playerInviter;
            IdPlayerPairs.TryGetValue(connectionId, out playerInviter);

            string partyName;

            // Determine if the inviter is already in a group
            if (string.IsNullOrEmpty(playerInviter.partyName) && string.IsNullOrEmpty(playerInviter.pendingPartyName))
            {
                partyName = "party:" + playerInviter.ConnectionId;
                playerInviter.pendingPartyName = partyName;
                PendingPartyNameAndPlayerId.Add(partyName, connectionId);
            }
            else
            {
                if (!string.IsNullOrEmpty(playerInviter.partyName))
                {
                    partyName = playerInviter.partyName;
                }
                else
                {
                    partyName = playerInviter.pendingPartyName;
                }
            }

            // Return that player is already in group if the player has a 
            // partyName and that party contains more 1 player, or if the player
            // is still deciding to join a different party
            if ((!string.IsNullOrEmpty(playerInvited.partyName) && 
                PartyNameAndListOfPlayerIds[playerInvited.partyName].Count > 1) ||
                !string.IsNullOrEmpty(playerInvited.pendingPartyName))
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

            // If the inviter was not in a group, then switch inviter to no longer pending party
            if (PendingPartyNameAndPlayerId.ContainsKey(playerInvited.pendingPartyName))
            {
                Player playerInviter;
                IdPlayerPairs.TryGetValue(PendingPartyNameAndPlayerId[playerInvited.pendingPartyName], out playerInviter);

                playerInviter.partyName = playerInviter.pendingPartyName;
                PendingPartyNameAndPlayerId.Remove(playerInviter.pendingPartyName);
                playerInviter.pendingPartyName = "";

                List<string> playerIds = new List<string>();
                playerIds.Add(playerInviter.ConnectionId);
                PartyNameAndListOfPlayerIds.Add(playerInviter.partyName, playerIds);

                _context.Groups.Add(playerInviter.ConnectionId, playerInviter.partyName);
                _context.Clients.Client(playerInviter.ConnectionId).addReadyOptionForNewMember();
            }


            // Switch invited to no longer be pending party
            playerInvited.partyName = playerInvited.pendingPartyName;
            playerInvited.pendingPartyName = "";
            
            _context.Groups.Add(connectionId, playerInvited.partyName);

            // Get new member info for pre existing members
            PartyMemberInfo newPartyMember;
            newPartyMember.level = playerInvited.level;
            newPartyMember.health = playerInvited.health;
            newPartyMember.mana = playerInvited.mana;
            newPartyMember.name = playerInvited.name;
            newPartyMember.id = playerInvited.ConnectionId;
            newPartyMember.isReadyForWilderness = playerInvited.isReadyForWilderness;

            // Get pre existing member info for new member
            List<PartyMemberInfo> partyMembers = new List<PartyMemberInfo>();
            for (int i = 0; i < PartyNameAndListOfPlayerIds[playerInvited.partyName].Count; i++)
            {
                Player partyMember;
                IdPlayerPairs.TryGetValue(PartyNameAndListOfPlayerIds[playerInvited.partyName][i], out partyMember);

                PartyMemberInfo partyMemberInfo = new PartyMemberInfo();
                partyMemberInfo.level = partyMember.level;
                partyMemberInfo.health = partyMember.health;
                partyMemberInfo.mana = partyMember.mana;
                partyMemberInfo.name = partyMember.name;
                partyMemberInfo.id = partyMember.ConnectionId;
                partyMemberInfo.isReadyForWilderness = partyMember.isReadyForWilderness;
                partyMembers.Add(partyMemberInfo);
            }

            _context.Clients.Client(connectionId).addPartyMembersToNewMember(partyMembers);
            _context.Clients.Client(connectionId).addReadyOptionForNewMember();
            _context.Clients.Group(playerInvited.partyName, connectionId).addNewMemberToPartyMembers(newPartyMember);

            // Add after list of all party members is sent to client
            PartyNameAndListOfPlayerIds[playerInvited.partyName].Add(connectionId);
        }

        public void RejectInvitation(string connectionId)
        {
            Player playerInvited;
            IdPlayerPairs.TryGetValue(connectionId, out playerInvited);

            // If the inviter was not in a group, then switch inviter to no longer pending party
            if (PendingPartyNameAndPlayerId.ContainsKey(playerInvited.pendingPartyName))
            {
                Player playerInviter;
                IdPlayerPairs.TryGetValue(PendingPartyNameAndPlayerId[playerInvited.pendingPartyName], out playerInviter);
                
                PendingPartyNameAndPlayerId.Remove(playerInviter.pendingPartyName);
                playerInviter.pendingPartyName = "";
            }

            playerInvited.pendingPartyName = "";
        }

        public void LeaveParty(string connectionId)
        {
            Player leavingPlayer;
            IdPlayerPairs.TryGetValue(connectionId, out leavingPlayer);

            _context.Clients.Client(connectionId).removePartyMembersFromLeavingMember();
            _context.Clients.Client(connectionId).removeLeavingMemberReadyCheck();
            _context.Clients.Group(leavingPlayer.partyName, connectionId).removeLeavingMemberFromPartyMembers(connectionId);

            PartyNameAndListOfPlayerIds[leavingPlayer.partyName].Remove(connectionId);
            _context.Groups.Remove(connectionId, leavingPlayer.partyName);

            // If after leaving there is only one player left, then disband the party
            if (PartyNameAndListOfPlayerIds[leavingPlayer.partyName].Count == 1)
            {
                Player lastPlayerInParty;
                IdPlayerPairs.TryGetValue(PartyNameAndListOfPlayerIds[leavingPlayer.partyName][0], out lastPlayerInParty);

                lastPlayerInParty.partyName = "";
                PartyNameAndListOfPlayerIds.Remove(leavingPlayer.partyName);
                _context.Groups.Remove(lastPlayerInParty.ConnectionId, leavingPlayer.partyName);


                _context.Clients.Client(lastPlayerInParty.ConnectionId).removeLeavingMemberReadyCheck();
            }

            leavingPlayer.partyName = "";
        }

        public void CheckWildernessReadiness(string connectionId)
        {
            Player enteringPlayer;
            IdPlayerPairs.TryGetValue(connectionId, out enteringPlayer);

            if (string.IsNullOrEmpty(enteringPlayer.partyName) && 
                string.IsNullOrEmpty(enteringPlayer.pendingPartyName))
            {
                _context.Clients.Client(connectionId).enterWildernessConfirmation();
                return;
            }
            else if (!string.IsNullOrEmpty(enteringPlayer.pendingPartyName))
            {
                string notReadyStatus = "pendingParty";
                _context.Clients.Client(connectionId).notReadyForWilderness(notReadyStatus);
                return;
            }
            else
            {
                List<string> memberIds = PartyNameAndListOfPlayerIds[enteringPlayer.partyName];

                // Check if all members are ready
                for (int i = 0; i < memberIds.Count; i++)
                {
                    Player member;
                    IdPlayerPairs.TryGetValue(memberIds[i], out member);

                    if (!member.isReadyForWilderness)
                    {
                        string notReadyStatus = "memberNotReady";
                        _context.Clients.Client(connectionId).notReadyForWilderness(notReadyStatus);
                        return;
                    }
                }

                _context.Clients.Client(connectionId).enterWildernessConfirmation();
            }
        }

        public void ChangeReadyStatus(string connectionId)
        {
            Player statusChanger;
            IdPlayerPairs.TryGetValue(connectionId, out statusChanger);

            if (statusChanger.isReadyForWilderness)
            {
                statusChanger.isReadyForWilderness = false;
            }
            else
            {
                statusChanger.isReadyForWilderness = true;
            }

            _context.Clients.Client(connectionId).changeLocalPlayerReadiness(statusChanger.isReadyForWilderness);
            _context.Clients.Group(statusChanger.partyName, connectionId).changeRemotePlayerReadiness(connectionId, 
                                                statusChanger.isReadyForWilderness);
        }

        public string GetPartyName(string connectionId)
        {
            Player partyMember;
            IdPlayerPairs.TryGetValue(connectionId, out partyMember);

            return partyMember.partyName;
        }
    }
}