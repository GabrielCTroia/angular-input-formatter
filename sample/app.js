'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'InputFormatter'
])
    .controller('myFormCtrl', ['$scope', function ($scope) {
      $scope.user = {};
    }])
    .config(['$routeProvider', function ($routeProvider) {
      $routeProvider.otherwise({redirectTo: '/view1'});
    }]);