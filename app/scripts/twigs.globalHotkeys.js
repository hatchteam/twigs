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

'use strict';

/**
 *  application wide hotkeys that can be overridden by
 *  controllers (with route/path-specific hotkey assignments)
 *
 *  See readme.md for more information
 */
angular.module('twigs.globalHotKeys', [])

    .factory('GlobalHotKeysService', function ($location) {
        var serviceInstance = {
            pageHotKeys: {},
            globalHotKeys: {},

            getPageHotKeyAction: function (page, hotKey) {
                var hotKeys = this.pageHotKeys[page];
                if (angular.isUndefined(hotKeys)) {
                    return undefined;
                }

                return hotKeys[hotKey.toLowerCase()];
            },

            /**
             * controllers can call this method to register route-/path-specifiv hotkeys.
             * @param hotKey
             *      the hotkey as string (e.g.  'n'  or 'alt+n' )
             * @param actionFunction
             *      the callback function that is invoked when a hotkey (-combination) is pressed
             */
            registerPageHotKey: function (hotKey, actionFunction) {
                var page = $location.path();
                var hotKeys = this.pageHotKeys[page];
                if (angular.isUndefined(hotKeys)) {
                    hotKeys = {};
                    this.pageHotKeys[page] = hotKeys;
                }

                hotKeys[hotKey.toLowerCase()] = actionFunction;
            },

            /**
             * @param hotKeys an array of hotkeys
             */
            registerPageHotKeys: function (hotKeys, actionFunction) {
                var that = this;
                angular.forEach(hotKeys, function (key) {
                    that.registerPageHotKey.call(that, key, actionFunction);
                });
            },


            getGlobalHotKeyAction: function (hotKey) {
                return this.globalHotKeys[hotKey.toLowerCase()];
            },


            /**
             * controllers can call this method to register global (application-wide) hotkeys.
             * @param hotKey
             *      the hotkey as string (e.g.  "n"  or "alt+n" )
             * @param actionFunction
             *      the callback function that is invoked when a hotkey (-combination) is pressed
             */
            registerGlobalHotKey: function (hotKey, actionFunction) {
                this.globalHotKeys[hotKey.toLowerCase()] = actionFunction;
            },

            /**
             * @param hotKeys an array of hotkeys
             */
            registerGlobalHotKeys: function (hotKeys, actionFunction) {
                var that = this;
                angular.forEach(hotKeys, function (key) {
                    that.registerGlobalHotKey.call(that, key, actionFunction);
                });
            }
        };

        return serviceInstance;
    })

/**
 * this directive registers for the jquery 'keypress' event and forwards them to
 * either custom hotkeys for the current page or global hotkey function, if defined.
 *
 * we used this directive on the <html> element, in order to catch all key events.
 *
 * ignores keystrokes in form elements , buttons and links.
 */
    .directive('htHotKeys', function ($location, $rootScope, GlobalHotKeysService) {
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

                /*
                 * register to the keypress event (works for most keys, i.e. this is the 'normal' way)
                 */
                element.bind('keypress', function (event) {
                    if (isForbiddenElement(event)) {
                        return;
                    }
                    handleHotKey(event);
                });

                /**
                 * register to keydown to handle 'alt+' in chrome
                 */
                element.bind('keydown', function (event) {
                    if (isForbiddenElement(event)) {
                        return;
                    }
                    if (event.altKey !== true) {
                        return;
                    }
                    handleHotKey(event);
                });

                function handleHotKey(event) {
                    var hotKey = '';
                    if (event.ctrlKey) {
                        hotKey = appendKey(hotKey, 'ctrl');
                    }

                    if (event.altKey) {
                        hotKey = appendKey(hotKey, 'alt');
                    }

                    if (event.shiftKey) {
                        hotKey = appendKey(hotKey, 'shift');
                    }

                    hotKey = appendKey(hotKey, String.fromCharCode(event.which));

                    var pageAction = GlobalHotKeysService.getPageHotKeyAction($location.path(), hotKey);

                    if (angular.isDefined(pageAction)) {
                        pageAction();
                    } else {
                        var globalAction = GlobalHotKeysService.getGlobalHotKeyAction(hotKey);
                        if (angular.isDefined(globalAction)) {
                            globalAction();
                        }
                    }

                    scope.$apply();
                }

                var appendKey = function (oldHotKey, nextKey) {
                    var hotKey = oldHotKey;

                    if (oldHotKey.length > 0) {
                        hotKey += '+';
                    }

                    hotKey += nextKey;

                    return hotKey;
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