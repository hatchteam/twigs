'use strict';

angular.module('twigs.security')

  .service('UserObjectSanityChecker', function () {

    var EXPECTED_PROPERTIES = ['username', 'permissions'];

    function isSaneUserObject(userObject) {
      if (angular.isUndefined(userObject)) {
        return false;
      }

      var allPropertiesFound = true;
      EXPECTED_PROPERTIES.forEach(function (prop) {
        if (angular.isUndefined(userObject[prop])) {
          allPropertiesFound = false;
        }
      });

      return allPropertiesFound;
    }

    return {
      isSane: isSaneUserObject
    };
  });
