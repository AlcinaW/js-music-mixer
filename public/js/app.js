//Note: run with python -m SimpleHTTPServer to test

//Would it be better to npm the packages for ToneJS in and configure the package.json, 
// or just CDN, or leave files as is


//loading file with XMLHttpRequest
//to-do: what to do about more than one piece
//to-do: re-add sliders

//button text swaps when pressed
var playButton = document.getElementById("playPauseButton");

function swapText() {
    if (playButton.value === "Play") {
      playButton.value = "Pause";
    }
    else {
      playButton.value = "Play";
    }
}

// LOADING AUDIO ONLY
//in case not Chrome 
//var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
// initializing a new context
context = new (window.AudioContext || window.webkitAudioContext)();

function playSound(buffer, time) {
  var source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  source.start(time);
}

function loadSounds(obj, soundMap, callback) {
  // Array-ify
  var names = [];
  var paths = [];
  for (var name in soundMap) {
    var path = soundMap[name];
    names.push(name);
    paths.push(path);
  }
  bufferLoader = new BufferLoader(context, paths, function(bufferList) {
    for (var i = 0; i < bufferList.length; i++) {
      var buffer = bufferList[i];
      var name = names[i];
      obj[name] = buffer;
    }
    if (callback) {
      callback();
    }
  });
  bufferLoader.load();
}

function BufferLoader(context, urlList, callback) {
  this.context = context;
  this.urlList = urlList;
  this.onload = callback;
  this.bufferList = new Array();
  this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url, index) {
  // Load buffer asynchronously
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";

  var loader = this;

  request.onload = function() {
    // Asynchronously decode the audio file data in request.response
    loader.context.decodeAudioData(
      request.response,
      function(buffer) {
        if (!buffer) {
          alert('error decoding file data: ' + url);
          return;
        }
        loader.bufferList[index] = buffer;
        if (++loader.loadCount == loader.urlList.length)
          loader.onload(loader.bufferList);
      },
      function(error) {
        console.error('decodeAudioData error', error);
      }
    );
  }

  request.onerror = function() {
    alert('BufferLoader: XHR error');
  }

  request.send();
};

BufferLoader.prototype.load = function() {
  for (var i = 0; i < this.urlList.length; ++i)
  this.loadBuffer(this.urlList[i], i);
};

// MANIPULATE WITH FILTER
var QUAL_MUL = 35;

function FilterSample() {
  this.isPlaying = false;
  loadSounds(this, {buffer: 'media/The_Voyage.mp3'});
};

FilterSample.prototype.play = function() {
  // Create the source
  var source = context.createBufferSource();
  source.buffer = this.buffer;
  // Create the filter
  var filter = context.createBiquadFilter();
  filter.type = filter.LOWPASS;
  filter.frequency.value = 5000;
  // Connect source to filter, filter to destination
  source.connect(filter);
  filter.connect(context.destination);
  // Play
  source.start(0);
  source.loop = true;
  // Save source and filterNode for later access
  this.source = source;
  this.filter = filter;
};

FilterSample.prototype.stop = function() {
  this.source.stop(0);
};

FilterSample.prototype.toggle = function() {
  this.isPlaying ? this.stop() : this.play();
  this.isPlaying = !this.isPlaying;
};

FilterSample.prototype.changeFrequency = function(element) {
  // Clamp the frequency between the minimum value (40 Hz) and half of the
  // sampling rate.
  var minValue = 40;
  var maxValue = context.sampleRate / 2;
  // Logarithm (base 2) to compute how many octaves fall in the range.
  var numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2;
  // Compute a multiplier from 0 to 1 based on an exponential scale.
  var multiplier = Math.pow(2, numberOfOctaves * (element.value - 1.0));
  // Get back to the frequency value between min and max.
  this.filter.frequency.value = maxValue * multiplier;
};

FilterSample.prototype.changeQuality = function(element) {
  this.filter.Q.value = element.value * QUAL_MUL;
};

//VISUALIZATION 
// Assume that node A is ordinarily connected to B.
// var analyser = context.createAnalyser();
// A.connect(analyser);
// analyser.connect(B);

//VIZ START
var analyser = context.createAnalyser();
// source = context.createMediaStreamSource(stream);
// source.connect(analyser);
// analyser.connect(distortion);


// // Create arrays to store sound data
// var fFrequencyData = new Float32Array(analyser.frequencyBinCount);
// var bFrequencyData = new Uint8Array(analyser.frequencyBinCount);
 
// // Retrieve data
// analyser.getFloatFrequencyData(fFrequencyData);
// analyser.getByteFrequencyData(bFrequencyData);
// analyser.getByteTimeDomainData(bFrequencyData);

// // setTimeout fallback
// window.requestAnimFrame = (function(){
// return  window.requestAnimationFrame       || 
//   window.webkitRequestAnimationFrame || 
//   window.mozRequestAnimationFrame    || 
//   window.oRequestAnimationFrame      || 
//   window.msRequestAnimationFrame     || 
//   function( callback ){
//   window.setTimeout(callback, 1000 / 60);
// };
// })();

// VIZ END

//New sample
var sample = new FilterSample();
//var sample = new VisualizerSample();

