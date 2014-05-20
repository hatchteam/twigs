'use strict';


angular.module('twigsDemo')
    .controller('DemoChooseCtrl', function ($filter, $scope) {

        function toInt(input) {
            if (typeof input === 'number') {
                return input;
            }
            return parseInt(input, 10);
        }

        function getObjectByIdFromArray(array, id) {
            var matches = $filter('filter')(array, {id: toInt(id)});
            if (matches.length < 1) {
                throw 'Sorry, no object with id ' + id + ' found in given choices!';
            } else if (matches.length > 1) {
                throw 'Sorry, multiple objects with id ' + id + ' found in given choices!';
            } else {
                return matches[0];
            }
        }


        $scope.allCountries = [
            {id: 1, name: 'Switzerland', code: 'CH'},
            {id: 2, name: 'Austria', code: 'AU'},
            {id: 3, name: 'Germany', code: 'DE'}
        ];


        $scope.setSelectedCountry = function (id) {
            $scope.selectedCountry = id;
        };

        $scope.setSelectedCountryFull = function (id) {
            $scope.selectedCountryFull = getObjectByIdFromArray($scope.allCountries, id);
        };

        $scope.setSelectedCountries = function (idArray) {
            var idObjectArray = [];

            idArray.forEach(function (item) {
                idObjectArray.push({id: item});
            });
            $scope.selectedCountries = idObjectArray;
        };
        $scope.setSelectedCountriesFull = function (idArray) {
            var idObjectArray = [];

            idArray.forEach(function (item) {
                idObjectArray.push({id: item});
            });
            $scope.selectedCountriesFull = idObjectArray;
        };


    });