"use strict";

angular.module('twigs.globalPopups', ['ui.bootstrap.modal'])

.provider('GlobalPopups',function GlobalPopupsProvider(){
        this.modals = {};
        this.toasts = {};
        this.fileModals = {};

        this.$get = function ($rootScope, $modal, $timeout, $templateCache, $http, $compile, $document, $sce) {
            var modals = this.modals;
            var toasts = this.toasts;
            var fileModals = this.fileModals;

            var ModalInstanceCtrl = function ($scope, $modalInstance, messageText, title) {
                $scope.message=messageText;
                $scope.title=title;

                $scope.ok = function () {
                    $modalInstance.close();
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss();
                };
            };

            var displayModal = function(modal, messageText, title){
                var modalOptions = modal.options.modalOptions;
                modalOptions.controller = ModalInstanceCtrl;
                modalOptions.resolve = {
                    messageText: function () {
                        return messageText;
                    },
                    title: function () {
                        return title;
                    }
                };
                return $modal.open(modalOptions).result;
            };

            var displayFileModal = function(modal, url, title){
                var modalOptions = modal.options.modalOptions;
                modalOptions.controller = ModalInstanceCtrl;
                modalOptions.resolve = {
                    messageText: function () {
                        return $sce.trustAsResourceUrl(url);
                    },
                    title: function () {
                        return title;
                    }
                };
                return $modal.open(modalOptions).result;
            };

            var getTemplatePromise = function(templateUrl) {
                return $http.get(templateUrl, {cache: $templateCache}).then(function (result) {
                    return result.data;
                });
            };

            var toastStack = [];

            var displayToast = function(toast, messageText){
               getTemplatePromise(toast.options.templateUrl).then(function(content){
                   var angularDomEl = angular.element('<div class="twigs-toast"></div>');
                   angularDomEl.html(content);
                   var scope = $rootScope.$new(true);
                   scope.message = messageText;
                   var modalDomEl = $compile(angularDomEl)(scope);

                   var body = $document.find('body');

                   if(toastStack.length === 0){
                       body.append(modalDomEl);
                   }else{
                       toastStack[toastStack.length-1].remove();
                       body.append(modalDomEl);
                   }
                   toastStack.push(modalDomEl);

                   scope.close = function(){
                       if(toastStack.length === 1){
                           toastStack.pop().remove();
                       }else{
                           toastStack.pop().remove();
                           var nextToast = toastStack[toastStack.length-1];
                           body.append(nextToast);
                       }
                   };

                   $timeout(function(){
                       return scope.close();
                   }, toast.options.displayDuration);
               });
            };

            /**
             * Preparate service instance with a function for each toast and modal
             */
            var serviceInstance = {};
            angular.forEach(modals, function(modal){
                serviceInstance[modal.name] = function(messageText, title){
                    return displayModal(modal, messageText, title);
                };
            });
            angular.forEach(toasts, function(toast){
                serviceInstance[toast.name] = function(messageText){
                    displayToast(toast, messageText);
                };
            });
            angular.forEach(fileModals, function(fileModal){
                serviceInstance[fileModal.name] = function(messageText){
                    displayFileModal(fileModal, messageText);
                };
            });
            return serviceInstance;
        };

        this.createModal = function (messageName, options) {
            this.modals[messageName]={
                name:messageName,
                options:options
            };
        };
        this.createToast = function (messageName, options) {
            this.toasts[messageName]={
                name:messageName,
                options:options
            };
        };
        this.createFileModal = function (messageName, options) {
            this.fileModals[messageName]={
                name:messageName,
                options:options
            };
        };
    });


