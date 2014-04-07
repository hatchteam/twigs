'use strict';


angular.module('twigsDemo')
    .controller('DemoHotkeysCtrl', function ($scope, GlobalHotkeysService) {

        $scope.message = '';

        $scope.areaFocus = function () {
            $scope.focussed = true;
        };

        GlobalHotkeysService.registerGlobalHotkey('a', function (event) {
            $scope.message = 'Callback for "a"';
        });
        GlobalHotkeysService.registerGlobalHotkeyCode('40', function (event) {
            $scope.message = 'Callback for code "40" (arrow down)';
        });

    });