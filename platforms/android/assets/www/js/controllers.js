angular.module('starter.controllers', ['ionic', 'ui.router', 'ngCordova']) //['ngResource'], ['ngBootstrap']

.controller('TabsCtrl', function($scope, $rootScope, $state) {
    $rootScope.$on('$ionicView.beforeEnter', function() {
        //alert($state.current.name);
        $rootScope.hideTabs = false;

        if ($state.current.name === 'tab.login') {
            //alert($state.current.name);
            $rootScope.hideTabs = true;
        }
    });
})

.controller('LoginController', function($scope, $state, $location, $ionicHistory, $http, UserService) {
        $scope.login = function(username, password) {
            window.localStorage.setItem("username", username);
            window.localStorage.setItem("password", password);
            $ionicHistory.nextViewOptions({
                disableAnimate: true,
                disableBack: true
            });

            doLogin(username, password);
        }

        function doLogin(username, password){

            $http.get('http://www.stockmateauto.co.za/v1/api_v1/v1/api/users/userAuth/'+username+'/'+password)
                .success(function (res){

                    var resuserId = res.split("/",1);
                    var resuserRole = res.split("/",2);

                    UserService.user_id = resuserId;
                    UserService.role = resuserRole[1];

                    if(UserService.user_id > 0){
                        window.localStorage.setItem("role", UserService.role);
                        window.localStorage.setItem("user_id", UserService.user_id);

                        $state.transitionTo("tab.home");
                    }else{
                        alert('No user found for the login info');
                    }

                }).error(function(data, status, headers, config)
                    {
                        alert('Username and Password did not match');
                        $state.transitionTo("tab.login");

                    }
                );
        }
})


.controller('HomeCtrl', function($scope, $http, $location, $timeout, $rootScope, $ionicPush, $ionicUser, DataService, $state, $ionicLoading, $ionicPopup, $ionicHistory, UserService) {

        $rootScope.hideTabs = false;

        var user = window.localStorage.getItem("username");
        var pass = window.localStorage.getItem("password");
        var role = window.localStorage.getItem("role");
        if(!role){
            role = UserService.role;
        }
        $scope.role = role;


        if(user === "undefined" || user === null || user === '' || pass === "undefined" || pass === null || pass === '') {
            $ionicHistory.nextViewOptions({
                disableAnimate: false,
                disableBack: true
            });
            $state.transitionTo("tab.login");
        }

    $http.get('http://www.stockmateauto.co.za/v1/api_v1/v1/api/stock').then(function(resp) {
        $scope.response = resp.data;
        //console.log($scope.response);
        // For JSON responses, resp.data contains the result
        $scope.vehicles = resp.data.vehicles;
    }, function(err) {
        console.error('ERR', err);
    });


    $scope.doRefresh = function () {
        $timeout( function() {
            $scope.$broadcast('scroll.refreshComplete');

            $http.get('http://www.stockmateauto.co.za/v1/api_v1/v1/api/stock').then(function(resp) {
                $scope.response = resp.data;
                $scope.vehicles = resp.data.vehicles;
            }, function(err) {
                console.error('ERR', err);
            });
        }, 1000);

    };


   if(DataService !== {}){

       $scope.data = DataService;
   }
   $scope.onItemView = function(data)
   {
       $scope.vehicle = data;
       DataService.vehicle= data;
   }

   $scope.deleteStock = function(st)
   {
        $ionicPopup.confirm({
           title: 'Delete this Vehicle?',
            cancelText: 'Cancel',
            cancelType: 'button-calm',
            okText: 'OK',
            okType: 'button-assertive'
        }).then(function(respDel) {

             if(respDel === true){
                 $http.get('http://www.stockmateauto.co.za/v1/api_v1/v1/api/stock/delete/'+st).then(function (res){
                     $scope.response = res.data;
                 }, function(err) {
                     //console.log('Delete Stock Error');
                 }).then(function(){
                         $ionicLoading.show({ template: 'Vehicle Removed', duration: 1500})
                         $state.transitionTo('tab.home', $scope.response, {
                             reload: true, inherit: false, notify: true
                         });
                     }
                 );
             }else{
                 close();
             }

        });
    }
})

.directive('ionSearch', function() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            getData: '&source',
            model: '=?',
            search: '=?filter'
        },
        link: function(scope, element, attrs) {
            attrs.minLength = attrs.minLength || 0;
            scope.placeholder = attrs.placeholder || '';
            scope.search = {value: ''};

            if (attrs.class)
                element.addClass(attrs.class);

            if (attrs.source) {
                scope.$watch('search.value', function (newValue, oldValue) {
                    if (newValue.length > attrs.minLength) {
                        scope.getData({str: newValue}).then(function (results) {
                            scope.model = results;
                        });
                    } else {
                        scope.model = [];
                    }
                });
            }

            scope.clearSearch = function() {
                scope.search.value = '';
            };
        },
        template: '<div class="item-input-wrapper">' +
            '<i class="icon ion-android-search"></i>' +
            '<input type="search" placeholder="{{placeholder}}" ng-model="search.value">' +
            '<i ng-if="search.value.length > 0" ng-click="clearSearch()" class="icon ion-close"></i>' +
            '</div>'
    };
})

.controller("PictureCtrl", function($scope, $ionicActionSheet, $cordovaCamera, $ionicLoading, $cordovaFile, DataService) {
        var imageNumber = 0;
        $scope.takePicture = function(slotNumber) {
            var hideSheet = $ionicActionSheet.show({
                buttons: [{ text: 'Take Picture', index: 'take'}, {text: 'Pictures from Library', index: 'get'}],
                titleText: 'Vehicle Picture',
                cancelText: 'Cancel',
                cancel: function() {
                    hideSheet();
                },
                buttonClicked: function(index){
                    switch (this.buttons[index].index) {
                        case 'take':
                            var typeChosen = Camera.PictureSourceType.CAMERA;
                            doPicture(typeChosen,slotNumber);
                            break;
                        case 'get':
                            var typeChosen = Camera.PictureSourceType.SAVEDPHOTOALBUM;
                            doPicture(typeChosen,slotNumber);
                            break;
                    }
                    return true;
                }
            });
        };

        function doPicture(typeChosen, slotNum) {
            var options = {
                quality : 100,
                destinationType : Camera.DestinationType.FILE_URI,
                sourceType : typeChosen,
                allowEdit : true,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 595,
                targetHeight: 446,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: false
            };

            $cordovaCamera.getPicture(options).then(function(imageData) {

                switch (imageNumber++) {
                    case 0:
                        $scope.imgURI1 = imageData;
                        DataService.imageURI1 = imageData;
                        break;
                    case 1:
                        $scope.imgURI2 = imageData;
                        DataService.imageURI2 = imageData;
                        break;
                    case 2:
                        $scope.imgURI3 = imageData;
                        DataService.imageURI3 = imageData;
                        break;
                    case 3:
                        $scope.imgURI4 = imageData;
                        DataService.imageURI4 = imageData;
                        break;
                }

            }, function(err) {
                alert(err + 'doPicture');
            });
        }
})


.controller('AddVehicleCtrl', function($scope,$timeout, $state, $http, $rootScope, $ionicUser, DataService, $ionicPopup, $ionicLoading, UserService)
 {

     $scope.doRefresh = function () {
         $timeout( function() {
             $scope.$broadcast('scroll.refreshComplete');
         $scope.vehicle = {};
         },1000);
     };

     $scope.submit = function(e)
     {
        if (e == undefined || e == '' || e.year_model == undefined || e.veh_make == undefined || e.mm_code == undefined || e.location == undefined || e.vehicle_colour == undefined) {
            $ionicLoading.show({template:"More information required!", duration: 1500})
        }else{
            var link = "http://www.stockmateauto.co.za/v1/api_v1/v1/api/stock/insert";
            var linkUpload = "http://www.stockmateauto.co.za/v1/api_v1/v1/api/upload/";
            var submitCnt = 0;

            //Access the image out of the factory
            var imageURI1 = DataService.imageURI1;
            var imageURI2 = DataService.imageURI2;
            var imageURI3 = DataService.imageURI3;
            var imageURI4 = DataService.imageURI4;
            var imageName1 =  '';
            var imageName2 =  '';
            var imageName3 =  '';
            var imageName4 =  '';
            var imageFileName = '';


            uploadPhoto(imageURI1, imageURI2, imageURI3, imageURI4, linkUpload);


            function uploadPhoto(imageURI1, imageURI2, imageURI3, imageURI4, linkURL) {
                $ionicLoading.show({template:"Saving vehicle data."})

                function winStart(){
                    if(imageURI1 !== undefined){

                        var options = new FileUploadOptions();
                        options.fileKey="file";
                        options.fileName =imageURI1.substr(imageURI1.lastIndexOf('/')+1);
                        imageFileName = options.fileName;
                        options.mimeType="image/jpeg";

                        var params = new Object();
                        params.value1 = "test";
                        params.value2 = "param";

                        options.params = params;
                        options.chunkedMode = false;

                        var ft = new FileTransfer();
                        ft.upload(imageURI1, encodeURI(linkURL+'1'), win, fail, options);


                    }else{
                        winFinal();
                    }
                }
                function win1(){

                    if(imageURI2 !== undefined){

                        var options = new FileUploadOptions();
                        options.fileKey="file";
                        options.fileName =imageURI2.substr(imageURI2.lastIndexOf('/')+1);
                        imageFileName = options.fileName;
                        options.mimeType="image/jpeg";

                        var params = new Object();
                        params.value1 = "test";
                        params.value2 = "param";

                        options.params = params;
                        options.chunkedMode = false;

                        var ft = new FileTransfer();
                        ft.upload(imageURI2, encodeURI(linkURL+'2'), win, fail, options);
                    }else{
                        winFinal();
                    }
                }
                function win2(){
                    if(imageURI3 !== undefined){

                        var options = new FileUploadOptions();
                        options.fileKey="file";
                        options.fileName =imageURI3.substr(imageURI3.lastIndexOf('/')+1);
                        imageFileName = options.fileName;
                        options.mimeType="image/jpeg";

                        var params = new Object();
                        params.value1 = "test";
                        params.value2 = "param";

                        options.params = params;
                        options.chunkedMode = false;

                        var ft = new FileTransfer();
                        ft.upload(imageURI3, encodeURI(linkURL+'3'), win, fail, options)
                    }
                    else{
                        winFinal();
                    }
                }
                function win3(){
                    if(imageURI4 !== undefined){

                        var options = new FileUploadOptions();
                        options.fileKey="file";
                        options.fileName =imageURI4.substr(imageURI4.lastIndexOf('/')+1);
                        imageFileName = options.fileName;
                        options.mimeType="image/jpeg";

                        var params = new Object();
                        params.value1 = "test";
                        params.value2 = "param";

                        options.params = params;
                        options.chunkedMode = false;

                        var ft = new FileTransfer();
                        ft.upload(imageURI4, encodeURI(linkURL+'4'), win, fail, options);
                    }else{
                        winFinal();
                    }
                }
                function winFinal(){
                    var user_id = window.localStorage.getItem("user_id");
                    if(!user_id){
                        user_id = UserService.user_id;
                    }
                    var $promise = $http({
                        url: link,
                        method: 'POST',
                        data: 'year_model=' + e.year_model +
                            '&veh_make=' + e.veh_make +
                            '&mm_code=' + e.mm_code  +
                            '&veh_colour=' + e.vehicle_colour  +
                            '&veh_type=' + e.veh_type +
                            '&extra_fitted=' + e.extra_fitted +
                            '&vehicle_kilometers=' + e.vehicle_kilometers +
                            '&service_history=' + e.service_history +
                            '&location=' + e.location +
                            '&recon_cost=' + e.recon_cost +
                            '&trade_value=' + e.trade_value +
                            '&retail_value=' + e.retail_value +
                            '&standin_value=' + e.standin_value +
                            '&comments=' + e.comments +
                            '&image1=' + imageName1 + '&image2=' + imageName2 +
                            '&image3=' + imageName3 + '&image4=' + imageName4 +
                            '&contact_name=' + e.contact_name +
                            '&contact_number=' + e.contact_number +
                            '&user_id=' + user_id,
                        headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
                    }).success (function(data, status, headers, config){

                        $ionicLoading.hide();

                        $ionicLoading.show({ template: 'Vehicle Added', duration: 1500});

                        $scope.vehicle = {};

                        $state.transitionTo('tab.home', $scope.response, {
                            reload: true, inherit: false, notify: true
                        });


                    }).error(function(data, status, headers, config)
                        {
                            $ionicLoading.hide();
                            alert('Vehicle data not submitted: '+status);

                        }
                    );

                }

                function win(r) {

                    var e = r.response.substr(0,1);

                    switch (e) {
                        case '1':
                            imageName1 = r.response.substr(2);
                            win1();
                            break;
                        case '2':
                            imageName2 = r.response.substr(2);
                            win2();
                            break;
                        case '3':
                            imageName3 = r.response.substr(2);
                            win3();
                            break;
                        case '4':
                            imageName4 = r.response.substr(2);
                            winFinal();
                            break;
                    }

                }
                winStart();

            }

            function fail(error) {
                alert("An error has occurred: Code = " + error.code);
                alert("Upload error source " + error.source);
                alert("Upload error target " + error.target);
            }
        }

     }

})

 .controller('UserCtrl', function($scope, $timeout, $state, $ionicLoading, $http, $rootScope, $ionicUser, DataService, UserService, $ionicPopup)
    {

        $scope.typeOptions = [
            { name: 'Normal', value: 'public' },
            { name: 'Admin', value: 'admin' }
        ];

        $scope.user = {role : $scope.typeOptions[0].value};

        $scope.doRefresh = function () {
            $timeout( function() {
                $scope.$broadcast('scroll.refreshComplete');
                $scope.vehicle = {};
            },1000);
        };

        var role = window.localStorage.getItem("role");
        if(!role){
            role = UserService.role;
        }
        $scope.role = role;

        var link = 'http://www.stockmateauto.co.za/v1/api_v1/v1/api/users';

        $http.get(link).then(function(resp)
        {
            console.log('Success', resp);
            // For JSON responses, resp.data contains the result
            $scope.users = resp.data.users;

        }, function(err) {
            console.error('ERR', err);
        });

        $scope.doRefresh = function() {
            $timeout( function() {
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');

            }, 1000);

        };
        if(DataService !== {}){

            $scope.data = DataService;
        }
        $scope.onItemView = function(data)
        {
            $scope.users = data;
            DataService.users= data;
        }

        $scope.deleteUser = function(st)
        {

            $ionicPopup.confirm({
                title: 'Delete this User?',
                cancelText: 'Cancel',
                cancelType: 'button-calm',
                okText: 'OK',
                okType: 'button-assertive'
            }).then(function(respDel) {

                    if(respDel === true){
                        $http.get('http://www.stockmateauto.co.za/v1/api_v1/v1/api/users/delete/'+st).then(function (res){
                            $scope.response = res.data;
                        }, function(err) {
                            console.log('Delete User Error');
                        }).then(function(){
                                $ionicLoading.show({ template: 'User Removed', duration: 1500})
                                $state.transitionTo('tab.home', $scope.response, {
                                    reload: true, inherit: false, notify: true
                                });
                            }
                        );
                    }else{
                        close();
                    }

                });

        }

        $scope.addUser = function(){
            $state.transitionTo('tab.useradd', $scope.response, {
                reload: true, inherit: false, notify: true
            });
        }

        $scope.newUser = function(resp){
            var username = resp.username;
            var password = resp.password;
            var name = resp.name;
            var role = resp.role;

            var linkUserAdd = 'http://www.stockmateauto.co.za/v1/api_v1/v1/api/users/insert';
            $http({
                url: linkUserAdd,
                method: 'POST',
                data: 'username=' + username +
                    '&password=' + password +
                    '&name=' + name  +
                    '&role=' + role,
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
            }).success (function(data, status, headers, config){

                $ionicLoading.show({ template: 'User Added', duration: 1500});

                $state.transitionTo('tab.user', $scope.response, {
                    reload: true, inherit: false, notify: true
                });


            }).error(function(data, status, headers, config)
                {
                    alert('User data not submitted: '+status);

                }
            );
        }

    }
)


.controller('PushCtrl', function($http, $scope, $rootScope, $ionicPush, $ionicApp) {
  // Put your private API key here to be able to send push notifications from within the app.
  // TODO: Add your private API key here if you want to push from your device.
  $scope.privateKey = '32dd6d4e9c02d2bbce9a802a05c869627b32b3f1a7698461';

  // Write your own code here to handle new device tokens from push notification registration as they come in.
  $rootScope.$on('$cordovaPush:tokenReceived', function(event, data) {
    alert("Successfully registered token " + data.token);
    console.log('Ionic Push: Got token ', data.token, data.platform);
    $scope.token = data.token;
  });

  /**
   * Registers the currently identified Ionic User for push notifications on the current device. This should either pass
   * a user object to identify or be called after $ionicUser.identify()
   * (read the docs at http://docs.ionic.io/push/installation/).
   **/
  $scope.pushRegister = function() {
    console.log('Ionic Push: Registering user');

    // Register with the Ionic Push service.  All parameters are optional.
    $ionicPush.register({
      canShowAlert: true, //Should new pushes show an alert on your screen?
      canSetBadge: true, //Should new pushes be allowed to update app icon badges?
      canPlaySound: true, //Should notifications be allowed to play a sound?
      canRunActionsOnWake: true, // Whether to run auto actions outside the app,
      onNotification: function(notification) {
        // Handle new push notifications here
        // console.log(notification);
        return true;
      }
    }).then(function(deviceToken) {
      //Save the device token, if necessary
    });
  };

  /**
   * If you've added your Private API Key, you can send a push notification directly fro the current device.  Since the
   * app iwll be open when this happens, you probably will not see the notification handled by the OS, but it should
   * still be handled by whatever function you define.
   **/
  $scope.sendPush = function() {
    if ($scope.privateKey) {
      alert('A notification will be sent to you 5 seconds after you close this alert.  They can take a few minutes to arrive.');
      var appId = $ionicApp.getApp().app_id;
      var auth = btoa($scope.privateKey + ':'); // Base64 encode your key
      var req = {
        method: 'POST',
        url: $ionicApp.getValue('push_api_server') + '/api/v1/push',
        headers: {
          'Content-Type': 'application/json',
          'X-Ionic-Application-Id': appId,
          'Authorization': 'basic ' + auth
        },
        data: {
          "tokens": [$scope.token],
          "notification": {
            "alert":"Hello World!"
          }
        }
      };

      setTimeout(function(){
        $http(req).success(function(resp){
            console.log("Ionic Push: Push success!");
          }).error(function(error){
            console.log("Ionic Push: Push error...");
          });
      }, 5000);
    } else {
      alert('Uh-oh!  To use this function, add your Private API Key to line 36 of controllers.js');
    }
  };
})

.controller('AnalyticsCtrl', function($scope, $ionicAnalytics) {

  // Track a fake purchase event.
  $scope.trackPurchase = function() {
    console.log("Ionic Analytics: Tracking a fake purchase.");
    $ionicAnalytics.track('purchase', {
      item_id: 101,
      item_name: 'A-Trak player'
    });
    alert('Tracked purchase of A_Trak player ID 101.');
  };

  // Track a fake review event
  $scope.trackReview = function() {
    console.log("Ionic Analytics: Tracking a fake review.");
    $ionicAnalytics.track('review', {
      star_rating: 5,
      reviewer_name: 'John',
      content: 'Awesome app!'
    });
    alert('Tracked 5-star review from John, "Awesome app!"');
  };
})

.controller('DeployCtrl', function($scope, $rootScope, $ionicDeploy) {
  $scope.updateMinutes = 2;

  // Handle action when update is available
  $rootScope.$on('$ionicDeploy:updateAvailable', function() {
    console.log('Ionic Deploy: New update available!');
    $scope.hasUpdate = true;
  });

  // Stop checking for updates form Ionic Deploy
  $scope.stopCheckingForUpdates = function() {
    $ionicDeploy.unwatch();
  };

  // Update app code with new release from Ionic Deploy
  $scope.doUpdate = function() {
    $ionicDeploy.update().then(function(res) {
      console.log('Ionic Deploy: Update Success! ', res);
    }, function(err) {
      console.log('Ionic Deploy: Update error! ', err);
    }, function(prog) {
      console.log('Ionic Deploy: Progress... ', prog);
    });
  };

  // Check Ionic Deploy for new code
  $scope.checkForUpdates = function() {
    console.log('Ionic Deploy: Checking for updates');
    $ionicDeploy.check().then(function(hasUpdate) {
      console.log('Ionic Deploy: Update available: ' + hasUpdate);
      $rootScope.lastChecked = new Date();
      $scope.hasUpdate = hasUpdate;
    }, function(err) {
      console.error('Ionic Deploy: Unable to check for updates', err);
    });
  }
})

.factory("DataService",function(){
    var service = {};
    return service;
})

.factory("UserService",function(){
    var service = {};
    return service;
})
