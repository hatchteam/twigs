'use strict';


angular.module('twigsDemo')
    .controller('DemoSortableCtrl', function ($scope) {


        $scope.dataForTableOne = [
            { firstName: "Sergio", lastName: "Pepperoni"  },
            { firstName: "Thomaso", lastName: "Alabori"  }
        ];
        $scope.dataForTableTwo = [
            { firstName: "Sandra", lastName: "Schimantzki"  },
            { firstName: "Tamara", lastName: "Alessi"  }
        ];

    });