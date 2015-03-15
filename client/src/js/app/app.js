/* jshint node: true */
'use strict';

var angular   = require('angular');
var ngRouter  = require('angular-ui-router');

var app = angular.module('app', [ngRouter]);

app.controller('AppCtrl', [
  '$scope',
  function($scope) {

  }
]);

app.directive('dirNav', [
  function() {
    return {
      restrict: 'E',
      scope: {},
      replace: true,
      templateUrl: 'dir.nav.html'
    };
  }
]);

app.config([
  '$stateProvider', '$urlRouterProvider', '$locationProvider',
  function($stateProvider, $urlRouterProvider, $locationProvider) {
    $locationProvider.html5Mode(true);

    $stateProvider
      .state('root', {
        url: null,
        templateUrl: 'view.root.html'
      })
      .state('root.home', {
        url: '/',
        templateUrl: 'view.home.html'
      })
      .state('root.blog', {
        url: '/blog',
        templateUrl: 'view.blog.html'
      })
      .state('root.projects', {
        url: '/projects',
        templateUrl: 'view.projects.html'
      })
      .state('root.about', {
        url: '/about',
        templateUrl: 'view.about.html'
      })
      .state('root.404', {
        templateUrl: 'view.404.html'
      })
    ;

    //$urlRouterProvider.when('', '/');
    $urlRouterProvider.otherwise(function($injector, $location) {
      $injector.invoke(['$state', function($state) {
        $state.go('root.404');
      }]);
    });
  }
]);
