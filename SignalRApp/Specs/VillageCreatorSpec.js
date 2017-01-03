

describe('VillageCreator', function () {

    beforeEach(function () {
        this.specVillageCreator = Object.create(VillageCreator);
    });

    describe('#initialize', function () {

        it('should call a function to create the map', function () {
            spyOn(this.specVillageCreator, 'createMap');
            var gameCanvasFake = null;
            var canvasDimensionsFake = { width: null, height: null };
            var gameConstantsFake = {
                mapWidth: null,
                mapHeight: null,
                tileWidth: null,
                tileHeight: null
            };
            this.specVillageCreator.initialize(gameCanvasFake,
                    canvasDimensionsFake, gameConstantsFake);
            expect(this.specVillageCreator.createMap).toHaveBeenCalled();
        });

    });

    describe('#createMap', function () {

        beforeEach(function () {
            spyOn(this.specVillageCreator, 'createLand').and.callFake(function () {
                return;
            });

            spyOn(this.specVillageCreator, 'createStructures').and.callFake(function () {
                return;
            });

            this.specVillageCreator.createMap();
        });

        it('should call a function to create the background', function () {
            expect(this.specVillageCreator.createLand).toHaveBeenCalled();
        });

        it('should call a function to create the structures', function () {
            expect(this.specVillageCreator.createStructures).toHaveBeenCalled();
        });

    });

    describe('#createLand', function () {

        it('should create the appropriate number of tiles, n wide by m high', function () {
            spyOn(this.specVillageCreator, 'addGrassTile').and.callFake(function () {
                return;
            });
            this.specVillageCreator._mapWidth = 10;
            this.specVillageCreator._mapHeight = 10;
            this.specVillageCreator.createLand();
            expect(this.specVillageCreator.addGrassTile.calls.count()).toEqual(100);
        });

    });

    describe('#addGrassTile', function () {

        it('should try to get an image object via some url', function () {
            spyOn(window.fabric.Image, 'fromURL');
            this.specVillageCreator.addGrassTile();
            expect(window.fabric.Image.fromURL).toHaveBeenCalled();
        });

    });

    describe('#setupGrassTile', function () {

        beforeEach(function () {
            var canvasElement = document.createElement('canvas');
            canvasElement.setAttribute('id', 'test-canvas');
            this.specVillageCreator._gameCanvas = new fabric.Canvas('test-canvas');
            this.leftTestPos = 100;
            this.topTestPos = 100;
        });

        it('should set up properties of an image object', function (done) {
            var _this = this;
            var testImageGetter = new fabric.Image.fromURL('Client/images/grass_tile.png', function (img) {
                spyOn(img, 'set').and.callThrough();
                _this.specVillageCreator.setupGrassTile(img, this.leftTestPos, this.topTestPos);
                expect(img.set).toHaveBeenCalled();
                done();
            });
        });

        it('should add the tile to the canvas', function (done) {
            var _this = this;
            var testImageGetter = new fabric.Image.fromURL('Client/images/grass_tile.png', function (img) {
                spyOn(_this.specVillageCreator._gameCanvas, 'add');
                _this.specVillageCreator.setupGrassTile(img, this.leftTestPos, this.topTestPos);
                expect(_this.specVillageCreator._gameCanvas.add).toHaveBeenCalled();
                done();
            });
        });

        it('should number of grass tiles should be increased by one', function (done) {
            this.specVillageCreator.numberOfGrassTiles = 40;
            var _this = this;
            var testImageGetter = new fabric.Image.fromURL('Client/images/grass_tile.png', function (img) {
                _this.specVillageCreator.setupGrassTile(img, this.leftTestPos, this.topTestPos);
                expect(_this.specVillageCreator.numberOfGrassTiles).toEqual(41);
                done();
            });
        });

        it('should call a function to cache the background on last tile', function (done) {
            this.specVillageCreator.numberOfGrassTiles = 99;
            this.specVillageCreator._mapWidth = 10;
            this.specVillageCreator._mapHeight = 10;
            var _this = this;
            var testImageGetter = new fabric.Image.fromURL('Client/images/grass_tile.png', function (img) {
                spyOn(_this.specVillageCreator, 'cacheLand');
                _this.specVillageCreator.setupGrassTile(img, this.leftTestPos, this.topTestPos);
                expect(_this.specVillageCreator.cacheLand).toHaveBeenCalled();
                done();
            });
        });

    });

});