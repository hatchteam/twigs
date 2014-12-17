'use strict';


angular.module('twigsDemo')
  .config(function (MenuProvider) {


    var mainMenu = MenuProvider.createMenu('main_menu', 'views/menuTemplate.html')
      .addItem('main_menu_home', {
        text: 'Home',
        link: '/home'
      });

    var modulesMenu = mainMenu.createSubMenu('main_menu_modules',
      {
        link: '/modules',
        text: 'Modules'
      });

    modulesMenu.addItem('main_menu_modules_hotkeys', {
      link: '/modules/hotkeys',
      text: 'Hotkeys'
    });
    modulesMenu.addItem('main_menu_modules_sortable', {
      link: '/modules/sortable',
      text: 'Sortable'
    });
    modulesMenu.addItem('main_menu_modules_flow', {
      link: '/modules/flow',
      text: 'Flow'
    });


  });
