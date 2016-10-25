
//TODO//
// Should probably move all magic
// numbers to this object
var GameConstants = {

    // Z index constants
    zBackground: 0,
    zCursor: 1,
    
    // Player can be above cursor or below playerDisplay
    zPlayer: 2,

    // Structures can be above cursor or below playerDisplay
    zStructure: 3,

    // At the top
    zPlayerDisplay: 5,

    // In units of tiles
    mapWidth: 32,
    mapHeight: 92,

    // In units of pixels
    tileWidth: 80,
    tileHeight: 40,

    // Indices to determine starting pos
    xStartIndex: 9,
    yStartIndex: 0
};