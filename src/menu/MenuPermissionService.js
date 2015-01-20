'use strict';

angular.module('twigs.menu')

/**
 * @ngdoc object
 * @name twigs.menu.service:MenuPermissionService
 *
 */
  .service('MenuPermissionService', function ($q, $route, $injector, $log) {

    var Authorizer = getAuthorizerCollaboratorIfPresent();

    return {
      /**
       * @ngdoc function
       * @name twigs.security.service:MenuPermissionService#filterMenuForRouteRestrictions
       * @methodOf twigs.menu.service:MenuPermissionService
       *
       * @description
       *  Filters a given menu object according to specified protected routes. Will not filter any items if twigs.security is not present.
       *
       *  @returns {promise} Resolves to the filtered menu object
       */
      filterMenuForRouteRestrictions: filterMenuForRouteRestrictions
    };

    /**
     * injects Authorizer if module twigs.security exists, otherwise all SubMenuItems are allowed
     */
    function getAuthorizerCollaboratorIfPresent() {
      try {
        return $injector.get('Authorizer');
      } catch (err) {
        $log.debug('twigs.menu is used without permission filtering. Include twigs.security in your app if you wish to filter twigs.menu according to user permissions.');
      }
    }

    function filterMenuForRouteRestrictions(menu) {
      var deferred = $q.defer();

      if (angular.isUndefined(menu)) {
        deferred.resolve(undefined);
      } else if (angular.isUndefined(Authorizer)) {
        deferred.resolve(menu);
      } else {

        filterMenuRecursively(angular.copy(menu))
          .then(function (filteredMenu) {
            deferred.resolve(filteredMenu);
          });
      }

      return deferred.promise;
    }

    function hasChildren(menu) {
      return angular.isDefined(menu.items) && menu.items.length > 0;
    }

    function checkMenuChildren(menu, deferred) {
      if (!hasChildren(menu)) {
        deferred.resolve(menu);
        return;
      }

      $q.all(menu.items.map(filterMenuRecursively))
        .then(function (childResults) {
          menu.items = childResults.filter(function (child) {
            return angular.isDefined(child);
          });
          deferred.resolve(menu);
        });
    }

    function filterMenuRecursively(menuItem) {
      var deferred = $q.defer();

      isMenuItemAllowed(menuItem)
        .then(function (itemIsAllowed) {
          if (itemIsAllowed) {
            // this menu item is allowed, loop over child-items
            checkMenuChildren(menuItem, deferred);
          } else {
            // this menu item is NOT allowed, return 'filtered' item -> undefined
            deferred.resolve(undefined);
          }
        });

      return deferred.promise;
    }

    function getMatchingProtectedRoute(menuItem) {
      if (angular.isUndefined(menuItem.link)) {
        // no link -> we cannot check for route protection (might be the menu root item)
        return undefined;
      }

      var itemRoute = $route.routes[menuItem.link];
      if (angular.isUndefined(itemRoute) || angular.isUndefined(itemRoute.protection)) {
        return undefined;
      }

      return itemRoute.protection;
    }

    function isMenuItemAllowed(menuItem) {
      var deferred = $q.defer();

      var itemRouteProtection = getMatchingProtectedRoute(menuItem);

      if (angular.isUndefined(itemRouteProtection)) {
        // no matching protected route -> permission granted
        deferred.resolve(true);
      } else if (itemRouteProtection === true) {
        Authorizer
          .isLoggedIn()
          .then(function (isLoggedIn) {
            deferred.resolve(isLoggedIn);
          });
      } else {
        Authorizer
          .hasPermission(itemRouteProtection)
          .then(function (hasPermission) {
            deferred.resolve(hasPermission);
          });
      }

      return deferred.promise;
    }


  });
