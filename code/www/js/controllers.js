angular.module('songhop.controllers', ['ionic', 'songhop.services'])


/*
Controller for the discover page
*/
.controller('DiscoverCtrl', function($scope,$ionicLoading, $timeout, User, Recommendations) {
  //helper loading page
  var showLoading = function(){
    $ionicLoading.show({
      template:'<i class="ion-loading-c"></i>',
      noBackdrop: true
    });
  }
  var hideLoading = function(){
    $ionicLoading.hide();
  }
  showLoading();

  //Recommendations setting current song
  Recommendations.getNextSongs()
  .then(function(){
    $scope.currentSong = Recommendations.queue[0];
    return Recommendations.playCurrentSong();
  })
  .then(function(){
    hideLoading();
    $scope.currentSong.loaded = true;
  });
  // //Check whether user favorites or skipped this songs
  $scope.checkInput = function(boolean){
      // add song to favorites if user click it
      if(boolean) User.addSongToFavorites($scope.currentSong);
      $scope.currentSong.isTrue=boolean;
      $scope.currentSong.hide=true;
      // prepare the next song
      Recommendations.nextSong();
      $timeout(function() {
          // $timeout to allow animation to complete
          $scope.currentSong = Recommendations.queue[0];
          $scope.currentSong.loaded = false;
      }, 250);
      Recommendations.playCurrentSong()
        .then(function(){
          $scope.currentSong.loaded=true;
      });
      // used for retrieving the next album image.
      // if there isn't an album image available next, return empty string.
      $scope.nextAlbumImg = function() {
        if (Recommendations.queue.length > 1) {
          return Recommendations.queue[1].image_large;
        }
        return '';
      }
    }
    //       $timeout(function(){
    //      //randomly set current song to one of existing 3 songs
    //      var randomSong = Math.round(Math.random()*(Recommendations.queue.length-1));
    //      //Prevent from displaying the same song again and again
    //      while(angular.equals($scope.currentSong.title,Recommendations.queue[randomSong].title)){
    //        randomSong = Math.round(Math.random()*(Recommendations.queue.length-1));
    //      }
    //      //update current song in the scope
    //      $scope.currentSong = angular.copy(Recommendations.queue[randomSong]);
    //    },300
    // );
})

/*
Controller for the favorites page
*/
.controller('FavoritesCtrl', function($scope, User,$window) {
  $scope.username = User.username;
  // add song into favorite
  $scope.favorites = User.favorites;
  //remove a song from favorite
  $scope.removeSong = function(song,index){
    //call user services and remove song at this index
    User.removeSongFromFavorites(song,index);
  }
  $scope.openSong = function(song){
    $window.open(song.open_url,"_system");
  }

})
/*
Controller for our splash screen
*/
.controller('SplashCtrl',function($scope, $state, User){
  //If user want to login/signup using Usr.auth
  $scope.submitForm = function(username,signingUp){
    //session is set
    User.auth(username,signingUp).then(function(){
      $state.go('tab.discover');
    },function(){
      alert('Please try another name');
    });
  }
})
/*
Controller for our tab bar
*/
.controller('TabsCtrl', function($scope,User,$window) {
    //Show number of favorites
    $scope.favCount = User.favoriteCount;
    //reset new favorites to 0 when user click fav tab
    $scope.enteringFavorites = function(){
      User.newFavorites=0;
    }
    $scope.leavingFavorites = function(){
    }
    $scope.logout = function(){
      User.destroySession();
      $window.location.href = 'index.html';
    }    
});
