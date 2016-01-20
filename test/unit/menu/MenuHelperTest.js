'use strict';

describe('MenuHelper', function () {

  var MenuProvider, MenuHelper;

  beforeEach(function () {
    // Initialize the service provider by injecting it to a fake module's config block
    var fakeModule = angular.module('testApp', []);

    fakeModule.config(function (_MenuProvider_) {
      MenuProvider = _MenuProvider_;
    });

    angular.mock.module('twigs.menu', 'testApp');

  });

  beforeEach(inject(function (_MenuHelper_) {
    MenuHelper = _MenuHelper_;
  }));

  it('should setActiveMenuEntryRecursively', function () {
    var tabMenu = MenuProvider.createMenu('secondaryNavigation', 'views/menu/secondaryNavigation.html');
    tabMenu.createSubMenu('secondaryNavigation_dataImport')
      .addItem('secondaryNavigation_dataImport_claim', {
        link: '/import/claim',
        iconClass: 'glyphicon glyphicon-file'
      })
      .addItem('secondaryNavigation_dataImport_damage', {
        link: '/import/damage',
        iconClass: 'glyphicon glyphicon-file'
      });

    MenuHelper.setActiveMenuEntryRecursively('/import/claim', tabMenu);

    expect(tabMenu.active).toBeTruthy();
    expect(tabMenu.items[0].active).toBeTruthy();
    expect(tabMenu.items[0].items[0].active).toBeTruthy();

    expect(tabMenu.items[0].items[1].active).toBeFalsy();
  });

  it('should setActiveMenuEntryRecursively root item', function () {
    var tabMenu = MenuProvider.createMenu('secondaryNavigation', 'views/menu/secondaryNavigation.html');
    tabMenu.createSubMenu('secondaryNavigation_dataImport', {link: '/import'})
      .addItem('secondaryNavigation_dataImport_claim', {
        link: '/import/claim',
        iconClass: 'glyphicon glyphicon-file'
      })
      .addItem('secondaryNavigation_dataImport_damage', {
        link: '/import/damage',
        iconClass: 'glyphicon glyphicon-file'
      });

    MenuHelper.setActiveMenuEntryRecursively('/import', tabMenu);
    expect(tabMenu.active).toBeTruthy();
    expect(tabMenu.items[0].active).toBeTruthy();

    expect(tabMenu.items[0].items[1].active).toBeFalsy();
    expect(tabMenu.items[0].items[0].active).toBeFalsy();
  });

  it('should setActiveMenuEntryRecursively nested page', function () {
    var tabMenu = MenuProvider.createMenu('secondaryNavigation', 'views/menu/secondaryNavigation.html');
    tabMenu.createSubMenu('secondaryNavigation_dataImport', {link: '/import'})
      .addItem('secondaryNavigation_dataImport_claim', {
        link: '/import/claim',
        iconClass: 'glyphicon glyphicon-file',
        activeRoute: '/import/claim/.*'
      })
      .addItem('secondaryNavigation_dataImport_damage', {
        link: '/import/damage',
        iconClass: 'glyphicon glyphicon-file'
      });

    MenuHelper.setActiveMenuEntryRecursively('/import/claim/new', tabMenu);
    expect(tabMenu.active).toBeTruthy();
    expect(tabMenu.items[0].active).toBeTruthy();

    expect(tabMenu.items[0].items[0].active).toBeTruthy();
    expect(tabMenu.items[0].items[1].active).toBeFalsy();
  });
});
