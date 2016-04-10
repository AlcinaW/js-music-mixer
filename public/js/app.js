//Note: run with python -m SimpleHTTPServer to test

//Would it be better to npm the packages for ToneJS in and configure the package.json, 
// or just CDN, or leave files as is


//loading file with XMLHttpRequest
//to-do: what to do about more than one piece
//to-do: re-add sliders

  /**
   * AudioAnalyser
   * param- soundPath: path to your sound
   */
   
  function AudioAnalyser(soundPath){
    
      this.sound =soundPath;
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      this.source = this.audioCtx.createBufferSource();        
      this.request = new XMLHttpRequest();
      
      //from https://github.com/srchea/Sound-Visualizer/blob/master/js/audio.js
      this.source;
      this.analyser;
      
      //publicly accessible music attributes
      this.boost = 0;
      
  }
  
  
   AudioAnalyser.prototype={
    constructor:AudioAnalyser,

    /**
    * http://mdn.github.io/decode-audio-data/
    */
    // use XHR to load an audio track, and
    // decodeAudioData to decode it and stick it in a buffer.
    // Then we put the buffer into the source
    loadAudio:function(){

        this.request.open('GET', this.sound, true);
        this.request.responseType = 'arraybuffer';
        
        var audioAnalyserInstance = this;
        //on load decode the audio
        this.request.onload = function() {
          audioAnalyserInstance.decodeAudio();
        }
        
        //then send the request
        this.request.send();  
      
    },
    decodeAudio:function(){
      
        var audioAnalyserInstance = this;
        this.audioCtx.decodeAudioData(this.request.response, function(decodedData) {
          
            audioAnalyserInstance.setUpAnalyser(decodedData);
        },
        function(e){"Error with decoding audio data" + e.err});
    },
    setUpAnalyser:function(buffer){
          
         var audioAnalyserInstance = this;
          /**from https://github.com/srchea/Sound-Visualizer/blob/master/js/audio.js */
          var scriptProcessorNode = this.audioCtx.createScriptProcessor(2048, 1, 1);
          scriptProcessorNode.buffer = buffer;
          scriptProcessorNode.connect(this.audioCtx.destination);
          
          this.analyser = this.audioCtx.createAnalyser();
          this.analyser.smoothingTimeConstant = 0.6;
          this.analyser.fftSize = 512;
          this.analyser.connect(scriptProcessorNodes);
          
          this.source.buffer = buffer;
          this.source.connect(this.audioCtx.destination);
          this.source.loop = true;
          this.source.connect(this.analyser);
          
          scriptProcessorNode.onaudioprocess = function(e) {
              audioAnalyserInstance.analyseBoost();
           }

      
    },
    analyseBoost:function(){
      
          /**from https://github.com/srchea/Sound-Visualizer/blob/master/js/audio.js */      
          var audioArray = new Uint8Array(this.analyser.frequencyBinCount);
          
          this.analyser.getByteFrequencyData(audioArray);
          
          this.boost = 0;
          
          for (var i = 0; i < audioArray.length; i++) {
              this.boost += audioArray[i];
           }
          
          this.boost = this.boost / audioArray.length;
    },
    
    /**
     * play music
     */
    play:function(){
        this.loadAudio();
        this.source.start(0);
    }
    
   }