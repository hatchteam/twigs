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

describe('Service & Provider: GlobalPopups', function () {

    var GlobalPopupsProvider, GlobalPopups;

    beforeEach(function () {
        // Initialize the service provider by injecting it to a fake module's config block
        var fakeModule = angular.module('testApp', function () {
        });

        fakeModule.config(function (_GlobalPopupsProvider_) {
            GlobalPopupsProvider = _GlobalPopupsProvider_;
        });
        // Initialize ht.flow module injector
        angular.mock.module('twigs.globalPopups', 'testApp');
    });

    describe('GlobalPopups Provider', function (){
        var capturedModalOptions;

        /**
         * Inject GlobalPopups Service
         */
        beforeEach(inject(function (_GlobalPopups_){
            GlobalPopups = _GlobalPopups_;
        }));

        it('allows to register new dialog configs', function () {
            expect(GlobalPopupsProvider).toBeDefined();

            GlobalPopupsProvider.createToast('successToast',{
                templateUrl: 'views/globalMsg/successToast.html',
                displayDuration: 7000
            });
            GlobalPopupsProvider.createModal('infoDialog',{
                modalOptions: {
                    templateUrl: 'views/globalMsg/infoModal.html',
                    backdrop: false,
                    keyboard: true
                }
            });
            GlobalPopupsProvider.createFileModal('fileDialog',{
                modalOptions: {
                    templateUrl: 'views/globalMsg/fileModal.html',
                    keyboard: true
                }
            });

            expect(GlobalPopups.successToast).toBeDefined();
            expect(GlobalPopups.infoDialog).toBeDefined();
            expect(GlobalPopups.fileDialog).toBeDefined();
        });

        it('throws errors if required config parameters are missing', function () {
            expect(GlobalPopupsProvider).toBeDefined();

            function crateToast(){
                GlobalPopupsProvider.createToast('successToast',{
                    //missing templateUrl
                    displayDuration: 7000
                });
            }
            function createModal(){
                GlobalPopupsProvider.createModal('infoDialog',{
                    modalOptions: {
                        //missing templateUrl
                        backdrop: false,
                        keyboard: true
                    }
                });
            }
            function createFileModal(){
                GlobalPopupsProvider.createFileModal('fileDialog',{
                    modalOptions: {
                        //missing templateUrl
                        keyboard: true
                    }
                });
            }
            expect(crateToast).toThrow();
            expect(createModal).toThrow();
            expect(createFileModal).toThrow();

            expect(GlobalPopups.successToast).toBeUndefined();
            expect(GlobalPopups.infoDialog).toBeUndefined();
            expect(GlobalPopups.fileDialog).toBeUndefined();
        });
    });

    describe('GlobalPopups Modal', function (){
        var $modal, capturedModalOptions;

        /**
         * mock $modal
         */
        beforeEach(function (){
            $modal = {
                open : function(modalOptions){
                    capturedModalOptions=modalOptions;
                    return {result: function(){
                    }};
                }
            }
            module(function ($provide) {
                $provide.value('$modal', $modal);
            });
        });
        /**
         * Inject GlobalPopups Service
         */
        beforeEach(inject(function (_GlobalPopups_){
            GlobalPopups = _GlobalPopups_;
        }));

        it('should display modal', function () {
            expect(GlobalPopupsProvider).toBeDefined();

            GlobalPopupsProvider.createModal('infoDialog',{
                modalOptions: {
                    templateUrl: 'views/globalMsg/infoModal.html',
                    backdrop: false,
                    keyboard: true
                }
            });
            spyOn($modal, 'open').andCallThrough();

            expect(GlobalPopups.infoDialog).toBeDefined();
            GlobalPopups.infoDialog('my info message');

            expect($modal.open).toHaveBeenCalled();
            expect(capturedModalOptions.templateUrl).toBe('views/globalMsg/infoModal.html');
            expect(capturedModalOptions.backdrop).toBeFalsy();
            expect(capturedModalOptions.keyboard).toBeTruthy();
        });
    });

    describe('GlobalPopups Toast', function () {
        var document, $httpBackend;

        /**
         * Inject GlobalPopups Service and mock dependencies
         */
        beforeEach(inject(function (_GlobalPopups_, _$document_, _$httpBackend_){
            GlobalPopups = _GlobalPopups_;
            document = _$document_;
            $httpBackend = _$httpBackend_;
        }));

        it('should display toast', function () {
            expect(GlobalPopupsProvider).toBeDefined();

            GlobalPopupsProvider.createToast('successToast',{
                templateUrl: 'views/globalMsg/successToast.html',
                displayDuration: 7000
            });

            $httpBackend.expectGET('views/globalMsg/successToast.html').respond('<div>my special content</div>');

            expect(GlobalPopups.successToast).toBeDefined();
            GlobalPopups.successToast('my success message');

            $httpBackend.flush();

            expect(document.find('body').html()).toContain('<div class="twigs-toast ng-scope"><div>my special content</div></div>');
        });
    });
});
