'use strict';


angular.module('twigsDemo')
  .controller('DemoHotkeysCtrl', function (GlobalHotkeysService) {

    var vm = this;
    vm.message = '';

    GlobalHotkeysService.registerGlobalHotkey('a', function () {
      vm.message = 'Callback for "a"';
    });

    GlobalHotkeysService.registerGlobalHotkeyCode('40', function () {
      vm.message = 'Callback for code "40" (arrow down)';
    });

  });
