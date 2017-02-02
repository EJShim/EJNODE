(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ViveController = require('three-vive-controller')(THREE)

function E_Manager()
{
  if ( WEBVR.isAvailable() === false ) {

    document.body.appendChild( WEBVR.getMessage() );

  }

  this.clock = new THREE.Clock();

  this.container = null;
  this.camera = null;
  this.scene = null;
  this.renderer = null;
  this.effect = null;
  this.controls = null;
  this.floor = 0;


  this.skull = null;

  this.controller1 = null;
  this.controller2 = null;

  this.room = null;
  this.pickMesh = null;

  this.Init();
  this.Animate();
}

E_Manager.prototype.Init = function()
{
  this.container = document.createElement( 'div' );
  document.body.appendChild( this.container );

  //Initialize Scene
  this.scene = new THREE.Scene();

  //Initialize Camera
  this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 10 );
  this.scene.add( this.camera );

  var scaleFactor = 3;
  this.floor = -scaleFactor/2

  this.room = new THREE.Mesh(
    new THREE.BoxGeometry( scaleFactor, scaleFactor, scaleFactor, 8, 8, 8 ),
    new THREE.MeshBasicMaterial( { color: 0xffff00, wireframe: true } )
  );
  this.room.position.y = scaleFactor/2 + 0.7;
  this.scene.add( this.room );

  this.scene.add( new THREE.HemisphereLight( 0x606060, 0x404040 ) );

  this.light = new THREE.DirectionalLight( 0xffffff );
  this.scene.add( this.light );

  var geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );

  for(var i=0 ; i<20 ; i++){
    var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );

    object.position.set(Math.random() * scaleFactor + this.floor, this.floor, Math.random() * scaleFactor + this.floor);

    object.rotation.x = Math.random() * 2 * Math.PI;
    object.rotation.y = Math.random() * 2 * Math.PI;
    object.rotation.z = Math.random() * 2 * Math.PI;

    object.scale.x = Math.random() + 0.5;
    object.scale.y = Math.random() + 0.5;
    object.scale.z = Math.random() + 0.5;

    this.room.add( object );
  }



  var that = this;


  this.renderer = new THREE.WebGLRenderer( { antialias: true } );
  this.renderer.setClearColor( 0x000000 );
  this.renderer.setPixelRatio( window.devicePixelRatio );
  this.renderer.setSize( window.innerWidth, window.innerHeight );
  this.renderer.sortObjects = false;
  this.container.appendChild( this.renderer.domElement );

  this.controls = new THREE.VRControls( this.camera );
  this.controls.standing = true;

  // controllers

  this.controller1 = new THREE.ViveController( 0 , this.controls);
  //this.controller1.standingMatrix = this.controls.getStandingMatrix();
  this.scene.add( this.controller1 );
  this.controller1.on(this.controller1.TriggerClicked, () => {
    that.OnTriggerClicked(that.controller1);
  })

  this.controller2 = new THREE.ViveController( 1 , this.controls);
  this.controller2.on(this.controller2.TriggerClicked, () => {
    that.OnTriggerClicked(that.controller2);
  })
  this.scene.add( this.controller2 );


  var loader = new THREE.OBJLoader();
  //loader.setPath( 'models/' );

  var that = this;
  loader.load( 'models/vr_controller_vive_1_5.obj', function ( object ) {

    var loader = new THREE.TextureLoader();

    var controller = object.children[ 0 ];

    controller.material.map = loader.load( 'models/onepointfive_texture.png' );
    controller.material.specularMap = loader.load( 'models/onepointfive_spec.png' );

    that.controller1.add( object.clone() );
    that.controller2.add( object.clone() );

  } );


  var loader = new THREE.OBJLoader();
  //loader.setPath( 'models/' );

  loader.load( 'models/craniopagus_bone.obj', function ( object ) {

    var mesh = object.children[0];


    var geometry = mesh.geometry;
    geometry.computeBoundingBox();
    var centerX = 0.5 * ( geometry.boundingBox.max.x + geometry.boundingBox.min.x );
    var centerY = 0.5 * ( geometry.boundingBox.max.y + geometry.boundingBox.min.y );
    var centerZ = 0.5 * ( geometry.boundingBox.max.z + geometry.boundingBox.min.z );
    console.log(centerX, centerY, centerZ);
    geometry.applyMatrix( new THREE.Matrix4().makeTranslation( -centerX, -centerY, -centerZ) );

    mesh.scale.x = 0.05;
    mesh.scale.y = 0.05;
    mesh.scale.z = 0.05;
    mesh.material = new THREE.MeshPhongMaterial({color:0xaaaaaa, side:THREE.DoubleSide});

    that.controller2.add(mesh);

    var sphereGeo = new THREE.SphereGeometry( 0.1, 32, 32 );
    var sphereMat = new THREE.MeshBasicMaterial( {color: 0xff0000, side:THREE.DoubleSide} );
    var sphere = new THREE.Mesh(sphereGeo, sphereMat );

    that.controller1.add(sphere);
    that.pickMesh = sphere;
  } );



  this.effect = new THREE.VREffect( this.renderer );

  if ( WEBVR.isAvailable() === true ) {

    document.body.appendChild( WEBVR.getButton( this.effect ) );

  }


  //SkyBox
  // var imagePrefix = "../images/ame_nebula/purplenebula_";
  // var directions  = ["bk", "dn", "ft", "lf", "rt", "up"];
  // var imageSuffix = ".jpg";

  var path = "../images/ame_nebula/purplenebula_";
  var format = '.jpg';
  var urls = [
      path + 'bk' + format, path + 'dn' + format,
      path + 'ft' + format, path + 'lf' + format,
      path + 'rt' + format, path + 'up' + format
    ];
  var textureCube = new THREE.CubeTextureLoader().load( urls );
  textureCube.format = THREE.RGBFormat;
  this.room.material.texture = textureCube;

  window.addEventListener( 'resize', this.onWindowResize.bind(this), false );
}

E_Manager.prototype.Animate = function()
{
  this.effect.requestAnimationFrame( this.Animate.bind(this) );
  this.render();
}

E_Manager.prototype.UpdateController = function()
{
  this.controller1.update();
  this.controller2.update();
}

E_Manager.prototype.OnTriggerClicked = function( controller )
{
  if(controller.children.length > 1){
    controller.children[1].material.color = new THREE.Color(Math.random(), Math.random(), Math.random());
  }

  if(controller === this.controller1){
    if(controller.children.length > 1){
      controller.remove(this.pickMesh);
      this.scene.add(this.pickMesh);
    }else{
      this.scene.remove(this.pickMesh);
      controller.add(this.pickMesh);
    }
  }


}

E_Manager.prototype.render = function()
{
      var delta = this.clock.getDelta() * 60;


      this.UpdateController();


      this.controls.update();


      var pos = this.camera.position;
      this.light.position.set(pos.x, pos.y, pos.z);

      if(this.skull !== null)
      {
        this.skull.rotation.y += 0.01;
      }



      this.effect.render( this.scene, this.camera );
}

E_Manager.prototype.onWindowResize = function()
{

      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();

      this.effect.setSize( window.innerWidth, window.innerHeight );
}

module.exports = E_Manager;

},{"three-vive-controller":5}],2:[function(require,module,exports){
var E_Manager = require("./E_Manager.js");


var Manager = new E_Manager();

},{"./E_Manager.js":1}],3:[function(require,module,exports){
'use strict';

var has = Object.prototype.hasOwnProperty;

//
// We store our EE objects in a plain object whose properties are event names.
// If `Object.create(null)` is not supported we prefix the event names with a
// `~` to make sure that the built-in object properties are not overridden or
// used as an attack vector.
// We also assume that `Object.create(null)` is available when the event name
// is an ES6 Symbol.
//
var prefix = typeof Object.create !== 'function' ? '~' : false;

/**
 * Representation of a single EventEmitter function.
 *
 * @param {Function} fn Event handler to be called.
 * @param {Mixed} context Context for function execution.
 * @param {Boolean} [once=false] Only emit once
 * @api private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Minimal EventEmitter interface that is molded against the Node.js
 * EventEmitter interface.
 *
 * @constructor
 * @api public
 */
function EventEmitter() { /* Nothing to set */ }

/**
 * Hold the assigned EventEmitters by name.
 *
 * @type {Object}
 * @private
 */
EventEmitter.prototype._events = undefined;

/**
 * Return an array listing the events for which the emitter has registered
 * listeners.
 *
 * @returns {Array}
 * @api public
 */
EventEmitter.prototype.eventNames = function eventNames() {
  var events = this._events
    , names = []
    , name;

  if (!events) return names;

  for (name in events) {
    if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
  }

  if (Object.getOwnPropertySymbols) {
    return names.concat(Object.getOwnPropertySymbols(events));
  }

  return names;
};

/**
 * Return a list of assigned event listeners.
 *
 * @param {String} event The events that should be listed.
 * @param {Boolean} exists We only need to know if there are listeners.
 * @returns {Array|Boolean}
 * @api public
 */
EventEmitter.prototype.listeners = function listeners(event, exists) {
  var evt = prefix ? prefix + event : event
    , available = this._events && this._events[evt];

  if (exists) return !!available;
  if (!available) return [];
  if (available.fn) return [available.fn];

  for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
    ee[i] = available[i].fn;
  }

  return ee;
};

/**
 * Emit an event to all registered event listeners.
 *
 * @param {String} event The name of the event.
 * @returns {Boolean} Indication if we've emitted an event.
 * @api public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) return false;

  var listeners = this._events[evt]
    , len = arguments.length
    , args
    , i;

  if ('function' === typeof listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Register a new EventListener for the given event.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} [context=this] The context of the function.
 * @api public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  var listener = new EE(fn, context || this)
    , evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;
  else {
    if (!this._events[evt].fn) this._events[evt].push(listener);
    else this._events[evt] = [
      this._events[evt], listener
    ];
  }

  return this;
};

/**
 * Add an EventListener that's only called once.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} [context=this] The context of the function.
 * @api public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  var listener = new EE(fn, context || this, true)
    , evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;
  else {
    if (!this._events[evt].fn) this._events[evt].push(listener);
    else this._events[evt] = [
      this._events[evt], listener
    ];
  }

  return this;
};

/**
 * Remove event listeners.
 *
 * @param {String} event The event we want to remove.
 * @param {Function} fn The listener that we need to find.
 * @param {Mixed} context Only remove listeners matching this context.
 * @param {Boolean} once Only remove once listeners.
 * @api public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) return this;

  var listeners = this._events[evt]
    , events = [];

  if (fn) {
    if (listeners.fn) {
      if (
           listeners.fn !== fn
        || (once && !listeners.once)
        || (context && listeners.context !== context)
      ) {
        events.push(listeners);
      }
    } else {
      for (var i = 0, length = listeners.length; i < length; i++) {
        if (
             listeners[i].fn !== fn
          || (once && !listeners[i].once)
          || (context && listeners[i].context !== context)
        ) {
          events.push(listeners[i]);
        }
      }
    }
  }

  //
  // Reset the array, or remove it completely if we have no more listeners.
  //
  if (events.length) {
    this._events[evt] = events.length === 1 ? events[0] : events;
  } else {
    delete this._events[evt];
  }

  return this;
};

/**
 * Remove all listeners or only the listeners for the specified event.
 *
 * @param {String} event The event want to remove all listeners for.
 * @api public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  if (!this._events) return this;

  if (event) delete this._events[prefix ? prefix + event : event];
  else this._events = prefix ? {} : Object.create(null);

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// This function doesn't apply anymore.
//
EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
  return this;
};

//
// Expose the prefix.
//
EventEmitter.prefixed = prefix;

//
// Expose the module.
//
if ('undefined' !== typeof module) {
  module.exports = EventEmitter;
}

},{}],4:[function(require,module,exports){
'use strict';

module.exports = function (THREE) {

  /**
   * @author mrdoob / http://mrdoob.com/
   */
  THREE.OBJLoader = function (manager) {

    this.manager = manager !== undefined ? manager : THREE.DefaultLoadingManager;
  };

  THREE.OBJLoader.prototype = {

    constructor: THREE.OBJLoader,

    load: function load(url, onLoad, onProgress, onError) {

      var scope = this;

      var loader = new THREE.XHRLoader(scope.manager);
      loader.load(url, function (text) {

        onLoad(scope.parse(text));
      }, onProgress, onError);
    },

    parse: function parse(text) {

      console.time('OBJLoader');

      var object,
          objects = [];
      var geometry, material;

      function parseVertexIndex(value) {

        var index = parseInt(value);

        return (index >= 0 ? index - 1 : index + vertices.length / 3) * 3;
      }

      function parseNormalIndex(value) {

        var index = parseInt(value);

        return (index >= 0 ? index - 1 : index + normals.length / 3) * 3;
      }

      function parseUVIndex(value) {

        var index = parseInt(value);

        return (index >= 0 ? index - 1 : index + uvs.length / 2) * 2;
      }

      function addVertex(a, b, c) {

        geometry.vertices.push(vertices[a], vertices[a + 1], vertices[a + 2], vertices[b], vertices[b + 1], vertices[b + 2], vertices[c], vertices[c + 1], vertices[c + 2]);
      }

      function addNormal(a, b, c) {

        geometry.normals.push(normals[a], normals[a + 1], normals[a + 2], normals[b], normals[b + 1], normals[b + 2], normals[c], normals[c + 1], normals[c + 2]);
      }

      function addUV(a, b, c) {

        geometry.uvs.push(uvs[a], uvs[a + 1], uvs[b], uvs[b + 1], uvs[c], uvs[c + 1]);
      }

      function addFace(a, b, c, d, ua, ub, uc, ud, na, nb, nc, nd) {

        var ia = parseVertexIndex(a);
        var ib = parseVertexIndex(b);
        var ic = parseVertexIndex(c);
        var id;

        if (d === undefined) {

          addVertex(ia, ib, ic);
        } else {

          id = parseVertexIndex(d);

          addVertex(ia, ib, id);
          addVertex(ib, ic, id);
        }

        if (ua !== undefined) {

          ia = parseUVIndex(ua);
          ib = parseUVIndex(ub);
          ic = parseUVIndex(uc);

          if (d === undefined) {

            addUV(ia, ib, ic);
          } else {

            id = parseUVIndex(ud);

            addUV(ia, ib, id);
            addUV(ib, ic, id);
          }
        }

        if (na !== undefined) {

          ia = parseNormalIndex(na);
          ib = parseNormalIndex(nb);
          ic = parseNormalIndex(nc);

          if (d === undefined) {

            addNormal(ia, ib, ic);
          } else {

            id = parseNormalIndex(nd);

            addNormal(ia, ib, id);
            addNormal(ib, ic, id);
          }
        }
      }

      // create mesh if no objects in text

      if (/^o /gm.test(text) === false) {

        geometry = {
          vertices: [],
          normals: [],
          uvs: []
        };

        material = {
          name: ''
        };

        object = {
          name: '',
          geometry: geometry,
          material: material
        };

        objects.push(object);
      }

      var vertices = [];
      var normals = [];
      var uvs = [];

      // v float float float

      var vertex_pattern = /v( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/;

      // vn float float float

      var normal_pattern = /vn( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/;

      // vt float float

      var uv_pattern = /vt( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/;

      // f vertex vertex vertex ...

      var face_pattern1 = /f( +-?\d+)( +-?\d+)( +-?\d+)( +-?\d+)?/;

      // f vertex/uv vertex/uv vertex/uv ...

      var face_pattern2 = /f( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))?/;

      // f vertex/uv/normal vertex/uv/normal vertex/uv/normal ...

      var face_pattern3 = /f( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))?/;

      // f vertex//normal vertex//normal vertex//normal ...

      var face_pattern4 = /f( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))?/;

      //

      var lines = text.split('\n');

      for (var i = 0; i < lines.length; i++) {

        var line = lines[i];
        line = line.trim();

        var result;

        if (line.length === 0 || line.charAt(0) === '#') {

          continue;
        } else if ((result = vertex_pattern.exec(line)) !== null) {

          // ["v 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

          vertices.push(parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3]));
        } else if ((result = normal_pattern.exec(line)) !== null) {

          // ["vn 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

          normals.push(parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3]));
        } else if ((result = uv_pattern.exec(line)) !== null) {

          // ["vt 0.1 0.2", "0.1", "0.2"]

          uvs.push(parseFloat(result[1]), parseFloat(result[2]));
        } else if ((result = face_pattern1.exec(line)) !== null) {

          // ["f 1 2 3", "1", "2", "3", undefined]

          addFace(result[1], result[2], result[3], result[4]);
        } else if ((result = face_pattern2.exec(line)) !== null) {

          // ["f 1/1 2/2 3/3", " 1/1", "1", "1", " 2/2", "2", "2", " 3/3", "3", "3", undefined, undefined, undefined]

          addFace(result[2], result[5], result[8], result[11], result[3], result[6], result[9], result[12]);
        } else if ((result = face_pattern3.exec(line)) !== null) {

          // ["f 1/1/1 2/2/2 3/3/3", " 1/1/1", "1", "1", "1", " 2/2/2", "2", "2", "2", " 3/3/3", "3", "3", "3", undefined, undefined, undefined, undefined]

          addFace(result[2], result[6], result[10], result[14], result[3], result[7], result[11], result[15], result[4], result[8], result[12], result[16]);
        } else if ((result = face_pattern4.exec(line)) !== null) {

          // ["f 1//1 2//2 3//3", " 1//1", "1", "1", " 2//2", "2", "2", " 3//3", "3", "3", undefined, undefined, undefined]

          addFace(result[2], result[5], result[8], result[11], undefined, undefined, undefined, undefined, result[3], result[6], result[9], result[12]);
        } else if (/^o /.test(line)) {

          geometry = {
            vertices: [],
            normals: [],
            uvs: []
          };

          material = {
            name: ''
          };

          object = {
            name: line.substring(2).trim(),
            geometry: geometry,
            material: material
          };

          objects.push(object);
        } else if (/^g /.test(line)) {

          // group

        } else if (/^usemtl /.test(line)) {

            // material

            material.name = line.substring(7).trim();
          } else if (/^mtllib /.test(line)) {

            // mtl file

          } else if (/^s /.test(line)) {

              // smooth shading

            } else {

                // console.log( "THREE.OBJLoader: Unhandled line " + line );

              }
      }

      var container = new THREE.Object3D();
      var l;

      for (i = 0, l = objects.length; i < l; i++) {

        object = objects[i];
        geometry = object.geometry;

        var buffergeometry = new THREE.BufferGeometry();

        buffergeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(geometry.vertices), 3));

        if (geometry.normals.length > 0) {

          buffergeometry.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(geometry.normals), 3));
        }

        if (geometry.uvs.length > 0) {

          buffergeometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(geometry.uvs), 2));
        }

        material = new THREE.MeshLambertMaterial({
          color: 0xff0000
        });
        material.name = object.material.name;

        var mesh = new THREE.Mesh(buffergeometry, material);
        mesh.name = object.name;

        container.add(mesh);
      }

      console.timeEnd('OBJLoader');

      return container;
    }

  };
};
},{}],5:[function(require,module,exports){
var EventEmitter = require('eventemitter3');
var extend = require('./util/extend')
module.exports = function(THREE, packageRoot) {
    packageRoot = packageRoot || "/node_modules/three-vive-controller/"

    var OBJLoader = require('three-obj-loader')
    OBJLoader(THREE)

    THREE.ViveController = function(controllerId, vrControls, startUpdating) {
        
        if (startUpdating === undefined) {
            startUpdating = true;
        }

        THREE.Object3D.call(this);
        extend(this, new EventEmitter)

        this.PadTouched = "PadTouched"
        this.PadUntouched = "PadUntouched"
        this.PadPressed = "PadPressed"
        this.PadUnpressed = "PadUnpressed"
        this.TriggerClicked = "TriggerClicked"
        this.TriggerUnclicked = "TriggerUnclicked"
        this.MenuClicked = "MenuClicked"
        this.MenuUnclicked = "MenuUnclicked"
        this.Gripped = "Gripped"
        this.Ungripped = "Ungripped"
        this.PadDragged = "PadDragged"
        this.MenuPressed = "MenuPressed"
        this.MenuUnpressed = "MenuUnpressed"
        this.Connected = "Connected"
        this.Disconnected = "Disconnected"

        this.matrixAutoUpdate = false;
        this.standingMatrix = vrControls.getStandingMatrix()

        this.padTouched = false
        this.connected = false
        this.tracked = false
        this.lastPosePosition = [0, 0, 0]
        this.lastPoseOrientation = [0, 0, 0, 1]

        var lastPadPosition = {
            x: 0,
            y: 0
        }

        var vivePath = packageRoot + 'assets/vr_controller_vive_1_5.obj'
        var loader = new THREE.OBJLoader()
        loader.load(vivePath, function(object) {
            var loader = new THREE.TextureLoader()
            model = object.children[0]
            model.material.map = loader.load(packageRoot + 'assets/onepointfive_texture.png')
            model.material.specularMap = loader.load(packageRoot + 'assets/onepointfive_spec.png')
            model.material.color = new THREE.Color(1, 1, 1)
            this.add(object)
        }.bind(this))

        var bindButton = function (eventOnKey, eventOffKey, button, type) {
          var propertyName = eventOnKey[0].toLowerCase() + eventOnKey.substring(1)
          var wasActive = this[propertyName]
          this[propertyName] = button[type]
          if (!wasActive && button[type]) {
            this.emit(eventOnKey)
          } else if (wasActive && !button[type]) {
            this.emit(eventOffKey)
          }
        }.bind(this)

        this.update = function() {
            var gamepad = navigator.getGamepads()[controllerId];
            if (gamepad && gamepad.pose) {
                this.visible = true;

                var padButton = gamepad.buttons[0]
                var triggerButton = gamepad.buttons[1]
                var gripButton = gamepad.buttons[2]
                var menuButton = gamepad.buttons[3]

                if (!this.connected) this.emit(this.Connected)

                var pose = gamepad.pose;

                if(pose.position && pose.orientation) {
                    this.tracked = true
                    this.lastPosePosition = pose.position
                    this.lastPoseOrientation = pose.orientation
                }
                else {
                    this.tracked = false
                }

                this.position.fromArray(this.lastPosePosition)
                this.quaternion.fromArray(this.lastPoseOrientation)
                this.matrix.compose(this.position, this.quaternion, this.scale)
                this.matrix.multiplyMatrices(this.standingMatrix, this.matrix)
                this.matrixWorldNeedsUpdate = true


                bindButton(this.PadTouched, this.PadUntouched, padButton, "touched")
                bindButton(this.PadPressed, this.PadUnpressed, padButton, "pressed")
                bindButton(this.MenuPressed, this.MenuUnpressed, menuButton, "pressed")
                bindButton(this.Gripped, this.Ungripped, gripButton, "pressed")

                var wasTriggerClicked = this.triggerClicked
                this.triggerClicked = triggerButton.value == 1
                if (!wasTriggerClicked && this.triggerClicked) {
                    this.emit(this.TriggerClicked)
                }
                if (wasTriggerClicked && !this.triggerClicked) {
                    this.emit(this.TriggerUnclicked)
                }
                this.triggerLevel = triggerButton.value

                this.padX = gamepad.axes[0]
                this.padY = gamepad.axes[1]

                if (this.padTouched && this.listeners(this.PadDragged) && lastPadPosition.x != null) {
                    var dx = this.padX - lastPadPosition.x
                    var dy = this.padY - lastPadPosition.y
                    this.emit(this.PadDragged, dx, dy)
                }

                if (this.padTouched) {
                    lastPadPosition.x = this.padX
                    lastPadPosition.y = this.padY
                } else {
                    lastPadPosition.x = null
                    lastPadPosition.y = null
                }


            } else {
                this.visible = false;
            }
            this.connected = !!gamepad

        }
        
        this.startUpdating = function() {
            this.update();
            requestAnimationFrame(this.startUpdating);
        }.bind(this)
        
        if (startUpdating) {
            this.startUpdating();
        }

    };

    THREE.ViveController.prototype = Object.create(THREE.Object3D.prototype);
    THREE.ViveController.prototype.constructor = THREE.ViveController;
    return THREE.ViveController;
}

},{"./util/extend":6,"eventemitter3":3,"three-obj-loader":4}],6:[function(require,module,exports){
module.exports = function(object, extension) {
    for (var key in extension) {
        object[key] = extension[key];
    }
}

},{}]},{},[2]);
