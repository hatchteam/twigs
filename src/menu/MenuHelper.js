'use strict';

angular.module('twigs.menu')


  .service('MenuHelper', function () {

    return {
      setActiveMenuEntryRecursively: setActiveMenuEntryRecursively
    };

    function activeRouteRegex(menu, path) {
      if (angular.isDefined(menu.activeRoute) && menu.activeRoute.length > 0) {
        var regexp = new RegExp('^' + menu.activeRoute + '$', 'i');
        if (regexp.test(path)) {
          return true;
        }
      }
      return false;
    }

    function setActiveMenuEntryRecursively(path, menu) {
      var subItemFound = false;

      if (angular.isDefined(menu.items) && menu.items.length > 0) {
        angular.forEach(menu.items, function (item) {
          item.active = false;
          if (setActiveMenuEntryRecursively(path, item) === true) {
            subItemFound = true;
            item.active = true;
            return false;
          }
        });
        menu.active = subItemFound;

        if (subItemFound === false) {
          //check if this menu item should be active itself
          menu.active = (menu.link === path || activeRouteRegex(menu, path) === true);
        }
        return menu.active;
      } else {
        return (menu.link === path || activeRouteRegex(menu, path) === true);
      }
    }

  });
