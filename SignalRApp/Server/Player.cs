using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SignalRApp.Server
{
    // Class
    public class Player : IPlayer
    {
        public string ConnectionId { get; set; }

        public string name { get; set; }

        public double xPos { get; set; }
        public double yPos { get; set; }

        // Constructor
        public Player()
        {
            xPos = 200;
            yPos = 200;
        }
    }
}