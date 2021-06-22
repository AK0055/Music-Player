/*
Spotify PLayer using Doubly Linked list and Priority Queue
We use spotify API for obtaining top artists and tracks for the particular user
We are using implicit autthentication for generating auth_token the defualt expiry is
set for 1 hour.We are creating map object using top tracks and artists and getting the track cover image also
in the same process.
*/
const client_id = "c88f458bfe36499b8ea019d5fe173c3e";
const client_secret = "3300104101f948fdb283ff33cf460597";
const spotify_uri = 'http://localhost:5500/dsa_spotify/index.html';

function dec2hex(dec) {
    return ("0" + dec.toString(16)).substr(-2);
}

function generateCodeVerifier() {
    var array = new Uint32Array(56 / 2);
    window.crypto.getRandomValues(array);
    return Array.from(array, dec2hex).join("");
}

function sha256(plain) {
    // returns promise ArrayBuffer
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest("SHA-256", data);
}

function base64urlencode(a) {
    var str = "";
    var bytes = new Uint8Array(a);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        str += String.fromCharCode(bytes[i]);
    }
    return btoa(str)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

async function generateCodeChallengeFromVerifier(v) {
    var hashed = await sha256(v);
    var base64encoded = base64urlencode(hashed);
    return base64encoded;
}
var ver = generateCodeVerifier();
var chal_ver_pro = generateCodeChallengeFromVerifier(ver);
let chal_ver;
chal_ver_pro.then(function myfunc(val) {
    chal_ver = val;
});
//////////////////////////
const uri_log = 'https://accounts.spotify.com/authorize?client_id=c88f458bfe36499b8ea019d5fe173c3e&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A5500&scope=user-read-private%20user-read-email%20user-read-playback-state%20user-read-currently-playing%20user-read-recently-played%20user-modify-playback-state%20app-remote-control%20user-read-email%20playlist-read-collaborative%20user-read-private%20playlist-modify-public%20user-library-modify%20user-read-playback-position%20user-read-currently-playing%20user-read-playback-state';


document.getElementById("spo-but").onclick = function() {
    location.href = "https://accounts.spotify.com/authorize?client_id=c88f458bfe36499b8ea019d5fe173c3e&response_type=token&redirect_uri=http://localhost:5500/dsa_spotify/index.html&show_dialog=true&scope=playlist-modify-public%20user-top-read%20streaming%20user-read-email%20user-read-private%20user-read-playback-position%20user-library-read%20user-read-playback-state%20user-modify-playback-state";
};

var urls = window.location.href;
var access_token = new URLSearchParams(window.location.hash).get('#access_token');
/*async function auth_code_rec(ver,chal_ver){
      const response = await fetch('https://accounts.spotify.com/api/token',{
        method: 'POST',
        headers: {
            'Content-type' : ''
        }
      })

    }
 


function top_artist() {
    fetch('https://api.spotify.com/v1/me/top/artists', {
        headers: {
            'Authorization': `Bearer ${access_token}`
        }
    }).then(response => {
        return response.json()
    })
   
}
*/
async function user_top_artists() {
    const response = await fetch('https://api.spotify.com/v1/me/top/artists', {
        headers: {
            'Authorization': `Bearer ${access_token}`
        }
    });
    const json = await response.json();
    return json;
};
async function user_top_tracks() {
    const response = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=50', {
        headers: {
            'Authorization': `Bearer ${access_token}`
        },
        params: {

        }
    });
    const json = await response.json();
    return await json;
};
let t_a = new Map()
const artist_ar = []
var dat_artists = user_top_artists();
dat_artists.then(data => {
    var i;
    for (i = 0; i < 20; i++) {
        t_a.set(data.items[i].id, data.items[i].name)
        artist_ar.push([data.items[i].id, data.items[i].name])
    }
    //document.getElementById("artist_img").src = data.items[8].images[0].url;
})
let t_t = new Map()
let t_u = new Map()
const track_ar = []
var dat_tracks = user_top_tracks();
dat_tracks.then(data => {
    var i;
    for (i = 0; i < 50; i++) {
        t_t.set(data.items[i].id, data.items[i].artists[0].id)
        t_u.set(i, [data.items[i].id, data.items[i].uri]);
        track_ar.push(data.items[i].id);
    }
});





/*Player SDK Starting From here
for playback use API using the device ID
*/

var dev_id;
window.onSpotifyPlayerAPIReady = () => {
    const player = new Spotify.Player({
        name: 'Spotify DS',
        getOAuthToken: cb => { cb(access_token); }
    });

    // Error handling
    player.on('initialization_error', e => console.error(e));
    player.on('authentication_error', e => console.error(e));
    player.on('account_error', e => console.error(e));
    player.on('playback_error', e => console.error(e));

    // Playback status updates
    player.on('player_state_changed', state => {
        console.log(state)
        $('#current-track').attr('src', state.track_window.current_track.album.images[0].url);
        $('#current-track-name').text(state.track_window.current_track.name);
    });

    // Ready
    player.on('ready', data => {
        console.log('Ready with Device ID', data.device_id);
        play(data.device_id)
            // Play a track using our new device ID
        $(document).ready(function() {
            $("#spo-but-pau-pla").click(function() {
                player.togglePlay().then(() => {
                    console.log('Toggled playback!');
                });
            });
        });

    });
    $(document).ready(function() {
      $("#spo-but-nex").click(function() {
          player.nextTrack().then(() => {
          console.log('Skipped to next track!');
        });
      });
  });
    $(document).ready(function() {
      $("#spo-but-prev").click(function() {
          player.previousTrack().then(() => {
          console.log('Set to previous track!');
        });
      });
    });

    
    // Connect to the player!
    player.connect();
}

function play(device_id) {
    var i;
    i = Math.floor((Math.random() * 50) + 0);
    var uir = t_u.get(i)[1];
    $.ajax({
        url: "https://api.spotify.com/v1/me/player/play?device_id=" + device_id,
        type: "PUT",
        data: "{\"uris\":[\""+uir+"\"]}",
        beforeSend: function(xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + access_token); },
        success: function(data) {
            console.log(data)
        }
    });
}



//Datastructures Portion
/*

Using a doubly linked list we add the tracks obtained from function 
and using priority queue we add to assign priority we use various factors like lenght of the songs
and if the artist name is present in top artists using this we obtain a priotity queue
and finally play a track from it

*/
//DS Portion impl
//DOUBLY LINKED
class Node {
    constructor(value) {
      this.value = value;
      this.prev = null;
      this.next = null;
    }
  }
  class DoublyLinkedList {
    constructor() {
      this.head = null;
      this.tail = null;
      this.length = 0;
    }
  
    push(val) {
      const newNode = new Node(val);
      if (!this.head) {
        this.head = newNode;
        this.tail = newNode;
      } else {
        this.tail.next = newNode;
        newNode.prev = this.tail;
        this.tail = newNode;
      }
      this.length++;
      return this;
    }
  
    pop() {

      if (this.length === 0) {
        return false;
      }
      const popped = this.tail;
      const newTail = this.tail.prev;
      if (newTail) {
        newTail.next = null;
        this.tail.prev = null;
      } else {
        this.head = null;
      }
      this.tail = newTail;
      this.length--;
  
      return popped;
    }
  
    shift() {
      if (!this.head) {
        return false;
      }
      const shiftedNode = this.head;
      const newHead = this.head.next;
      if (this.head !== this.tail) {
        newHead.prev = null;
        shiftedNode.next = null;
      } else {
        this.tail = null;
      }
      this.head = newHead;
      this.length--;
      return shiftedNode;
    }
  
    unshift(val) {
      const newNode = new Node(val);
      if (!this.head) {
        this.head = newNode;
        this.tail = newNode;
      } else {
        this.head.prev = newNode;
        newNode.next = this.head;
        this.head = newNode;
      }
      this.length++;
      return this;
    }
  
    insertAtIndex(index, val) {
      if (index > this.length) {
        return false;
      }
      if (index === 0) {
        this.unshift(val);
      } else if (index === this.length) {
        this.push(val);
      } else {
        const newNode = new Node(val);
        const after = this.accessAtIndex(index);
        const before = after.prev;
        after.prev = newNode;
        before.next = newNode;
        newNode.next = after;
        newNode.prev = before;
        this.length++;
      }
      return this;
    }
  
    removeAtIndex(index) {
      let removedNode;
      if (index >= this.length) {
        return false;
      }
      if (index == 0) {
        removedNode = this.shift();
      } else if (index == this.length - 1) {
        removedNode = this.pop();
      } else {
        removedNode = this.getNodeAtIndex(index);
        const after = removedNode.next;
        const before = removedNode.prev;
        removedNode.next = null;
        removedNode.prev = null;
        before.next = after;
        after.prev = before;
        this.length--;
      }
      return removedNode;
    }
  
    getNodeAtIndex(index) {
      if (index >= this.length || index < 0) {
        return false;
      }
      let currentIndex = 0;
      let currentNode = this.head;
      while (currentIndex !== index) {
        currentNode = currentNode.next;
        currentIndex++;
      }
      return currentNode;
    }
  
    setNodeAtIndex(index, val) {
      const foundNode = this.getNodeAtIndex(index)
      if(foundNode){
          foundNode.value = val
          return foundNode;
      }
      return null;
    }
    
    printList() {
      if(this.head){
        let current = this.head;
        while (current.next) {
          console.log(current);
          current = current.next;
        }
        console.log(current);
      } else {
        console.log("empty list")
      }
    }
  }

//Priority Queue

const tops = 0;
const parent = i => ((i + 1) >>> 1) - 1;
const left = i => (i << 1) + 1;
const right = i => (i + 1) << 1;

class PriorityQueue {
  constructor(comparator = (a, b) => song_score(a) > song_score(b)) {
    this._heap = [];
    this._comparator = comparator;
  }
  size() {
    return this._heap.length;
  }
  isEmpty() {
    return this.size() == 0;
  }
  peek() {
    return this._heap[tops];
  }
  push(...values) {
    values.forEach(value => {
      this._heap.push(value);
      this._siftUp();
    });
    return this.size();
  }
  pop() {
    const poppedValue = this.peek();
    const bottom = this.size() - 1;
    if (bottom > tops) {
      this._swap(top, bottom);
    }
    this._heap.pop();
    this._siftDown();
    return poppedValue;
  }
  replace(value) {
    const replacedValue = this.peek();
    this._heap[top] = value;
    this._siftDown();
    return replacedValue;
  }
  _greater(i, j) {
    return this._comparator(this._heap[i], this._heap[j]);
  }
  _swap(i, j) {
    [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
  }
  _siftUp() {
    let node = this.size() - 1;
    while (node > tops && this._greater(node, parent(node))) {
      this._swap(node, parent(node));
      node = parent(node);
    }
  }
  _siftDown() {
    let node = tops;
    while (
      (left(node) < this.size() && this._greater(left(node), node)) ||
      (right(node) < this.size() && this._greater(right(node), node))
    ) {
      let maxChild = (right(node) < this.size() && this._greater(right(node), left(node))) ? right(node) : left(node);
      this._swap(node, maxChild);
      node = maxChild;
    }
  }
}

//Datastrctures Usage


/*

Creating a Doubly Linked list for populating the nodes we are going to use the song_id atribute
received from the API call made earlier.Using those details we are going to create a doubly linked
list of song_id's of various song



/*

We are going to use song_score function to generate the score for custom 
compartor class in priority queue class for ordering the elements

*/


//Creating the new Priority Queue
//Default compartor class is set to use the score_gen function
const queue_pop = new PriorityQueue((a, b) => a[0] < b[0]);



//Implementation


function play_list(artist_seed,track_seed,limit){
  async function play_l(){
      const response = await fetch (`https://api.spotify.com/v1/recommendations?limit=50&market=US&seed_artists=${artist_seed}&seed_genres=classical%2Ccountry%2Cpop&seed_tracks=${track_seed}&min_energy=0.4&min_popularity=50`,{
          method: 'GET',
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': "Bearer " + access_token
          }

      });
      return response.json();
  }
  var pons = play_l()

  var arr = pons.then(data => {
  datas = data.tracks;
  var p_aa = [];
  const list_l = new DoublyLinkedList()
      for(i = 0; i < 50; i++){
        //Pusing to Doubly Linked List
        list_l.push(datas[i].uri)
        var x = datas[i].uri.substring('spotify:track:'.length);
        var pons1 = song_score(datas[i].uri)
        p_aa.push(pons1);
      }
      
      Promise.all(p_aa).then(data => {
        var aa = [] 
        for(i = 0;i<50;i++)
        {
          queue_pop.push(data[i])
          aa.push(data[i][1])
        }
        var t = 0
        console.log(queue_pop.size())
        console.log(aa)
        while (queue_pop.size() != t) {
            var rems = queue_pop._heap[t]
            t++;
            var uris_id = rems[1]
            uris_id = uris_id.substring('spotify:track:'.length)
            next_song(uris_id);

        }
      });  
      
       return queue_pop

  })
  return arr;
}

let t_s = new Map()
//Finding the score of the song using the given spotify song uri
function song_score(song_uri){
  song_uri = String (song_uri)
  uriss = song_uri.substring('spotify:track:'.length);
    async function song_score_gen(){
      const response = await fetch (`https://api.spotify.com/v1/audio-features/${uriss}`,{
          method: 'GET',
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': "Bearer " + access_token
          }

      });
      return response.json();
  }
  var resp = song_score_gen();
  var score = resp.then(data =>{
    sco = data.key + data.mode + data.time_signature + data.acousticness + data.danceability + data.energy + data.instrumentalness + data.liveness + data.loudness + data.speechiness + data.valence + data.tempo;
    return [sco,'spotify:track:'+data.id];
  }) 
  return score
}


/*

Using Promise async function wrapper and executing the functions and creating doubly
linked list  and Priority queue inside the this operator to eliminate the nedd for setTimeout
Function
*/

var dat_tracks = user_top_tracks();
var track_rank = dat_tracks.then(data => {
    var i;
    var t_u_t = []
    for (i = 0; i < 50; i++) {
        t_u_t[i] =  [data.items[i].id, data.items[i].uri];
    }
    let t_ss = new Map;
    //Creating a Doubly Linked List
    const list_l = new DoublyLinkedList()
    //Creating a Priority Queue with Custom Comparator Class
    // Comparison song_score(a)>song_score(b)
    const queue_pop = new PriorityQueue((a, b) => song_score(a) > song_score(b));
    //Using Doubly Linked List and Populate it using the Spotify's Song URI's
    //Populate the Priority Queue
    var i;
    i = Math.floor((Math.random() * 50) + 0);
    var j;
    j = Math.floor((Math.random() * 20) + 0);
    var s_s = t_u_t[i][1];
    var t_s = t_u_t[j][0];
    s_s = s_s.substring('spotify:track:'.length);
    var myarr = play_list(s_s,t_s);
    return myarr;
});
var track_rank_arr = track_rank.then(function(result) {
  return result;
});



//function for next song on playlist

function next_song(ur){
  async function add_song_qu(){
    const response = await fetch (`https://api.spotify.com/v1/me/player/queue/?uri=spotify%3Atrack%3A${ur}`,{
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + access_token
        }

    });
    return response.json();
}
add_song_qu();
}



