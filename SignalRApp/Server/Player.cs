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

        // Help player stand ON tile
        public int X_OFF_SET { get; set; }
        public int Y_OFF_SET { get; set; }


        // Constructor
        public Player()
        {
            X_OFF_SET = 7;
            Y_OFF_SET = -40;
        }

        public void goToCursor(double xCursor, double yCursor)
        {
            xPos = X_OFF_SET + xCursor;
            yPos = Y_OFF_SET + yCursor;
        }
    }
}