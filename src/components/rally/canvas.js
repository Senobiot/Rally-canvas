export default class Racing {
  constructor({
    size = { width: 400, height: 600 },
    roadImgUrl,
    carsImgUrl,
    carsCoords,
    selectedCar,
    setPlayState,
  }) {
    this.size = size;
    this.roadImgUrl = roadImgUrl;
    this.carsImgUrl = carsImgUrl;
    this.carsCoords = carsCoords;
    this.selectedCar = selectedCar;
    this.roadOffset = 0;
    this.scrollSpeed = 2;
    this.sensivity = 1;
    this.obstacles = [];
    this.obstaclesSpeed = 1;
    this.setPlayState = setPlayState;
    this.carListPosition = 140;
    this.minCarListPosition = 140;

    this.lastRenderTime = performance.now();
    this.thisDefaultFpsInterval = 1000 / 60;

    this.lastTime = performance.now();
    this.frameCount = 0;
    this.fps = 0;
    this.time = 60;
    this.score = 0;
  }

  init() {
    console.log('init');
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.size.width;
    this.canvas.height = this.size.height;

    this.obstaclesSpeedPositionMap = {
      1: {
        x: this.canvas.width / 4 - 50,
        speed: this.obstaclesSpeed * 3,
      },
      2: {
        x: this.canvas.width / 2 - 80,
        speed: this.obstaclesSpeed * 4,
      },
      3: {
        x: (this.canvas.width / 4) * 3 - 80,
        speed: this.obstaclesSpeed * 0.5,
      },
      4: {
        x: this.canvas.width - 100,
        speed: this.obstaclesSpeed,
      },
    };

    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    this.initRoad();

    return this.canvas;
  }

  initRoad() {
    this.roadImage = new Image();
    this.roadImage.src = this.roadImgUrl;

    this.roadImage.onload = () => {
      console.log('ROAD LOADED');
      this.drawMenu();
    };
  }
  //need to combine with init own car

  processCarSprite(car, scale) {
    return new Promise((resolve) => {
      const image = new Image();
      image.src = this.carsImgUrl;

      image.onload = () => {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        const scaledWidth = car.size.x * 2;
        const scaledHeight = car.size.y * 2;

        tempCanvas.width = scaledWidth;
        tempCanvas.height = scaledHeight;
        tempCtx.save();

        if (scale === 2 || scale === 1) {
          tempCtx.scale(1, -1);
          tempCtx.translate(0, -scaledHeight);
        }

        tempCtx.drawImage(
          image,
          car.xy.x,
          car.xy.y,
          car.size.x,
          car.size.y,
          0,
          0,
          scaledWidth,
          scaledHeight
        );

        const flippedSprite = new Image();
        flippedSprite.src = tempCanvas.toDataURL();

        resolve({
          image: flippedSprite,
          width: scaledWidth,
          height: scaledHeight,
        });
      };
    });
  }

  async initObstacle() {
    const random = Math.floor(Math.random() * 4) + 1;
    const randomCar = Math.floor(Math.random() * this.carsCoords.length);
    const currentCar = this.carsCoords[randomCar];

    const { image, width, height } = await this.processCarSprite(
      currentCar,
      random
    );

    this.obstacles.push({
      image,
      x: this.obstaclesSpeedPositionMap[random].x,
      speed: this.obstaclesSpeedPositionMap[random].speed,
      y: -height,
      width: width,
      height: height,
    });
  }

  drawObstacles() {
    this.newObstacles = [];
    for (let index = 0; index < this.obstacles.length; index++) {
      const obstacle = this.obstacles[index];

      if (obstacle.y > this.canvas.height) {
        continue;
      }

      const { x, image, speed } = obstacle;
      obstacle.y += speed;
      this.ctx.drawImage(image, x, obstacle.y);

      if (this.isCollision(this.obstacles[index], this.selectedCar)) {
        this.playing = false;
        setTimeout(() => {
          this.stopAnimation('gameover');
        }, 2000);

        break;
      }

      if (obstacle.y > this.canvas.height) {
        this.score += 100;
      }

      this.newObstacles.push(obstacle);
    }

    this.obstacles = this.newObstacles;
  }

  //need to combine with initObstacle
  initCar() {
    const { width, height } = this.selectedCar;
    this.selectedCar.x = this.canvas.width / 2 - width / 2;
    this.selectedCar.y = this.canvas.height - height - 10;
  }

  isCollision(rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  drawFpsMeter(currentTime) {
    this.frameCount++;
    const elapsed = currentTime - this.lastTime;

    if (elapsed >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastTime = currentTime;
    }

    this.ctx.font = '16px Arial';
    this.ctx.fillStyle = 'white';
    this.ctx.fillText(`FPS: ${this.fps}`, this.canvas.width - 50, 20);
  }

  drawRoad(currentTime) {
    const { ctx, roadImage, size, roadOffset } = this;

    ctx.clearRect(0, 0, size.width, size.height);

    const patternHeight = size.height;
    const yPosition1 = roadOffset % patternHeight;
    const yPosition2 = yPosition1 - patternHeight;

    ctx.drawImage(roadImage, 0, yPosition1, size.width, patternHeight);
    ctx.drawImage(roadImage, 0, yPosition2, size.width, patternHeight);
    this.roadOffset += this.scrollSpeed;

    this.drawFpsMeter(currentTime);
  }

  limitFps(currentTime) {
    const elapsed = currentTime - this.lastRenderTime;
    this.lastRenderTime = currentTime - (elapsed % this.thisDefaultFpsInterval);
    return elapsed > this.thisDefaultFpsInterval;
  }

  async drawMenu() {
    console.log('drawMenu');
    this.ctx.fillStyle = 'yellow';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    let y = 40;
    let textSpeed = 3;
    let modifier = textSpeed;

    this.carList = [];
    const maxCars = 55;

    for (let index = 0; index < maxCars; index++) {
      const carSprite = await this.processCarSprite(this.carsCoords[index]);
      carSprite.name = this.carsCoords[index].name;
      this.carList.push(carSprite);
    }

    let text = {
      text: 'START GAME',
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
      font: 40,
      x1: 50,
      x2: this.canvas.width - 50,
      y1: this.canvas.height / 2 - 50,
      y2: this.canvas.height / 2 + 50,
    };

    const animateMenu = (currentTime) => {
      if (this.playing) {
        return;
      }

      this.animationFrameId = requestAnimationFrame(animateMenu);
      if (this.limitFps(currentTime)) {
        this.drawRoad(currentTime);

        if (!this.selectingCar) {
          this.ctx.font = `${text.font + y / 20}px Arial`;
          y += modifier;

          if (y > 50) {
            modifier = -textSpeed;
          } else if (y < -50) {
            modifier = textSpeed;
          }

          this.ctx.fillText(text.text, text.x, text.y);
        } else {
          this.drawCarList();
        }
      }
    };

    const mouseHandler = (event, coord) => {
      const clickX = event.offsetX;
      const clickY = event.offsetY;
      return (
        clickX >= coord.x1 &&
        clickX <= coord.x2 &&
        clickY >= coord.y1 &&
        clickY <= coord.y2
      );
    };

    const clickHandler = (event) => {
      if (mouseHandler(event, text)) {
        this.selectingCar = true;
        this.selectedCar;
      }
    };

    const curorHandler = (event) => {
      if (mouseHandler(event, text)) {
        this.canvas.style.cursor = 'pointer';
      } else {
        this.canvas.style.cursor = 'initial';
      }
    };

    this.canvas.addEventListener('click', clickHandler);
    this.canvas.addEventListener('mousemove', curorHandler);
    this.animationFrameId = requestAnimationFrame(animateMenu);
  }

  drawCarList() {
    if (this.playing) {
      return;
    }
    if (!this.drivingRight && !this.drivingLeft && this.lastRenderedSection) {
      this.ctx.putImageData(this.lastRenderedSection, 0, 0);
      return;
    }
    if (this.drivingRight) {
      this.carListPosition -= 3;
    }
    if (this.drivingLeft) {
      if (this.minCarListPosition >= this.carListPosition) {
        this.carListPosition += 3;
      }
    }

    let currentPosition = this.carListPosition;

    for (let index = 0; index < this.carList.length; index++) {
      if (currentPosition >= this.canvas.width) {
        break;
      }

      const width = this.carList[index].width;
      if (currentPosition + width <= 0) {
        currentPosition += width + 50;
        continue;
      }

      const { image, height, name } = this.carList[index];

      this.ctx.drawImage(
        image,
        currentPosition,
        this.canvas.height - height - 10
      );

      if (
        currentPosition < this.canvas.width / 2 + width / 2 + 50 / 2 &&
        currentPosition > this.canvas.width / 2 - width / 2 - 50 / 4
      ) {
        this.selectedCar = { image, width, height };

        this.addText({ text: 'Selected car:', y: this.canvas.height / 2 - 50 });
        this.addText({ text: name, upperCase: true, color: 'yellow', fz: 40 });
      }
      currentPosition += width + 50;
    }
  }

  addText({
    text,
    upperCase,
    y = this.canvas.height / 2,
    x = this.canvas.width / 2,
    font = 'Arial',
    fz = 30,
    color = 'white',
  }) {
    this.ctx.font = `${fz}px ${font}`;
    this.ctx.fillStyle = color;
    this.ctx.fillText(upperCase ? text.toUpperCase() : text, x, y);
  }

  drawCar() {
    if (this.drivingUp) {
      if (
        this.selectedCar.y + this.selectedCar.height / 2 >
        this.canvas.height / 2
      ) {
        this.selectedCar.y -= this.sensivity;
      }
    }

    if (this.drivingDown) {
      if (
        this.selectedCar.y + this.selectedCar.height + 10 <
        this.canvas.height
      ) {
        this.selectedCar.y += this.sensivity;
      }
    }

    if (this.drivingLeft) {
      if (this.selectedCar.x - 10 > 10) {
        this.selectedCar.x -= this.sensivity;
      }
    }

    if (this.drivingRight) {
      if (
        this.selectedCar.x + this.selectedCar.width + 10 <
        this.canvas.width
      ) {
        this.selectedCar.x += this.sensivity;
      }
    }

    this.ctx.drawImage(
      this.selectedCar.image,
      this.selectedCar.x,
      this.selectedCar.y
    );
  }

  updateRoad() {
    this.drawRoad();
    this.drawCar();
    this.drawObstacles();
    this.ctx.font = '24px Arial';
    this.ctx.fillStyle = 'white';

    this.ctx.fillText(`Score: ${this.score}`, 50, 50);
    this.ctx.fillText(`Time: ${this.time}`, 50, 100);
  }

  startGame() {
    if (this.playing) {
      return;
    }

    if (!this.selectingCar) {
      this.selectingCar = true;
      return;
    }

    if (this.selectingCar) {
      this.playing = true;
      this.startAnimation();
    }
  }

  startAnimation(sensivity) {
    this.initCar();
    this.setPlayState(true);
    if (sensivity >= 1) {
      this.sensivity = sensivity;
    }

    const loop = (currentTime) => {
      if (!this.playing) return;
      this.animationFrameId = requestAnimationFrame(loop);
      if (this.limitFps(currentTime)) {
        this.updateRoad();
      }
    };

    this.interval = setInterval(() => {
      this.initObstacle();
    }, 2000);

    this.timer = setInterval(() => {
      if (this.time <= 0) {
        return this.stopAnimation('gameover');
      }
      this.time--;
    }, 1000);

    this.animationFrameId = requestAnimationFrame(loop);
  }

  gameOver() {
    this.addText({ fz: 50, color: 'red', text: 'GAME OVER' });
    this.addText({
      fz: 40,
      text: `Score: ${this.score}`,
      y: this.canvas.height / 2 + 100,
    });

    this.score = 0;
  }

  stopAnimation(gameover) {
    console.log('RESET');
    this.time = 60;
    this.playing = false;
    this.setPlayState(false);
    cancelAnimationFrame(this.animationFrameId);
    clearInterval(this.interval);
    clearInterval(this.timer);
    this.animationFrameId = null;
    this.ctx.clearRect(0, 0, this.size.width, this.size.height);

    this.obstacles = [];
    if (gameover) {
      return this.gameOver();
    }

    this.score = 0;
    this.initRoad(gameover);
  }
}
