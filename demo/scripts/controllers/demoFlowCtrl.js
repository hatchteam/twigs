'use strict';


/**
 * this controller is used for steps 1 and 3.
 * step 2 has it's own specific controller
 */
angular.module('twigsDemo')
  .controller('DemoFlowController', function (Flow) {

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
