export default class Racing {
  constructor({
    size = { width: 400, height: 600 },
    roadImgUrl,
    carsImgUrl,
    carsCoords,
    selectedCar,
    setScore,
  }) {
    this.size = size;
    this.roadImgUrl = roadImgUrl;
    this.carsImgUrl = carsImgUrl;
    this.carsCoords = carsCoords;
    this.selectedCar = selectedCar;
    this.roadOffset = 0;
    this.scrollSpeed = 2;
    this.sensivity = 1;
    this.setScore = setScore;
    this.obstacles = [];
    this.obstaclesSpeed = 1;

    // this.drivingLeft = false;
    // this.drivingRight = false;
    // this.drivingUp = false;
    // this.drivingDown = false;
  }

  init() {
    console.log('init');
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.size.width;
    this.canvas.height = this.size.height;

    this.obstaclesSpeedPositionMap = {
      1: {
        dx: this.canvas.width / 4 - 50,
        speed: this.obstaclesSpeed * 3,
      },
      2: {
        dx: this.canvas.width / 2 - 80,
        speed: this.obstaclesSpeed * 4,
      },
      3: {
        dx: (this.canvas.width / 4) * 3 - 80,
        speed: this.obstaclesSpeed * 0.5,
      },
      4: {
        dx: this.canvas.width - 100,
        speed: this.obstaclesSpeed,
      },
    };

    this.ctx = this.canvas.getContext('2d');
    this.initRoad();
    this.initCar();

    return this.canvas;
  }

  initRoad() {
    this.roadImage = new Image();
    this.roadImage.src = this.roadImgUrl;

    this.roadImage.onload = () => {
      console.log('ROAD LOADED');
      this.drawRoad();
    };
  }

  initObstacle() {
    const image = new Image();
    image.src = this.carsImgUrl;
    const random = Math.floor(Math.random() * 4) + 1;
    const randomCar = Math.floor(Math.random() * this.carsCoords.length);
    const currentCar = this.carsCoords[randomCar];

    image.onload = () => {
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      const scaledWidth = currentCar.size.x * 2;
      const scaledHeight = currentCar.size.y * 2;
      console.log(scaledHeight);
      tempCanvas.width = scaledWidth;
      tempCanvas.height = scaledHeight;
      tempCtx.save();

      if (random === 2 || random === 1) {
        tempCtx.scale(1, -1);
        tempCtx.translate(0, -scaledHeight);
      }

      tempCtx.drawImage(
        image,
        currentCar.xy.x,
        currentCar.xy.y,
        currentCar.size.x,
        currentCar.size.y,
        0,
        0,
        scaledWidth,
        scaledHeight
      );

      const flippedSprite = new Image();
      flippedSprite.src = tempCanvas.toDataURL();

      this.obstacles.push({
        image: flippedSprite,
        dx: this.obstaclesSpeedPositionMap[random].dx,
        speed: this.obstaclesSpeedPositionMap[random].speed,
        dy: -scaledHeight,
      });
    };
  }

  drawObstacles() {
    this.obstacles.forEach((car) => {
      const { dx, image, speed } = car;
      this.ctx.drawImage(image, dx, (car.dy += speed));
    });
  }

  initCar() {
    const { x, y, width, height } = this.selectedCar;
    const image = new Image();
    image.src = this.carsImgUrl;

    image.onload = () => {
      this.car = {
        x,
        y,
        width,
        height,
        image,
        dx: this.canvas.width / 2 - width / 2,
        dy: this.canvas.height - 10 - height,
      };
    };
  }

  drawRoad() {
    const { ctx, roadImage, size, roadOffset } = this;

    ctx.clearRect(0, 0, size.width, size.height);

    // Calculate two positions for seamless scrolling
    const patternHeight = size.height;
    const yPosition1 = roadOffset % patternHeight;
    const yPosition2 = yPosition1 - patternHeight;

    // Draw the road texture at two positions
    ctx.drawImage(roadImage, 0, yPosition1, size.width, patternHeight);
    ctx.drawImage(roadImage, 0, yPosition2, size.width, patternHeight);
  }

  drawCar() {
    const { image, x, y, width, height, dx, dy } = this.car;

    if (this.drivingUp) {
      if (this.car.dy - 10 > this.canvas.height / 2) {
        this.car.dy -= this.sensivity;
      }
    }

    if (this.drivingDown) {
      if (this.car.dy + 10 < this.canvas.height) {
        this.car.dy += this.sensivity;
      }
    }

    if (this.drivingLeft) {
      if (this.car.dx - 10 > 10) {
        this.car.dx -= this.sensivity;
      }
    }

    if (this.drivingRight) {
      if (this.car.dx + this.car.width + 10 < this.canvas.width) {
        this.car.dx += this.sensivity;
      }
    }
    this.ctx.drawImage(image, x, y, width, height, dx, dy, width, height);
  }

  updateRoad() {
    this.roadOffset += this.scrollSpeed; // Move the road offset
    this.drawRoad();
    this.drawCar();
    this.drawObstacles();
  }

  startAnimation(sensivity) {
    if (sensivity) {
      console.log(sensivity);
      this.sensivity = sensivity;
    }
    if (this.animationFrameId) {
      this.stopAnimation();
    }

    const loop = () => {
      this.updateRoad(); // Update the road position
      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.interval = setInterval(() => {
      this.initObstacle();
    }, 2000);

    loop();
  }

  stopAnimation() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.animationFrameId = null;
    this.ctx.clearRect(0, 0, this.size.width, this.size.height);

    this.obstacles = [];
    this.initRoad();
    this.initCar();
  }
}
