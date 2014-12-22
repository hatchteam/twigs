'use strict';


angular.module('twigsDemo')
  .controller('DemoHotkeysCtrl', function (GlobalHotkeysService) {

    var vm = this;
    vm.message = '';

    GlobalHotkeysService.registerGlobalHotkey('a', function () {
      vm.message = 'Callback for "a"';
    });

    GlobalHotkeysService.registerGlobalHotkeyCode('39', function () {
      vm.message = 'Callback for code "39" (arrow  right)';
    });

  });
