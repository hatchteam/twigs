'use strict';


angular.module('twigsDemo')
  .controller('DemoSortableCtrl', function () {

    var vm = this;

    vm.dataForTableOne = [
      {firstName: "Sergio", lastName: "Pepperoni"},
      {firstName: "Thomaso", lastName: "Alabori"}
    ];

  });
