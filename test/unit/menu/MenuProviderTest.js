'use strict';

describe('MenuProvider', function () {

  var MenuProvider;

  beforeEach(function () {
    // Initialize the service provider by injecting it to a fake module's config block
    var fakeModule = angular.module('testApp', function () {
    });

    fakeModule.config(function (_MenuProvider_) {
      MenuProvider = _MenuProvider_;
    });

    angular.mock.module('twigs.menu', 'testApp');

    // Kickstart the injectors previously registered with calls to angular.mock.module
    inject(function () {
    });
  });

  it('allows to register new main menu', function () {
    expect(MenuProvider).toBeDefined();

    var mainMenu = MenuProvider.createMenu('main_menu', "views/menu/mainMenuTemplate.html")
      .addItem('main_menu_refdata', {
        link: '/refdata/users',
        text: 'Reference Data',
        iconClass: 'glyphicon glyphicon-person'
      })
      .addItem('main_menu_logout', {
        link: '/dologout',
        text: 'Logout',
        iconClass: 'glyphicon glyphicon-logout'
      });

    expect(mainMenu).toBeDefined();
    expect(mainMenu.name).toBe('main_menu');
    expect(mainMenu.templateUrl).toBe('views/menu/mainMenuTemplate.html');
    expect(mainMenu.items.length).toBe(2);

    expect(mainMenu.items[0].name).toBe('main_menu_refdata');
    expect(mainMenu.items[0].text).toBe('Reference Data');
    expect(mainMenu.items[0].link).toBe('/refdata/users');
    expect(mainMenu.items[0].options.iconClass).toBe('glyphicon glyphicon-person');
    expect(mainMenu.items[0].items.length).toBe(0);

    expect(mainMenu.items[1].name).toBe('main_menu_logout');
    expect(mainMenu.items[1].text).toBe('Logout');
    expect(mainMenu.items[1].link).toBe('/dologout');
    expect(mainMenu.items[1].options.iconClass).toBe('glyphicon glyphicon-logout');
    expect(mainMenu.items[1].items.length).toBe(0);
  });

  describe('#getMenuItemInMenu', function () {

    it('should find item on top level', function () {
      MenuProvider.createMenu('main_menu', "views/menu/mainMenuTemplate.html")
        .addItem('main_menu_refdata', {
          link: '/refdata/users',
          text: 'Reference Data',
          iconClass: 'glyphicon glyphicon-person'
        })
        .addItem('main_menu_logout', {
          link: '/dologout',
          text: 'Logout',
          iconClass: 'glyphicon glyphicon-logout'
        });

      var item = MenuProvider.getMenuItemInMenu('main_menu', 'main_menu_logout');
      expect(item).toBeDefined();
      expect(item.name).toBe('main_menu_logout');
    });

    it('should find nested item', function () {
      MenuProvider.createMenu('main_menu', "views/menu/mainMenuTemplate.html")
        .addItem('main_menu_refdata', {
          link: '/refdata/users',
          text: 'Reference Data',
          iconClass: 'glyphicon glyphicon-person'
        })
        .createSubMenu('main_menu_settings', {
          link: '/settings',
          text: 'Settings',
          iconClass: 'glyphicon glyphicon-logout'
        })
        .addItem('main_menu_settings_users', {
          link: '/settings/users',
          text: 'Users',
          iconClass: 'glyphicon glyphicon-person'
        })
        .addItem('main_menu_settings_roles', {
          link: '/settings/roles',
          text: 'Roles',
          iconClass: 'glyphicon glyphicon-person'
        });

      var item = MenuProvider.getMenuItemInMenu('main_menu', 'main_menu_settings_users');
      expect(item).toBeDefined();
      expect(item.name).toBe('main_menu_settings_users');
    });

    it('should return first result and break', function () {
      MenuProvider.createMenu('main_menu', "views/menu/mainMenuTemplate.html")
        .addItem('main_menu_refdata', {
          link: '/refdata/users',
          text: 'Reference Data',
          iconClass: 'glyphicon glyphicon-person'
        })
        .createSubMenu('main_menu_settings', {
          link: '/settings',
          text: 'Settings',
          iconClass: 'glyphicon glyphicon-logout'
        })
        .addItem('main_menu_settings_users', {
          link: '/settings/usersFirst',
          text: 'Users First',
          iconClass: 'glyphicon glyphicon-person'
        })
        .addItem('main_menu_settings_users', {
          link: '/settings/usersSecond',
          text: 'Users Second',
          iconClass: 'glyphicon glyphicon-person'
        });

      var item = MenuProvider.getMenuItemInMenu('main_menu', 'main_menu_settings_users');
      expect(item).toBeDefined();
      expect(item.name).toBe('main_menu_settings_users');
      expect(item.text).toBe('Users First');
    });

    it('should return undefined if menuName does not exist', function () {
      MenuProvider.createMenu('main_menu', "views/menu/mainMenuTemplate.html")
        .addItem('main_menu_refdata', {
          link: '/refdata/users',
          text: 'Reference Data',
          iconClass: 'glyphicon glyphicon-person'
        })
        .addItem('main_menu_logout', {
          link: '/dologout',
          text: 'Logout',
          iconClass: 'glyphicon glyphicon-logout'
        });

      var item = MenuProvider.getMenuItemInMenu('not_existent', 'main_menu_refdata');
      expect(item).toBeUndefined();
    });

    it('should return undefined if menuItem does not exist', function () {
      MenuProvider.createMenu('main_menu', "views/menu/mainMenuTemplate.html")
        .addItem('main_menu_refdata', {
          link: '/refdata/users',
          text: 'Reference Data',
          iconClass: 'glyphicon glyphicon-person'
        })
        .addItem('main_menu_logout', {
          link: '/dologout',
          text: 'Logout',
          iconClass: 'glyphicon glyphicon-logout'
        });

      var item = MenuProvider.getMenuItemInMenu('main_menu', 'not_existent');
      expect(item).toBeUndefined();
    });
  });
});
