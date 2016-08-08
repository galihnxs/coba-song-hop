angular.module('songhop.services', ['ionic.utils'])
  .factory('User',function($http, $q, $localstorage, SERVER){
      //Store favorie songs
        var store = {
          username: false,
          session_id: false,
          favorites: [],
          newFavorites:0
        };
        //Store favorite songs
        store.addSongToFavorites = function(song){
          if(!song) return false;
          store.favorites.push(song);
          store.newFavorites++;
          // persist this to the server
          return $http.post(SERVER.url + '/favorites', {session_id: store.session_id, song_id: song.song_id });
        }
        //get all user favorites song from the SERVER
        store.populateFavorites = function(){
          return $http({
            method: 'GET',
            url: SERVER.url +'/favorites',
            params: { session_id: store.session_id}
          }).success(function(data){
            store.favorites=data;
          });
        }
        //set session data
        store.setSession = function(username,session_id,favorites){
          if(username) store.username = username;
          if(session_id) store.session_id = session_id;
          if(favorites) store.favorites = favorites;
          //set data in localstorage object
          $localstorage.setObject('user',{
            username:username,
            session_id: session_id
          });
        }
        //Remove song in favorites
        store.removeSongFromFavorites = function(song,index) {
            if(!song) return false;
            //Remove one song starting at this.index
            store.favorites.splice(index,1);
            return $http({
              method:'DELETE',
              url: SERVER.url + '/favorites',
              params: {session_id: store.session_id,song_id: song.song_id}
            });
        }
        store.favoriteCount = function(){
          return store.newFavorites;
        }
        //Login or signup
        store.auth = function(username,signingUp){
          var authRoute;
          if(signingUp){
            authRoute='signup';
          }else{
            authRoute='login';
          }
          return $http.post(SERVER.url +'/'+ authRoute, {username: username})
            .success(function(data){
              store.setSession(data.username, data.session_id, data.favorites);
            });
        }
        //Check if user session present
        store.checkSession = function(){
          var defer = $q.defer();
          if(store.session_id){
            //if already initialized in the services
            defer.resolve(true);
          }else{
            //If there's a session in localstorage from previous use
            //pull into the services
            var user = $localstorage.getObject('user');
            if(user.username){
              //if there's a user, lets grab their favorites from the server
              store.setSession(user.username,user.session_id);
              store.populateFavorites().then(function(){
                defer.resolve(true);
              });
            }else{
              //no info, reject
              defer.resolve(false);
            }
          }
          return defer.promise;
        }
        store.destroySession = function(){
          $localstorage.setObject('user',{});
          store.username = false;
          store.session_id = false;
          store.favorites = [];
          store.newFavorites = 0;
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
