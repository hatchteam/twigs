'use strict';

/**
 * you can use different controllers for each step of your flow
 */
angular.module('twigsDemo')
  .controller('SecondDemoFlowController', function (Flow) {

    var vm = this;
    vm.flowmodel = Flow.getModel();
    vm.onButtonPrevious = onButtonPrevious;
    vm.onButtonNext = onButtonNext;

    function onButtonPrevious() {
      Flow.previous(vm.flowmodel);
    }

    function onButtonNext() {
      Flow.next(vm.flowmodel);
    }

  });
