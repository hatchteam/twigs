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
    .directive('twgChoose', function () {
        return {
            templateUrl: 'templates/choose.html',
            replace: true,
            restrict: 'E',
            scope: {
                choices: '=choices',
                name: '@name',
                ngModel: '=ngModel',
                choiceDisplayname: '@choiceDisplayname',
                multiple: '=multiple',
                onSelectionChanged: '='
            },
            link: function postLink(scope) {
                scope.renderDropdown = false;

                function mapNgModelToArrayOfIds() {
                    var mappedArray = [];
                    angular.forEach(scope.ngModel, function (element) {
                        mappedArray.push(element.id);
                    });
                    scope.ngModel = mappedArray;
                }

                function mapNgModelToArrayOfIdObjects() {
                    var mappedArray = [];
                    angular.forEach(scope.ngModel, function (element) {
                        if (angular.isDefined(element.id)) {
                            mappedArray.push({id: element.id});
                        }
                        else {
                            mappedArray.push({id: element});
                        }
                    });
                    scope.ngModel = mappedArray;
                }

                function mapSelectedItemsToIdArray() {
                    var mappedArray = [];
                    angular.forEach(scope.selectedItems, function (currentItem) {
                        mappedArray.push({id: currentItem});
                    });
                    scope.ngModel = mappedArray;
                }

                var unregister = scope.$watch('ngModel', function () {
                    if (angular.isDefined(scope.ngModel) && scope.ngModel !== null) {
                        if (angular.isArray(scope.ngModel)) {
                            if (scope.ngModel.length > 0) {
                                mapNgModelToArrayOfIds();
                                scope.selectedItems = scope.ngModel;
                                unregister();
                                mapNgModelToArrayOfIdObjects();
                            }
                        } else {
                            scope.selectedItems = scope.ngModel.id;
                            unregister();
                            scope.ngModel = {id: scope.ngModel.id};
                        }
                    }
                });

                scope.$watch('choices', function () {
                    if (angular.isDefined(scope.choices) && scope.choices !== null) {
                        scope.renderDropdown = true;
                    }
                });

                scope.onChange = function (newVal) {
                    if (newVal !== null) {
                        if (scope.multiple === true) {
                            scope.selectedItems = newVal;
                            mapSelectedItemsToIdArray();
                        } else {
                            scope.ngModel = {id: newVal};
                        }

                        if (angular.isDefined(scope.onSelectionChanged)) {
                            scope.onSelectionChanged(newVal, scope.name);
                        }
                    }
                };


                scope.getLabel = function (choice) {
                    var displayName = scope.choiceDisplayname;
                    if (angular.isUndefined(displayName) || displayName === '') {
                        return choice;
                    } else {
                        return choice[displayName];
                    }
                };

                scope.select2Options = {
                    'formatNoMatches': function () {
                        return '----nö----';
                    }
                };
            }
        };
    });
