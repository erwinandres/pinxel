"use strict";

const view  = document.getElementById('view');
const canvasWrapper = document.getElementById('canvas-wrapper');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const buttonsContainer = document.getElementById('buttons');
const finishButton = document.getElementById('finish');
const finishHolder = document.getElementById('finish-holder');
const backButton = document.getElementById('back');

let spriteLoaded = false;
let touchedObject = -1;
let selectedObject = null;
let objectsOnCanvas = [];

let scale = 1;

let cursorStartX = null;
let cursorStartY = null;
let objStartX = null;
let objStartY = null;

function Filters() {
	const filterValues = {
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
		context.filter = `
			brightness(${filterValues['brigthness']}%)
			contrast(${filterValues['contrast']}%)
			grayScale(${filterValues['grayscale']}%)
			hue-rotate(${filterValues['hue-rotate']}deg)
			saturate(${filterValues['saturate']}%)
			sepia(${filterValues['sepia']}%)
		`;
	}
}

const filters = new Filters();
const sprite = new Image();

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
		button.style.width = `${newSizes.tileW}px`;
		button.style.height = `${newSizes.tileH}px`;
		button.style.backgroundPosition = `-${newSizes.tileX}px -${newSizes.tileY}px`;
		button.style.backgroundSize = `${newSizes.spriteW}px ${newSizes.spriteH}px`

		button.dataset.objectId = i;
		button.innerHTML = `Item ${i}`;
		button.addEventListener('click', toogleObject);

		buttonsContainer.appendChild(button);
	});

	function getNewSizes(x, y, w, h) {
		const maxWidth = 64;
		const maxHeight = 64;

		let diff;
		let newSpriteWidth = sprite.width;
		let newSpriteHeight = sprite.height;
		let newPosX = x;
		let newPosY = y;

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
	const id = Number(this.dataset.objectId);
	const item = spriteMap[id];
	const onCanvas = objectsOnCanvas.findIndex(obj => obj.id === id);

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

	const canvasRatio = canvas.width / canvas.height;
	const bgRatio = spriteMap[0][2] / spriteMap[0][3];

	scale = canvas.width / spriteMap[0][2];

	if (canvasRatio > bgRatio) {
		scale = canvas.height / spriteMap[0][3];
	}
}

function paintBg() {
	if (!spriteLoaded) return;

	const s = spriteMap[0];

	const xCenter = Math.floor(canvas.width / 2 - (s[2] * scale) / 2);
	const yCenter = Math.floor(canvas.height / 2 - (s[3] * scale) / 2);

	ctx.drawImage(sprite, ...s, xCenter, yCenter, s[2] * scale, s[3] * scale);
}

function paintObjects() {
	if (!spriteLoaded) return;

	objectsOnCanvas.forEach(s => {
		const xPos = s.x - Math.floor((s.sprite[2] * scale)/2);
		const yPos = s.y - Math.floor((s.sprite[3] * scale)/2);

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
  for (let i = objectsOnCanvas.length - 1; i >= 0; i--) {
    let obj = objectsOnCanvas[i];

	let objLeft = obj.x - (obj.sprite[2] * scale/2);
	let objRight = obj.x + (obj.sprite[2] * scale/2);
	let objTop = obj.y - (obj.sprite[3] * scale/2);
	let objBottom = obj.y + (obj.sprite[3] * scale/2);

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

  const touch = e.changedTouches && e.changedTouches.length ? e.changedTouches[0] : null;
  const coords = touch ? { x: touch.pageX - canvas.offsetLeft, y: touch.pageY - canvas.offsetTop} : { x: e.offsetX, y: e.offsetY};

  cursorStartX = coords.x;
  cursorStartY = coords.y;

  touchedObject = indexOfSelectedObject(coords);

  if (touchedObject > -1) {
  	let soundIndex = touchedObject > 7 ? touchedObject % 8 : touchedObject;
	
	clickSounds[soundIndex].play();

  	objStartX = objectsOnCanvas[touchedObject].x;
  	objStartY = objectsOnCanvas[touchedObject].y;


    return;
  }
}

function onTouchMoveOrMouseMove(e) {
  e.preventDefault();

  const touches = e.changedTouches || [];
  const touch1 = touches.length ? touches[0] : null;
  const touch2 = touches.length > 1 ? touches[1] : null;

  const coords = touch1 ? { x: touch1.pageX - canvas.offsetLeft, y: touch1.pageY - canvas.offsetTop} : { x: e.offsetX, y: e.offsetY};

  if (touchedObject >= 0) {
    const obj = objectsOnCanvas[touchedObject];

	obj.x = objStartX - (cursorStartX - coords.x);
	obj.y = objStartY - (cursorStartY - coords.y);

	draw();
  }
}

function onTouchEndOrMouseUp(e) {
	if (touchedObject > -1) {
		let soundIndex = touchedObject > 7 ? touchedObject % 8 : touchedObject;
  		clickSounds[soundIndex].stop();
  		touchedObject = -1;
	}
  	cursorStartX = null;
  	cursorStartY = null;
  	objStartX = null;
  	objStartY = null;
}

function finish() {
	const imageData = canvas.toDataURL();
	const image = new Image();
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