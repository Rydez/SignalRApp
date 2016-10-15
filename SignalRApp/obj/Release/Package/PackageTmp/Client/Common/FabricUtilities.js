

var FabricUtilities = {

    // Here canvas dimensions are in pixels
    setObjectVisibility: function (obj, left, top,
                                   canvasWidth,
                                   canvasHeight) {

        // Don't render objects outside of canvas
        if (left > canvasWidth  ||
            top  > canvasHeight ||
            left + obj.getWidth()  < 0 ||
            top  + obj.getHeight() < 0) {
            obj.visible = false;
        }
        else {
            obj.visible = true;
        }
    }

};