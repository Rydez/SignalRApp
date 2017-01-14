using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using SignalRApp.Server;

namespace SignalRApp.Hubs
{
    public class WildernessHub : GameHub
    {

        public void AddPartyMembers()
        {
            string partyName = PlayerManager.GetPartyName(Context.ConnectionId);
            if (string.IsNullOrEmpty(partyName))
            {
                PlayerManager.AddClientToPartyMembers(Context.ConnectionId);
                PlayerManager.AddPartyMembersToClient(Context.ConnectionId);
                return;
            }

            //TODO: fix this lie. Here the client's player is being added. But there
            // are no remote players
            PlayerManager.AddClientToRemotePlayers(Context.ConnectionId);
        }

        public void SwitchToWilderness()
        {
            Wilderness wilderness = new Wilderness();

            string partyName = PlayerManager.GetPartyName(Context.ConnectionId);
            if (string.IsNullOrEmpty(partyName))
            {
                Clients.Client(Context.ConnectionId).switchToWilderness(wilderness);
                return;
            }

            Clients.Group(partyName).switchToWilderness(wilderness);
        }
    }
}