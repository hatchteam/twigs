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

angular.module('twigs.choose')

    .service('ChooseConfig', function ChooseConfig() {
        var noResultMessage = 'No results';

        function setNoResultMessage(message) {
            noResultMessage = message;
        }

        function getNoResultMessage() {
            return noResultMessage;
        }

        return {
            setNoResultMessage: setNoResultMessage,
            getNoResultMessage: getNoResultMessage
        };
    })


    .service('ChooseHelper', function ChooseHelper() {

        function convertExternToInternMultiple(externNgModel) {
            if (!angular.isArray(externNgModel)) {
                throw 'With multiple selection, model is expected to be an array!';
            }
            if (externNgModel.length < 1) {
                return;
            }

            var mappedArray = [];
            externNgModel.forEach(function (element) {
                if (angular.isDefined(element.id)) {
                    mappedArray.push(element.id);
                }
                else {
                    mappedArray.push(element);
                }
            });

            return mappedArray;
        }

        function convertExternToInternSingle(externNgModel) {
            if (angular.isDefined(externNgModel.id)) {
                return externNgModel.id;
            } else {
                return externNgModel;
            }
        }

        function convertInternToExternMultiple(internBinding) {
            if (!angular.isArray(internBinding)) {
                throw 'With multiple selection, intern model is expected to be an array!';
            }
            var mappedArray = [];
            internBinding.forEach(function (currentItem) {
                mappedArray.push({id: toInt(currentItem)});
            });
            return mappedArray;
        }

        function convertInternToExternSingle(internBinding) {
            return {id: toInt(internBinding)};
        }

        function toInt(input) {
            if (typeof input === 'Number') {
                return input;
            }

            return parseInt(input, 10);
        }

        return {
            convertExternToInternMultiple: convertExternToInternMultiple,
            convertExternToInternSingle: convertExternToInternSingle,
            convertInternToExternMultiple: convertInternToExternMultiple,
            convertInternToExternSingle: convertInternToExternSingle
        };
    })


/**
 * @ngdoc directive
 * @name twigs.choose.directive:twgChoose
 * @restrict E
 *
 * @description
 * Creates a ui-select2 choose element. This can be single- or multi select.
 *
 * ### Attributes:
 * -model -> model variable which should be changed by selecting a value in the dropdown
 * -choices -> array of choices to be displayed in the dropdown (one object in the choices array needs to be equal to the object in model for the mapping between model and dropdown to work properly)
 * -choiceDisplayname -> name of the attribute of a choice to be displayed as text in the choose element
 * -onSelectionChanged -> callback function that is invoked when selection in dropdown changed. passed params are: the new selected value(s), the name of the element
 */
    .directive('twgChoose', function (ChooseConfig, ChooseHelper) {
        return {
            templateUrl: 'templates/choose.html',
            replace: true,
            restrict: 'E',
            scope: {
                choices: '=',
                name: '@',
                twgModel: '=',
                choiceDisplayname: '@',
                multiple: '=',
                onSelectionChanged: '='
            },
            link: function (scope, element, attrs) {

                scope.renderDropdown = false;

                /** -- watchers -- **/
                scope.$watch('choices', onChoicesChanged);
                scope.$watch('twgModel', onNgModelChanged);


                /** -- watcher callbacks -- **/

                function onChoicesChanged(newValue) {
                    if (angular.isDefined(newValue) && newValue !== null) {
                        // display the dropdown, only after choices are available
                        scope.renderDropdown = true;
                    }
                }

                function onNgModelChanged(newValue) {
                    if (newValue == null) {
                        return;
                    }

                    if (angular.isUndefined(newValue)) {
                        scope.internalBinding = newValue;
                        return;
                    }

                    if (scope.multiple) {
                        scope.internalBinding = ChooseHelper.convertExternToInternMultiple(newValue);
                    } else {
                        scope.internalBinding = ChooseHelper.convertExternToInternSingle(newValue);
                    }

                    console.log('after all, ngModel and internalBinding:', scope.ngModel, scope.internalBinding);
                }

                /** -- scope functions -- **/

                scope.onChange = function (newVal) {
                    if (newVal === null) {
                        return;
                    }

                    if (scope.multiple === true) {
                        scope.twgModel = ChooseHelper.convertInternToExternMultiple(newVal);
                    } else {
                        scope.twgModel = ChooseHelper.convertInternToExternSingle(newVal);
                    }

                    if (angular.isDefined(scope.onSelectionChanged)) {
                        scope.onSelectionChanged(newVal, scope.name);
                    }
                };

                scope.getLabel = function (choice) {
                    var displayName = scope.choiceDisplayname;
                    if (angular.isUndefined(displayName) || displayName === '' || angular.isUndefined(choice[displayName])) {
                        return choice;
                    } else {
                        return choice[displayName];
                    }
                };

                scope.select2Options = {
                    'formatNoMatches': function () {
                        return ChooseConfig.getNoResultMessage();
                    }
                };
            }
        };
    });
