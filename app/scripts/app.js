'use strict';


  angular.module('yeomanAngularRestuarantApp', ['ui.router'])
  .config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/tables');
    $stateProvider
      .state('tables', {
        url: '/tables',
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .state('tables.table',{
        url: '/:table_id', 
        templateUrl: 'views/table.html',
        controller: 'TableCtrl'
      });
  });




