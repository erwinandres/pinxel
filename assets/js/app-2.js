"use strict";

// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.com/#x15.4.4.18
if (!Array.prototype.forEach) {

  Array.prototype.forEach = function forEach(callback, thisArg) {
    'use strict';
    var T, k;

    if (this == null) {
      throw new TypeError("this is null or not defined");
    }

    var kValue,
        // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
        O = Object(this),

        // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
        // 3. Let len be ToUint32(lenValue).
        len = O.length >>> 0; // Hack to convert O.length to a UInt32

    // 4. If IsCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if ({}.toString.call(callback) !== "[object Function]") {
      throw new TypeError(callback + " is not a function");
    }

    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    if (arguments.length >= 2) {
      T = thisArg;
    }

    // 6. Let k be 0
    k = 0;

    // 7. Repeat, while k < len
    while (k < len) {

      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {

        // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
        kValue = O[k];

        // ii. Call the Call internal method of callback with T as the this value and
        // argument list containing kValue, k, and O.
        callback.call(T, kValue, k, O);
      }
      // d. Increase k by 1.
      k++;
    }
    // 8. return undefined
  };
}

if (!Array.prototype.findIndex) {
  Array.prototype.findIndex = function(predicate) {
    if (this === null) {
      throw new TypeError('Array.prototype.findIndex called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return i;
      }
    }
    return -1;
  };
}

var view  = document.getElementById('view');
var canvasWrapper = document.getElementById('canvas-wrapper');
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var buttonsContainer = document.getElementById('buttons');
var finishButton = document.getElementById('finish');
var finishHolder = document.getElementById('finish-holder');
var backButton = document.getElementById('back');

var spriteLoaded = false;
var touchedObject = -1;
var selectedObject = null;
var objectsOnCanvas = [];

var scale = 1;

var cursorStartX = null;
var cursorStartY = null;
var objStartX = null;
var objStartY = null;

function Filters() {
	var filterValues = {
		'brigthness': 100,
		'contrast': 100,
		'grayscale': 0,
		'hue-rotate': 0,
		'saturate': 100,
		'sepia': 0
	}

	this.get = function(filter) {
		return filterValues[filter];
	}

	this.getAll = function() {
		return filterValues;
	}

	this.set = function() {
		filterValues['brigthness'] = getRandomInt(40, 100);
		filterValues['contrast'] = getRandomInt(40, 100);
		filterValues['grayscale'] = getRandomInt(0, 100);
		filterValues['hue-rotate'] = getRandomInt(0, 359);
		filterValues['saturate'] = getRandomInt(0, 200);
		filterValues['sepia'] = getRandomInt(0, 100);
	}

	this.apply = function(context) {
		context.filter = 'brightness(' + filterValues['brigthness'] + '%) contrast(' +  filterValues['contrast'] + '%) grayScale(' + filterValues['grayscale'] +'%) hue-rotate(' + filterValues['hue-rotate'] + 'deg) saturate(' + filterValues['saturate'] + '%) sepia(' + filterValues['sepia'] + '%)';
	}

	function setFilter(filter) {
		return filter + '(' + filterValues[filter] + '%)';
	}
}

var filters = new Filters();
var sprite = new Image();

sprite.onload = function() {
	bgSound.play();

	spriteLoaded = true;

	handleResize();

	filters.set();
	draw();
	createObjectsButtons();
}

sprite.src = '/assets/img/sprite/lennon.png';

const spriteMap = [
	[0, 0, 734, 618],
	[734, 0, 310, 56],
	[734, 56, 310, 56],
	[734, 120, 310, 56],
	[734, 186, 310, 56],
	[734, 266, 310, 56],
	[1041, 56, 95, 65],
	[1041, 120, 95, 65],
	[1041, 186, 97, 78],
	[1140, 56, 97, 62],
	[1140, 120, 97, 62],
	[1140, 186, 97, 62],
	[1236, 56, 101, 61],
	[1236, 120, 101, 61],
	[1236, 186, 101, 61],
	[1334, 0, 277, 579],
	[1613, 0, 346, 280],
	[1962, 0, 353, 264],
	[2312, 0, 178, 125],
	[2490, 0, 165, 120],
	[2651, 0, 143, 120],
];

const bgSound = new Howl({
	src: ['/assets/sounds/background1.wav'],
	loop: true
});

const clickSounds = [
	new Howl({src: '/assets/sounds/clickrelexivo.wav'}),
	new Howl({src: '/assets/sounds/clickondulado2.wav'}),
	new Howl({src: '/assets/sounds/clickfunny.wav'}),
	new Howl({src: '/assets/sounds/clickjuego.wav'}),
	new Howl({src: '/assets/sounds/clickloco.wav'}),
	new Howl({src: '/assets/sounds/clickmisterio.wav'}),
	new Howl({src: '/assets/sounds/clickpunti.wav'}),
	new Howl({src: '/assets/sounds/clickpuntihip.wav'}),
];

function createObjectsButtons() {
	if (!spriteLoaded) return;

	spriteMap.forEach((obj, i) => {
		if (i === 0) return;

		const newSizes = getNewSizes(...obj);
		const button = document.createElement('button');

		button.className = 'itemButton';

		button.style.backgroundImage = 'url(/assets/img/sprite/lennon.png)';
		button.style.width = newSizes.tileW + 'px';
		button.style.height = newSizes.tileH + 'px';
		button.style.backgroundPosition = '-' + newSizes.tileX + 'px -' + newSizes.tileY + 'px';
		button.style.backgroundSize = newSizes.spriteW + 'px ' + newSizes.spriteH + 'px';

		button.dataset.objectId = i;
		button.innerHTML = 'Item ' + i;
		button.addEventListener('click', toogleObject);

		buttonsContainer.appendChild(button);
	});

	function getNewSizes(x, y, w, h) {
		var maxWidth = 64;
		var maxHeight = 64;

		var diff;
		var newSpriteWidth = sprite.width;
		var newSpriteHeight = sprite.height;
		var newPosX = x;
		var newPosY = y;

		/*if (w > maxWidth) {
			diff = maxWidth / w;
			w = maxWidth;
			newSpriteWidth = sprite.width * diff;
			newSpriteHeight = sprite.height * diff;
		}*/

		if (h > maxHeight) {
			diff = maxHeight / h;
			h = maxHeight;
			w = w * diff;
			newSpriteWidth = sprite.width * diff;
			newSpriteHeight = sprite.height * diff;
			newPosX = Math.floor(x * diff);
			newPosY = Math.floor(y * diff);
		}

		return {
			tileW: Math.floor(w),
			tileH: Math.floor(h),
			spriteW: Math.floor(newSpriteWidth),
			spriteH: Math.floor(newSpriteHeight),
			tileX: newPosX,
			tileY: newPosY
		};
	}
}

function toogleObject() {
	var id = Number(this.dataset.objectId);
	var item = spriteMap[id];
	var onCanvas = objectsOnCanvas.findIndex(obj => obj.id === id);

	if (onCanvas >= 0) {
		objectsOnCanvas.splice(onCanvas, 1);
		this.classList.remove('itemButton-active');
	} else {
		objectsOnCanvas.push({
			id,
			sprite: item,
			x: canvas.width/2,
			y: canvas.height/2
		});

		this.classList.add('itemButton-active');
	}

	draw();
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function handleResize() {
	/*
		Redimensionar canvas al cargar DOM.
		Obtener ratio del canvas redimensionado.
		Obtener ratio de la imagen
		Escala es igual a ancho del canvas entre ancho de imagen
		Si ratio del canvas es mayo a ratio de imagen, entonces
		escala es igual a alto del canvas entre alto de imagen.
	*/

	canvas.width = canvasWrapper.clientWidth;
	canvas.height = canvasWrapper.clientHeight;

	var canvasRatio = canvas.width / canvas.height;
	var bgRatio = spriteMap[0][2] / spriteMap[0][3];

	scale = canvas.width / spriteMap[0][2];

	if (canvasRatio > bgRatio) {
		scale = canvas.height / spriteMap[0][3];
	}
}

function paintBg() {
	if (!spriteLoaded) return;

	var s = spriteMap[0];

	var xCenter = Math.floor(canvas.width / 2 - (s[2] * scale) / 2);
	var yCenter = Math.floor(canvas.height / 2 - (s[3] * scale) / 2);

	ctx.drawImage(sprite, ...s, xCenter, yCenter, s[2] * scale, s[3] * scale);
}

function paintObjects() {
	if (!spriteLoaded) return;

	objectsOnCanvas.forEach(s => {
		var xPos = s.x - Math.floor((s.sprite[2] * scale)/2);
		var yPos = s.y - Math.floor((s.sprite[3] * scale)/2);

		ctx.drawImage(sprite, ...s.sprite, xPos, yPos, s.sprite[2] * scale, s.sprite[3] * scale);
	});
}

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	//filters.apply(ctx);
	paintBg();
	paintObjects();
}

function indexOfSelectedObject(coords) {
  for (var i = objectsOnCanvas.length - 1; i >= 0; i--) {
    var obj = objectsOnCanvas[i];

	var objLeft = obj.x - (obj.sprite[2] * scale/2);
	var objRight = obj.x + (obj.sprite[2] * scale/2);
	var objTop = obj.y - (obj.sprite[3] * scale/2);
	var objBottom = obj.y + (obj.sprite[3] * scale/2);

    // DEBUGGING
    //ctx.strokeRect(objLeft, objTop, objRight-objLeft, objBottom-objTop);

    if (coords.x >= objLeft && coords.x <= objRight && coords.y >= objTop && coords.y <= objBottom) {
      return i;
    }
  }

  return -1;
}

function onTouchStartOrMouseDown(e) {
  e.preventDefault();

  var touch = e.changedTouches && e.changedTouches.length ? e.changedTouches[0] : null;
  var coords = touch ? { x: touch.pageX - canvas.offsetLeft, y: touch.pageY - canvas.offsetTop} : { x: e.offsetX, y: e.offsetY};

  cursorStartX = coords.x;
  cursorStartY = coords.y;

  touchedObject = indexOfSelectedObject(coords);

  if (touchedObject > -1) {
  	var soundIndex = touchedObject > 7 ? touchedObject % 8 : touchedObject;
	
	clickSounds[soundIndex].play();

  	objStartX = objectsOnCanvas[touchedObject].x;
  	objStartY = objectsOnCanvas[touchedObject].y;


    return;
  }
}

function onTouchMoveOrMouseMove(e) {
  e.preventDefault();

  var touches = e.changedTouches || [];
  var touch1 = touches.length ? touches[0] : null;
  var touch2 = touches.length > 1 ? touches[1] : null;

  var coords = touch1 ? { x: touch1.pageX - canvas.offsetLeft, y: touch1.pageY - canvas.offsetTop} : { x: e.offsetX, y: e.offsetY};

  if (touchedObject >= 0) {
    var obj = objectsOnCanvas[touchedObject];

	obj.x = objStartX - (cursorStartX - coords.x);
	obj.y = objStartY - (cursorStartY - coords.y);

	draw();
  }
}

function onTouchEndOrMouseUp(e) {
	if (touchedObject > -1) {
		var soundIndex = touchedObject > 7 ? touchedObject % 8 : touchedObject;
  		clickSounds[soundIndex].stop();
  		touchedObject = -1;
	}
  	cursorStartX = null;
  	cursorStartY = null;
  	objStartX = null;
  	objStartY = null;
}

function finish() {
	var imageData = canvas.toDataURL();
	var image = new Image();
	image.src = imageData;

	finishHolder.appendChild(image);
	view.classList.add('view-result');
}

function backToEdit() {
	finishHolder.innerHTML = '';
	view.classList.remove('view-result');
}

finishButton.addEventListener('click', finish);
back.addEventListener('click', backToEdit);

canvas.addEventListener('touchstart', onTouchStartOrMouseDown, false);
canvas.addEventListener('touchmove', onTouchMoveOrMouseMove, false);
canvas.addEventListener('touchend', onTouchEndOrMouseUp, false);

canvas.addEventListener('mousedown', onTouchStartOrMouseDown, false);
canvas.addEventListener('mousemove', onTouchMoveOrMouseMove, false);
canvas.addEventListener('mouseup', onTouchEndOrMouseUp, false);

window.addEventListener('resize', function() {
	handleResize();
	draw();
}, false);