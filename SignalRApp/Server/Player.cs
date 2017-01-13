

using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SignalRApp.Server
{
    public class Player
    {
        public string ConnectionId { get; set; }

        public string name { get; set; }

        public string partyName { get; set; }
        public string pendingPartyName { get; set; }

        public bool isReadyForWilderness { get; set; }

        public double xIndex { get; set; }
        public double yIndex { get; set; }

        public double xPos { get; set; }
        public double yPos { get; set; }

        // Help player stand ON tile
        public int X_OFF_SET { get; set; }
        public int Y_OFF_SET { get; set; }

        public int TILE_WIDTH { get; set; }
        public int TILE_HEIGHT { get; set; }

        public int level { get; set; }
        public int gold { get; set; }
        public int health { get; set; }
        public int mana { get; set; }

        // Constructor
        public Player()
        {
            isReadyForWilderness = false;

            X_OFF_SET = 40;
            Y_OFF_SET = 7;

            TILE_WIDTH = 80;
            TILE_HEIGHT = 40;

            xIndex = 9;
            yIndex = 0;

            xPos = X_OFF_SET + 0.5 * TILE_WIDTH * (xIndex + yIndex);
            yPos = Y_OFF_SET + 0.5 * TILE_HEIGHT * (xIndex - yIndex);
        }

        public void goToNextStep(double xStepIndex, double yStepIndex)
        {
            xIndex = xStepIndex;
            yIndex = yStepIndex;
            xPos = X_OFF_SET + 0.5 * TILE_WIDTH * (xIndex + yIndex);
            yPos = Y_OFF_SET + 0.5 * TILE_HEIGHT * (xIndex - yIndex);
        }
    }
}