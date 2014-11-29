'use strict';

/* twigs
 * Copyright (C) 2014, Hatch Development Team
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @ngdoc service
 * @name twigs.globalHotkeys.service:GlobalHotkeysService
 *
 * @description
 * GlobalHotkeys allows you to assign actions to specific keyboard key combinations.
 * In order for it to work, add the 'twg-global-hotkeys' directive to the top-element of your angular application (e.g. the html-element in a single page application).
 *
 * **Note:** All keydown events within input fields (input/textarea/select), links and buttons do not trigger the hotkey callback.
 *
 * ### Globally defined hotkeys
 * Globally defined hotkeys are available on all pages (except if explicitly overridden by path-specific hotkeys). You can define them in the **run** function of your Application's main module.
 *
 * ```javascript
 * var App = angular.module('Main',['twigs.globalHotkeys']);
 *
 * App.run(function ($location, GlobalHotkeysService) {
 *
 *    GlobalHotkeysService.registerGlobalHotkeys(["alt+h", "shift+h"], function (ev) {
 *        // go to home view
 *        $location.path('/#');
 *    });
 *
 *
 *    GlobalHotkeysService.registerGlobalHotkeys(["alt+a", "shift+a"], function (ev) {
 *        // do something here
 *    });
 *
 * });
 * ```
 *
 *
 * ### Path-specific hotkeys
 * You can define path-specific hotkeys which can override globally defined hotkeys. These will only be active for the current page.
 *
 * ```javascript
 *
 * App.controller('SomeController', function (GlobalHotkeysService) {
 *
 *    GlobalHotkeysService.registerPageHotkey("alt+i", function () {
 *        // do something here
 *    });
 *
 * });
 *
 * ```
 *
 */
angular.module('twigs.globalHotkeys')

  .factory('GlobalHotkeysService', function ($location) {
    var
      HOTKEY_CODE_PREFIX = 'c_',
      pageHotkeys = {},
      globalHotkeys = {};


    function getPageHotkeyAction(page, hotkey) {
      var hotkeys = pageHotkeys[page];
      if (angular.isUndefined(hotkeys)) {
        return undefined;
      }
      return hotkeys[hotkey.toLowerCase()];
    }

    function getPageHotkeyActionCode(page, hotkey) {
      var hotkeys = pageHotkeys[page];
      if (angular.isUndefined(hotkeys)) {
        return undefined;
      }
      return hotkeys[HOTKEY_CODE_PREFIX + hotkey];
    }

    function getGlobalHotkeyAction(hotkey) {
      return globalHotkeys[hotkey.toLowerCase()];
    }

    function getGlobalHotkeyActionCode(hotkey) {
      return globalHotkeys[HOTKEY_CODE_PREFIX + hotkey];
    }

    function registerPageHotkey(hotkey, actionFunction) {
      var page = $location.path();
      var hotkeys = pageHotkeys[page];
      if (angular.isUndefined(hotkeys)) {
        hotkeys = {};
        pageHotkeys[page] = hotkeys;
      }

      hotkeys[hotkey.toLowerCase()] = actionFunction;
    }

    function registerPageHotkeyCode(hotkeyCode, actionFunction) {
      var page = $location.path();
      var hotkeys = pageHotkeys[page];
      if (angular.isUndefined(hotkeys)) {
        hotkeys = {};
        pageHotkeys[page] = hotkeys;
      }

      hotkeys[HOTKEY_CODE_PREFIX + hotkeyCode] = actionFunction;
    }

    function registerPageHotkeys(hotkeys, actionFunction) {
      angular.forEach(hotkeys, function (key) {
        registerPageHotkey(key, actionFunction);
      });
    }

    function registerPageHotkeyCodes(hotkeyCodes, actionFunction) {
      angular.forEach(hotkeyCodes, function (key) {
        registerPageHotkeyCode(key, actionFunction);
      });
    }

    function registerGlobalHotkey(hotkey, actionFunction) {
      globalHotkeys[hotkey.toLowerCase()] = actionFunction;
    }

    function registerGlobalHotkeys(hotkeys, actionFunction) {
      angular.forEach(hotkeys, function (key) {
        registerGlobalHotkey(key, actionFunction);
      });
    }

    function registerGlobalHotkeyCode(hotkeyCode, actionFunction) {
      globalHotkeys[HOTKEY_CODE_PREFIX + hotkeyCode] = actionFunction;
    }

    function registerGlobalHotkeyCodes(hotkeyCodes, actionFunction) {
      angular.forEach(hotkeyCodes, function (key) {
        registerGlobalHotkeyCode(key, actionFunction);
      });
    }

    return {

      getPageHotkeyAction: getPageHotkeyAction,

      getPageHotkeyActionCode: getPageHotkeyActionCode,

      getGlobalHotkeyAction: getGlobalHotkeyAction,

      getGlobalHotkeyActionCode: getGlobalHotkeyActionCode,

      /**
       * @ngdoc function
       * @name twigs.globalHotkeys.service:GlobalHotkeysService#registerPageHotkey
       * @methodOf twigs.globalHotkeys.service:GlobalHotkeysService
       *
       * @description
       * Controllers can call this function to register a route-/path-specific hotkey.
       *
       * @param {string} hotkey The hotkey as string (e.g.  'n'  or 'alt+n' )
       * @param {function} actionFunction The callback function that is invoked when a hotkey (-combination) is pressed
       */
      registerPageHotkey: registerPageHotkey,

      /**
       * @ngdoc function
       * @name twigs.globalHotkeys.service:GlobalHotkeysService#registerPageHotkeyCode
       * @methodOf twigs.globalHotkeys.service:GlobalHotkeysService
       *
       * @description
       * Controllers can call this function to register a route-/path-specific hotkey. Use this when using special keys, e.g. arrows.
       *
       * @param {string} hotkey The hotkey as string (e.g.  '37'  or 'alt+37' )
       * @param {function} actionFunction The callback function that is invoked when a hotkey (-combination) is pressed
       */
      registerPageHotkeyCode: registerPageHotkeyCode,

      /**
       * @ngdoc function
       * @name twigs.globalHotkeys.service:GlobalHotkeysService#registerPageHotkeys
       * @methodOf twigs.globalHotkeys.service:GlobalHotkeysService
       *
       * @description
       * Controllers can call this function to register route-/path-specific hotkeys.
       *
       * @param {string[]} hotkey An array of hotkeys where each key is a string (e.g.  'n'  or 'alt+n' )
       * @param {function} actionFunction The callback function that is invoked when a hotkey (-combination) is pressed
       */
      registerPageHotkeys: registerPageHotkeys,

      /**
       * @ngdoc function
       * @name twigs.globalHotkeys.service:GlobalHotkeysService#registerPageHotkeyCodes
       * @methodOf twigs.globalHotkeys.service:GlobalHotkeysService
       *
       * @description
       * Controllers can call this function to register route-/path-specific hotkeys  with keycode (for special keys like arrows)
       *
       * @param {string[]} hotkey An array of hotkeys where each key is a string (e.g.  '39'  or 'shift+39' )
       * @param {function} actionFunction The callback function that is invoked when a hotkey (-combination) is pressed
       */
      registerPageHotkeyCodes: registerPageHotkeyCodes,

      /**
       * @ngdoc function
       * @name twigs.globalHotkeys.service:GlobalHotkeysService#registerGlobalHotkey
       * @methodOf twigs.globalHotkeys.service:GlobalHotkeysService
       *
       * @description
       * call this function to register a global (application-wide) hotkey.
       *
       * @param {string} The hotkey as string (e.g.  'n'  or 'alt+n' )
       * @param {function} actionFunction The callback function that is invoked when a hotkey (-combination) is pressed
       */
      registerGlobalHotkey: registerGlobalHotkey,

      /**
       * @ngdoc function
       * @name twigs.globalHotkeys.service:GlobalHotkeysService#registerGlobalHotkeys
       * @methodOf twigs.globalHotkeys.service:GlobalHotkeysService
       *
       * @description
       * call this function to register global (application-wide) hotkeys.
       *
       * @param {string[]} hotkey An array of hotkeys where each key is a string (e.g.  'n'  or 'alt+n' )
       * @param {function} actionFunction The callback function that is invoked when a hotkey (-combination) is pressed
       */
      registerGlobalHotkeys: registerGlobalHotkeys,

      /**
       * @ngdoc function
       * @name twigs.globalHotkeys.service:GlobalHotkeysService#registerGlobalHotkeyCode
       * @methodOf twigs.globalHotkeys.service:GlobalHotkeysService
       *
       * @description
       * call this function to register a global (application-wide) hotkey with keycode (for special keys like arrows).
       *
       * @param {string} The hotkey as string (e.g.  '40'  or 'alt+40' )
       * @param {function} actionFunction The callback function that is invoked when a hotkey (-combination) is pressed
       */
      registerGlobalHotkeyCode: registerGlobalHotkeyCode,

      /**
       * @ngdoc function
       * @name twigs.globalHotkeys.service:GlobalHotkeysService#registerGlobalHotkeyCodes
       * @methodOf twigs.globalHotkeys.service:GlobalHotkeysService
       *
       * @description
       * call this function to register global (application-wide) hotkeys with keycodes (for special keys like arrows).
       *
       * @param {string[]} hotkey An array of hotkeys where each key is a string (e.g.  '33'  or 'alt+33' )
       * @param {function} actionFunction The callback function that is invoked when a hotkey (-combination) is pressed
       */
      registerGlobalHotkeyCodes: registerGlobalHotkeyCodes
    };
  })


/**
 * @ngdoc directive
 * @name twigs.globalHotkeys.directive:twgGlobalHotkeys
 * @element ANY
 *
 * @description
 * This directive registers for the 'keydown' event and forwards them to
 * either custom hotkeys for the current page or global hotkey function, if defined.
 *
 * You can use this directive on the _html_ element, in order to catch all key events.
 *
 * Ignores keystrokes in form elements , buttons and links.
 *
 * See [GlobalHotkeysService](#/api/twigs.globalHotkeys.service:GlobalHotkeysService) for more information.
 */
  .directive('twgGlobalHotkeys', function ($location, $rootScope, GlobalHotkeysService) {
    return {
      restrict: 'A',
      link: function (scope, element) {

        function isForbiddenElement(event) {
          switch (getTarget(event).tagName.toLowerCase()) {
            case 'a':
            case 'button':
            case 'input':
            case 'select':
            case 'textarea':
              return true;
            default:
              return false;
          }
        }

        /**
         * register to keydown
         */
        element.bind('keydown', function (event) {
          if (isForbiddenElement(event)) {
            return;
          }
          handleHotkey(event);
        });

        function handleHotkeyNormal(hotkey, event) {
          var completeHotkey = appendKey(hotkey, String.fromCharCode(event.which));
          var pageAction = GlobalHotkeysService.getPageHotkeyAction($location.path(), completeHotkey);
          if (angular.isDefined(pageAction)) {
            pageAction(event);
            scope.$apply();
            return true;
          }

          var globalAction = GlobalHotkeysService.getGlobalHotkeyAction(completeHotkey);
          if (angular.isDefined(globalAction)) {
            globalAction(event);
            scope.$apply();
            return true;
          }
          return false;
        }

        function handleHotkeyCode(hotkey, event) {
          var completeHotkey = appendKey(hotkey, event.which);
          var pageAction = GlobalHotkeysService.getPageHotkeyActionCode($location.path(), completeHotkey);
          if (angular.isDefined(pageAction)) {
            pageAction(event);
            scope.$apply();
            return true;
          }

          var globalAction = GlobalHotkeysService.getGlobalHotkeyActionCode(completeHotkey);
          if (angular.isDefined(globalAction)) {
            globalAction(event);
            scope.$apply();
            return true;
          }
          return false;
        }

        function handleHotkey(event) {
          var hotkey = '';
          if (event.ctrlKey) {
            hotkey = appendKey(hotkey, 'ctrl');
          }

          if (event.altKey) {
            hotkey = appendKey(hotkey, 'alt');
          }

          if (event.shiftKey) {
            hotkey = appendKey(hotkey, 'shift');
          }

          /**
           * no way to determine if pressed key is a special key and registered with *Code
           * We search for a normal key first, if none found, search for a special one
           */

          var normalHandled = handleHotkeyNormal(hotkey, event);

          if (!normalHandled) {
            handleHotkeyCode(hotkey, event);
          }

        }

        var appendKey = function (oldHotkey, nextKey) {
          var hotkey = oldHotkey;

          if (oldHotkey.length > 0) {
            hotkey += '+';
          }

          hotkey += nextKey;

          return hotkey;
        };

        /**
         * returns the dom-element that fired the event.
         * (different browser handling)
         */
        var getTarget = function (event) {
          var target;

          if (!event) {
            event = window.event;
          }

          if (event.target) {
            target = event.target;
          } else if (event.srcElement) {
            target = event.srcElement;
          }

          // defeat Safari bug
          if (target.nodeType === 3) {
            target = target.parentNode;
          }

          return target;
        };
      }
    };
  });
