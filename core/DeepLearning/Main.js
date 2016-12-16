var convnetjs = require("convnetjs");

var layer_defs = [];
// input layer of size 1x1x2 (all volumes are 3D)
layer_defs.push({type:'input', out_sx:1, out_sy:1, out_depth:3});
// some fully connected layers
layer_defs.push({type:'fc', num_neurons:20, activation:'relu'});
layer_defs.push({type:'fc', num_neurons:20, activation:'relu'});
// a softmax classifier predicting probabilities for two classes: 0,1
layer_defs.push({type:'softmax', num_classes:3});

// create a net out of it
var net = new convnetjs.Net();
net.makeLayers(layer_defs);

// the network always works on Vol() elements. These are essentially
// simple wrappers around lists, but also contain gradients and dimensions
// line below will create a 1x1x2 volume and fill it with 0.5 and -1.3
var x = new convnetjs.Vol([1.0, 0.0, 0.0]);
var y = new convnetjs.Vol([0.0, 1.0, 0.0]);
var z = new convnetjs.Vol([0.0, 0.0, 1.0]);


var trainer = new convnetjs.Trainer(net, {learning_rate:0.01, l2_decay:0.001});
for(var i=0 ; i<10 ; i++){
  trainer.train(x, 0);
  trainer.train(y, 1);
  trainer.train(z, 2);
}

var random = [Math.random(), 0, 0];
console.log( "Generate Random Value : " + random[0] + "," + random[1] + "," + random[2] );

var inputVol = new convnetjs.Vol(random);
var probability_volume = net.forward(inputVol);

console.log('probability that input is near X axis : ' + probability_volume.w[0]);
console.log('probability that input is near Y axis : ' + probability_volume.w[1]);
console.log('probability that input is near Z axis : ' + probability_volume.w[2]);
// prints 0.50101
