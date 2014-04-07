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


    .service('ChooseHelper', function ChooseHelper(ChooseConfig) {

        function convertExternToInternMultiple(externNgModel) {

            if (angular.isUndefined(externNgModel)) {
                return externNgModel;
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

        function convertInternToExternSingle(internBinding) {
            return {id: toInt(internBinding)};
        }

        function toInt(input) {
            if (typeof input === 'Number') {
                return input;
            }

            return parseInt(input, 10);
        }

        function getChoiceLabel(choice, propertyName) {
            if (angular.isUndefined(propertyName) || propertyName === '' || angular.isUndefined(choice[propertyName])) {
                return choice;
            } else {
                return choice[propertyName];
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

        return {
            convertExternToInternMultiple: convertExternToInternMultiple,
            convertExternToInternSingle: convertExternToInternSingle,
            convertInternToExternMultiple: convertInternToExternMultiple,
            convertInternToExternSingle: convertInternToExternSingle,
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
                choiceDisplayname: '@',
                noResultMessage: '@'
            },
            link: function (scope, element, attrs, ngModelController) {

                ngModelController.$formatters.push(function (modelValue) {
                    return ChooseHelper.convertExternToInternSingle(modelValue);
                });

                ngModelController.$parsers.push(function (viewValue) {
                    return ChooseHelper.convertInternToExternSingle(viewValue);
                });

                scope.getLabel = function (choice) {
                    return ChooseHelper.getChoiceLabel(choice, scope.choiceDisplayname);
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
                choiceDisplayname: '@',
                noResultMessage: '@'
            },
            link: function (scope, element, attrs, ngModelController) {

                ngModelController.$formatters.push(function (modelValue) {
                    return ChooseHelper.convertExternToInternMultiple(modelValue);
                });

                ngModelController.$parsers.push(function (viewValue) {
                    return ChooseHelper.convertInternToExternMultiple(viewValue);
                });


                scope.getLabel = function (choice) {
                    return ChooseHelper.getChoiceLabel(choice, scope.choiceDisplayname);
                };

                scope.select2Options = ChooseHelper.getDefaultSelect2Options(scope.noResultMessage);
            }
        };
    })
;
