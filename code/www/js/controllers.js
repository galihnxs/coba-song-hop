angular.module('songhop.controllers', ['ionic', 'songhop.services'])


/*
Controller for the discover page
*/
.controller('DiscoverCtrl', function($scope, $timeout, User, Recommendations) {
  Recommendations.getNextSongs()
  .then(function(){
    $scope.currentSong = Recommendations.queue[0];
    Recommendations.playCurrentSong();
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
   }, 250);
   Recommendations.playCurrentSong();
   // used for retrieving the next album image.
  // if there isn't an album image available next, return empty string.
  $scope.nextAlbumImg = function() {
    if (Recommendations.queue.length > 1) {
      return Recommendations.queue[1].image_large;
    }

    return '';
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
  }
})


/*
Controller for the favorites page
*/
.controller('FavoritesCtrl', function($scope, User) {
  // add song into favorite
  $scope.favorites = User.favorites;
  //remove a song from favorite
  $scope.removeSong = function(song,index){
    //call user services and remove song at this index
    User.removeSongFromFavorites(song,index);
  }
})


/*
Controller for our tab bar
*/
.controller('TabsCtrl', function($scope) {

});
