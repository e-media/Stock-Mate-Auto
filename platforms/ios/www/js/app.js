// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', [
  'ionic',
  'ngCordova',
  'ionic.service.core',
  'ionic.service.push',
  'ionic.service.deploy',
  'starter.controllers'
])

.config(['$ionicAppProvider', function($ionicAppProvider) {
  // Identify app
  $ionicAppProvider.identify({
    // The App ID (from apps.ionic.io) for the server
    app_id: '16fb291d',
    // The public API key all services will use for this app
    api_key: '32dd6d4e9c02d2bbce9a802a05c869627b32b3f1a7698461',
    // Set the app to use development pushes
    dev_push: true,
    // The GCM project ID (project number) from your Google Developer Console (un-comment if used)
      // The GCM project number
      gcm_id: '121825763029' //api key  AIzaSyAZInLm9_bv7NvwoUVRwxS2FA8wzrWiKds
  });
}])

.run(function($rootScope, $ionicDeploy, $ionicPlatform, $cordovaStatusbar) {

  $ionicPlatform.ready(function() {

    // Hide the accessory bar by default
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }

    // Color the iOS status bar text to white
    if (window.StatusBar) {
      $cordovaStatusbar.overlaysWebView(true);
      $cordovaStatusBar.style(1); //Light
    }

    // Default update checking
    $rootScope.updateOptions = {
      interval: 2 * 60 * 1000
    };

    // Watch Ionic Deploy service for new code
    $ionicDeploy.watch($rootScope.updateOptions).then(function() {}, function() {}, function(hasUpdate) {
      $rootScope.lastChecked = new Date();
      console.log('WATCH RESULT', hasUpdate);
    });
  });
})

.config(function ( $httpProvider) {
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
}).factory('featuresData', function ($http) {
    return{
        doCrossDomainGet: function() {
            return $http({
                url:'http://www.stockmateauto.co.za',
                method: 'GET'
            })
        }
    }
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: "/tab",
    abstract: true,
    templateUrl: "templates/tabs.html"
  })
  // Each tab has its own nav history stack:
  // Welcome tab
  .state('tab.home', {
    url: '/home',
    views: {
      'tab-home': {
        templateUrl: 'templates/tab-home.html',
        controller: 'HomeCtrl'
      }
    }
  })

  .state('tab.login', {
      url: '/login',
      views: {
          'tab-home': {
              templateUrl: 'templates/tab-login.html',
              controller: 'LoginController'
          }
      }
  })


  .state('tab.vehicle', {
      url: '/vehicle',
      views: {
          'tab-home': {
              templateUrl: 'templates/vehicle-view.html',
              controller: 'HomeCtrl'
          }
      }
  })
  // Ionic User tab
  .state('tab.user', {
    cache: false,
    url: '/user',
    views: {
      'tab-user': {
        templateUrl: 'templates/tab-user.html',
        controller: 'UserCtrl'
      }
    }
  })
  .state('tab.useradd', {
      cache: false,
      url: '/useradd',
      views: {
          'tab-user': {
              templateUrl: 'templates/tab-useradd.html',
              controller: 'UserCtrl'
          }
      }
  })
  // Ionic Add Vehicle tab
  .state('tab.add-vehicle', {
    url: '/add-vehicle',
    views: {
      'tab-add-vehicle': {
        templateUrl: 'templates/tab-add-vehicle.html',
        controller: 'AddVehicleCtrl'
      }
    }
  })
  // Ionic Deploy tab
  .state('tab.deploy', {
    url: '/deploy',
    views: {
      'tab-deploy': {
        templateUrl: 'templates/tab-deploy.html',
        controller: 'DeployCtrl'
      }
    }
  })
  // Ionic Analytics tab
  .state('tab.analytics', {
    url: '/analytics',
    views: {
      'tab-analytics': {
        templateUrl: 'templates/tab-analytics.html',
        controller: 'AnalyticsCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/home');

})

.config(function($compileProvider){
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|blob|tel):|data:image\//);
});
