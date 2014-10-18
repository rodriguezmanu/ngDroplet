(function() {

    describe('ngDroplet', function() {

        var mockFileModel = { name: 'Mock.png', type: 'image/png', size: 200 };

        /**
         * @method compileDirective
         * @param html {String}
         * @param [properties={}] {Object}
         * @return {Object}
         */
        var compileDirective = function compileDirective(html, properties) {

            var scope, document = '';

            inject(function inject($rootScope, $compile) {

                scope = $rootScope.$new();

                for (var property in properties) {

                    if (properties.hasOwnProperty(property)) {
                        scope[property] = properties[property];
                    }

                }

                document = $compile(html)(scope);

            });

            return { scope: scope.$$childHead, html: document };

        };

        beforeEach(module('ngDroplet'));

        it('Should be able to define the DropletModel blueprint;', function() {

            var scope = compileDirective('<droplet></droplet>').scope;

            expect(scope.DropletModel).toBeDefined();
            expect(typeof scope.DropletModel.prototype.load).toBe('function');
            expect(typeof scope.DropletModel.prototype.deleteFile).toBe('function');
            expect(typeof scope.DropletModel.prototype.isImage).toBe('function');

            var model = new scope.DropletModel();
            model.load(mockFileModel, scope.FILE_TYPES.VALID);

            expect(model.file).toEqual(mockFileModel);
            expect(model.type).toEqual(scope.FILE_TYPES.VALID);
            expect(model.mimeType).toEqual('image/png');
            expect(model.extension).toEqual('png');

        });

        it('Should be able to unset the variables when finished loading;', function() {

            var scope = compileDirective('<droplet></droplet>').scope;

            scope.progress    = { percent: 100, total: 140, loaded: 140 };
            scope.isUploading = true;
            scope.finishedUploading();

            expect(scope.progress.percent).toEqual(0);
            expect(scope.progress.total).toEqual(0);
            expect(scope.progress.loaded).toEqual(0);
            expect(scope.isUploading).toBeFalsy();

        });

        it('Should be able to iterate over a given file type;', function() {

            var scope = compileDirective('<droplet></droplet>').scope;

            scope.addFile(mockFileModel, scope.FILE_TYPES.VALID);
            scope.addFile(mockFileModel, scope.FILE_TYPES.VALID);
            scope.addFile(mockFileModel, scope.FILE_TYPES.VALID);

            var Callback = {
                Function: function callbackFn(file) {
                    expect(file instanceof scope.DropletModel).toBeTruthy();
                }
            };

            spyOn(Callback, 'Function').andCallThrough();
            scope.forEachFile(scope.FILE_TYPES.VALID, Callback.Function);
            expect(Callback.Function).toHaveBeenCalled();
            expect(Callback.Function.calls.length).toEqual(3);

        });

        it('Should be able to add a file and filter of any given type;', function() {

            var scope = compileDirective('<droplet></droplet>').scope;
            scope.addFile(mockFileModel, scope.FILE_TYPES.INVALID);
            scope.addFile(mockFileModel, scope.FILE_TYPES.VALID);
            scope.addFile(mockFileModel, scope.FILE_TYPES.VALID);
            scope.addFile(mockFileModel, scope.FILE_TYPES.UPLOADED);

            expect(scope.files.length).toEqual(4);
            expect(scope.filterFiles(scope.FILE_TYPES.INVALID).length).toEqual(1);
            expect(scope.filterFiles(scope.FILE_TYPES.VALID).length).toEqual(2);
            expect(scope.filterFiles(scope.FILE_TYPES.UPLOADED).length).toEqual(1);

        });

        it('Should be able to delete files directly and through the model;', function() {

            var scope = compileDirective('<droplet></droplet>').scope,
                firstModel = scope.addFile(mockFileModel, scope.FILE_TYPES.VALID),
                secondModel = scope.addFile(mockFileModel, scope.FILE_TYPES.VALID);

            expect(scope.filterFiles(scope.FILE_TYPES.VALID).length).toEqual(2);
            scope.deleteFile(firstModel);
            expect(scope.filterFiles(scope.FILE_TYPES.VALID).length).toEqual(1);
            expect(scope.filterFiles(scope.FILE_TYPES.DELETED).length).toEqual(1);
            secondModel.deleteFile();
            expect(scope.filterFiles(scope.FILE_TYPES.VALID).length).toEqual(0);
            expect(scope.filterFiles(scope.FILE_TYPES.DELETED).length).toEqual(2);

        });

        it('Should be able to retrieve the extension for any given file;', function() {

            var scope = compileDirective('<droplet></droplet>').scope;
            expect(scope.getExtension({ name: 'Image.png' })).toEqual('png');
            expect(scope.getExtension({ name: 'Image.JPEG' })).toEqual('jpeg');
            expect(scope.getExtension({ name: '' })).toEqual('');
            expect(scope.getExtension({ name: '.torrent' })).toEqual('torrent');
            expect(scope.getExtension({ name: 'None' })).toEqual('');

        });

        it('Should be able to traverse the files;', function() {

            var scope = compileDirective('<droplet></droplet>').scope,
                invalidMockFileModel = { name: 'Mock.pdf', type: 'application/pdf' },
                files = [mockFileModel, mockFileModel, mockFileModel, mockFileModel, invalidMockFileModel];

            scope.extensions = ['png'];
            scope.traverseFiles(files);

            expect(scope.files.length).toEqual(5);
            expect(scope.filterFiles(scope.FILE_TYPES.VALID).length).toEqual(4);
            expect(scope.filterFiles(scope.FILE_TYPES.INVALID).length).toEqual(1);
            expect(scope.files[0] instanceof scope.DropletModel).toBeTruthy();

        });

        it('Should be able to add parameters to the XMLHttpRequest object;', function() {

            var MockXMLHttpRequest = function() {

                this.setRequestHeader = function(property, value) {
                    this[property] = value;
                }

            };

            var scope = compileDirective('<droplet></droplet>').scope,
                xmlHttpRequest = new MockXMLHttpRequest();

            scope.requestHeaders = { exampleHeader: 'okay', andAnotherHeader: 'sunshine' };
            var data = scope.addRequestHeaders(xmlHttpRequest);

            expect(data[0]).toEqual('exampleHeader');
            expect(data[1]).toEqual('andAnotherHeader');

            expect(xmlHttpRequest.exampleHeader).toEqual('okay');
            expect(xmlHttpRequest.andAnotherHeader).toEqual('sunshine');

        });

        it('Should be able to add parameters to the FormData object;', function() {

            var MockFormData = function() {

                this.append = function(property, value) {
                    this[property] = value;
                }

            };

            var scope = compileDirective('<droplet></droplet>').scope,
                formData = new MockFormData();

            scope.requestPostData = { morePost: 'everything', dataToCome: 'is', okay: 'okay!' };
            var data = scope.addPostData(formData);

            expect(data[0]).toEqual('morePost');
            expect(data[1]).toEqual('dataToCome');
            expect(data[2]).toEqual('okay');

            expect(formData.morePost).toEqual('everything');
            expect(formData.dataToCome).toEqual('is');
            expect(formData.okay).toEqual('okay!');

        });

        it('Should be able to compute the length of the request;', function() {

            var scope = compileDirective('<droplet></droplet>').scope,
                files = [];

            files.push(scope.addFile(mockFileModel));
            files.push(scope.addFile(mockFileModel));
            files.push(scope.addFile(mockFileModel));

            expect(scope.getRequestLength()).toEqual(600);
            expect(scope.getRequestLength(files)).toEqual(600);

        });

    });

})();