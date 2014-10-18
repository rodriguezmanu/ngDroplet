(function($angular) {

    // And... and... who other than you knows how to count the stars?
    $angular.module('dropletApp', ['ngDroplet']).controller('IndexController', function IndexController($scope, $timeout) {

        /**
         * @property interface
         * @type {Object}
         */
        $scope.interface = {};

        /**
         * @property uploadCount
         * @type {Number}
         */
        $scope.uploadCount = 0;

        /**
         * @property success
         * @type {Number}
         */
        $scope.success = 0;

        // Listen for when the interface has been configured.
        $scope.$on('$dropletReady', function whenDropletReady() {

            $scope.interface.allowedExtensions(['png', 'jpg', 'bmp', 'gif', 'svg', 'torrent']);
            $scope.interface.setRequestUrl('upload.html');
            $scope.interface.useArray(false);

        });

        // Listen for when the files have been successfully uploaded.
        $scope.$on('$dropletSuccess', function onDropletSuccess(event, response, files) {

            $scope.uploadCount = files.length;
            $scope.success     = true;
            console.log(response, files);

            $timeout(function timeout() {
                $scope.success = false;
            }, 5000);

        });

        // Listen for when the files have failed to upload.
        $scope.$on('$dropletSuccess', function onDropletError(event, response) {

            console.log(response);

        });

    });

})(window.angular);