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
                //TODO: fix this lie. Here the client's player is being added. But there
                // are no remote players
                PlayerManager.AddClientToPartyMembers(Context.ConnectionId);
                return;
            }


            PlayerManager.AddClientToPartyMembers(Context.ConnectionId);
            PlayerManager.AddPartyMembersToClient(Context.ConnectionId);
        }

        public void SwitchToWilderness()
        {
            Wilderness wilderness = new Wilderness(GlobalHost.ConnectionManager.GetHubContext<GameHub>());
            string partyName = PlayerManager.GetPartyName(Context.ConnectionId);
            wilderness.EnterWilderness(Context.ConnectionId, partyName, wilderness);
        }
    }
}