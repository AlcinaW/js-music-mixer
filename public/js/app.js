//Note: run with python -m SimpleHTTPServer to test

//Would it be better to npm the packages for ToneJS in and configure the package.json, 
// or just CDN, or leave files as is


//loading file with XMLHttpRequest
//to-do: what to do about more than one piece
//to-do: re-add sliders

/* Hoist some variables. */
var audio, context;

/* Try instantiating a new AudioContext, throw an error if it fails. */
try {
    /* Setup an AudioContext. */
    context = new AudioContext();
} catch(e) {
    throw new Error('The Web Audio API is unavailable');
}

/* Create a script processor node with a `bufferSize` of 1024. */
var processor = context.createScriptProcessor(1024),
    /* Create an analyser node */
    analyser = context.createAnalyser();

/* Wire the processor into our audio context. */
processor.connect(context.destination);
/* Wire the analyser into the processor */
analyser.connect(processor);

/* Define a Uint8Array to receive the analysers data. */
var data = new Uint8Array(analyser.frequencyBinCount);

/* Define a `Sound` Class */
var Sound = {
    /* Give the sound an element property initially undefined. */
    element: undefined,
    /* Define a class method of play which instantiates a new Media Element
     * Source each time the file plays, once the file has completed disconnect 
     * and destroy the media element source. */
    play: function() {
        var sound = context.createMediaElementSource(this.element);
        this.element.onended = function() {
            sound.disconnect();
            sound = null;
            /* Noop the audioprocess handler when the file finishes. */
            processor.onaudioprocess = function() {};
        }
        /* Add the following line to wire into the analyser. */
        sound.connect(analyser);
        sound.connect(context.destination);

        processor.onaudioprocess = function() {
            /* Populate the data array with the frequency data. */
            data = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteTimeDomainData(data);
        };
        /* Call `play` on the MediaElement. */
        this.element.play();
    }
};

/* Create an async function which returns a promise of a playable audio element. */
function loadAudioElement(url) {
    return new Promise(function(resolve, reject) {
        var audio = new Audio();
        audio.addEventListener('canplay', function() {
            /* Resolve the promise, passing through the element. */
            resolve(audio);
        });
        /* Reject the promise on an error. */
        audio.addEventListener('error', reject);
        audio.src = url;
        audio.crossOrigin = 'anonymous';
    });
}

/* Let's load our file. */
loadAudioElement('../media/Every_Step.mp3').then(function(elem) {
    /* Instantiate the Sound class into our hoisted variable. */
    audio = Object.create(Sound);
    /* Set the element of `audio` to our MediaElement. */
    audio.element = elem;
    /* Immediately play the file. */
    audio.play();
}, function(elem) {
    /* Let's throw an the error from the MediaElement if it fails. */
    throw elem.error;
});
