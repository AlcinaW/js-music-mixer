var synth = new Tone.SimpleSynth();

synth.toMaster();

synth.triggerAttack("C4", time);
synth.triggerRelease(time + 0.25);

synth.triggerAttackRelease("C4", 0.25, time);

var pattern = new Tone.Pattern(function(time, note){
    synth.triggerAttackRelease(note, 0.25);
}, ["C4", "E4", "G4", "A4"]);

//begin at the beginning
pattern.start(0);

Tone.Transport.start();