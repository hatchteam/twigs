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

  describe('GlobalPopups Provider', function () {
    var capturedModalOptions;

    /**
     * Inject GlobalPopups Service
     */
    beforeEach(inject(function (_GlobalPopups_) {
      GlobalPopups = _GlobalPopups_;
    }));

    it('allows to register new dialog configs', function () {
      expect(GlobalPopupsProvider).toBeDefined();

      GlobalPopupsProvider.createToast('successToast', {
        templateUrl: 'views/globalMsg/successToast.html',
        displayDuration: 7000
      });
      GlobalPopupsProvider.createModal('infoDialog', {
        modalOptions: {
          templateUrl: 'views/globalMsg/infoModal.html',
          backdrop: false,
          keyboard: true
        }
      });
      GlobalPopupsProvider.createFileModal('fileDialog', {
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

      function crateToast() {
        GlobalPopupsProvider.createToast('mySuccessToast', {
          //missing templateUrl
          displayDuration: 7000
        });
      }

      function createModal() {
        GlobalPopupsProvider.createModal('myInfoDialog', {
          modalOptions: {
            //missing templateUrl
            backdrop: false,
            keyboard: true
          }
        });
      }

      function createFileModal() {
        GlobalPopupsProvider.createFileModal('myFileDialog', {
          modalOptions: {
            //missing templateUrl
            keyboard: true
          }
        });
      }

      expect(crateToast).toThrow();
      expect(createModal).toThrow();
      expect(createFileModal).toThrow();

      expect(GlobalPopups.mySuccessToast).toBeUndefined();
      expect(GlobalPopups.myInfoDialog).toBeUndefined();
      expect(GlobalPopups.myFileDialog).toBeUndefined();
    });

    it('should throw errors on missing call params', function () {
      expect(GlobalPopupsProvider).toBeDefined();

      GlobalPopupsProvider.createToast('successToast', {
        templateUrl: 'views/globalMsg/successToast.html',
        displayDuration: 7000
      });
      GlobalPopupsProvider.createModal('infoDialog', {
        modalOptions: {
          templateUrl: 'views/globalMsg/infoModal.html',
          backdrop: false,
          keyboard: true
        }
      });
      GlobalPopupsProvider.createFileModal('fileDialog', {
        modalOptions: {
          templateUrl: 'views/globalMsg/fileModal.html',
          keyboard: true
        }
      });

      function openSuccessToast() {
        GlobalPopups.successToast();
      }

      function openInfoDialog() {
        GlobalPopups.infoDialog();
      }

      expect(openSuccessToast).toThrow();
      expect(openInfoDialog).toThrow();
      GlobalPopups.fileDialog('my info message');
    });
  });

  describe('GlobalPopups Modal', function () {
    var $modal, capturedModalOptions;

    /**
     * mock $modal
     */
    beforeEach(function () {
      $modal = {
        open: function (modalOptions) {
          capturedModalOptions = modalOptions;
          return {
            result: function () {
            }
          };
        }
      };
      module(function ($provide) {
        $provide.value('$modal', $modal);
      });
    });
    /**
     * Inject GlobalPopups Service
     */
    beforeEach(inject(function (_GlobalPopups_) {
      GlobalPopups = _GlobalPopups_;
    }));

    it('should open info modal', function () {
      expect(GlobalPopupsProvider).toBeDefined();

      GlobalPopupsProvider.createModal('infoDialog', {
        modalOptions: {
          templateUrl: 'views/globalMsg/infoModal.html',
          backdrop: false,
          keyboard: true
        }
      });
      spyOn($modal, 'open').and.callThrough();

      expect(GlobalPopups.infoDialog).toBeDefined();
      GlobalPopups.infoDialog('my info message');

      expect($modal.open).toHaveBeenCalled();
      expect(capturedModalOptions.templateUrl).toBe('views/globalMsg/infoModal.html');
      expect(capturedModalOptions.backdrop).toBeFalsy();
      expect(capturedModalOptions.keyboard).toBeTruthy();
    });

    it('should open file modal', function () {
      expect(GlobalPopupsProvider).toBeDefined();

      GlobalPopupsProvider.createFileModal('fileModal', {
        modalOptions: {
          templateUrl: 'views/globalMsg/fileModal.html',
          keyboard: true
        }
      });
      spyOn($modal, 'open').and.callThrough();

      expect(GlobalPopups.fileModal).toBeDefined();
      GlobalPopups.fileModal("http://www.mathworks.com/moler/random.pdf", "This is a title!");

      expect($modal.open).toHaveBeenCalled();
      expect(capturedModalOptions.templateUrl).toBe('views/globalMsg/fileModal.html');
      expect(capturedModalOptions.backdrop).toBeFalsy();
      expect(capturedModalOptions.keyboard).toBeTruthy();
    });

    it('should return modal instance', function () {
      expect(GlobalPopupsProvider).toBeDefined();

      var modal = GlobalPopupsProvider.createModal('infoDialog', {
        modalOptions: {
          templateUrl: 'views/globalMsg/infoModal.html',
          backdrop: false,
          keyboard: true
        }
      });
      var modal = GlobalPopups.infoDialog('my info message');
      expect(modal).toBeDefined();
    });
  });

  describe('GlobalPopups Toast', function () {
    var document, $httpBackend, $timeout;

    /**
     * Inject GlobalPopups Service and mock dependencies
     */
    beforeEach(inject(function (_GlobalPopups_, _$document_, _$httpBackend_, _$timeout_) {
      GlobalPopups = _GlobalPopups_;
      document = _$document_;
      $httpBackend = _$httpBackend_;
      $timeout = _$timeout_;

      $httpBackend.whenGET('views/globalMsg/successToast.html').respond('<div>my success content</div>');
      $httpBackend.whenGET('views/globalMsg/warningToast.html').respond('<div>my warning content</div>');
    }));

    it('should display toast and remove after timeout', function () {
      expect(GlobalPopupsProvider).toBeDefined();

      GlobalPopupsProvider.createToast('successToast', {
        templateUrl: 'views/globalMsg/successToast.html',
        displayDuration: 7000
      });

      $httpBackend.resetExpectations();

      expect(GlobalPopups.successToast).toBeDefined();
      GlobalPopups.successToast('my success message');

      $httpBackend.flush();

      expect(document.find('body').html()).toContain('<div id="twigs-toast"><div class="ng-scope">my success content</div></div>');

      $timeout.flush();

      expect(document.find('body').html()).not.toContain('<div id="twigs-toast"><div class="ng-scope">my success content</div></div>');
    });

    it('should stack toasts', function () {
      expect(GlobalPopupsProvider).toBeDefined();

      GlobalPopupsProvider.createToast('successToast', {
        templateUrl: 'views/globalMsg/successToast.html',
        displayDuration: 8000
      });
      GlobalPopupsProvider.createToast('warningToast', {
        templateUrl: 'views/globalMsg/warningToast.html',
        displayDuration: 5000
      });

      $httpBackend.resetExpectations();

      expect(GlobalPopups.successToast).toBeDefined();
      GlobalPopups.successToast('my success message');
      GlobalPopups.warningToast('my warning message');
      $httpBackend.flush();

      expect(document.find('body').html()).toContain('<div class="ng-scope">my success content</div>');
      expect(document.find('body').html()).toContain('<div class="ng-scope">my warning content</div>');

      $timeout.flush(6000);

      expect(document.find('body').html()).not.toContain('<div class="ng-scope">my warning content</div>');
      expect(document.find('body').html()).toContain('<div class="ng-scope">my success content</div>');
    });
  });
});
