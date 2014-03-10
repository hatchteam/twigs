"use strict";

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
 * @ngdoc object
 * @name twigs.globalPopups.provider:GlobalPopupsProvider
 *
 * @description
 * GlobalPopupsProvider can be used to define custom GlobalPopups or override twitch default GlobalPopups.
 *
 * ### Usage
 * You need to specify a config block to create a new GlobalPopup and you need to create a html template for the Popup content.
 *
 * ```javascript
 * angular.module('myApp').config(function (GlobalPopupsProvider) {
 *      GlobalPopupsProvider.createModal('myOwnPopup',{
 *          modalOptions: {
 *              templateUrl: 'views/globalMsg/myOwnPopup.html',
 *              windowClass: 'modal-myOwnPopup',
 *              backdrop: 'static',
 *              keyboard: false
 *          }
 *      });
 * });
 * ```
 * ```html
 * <div class="modal-header">
 *      <button type="button" ng-click="$close()" >x</button>
 *      <h3>{{title}}</h3>
 * </div>
 * <div class="modal-body">
 *      <p>{{message}}</p>
 * </div>
 * <div class="modal-footer">
 *      <button class="btn btn-default" ng-click="$close()">close</button>
 * </div>
 * ```
 *
 * ```javascript
 * angular.module('awesome.admin')
 *       .controller('UserCtrl', function ($scope, GlobalPopups, ...) {
 *               if(someErrorOccurred){
 *                      GlobalPopups.myOwnPopup('Show my message');
 *               }
 *        });
 * ```
 */

/**
 * @ngdoc object
 * @name twigs.globalPopups.provider:GlobalPopups
 *
 * @description
 * GlobalPopups globally defines popups dialogs which can be called in every controller of your Angular JS application. They consist of two different types of dialogs:
 *
 * * Modals: Wrapper of [UI Bootstrap Modals](http://angular-ui.github.io/bootstrap/#/modal) which defines global templates for modals you use frequently in your application.
 * * Toasts: Lightweight html templates which can be displayed i.e. on the top of your GUI to inform the user about actions (save actions, warnings, etc.)
 *
 * If you want to define your own GlobalPopups, consider [GlobalPopupsProvider](#/api/twigs.globalPopups.provider:GlobalPopupsProvider).
 *
 *  ### How to use GlobalPopups
 * ```javascript
 * angular.module('awesome.admin')
 *       .controller('UserCtrl', function ($scope, GlobalPopups) {
 *               if(someErrorOccurred){
 *                      GlobalPopups.errorDialog('Error during creation of new User',
 *                      'Error', 'ok');
 *               }
 *        });
 * ```
 *
 * ### Predefined Popups are:
 * These are all preconfigured Popups. You can find a more detailed description on some of the predefined methods further below.
 * * GlobalPopups.infoDialog(String message, String popupTitle, String okButtonText);
 * * GlobalPopups.warningDialog(String message, String popupTitle, String okButtonText);
 * * GlobalPopups.errorDialog(String message, String popupTitle, String okButtonText);
 *
 * * GlobalPopups.yesnoDialog(String message, String popupTitle, String noButtonText, String yesButtonText);
 *      returns a promise, callback is boolean whether the user clicked yes or no
 *
 * * GlobalPopups.fileDialog(String url, String popupTitle, String backButtonText);
 * *     example: GlobalPopups.fileDialog('http://someURL.com/random.pdf', 'PDF Dispaly', 'Back');
 *
 * * GlobalPopups.successToast(String successMessage);
 * * GlobalPopups.warningToast(String warningMessage);
 */

/**
 * @ngdoc function
 * @name twigs.globalPopups.provider:GlobalPopups#successToast
 * @methodOf twigs.globalPopups.provider:GlobalPopups
 *
 * @param {String} successMessage The message displayed as content of the toast.
 */

/**
 * @ngdoc function
 * @name twigs.globalPopups.provider:GlobalPopups#infoDialog
 * @methodOf twigs.globalPopups.provider:GlobalPopups
 *
 * @param {String} message The message displayed as content of the modal.
 * @param {String} popupTitle The title of the Modal.
 * @param {String} okButtonText The text of the ok button in the modal footer.
 */

/**
 * @ngdoc function
 * @name twigs.globalPopups.provider:GlobalPopups#yesnoDialog
 * @methodOf twigs.globalPopups.provider:GlobalPopups
 *
 * @param {String} message The message displayed as content of the modal.
 * @param {String} popupTitle The title of the Modal.
 * @param {String} noButtonText The text of the left button, interpreted as cancel.
 * @param {String} yesButtonText The text of the right button, interpreted as ok or yes.
 * @returns {Promise} Promise resolved with true or false once the user clicks the yes or no button. (yes -> true, no -> false)
 *
 * @example
 * ```javascript
 * angular.module('awesome.admin')
 *       .controller('UserCtrl', function ($scope, GlobalPopups) {
 *              GlobalPopups.yesnoDialog('Realy?', 'Title', 'no', 'yes').then(
 *              function(userClickedYes){
 *               if (userClickedYes) {
 *                   GlobalPopups.successToast('You clicked yes');
 *               } else {
 *                   GlobalPopups.successToast('You clicked no');
 *               }
 *           });
 * ```
 */
angular.module('twigs.globalPopups', ['ui.bootstrap.modal'])

    .provider('GlobalPopups', function GlobalPopupsProvider() {
        var serviceInstance = {};
        this.modals = {};
        this.toasts = {};
        this.fileModals = {};

        this.$get = function ($rootScope, $modal, $timeout, $templateCache, $http, $compile, $document, $sce) {
            var toastStack;

            /**
             * Display Modals using angular bootstrap $modal
             */
            var displayModal = function (modal, messageText, title, primaryButtonText, secondaryButtonText) {
                var modalOptions = modal.options.modalOptions;
                modalOptions.controller = ModalInstanceCtrl;
                modalOptions.resolve = {
                    messageText: function () {
                        return messageText;
                    },
                    title: function () {
                        return title;
                    },
                    primaryButtonText: function () {
                        return primaryButtonText;
                    },
                    secondaryButtonText: function () {
                        return secondaryButtonText;
                    }
                };
                return $modal.open(modalOptions).result;
            };
            /**
             * Display File Modals using angular bootstrap $modal
             * (open url as trusted resource)
             */
            var displayFileModal = function (modal, url, title, backButtonText) {
                var modalOptions = modal.options.modalOptions;
                modalOptions.controller = FileModalInstanceCtrl;
                modalOptions.resolve = {
                    messageText: function () {
                        return $sce.trustAsResourceUrl(url);
                    },
                    title: function () {
                        return title;
                    },
                    backButtonText: function () {
                        return backButtonText;
                    }
                };
                return $modal.open(modalOptions).result;
            };
            /**
             * Controller for angular bootstrap $modals used for basic Modals
             */
            var ModalInstanceCtrl = function ($scope, $modalInstance, messageText, title, primaryButtonText, secondaryButtonText) {
                $scope.message = messageText;
                $scope.title = title;
                $scope.primaryButtonText = primaryButtonText;
                $scope.secondaryButtonText = secondaryButtonText;

                $scope.ok = function () {
                    $modalInstance.close();
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss();
                };
            };
            /**
             * Controller for angular bootstrap $modals used for File Modals
             */
            var FileModalInstanceCtrl = function ($scope, $modalInstance, messageText, title, backButtonText) {
                $scope.message = messageText;
                $scope.title = title;
                $scope.backButtonText = backButtonText;

                $scope.ok = function () {
                    $modalInstance.close();
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss();
                };
            };

            /**
             * Displays a toast template by adding it to the body element in the dom
             */
            toastStack = { };
            var displayToast = function (toast, messageText) {
                getTemplatePromise(toast.options.templateUrl).then(function (content) {
                    var body = $document.find('body');
                    var scope = $rootScope.$new(true);
                    var rootToastElement = $document.find('#twigs-toast');

                    /**
                     * forms a wrapper to put toast templates into
                     */
                    if (rootToastElement.length < 1) {
                        rootToastElement = angular.element('<div id="twigs-toast"></div>');
                        body.append(rootToastElement);
                    }

                    /**
                     * appends the toast template to twigs-toast div
                     */
                    var toastElement = $compile(content)(scope);
                    scope.id = new Date().getTime();
                    toastStack[scope.id] = toastElement;
                    rootToastElement.append(toastElement);

                    /**
                     * The message displayed in the toast
                     */
                    scope.message = messageText;

                    /**
                     * removes the toast template on user click or displayDuration timeout
                     */
                    scope.close = function () {
                        //maybe the user already closed the toast
                        if (angular.isDefined(toastStack[scope.id])) {
                            toastStack[scope.id].remove();
                            delete toastStack[scope.id];
                        }
                    };

                    /**
                     * Removes the toast template after the given displayDuration
                     */
                    if (angular.isDefined(toast.options.displayDuration)) {
                        $timeout(function () {
                            scope.close();
                        }, toast.options.displayDuration);
                    }
                });
            };

            /**
             * loads a html template
             */
            var getTemplatePromise = function (templateUrl) {
                return $http.get(templateUrl, {cache: $templateCache}).then(function (result) {
                    return result.data;
                });
            };

            /**
             * Preparate service instance with a function for each toast and modal
             */
            serviceInstance.displayModal = displayModal;
            serviceInstance.displayToast = displayToast;
            serviceInstance.displayFileModal = displayFileModal;
            return serviceInstance;
        };

        /**
         * @ngdoc function
         * @name twigs.globalPopups.provider:GlobalPopupsProvider#createModal
         * @methodOf twigs.globalPopups.provider:GlobalPopupsProvider
         *
         * @description
         * Defines a Modal.
         *
         * @param {String} messageName The name of this Modal, is later used to display this Modal with GlobalPopups.messageName('my message', 'my title', 'ok');
         * @param {Object} options conatining the options of this Modal.
         * All options of [UI Bootstrap Modals](http://angular-ui.github.io/bootstrap/#/modal) are additionally possible
         * Required properties:
         *    * modalOptions: {
         *           `templateUrl` (required) specifying the location of the html template for this popup.
         *      }
         *
         * Example:
         * ```javascript
         * GlobalPopupsProvider.createModal('infoDialog',{
         *      modalOptions: {
         *          templateUrl: 'templates/infoModal.html',
         *          windowClass:'modal-info',
         *          backdrop: false,
         *          keyboard: true
         *      }
         * });
         * ```
         */
        this.createModal = function (messageName, options) {
            if (angular.isUndefined(options.modalOptions) || angular.isUndefined(options.modalOptions.templateUrl)) {
                throw "createModal requires at least modalOptions.templateUrl to be defined";
            }

            var modal = {
                name: messageName,
                options: options
            };
            serviceInstance[messageName] = function (messageText, title, primaryButtonText, secondaryButtonText) {
                if (angular.isUndefined(messageText)) {
                    throw "GlobalPupupService." + messageName + " must be called with a message";
                }
                return serviceInstance.displayModal(modal, messageText, title, primaryButtonText, secondaryButtonText);
            };
        };
        /**
         * @ngdoc function
         * @name twigs.globalPopups.provider:GlobalPopupsProvider#createToast
         * @methodOf twigs.globalPopups.provider:GlobalPopupsProvider
         *
         * @description
         * Defines a Toast.
         *
         * @param {String} messageName The name of this Toast, is later used to display this Modal with GlobalPopups.messageName('user saved successfully');
         * @param {Object} options conatining the options of this Modal. Required property is 'templateUrl' specifying the location of the html template for this popup.
         * All options of [UI Bootstrap Modals](http://angular-ui.github.io/bootstrap/#/modal) are additionally possible
         * Required properties:
         *    * `templateUrl` (required) specifying the location of the html template for this popup.
         *    * `splayDuration` (optional) specifying the timeout in miliseconds until the toast is hidden again. If left empty, the modal does not disappear automatically
         *
         * Example:
         * ```javascript
         * GlobalPopupsProvider.createToast('warningToast',{
         *      templateUrl: 'templates/warningToast.html',
         *      displayDuration: 5000
         * });
         * ```
         */
        this.createToast = function (messageName, options) {
            if (angular.isUndefined(options.templateUrl)) {
                throw "createToast requires templateUrl to be defined";
            }

            var toast = {
                name: messageName,
                options: options
            };
            serviceInstance[messageName] = function (messageText) {
                if (angular.isUndefined(messageText)) {
                    throw "GlobalPupupService." + messageName + " must be called with a message";
                }
                serviceInstance.displayToast(toast, messageText);
            };
        };
        /**
         * @ngdoc function
         * @name twigs.globalPopups.provider:GlobalPopupsProvider#createFileModal
         * @methodOf twigs.globalPopups.provider:GlobalPopupsProvider
         *
         * @description
         * Defines a File Modal. Can be used to display files directly in the browser, i.e. PDF.
         * The Browsers file display is used.
         *
         * @param {String} messageName The name of this Modal, is later used to display this Modal with GlobalPopups.messageName('http://myurl.com', 'title', 'back');
         * @param {Object} options conatining the options of this Modal.
         * All options of [UI Bootstrap Modals](http://angular-ui.github.io/bootstrap/#/modal) are additionally possible
         * Required properties:
         *    * modalOptions: {
         *           `templateUrl` (required) specifying the location of the html template for this popup.
         *      }
         *
         * Example:
         * ```javascript
         * GlobalPopupsProvider.createFileModal('fileDialog',{
         *      modalOptions: {
         *          templateUrl: 'templates/fileModal.html',
         *          windowClass:'modal-file',
         *          keyboard: true
         *      }
         * });
         * ```
         */
        this.createFileModal = function (messageName, options) {
            if (angular.isUndefined(options.modalOptions) || angular.isUndefined(options.modalOptions.templateUrl)) {
                throw "createFileModal requires at least modalOptions.templateUrl to be defined";
            }

            var fileModal = {
                name: messageName,
                options: options
            };
            serviceInstance[messageName] = function (url, title, backButtonText) {
                if (angular.isUndefined(url)) {
                    throw "GlobalPopupService." + messageName + " must be called with a valid url";
                }
                serviceInstance.displayFileModal(fileModal, url, title, backButtonText);
            };
        };
    })

/**
 * Default modals and toasts. Can be used without further configuration or can be overridden or supplemented with own configuration.
 */
    .config(function (GlobalPopupsProvider) {
        GlobalPopupsProvider.createToast('successToast', {
            templateUrl: 'templates/successToast.html',
            displayDuration: 7000
        });
        GlobalPopupsProvider.createToast('warningToast', {
            templateUrl: 'templates/warningToast.html',
            displayDuration: 7000
        });
        GlobalPopupsProvider.createModal('infoDialog', {
            modalOptions: {
                templateUrl: 'templates/infoModal.html',
                windowClass: 'modal-info',
                backdrop: false,
                keyboard: true
            }
        });
        GlobalPopupsProvider.createModal('yesnoDialog', {
            modalOptions: {
                templateUrl: 'templates/yesnoModal.html',
                windowClass: 'modal-yesno',
                backdrop: 'static',
                keyboard: false
            }
        });
        GlobalPopupsProvider.createFileModal('fileDialog', {
            modalOptions: {
                templateUrl: 'templates/fileModal.html',
                windowClass: 'modal-file',
                keyboard: true
            }
        });
        GlobalPopupsProvider.createModal('errorDialog', {
            modalOptions: {
                templateUrl: 'templates/errorModal.html',
                windowClass: 'modal-error',
                backdrop: 'static',
                keyboard: false
            }
        });
        GlobalPopupsProvider.createModal('warningDialog', {
            modalOptions: {
                templateUrl: 'templates/warningModal.html',
                windowClass: 'modal-warning',
                keyboard: true
            }
        });
    });