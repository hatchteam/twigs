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


    .service('ChooseHelper', function ChooseHelper($filter, ChooseConfig) {

        function convertExternToInternMultiple(externNgModel) {

            if (angular.isUndefined(externNgModel)) {
                return;
            }

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

            if (angular.isUndefined(externNgModel)) {
                return externNgModel;
            }

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

        function convertInternToExternMultipleFull(internBinding, choices) {
            if (!angular.isArray(internBinding)) {
                throw 'With multiple selection, intern model is expected to be an array!';
            }
            return getObjectsByIdFromArray(choices, internBinding);
        }

        function convertInternToExternSingle(internBinding) {
            return {id: toInt(internBinding)};
        }

        function convertInternToExternSingleFull(internBinding, choices) {
            return getObjectByIdFromArray(choices, internBinding);
        }

        function toInt(input) {
            if (typeof input === 'number') {
                return input;
            }
            return parseInt(input, 10);
        }

        function getChoiceLabel(scope, choice, propertyName) {
            if (angular.isUndefined(propertyName) || propertyName === '') {
                return choice;
            } else if (angular.isDefined(scope.$parent[propertyName]) && typeof scope.$parent[propertyName] === 'function') {
                return scope.$parent[propertyName](choice);
            } else if (angular.isDefined(choice[propertyName])) {
                return choice[propertyName];
            } else {
                return choice;
            }
        }

        function getDefaultSelect2Options(customNoResultMessage) {
            var formatNoMatchesValue;
            if (angular.isDefined(customNoResultMessage) && customNoResultMessage.length > 0) {
                formatNoMatchesValue = customNoResultMessage;
            } else {
                formatNoMatchesValue = ChooseConfig.getNoResultMessage();
            }
            return {
                'formatNoMatches': function () {
                    return formatNoMatchesValue;
                }
            };
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

        function getObjectsByIdFromArray(array, idsArray) {
            var matches = $filter('filter')(array, function (element) {
                return ($filter('filter')(idsArray, element.id.toString()).length > 0);
            });

            if (matches.length < 1) {
                throw 'Sorry, no object with ids ' + idsArray + ' found in given choices!';
            } else {
                return matches;
            }
        }

        return {
            convertExternToInternMultiple: convertExternToInternMultiple,
            convertExternToInternSingle: convertExternToInternSingle,
            convertInternToExternMultiple: convertInternToExternMultiple,
            convertInternToExternMultipleFull: convertInternToExternMultipleFull,
            convertInternToExternSingle: convertInternToExternSingle,
            convertInternToExternSingleFull: convertInternToExternSingleFull,
            getChoiceLabel: getChoiceLabel,
            getDefaultSelect2Options: getDefaultSelect2Options
        };
    }
)


/**
 * @ngdoc directive
 * @name twigs.choose.directive:twgChooseSingle
 * @restrict E
 *
 * @description
 * Creates a ui-select2 choose dropdown element.
 *
 * ### Attributes:
 * -model -> model variable which should be changed by selecting a value in the dropdown
 * -choices -> array of choices to be displayed in the dropdown (one object in the choices array needs to be equal to the object in model for the mapping between model and dropdown to work properly)
 * -choiceDisplayname -> name of the attribute of a choice to be displayed as text in the choose element
 */
    .directive('twgChooseSingle', function (ChooseHelper) {
        return {
            templateUrl: 'templates/chooseSingle.html',
            replace: true,
            restrict: 'E',
            require: '?ngModel',
            scope: {
                choices: '=',
                ngModel: '=',
                twgChooseFullObject: '@',
                choiceDisplayname: '@',
                noResultMessage: '@'
            },
            link: function (scope, element, attrs, ngModelController) {

                ngModelController.$formatters.push(function (modelValue) {
                    return ChooseHelper.convertExternToInternSingle(modelValue);
                });

                ngModelController.$parsers.push(function (viewValue) {
                    if (scope.twgChooseFullObject) {
                        return ChooseHelper.convertInternToExternSingleFull(viewValue, scope.choices);
                    } else {
                        return ChooseHelper.convertInternToExternSingle(viewValue);
                    }
                });

                scope.getLabel = function (choice) {
                    return ChooseHelper.getChoiceLabel(scope, choice, scope.choiceDisplayname);
                };

                scope.select2Options = ChooseHelper.getDefaultSelect2Options(scope.noResultMessage);

            }
        };
    })


/**
 * @ngdoc directive
 * @name twigs.choose.directive:twgChooseMultiple
 * @restrict E
 *
 * @description
 * Creates a ui-select2 choose multi-select element.
 *
 * ### Attributes:
 * -model -> model variable which should be changed by selecting a value in the dropdown
 * -choices -> array of choices to be displayed in the dropdown (one object in the choices array needs to be equal to the object in model for the mapping between model and dropdown to work properly)
 * -choiceDisplayname -> name of the attribute of a choice to be displayed as text in the choose element
 */
    .directive('twgChooseMultiple', function (ChooseHelper) {
        return {
            templateUrl: 'templates/chooseMultiple.html',
            replace: true,
            restrict: 'E',
            require: '?ngModel',
            scope: {
                choices: '=',
                ngModel: '=',
                twgChooseFullObject: '@',
                choiceDisplayname: '@',
                noResultMessage: '@'
            },
            link: function (scope, element, attrs, ngModelController) {

                ngModelController.$formatters.push(function (modelValue) {
                    return ChooseHelper.convertExternToInternMultiple(modelValue);
                });

                ngModelController.$parsers.push(function (viewValue) {
                    if (scope.twgChooseFullObject) {
                        return ChooseHelper.convertInternToExternMultipleFull(viewValue, scope.choices);
                    } else {
                        return ChooseHelper.convertInternToExternMultiple(viewValue);
                    }
                });


                scope.getLabel = function (choice) {
                    return ChooseHelper.getChoiceLabel(scope, choice, scope.choiceDisplayname);
                };

                scope.select2Options = ChooseHelper.getDefaultSelect2Options(scope.noResultMessage);
            }
        };
    })
;
