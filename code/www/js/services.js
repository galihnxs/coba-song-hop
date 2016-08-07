angular.module('songhop.services', [])
  .factory('User',function(){
      //Store favorie songs
        var store = {
          favorites: []
        };
        //Store favorite songs
        store.addSongToFavorites = function(song){
          if(!song) return false;
          store.favorites.push(song);
        }
        //Remove song in favorites
        store.removeSongFromFavorites = function(song,index) {
            if(!song) return false;
            //Remove one song starting at this.index
            store.favorites.splice(index,1);
        }
        return store;
})
.factory('Recommendations',function($http,SERVER,$q){
  var media;
  var recommendedSong = {
    queue: []
  };
  //get next recommended song
  recommendedSong.getNextSongs = function(){
    return $http({
      method:'GET',
      url: SERVER.url +'/recommendations'
    }).success(function(data){
      //merge data into queue
      recommendedSong.queue = recommendedSong.queue.concat(data);
    });
  }
  recommendedSong.nextSong = function(){
    recommendedSong.queue.shift();
    recommendedSong.haltAudio();
    if(recommendedSong.queue.length<4){
      recommendedSong.getNextSongs();
    }
  }
  recommendedSong.playCurrentSong = function(){
    var defer = $q.defer();
    // play the current song's preview
    media = new Audio(recommendedSong.queue[0].preview_url);

    // when song loaded, resolve the promise to let controller know.
    media.addEventListener("loadeddata", function() {
      defer.resolve();
    });
    media.play();
    return defer.promise;
  }
  // used when switching to favorites tab
  recommendedSong.haltAudio = function() {
    if (media) media.pause();
  }

  return recommendedSong;
});
