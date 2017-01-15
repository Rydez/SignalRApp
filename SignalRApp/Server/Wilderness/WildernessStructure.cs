using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SignalRApp.Server
{
    public class WildernessStructure
    {
        public string name { get; set; }
        public int xIndex { get; set; }
        public int yIndex { get; set; }
        public int width { get; set; }
        public int height { get; set; }
        public int xOffSet { get; set; }
        public int yOffSet { get; set; }

        public WildernessStructure(Random rnd)
        {
            // NOTE: rnd.Next() * Math.Abs(max - min) + min


            name = "tree1";
            xIndex = rnd.Next(0, 60);
            yIndex = Convert.ToInt32(rnd.NextDouble() * Math.Abs(20 - (-20)) + (-20));
            width = 80;
            height = 71;
            xOffSet = 0;
            yOffSet = 40;
        }
    }

    //public void HarvestItem()
    //{

    //}


}