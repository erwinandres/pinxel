var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var canvasWrapper = document.getElementById('canvas-wrapper');

var image = new Image();
var imageLoaded = false;
var pinxelActive = false;

image.onload = function() {
	canvas.width = image.width;
	if (canvas.width > 730) {
		canvas.width = 730;
	}

	var ratio = image.width/canvas.width;

	canvas.height = image.height / ratio;

	image.width = canvas.width;
	image.height = canvas.height;

	drawImage();

	imageLoaded = true;
}

image.src = IMAGE_URL;

function drawImage() {
	ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
}

function pinxel() {
	if (!imageLoaded) return;
	if (!pinxelActive) {
		drawImage();
		return;
	};

	// get a block size (see demo for this approach)
	var size = 40;

	setInterval(function() {
		if (size <= 10) return;

		size -= 10;
		console.log(size);
		var w = canvas.width * (size/100);
		var h = canvas.height * (size/100);

		// draw the original image at a fraction of the final size
		ctx.drawImage(image, 0, 0, w, h);

		// turn off image aliasing
		ctx.msImageSmoothingEnabled = false;
		ctx.mozImageSmoothingEnabled = false;
		ctx.webkitImageSmoothingEnabled = false;
		ctx.imageSmoothingEnabled = false;

		// enlarge the minimized image to full size
		ctx.drawImage(canvas, 0, 0, w, h, 0, 0, canvas.width, canvas.height);
	}, 1000);
}

var pinxelButton = document.getElementById('pinxel');
pinxelButton.addEventListener('click', function() {
	pinxelActive = !pinxelActive;
	pinxel();
}, false);
