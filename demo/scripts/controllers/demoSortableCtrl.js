'use strict';


angular.module('twigsDemo')
  .controller('DemoSortableCtrl', function () {

    var vm = this;

    vm.countries = [
      {name: "China", pop: 1367140000},
      {name: "India", pop: 1264020000},
      {name: "United States", pop: 319271000},
      {name: "Indonesia", pop: 252164800},
      {name: "Brazil", pop: 203596000}
    ];

  });
