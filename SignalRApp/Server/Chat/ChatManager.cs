using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;

namespace SignalRApp.Server
{
    public class ChatManager
    {
        private readonly IHubContext _context;

        public ChatManager(IHubContext context)
        {
            _context = context;
        }

        public void SendToAll(string connectionId, string name, string message)
        {
            // Send messages with a flag to make sender's message distinct
            bool isSender = false;
            _context.Clients.AllExcept(connectionId).addMessage(name, message, isSender);

            isSender = true;
            _context.Clients.Client(connectionId).addMessage(name, message, isSender);
        }
    }
}