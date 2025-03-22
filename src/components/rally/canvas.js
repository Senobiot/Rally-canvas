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

  initRoad(gameOver) {
    this.frameCount = 0;
    this.time = 60;
    this.roadImage = new Image();
    this.roadImage.src = this.roadImgUrl;

    this.roadImage.onload = () => {
      console.log('ROAD LOADED');
      // this.drawRoad();
      if (gameOver) {
        return this.gameOver();
      }
      this.drawMenu();
      this.score = 0;
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
      dx: this.obstaclesSpeedPositionMap[random].dx,
      speed: this.obstaclesSpeedPositionMap[random].speed,
      dy: -height,
      width: width,
      height: height,
    });
  }

  drawObstacles() {
    this.newObstacles = [];
    for (let index = 0; index < this.obstacles.length; index++) {
      const obstacle = this.obstacles[index];

      if (obstacle.dy > this.canvas.height) {
        continue;
      }

      const { dx, image, speed } = obstacle;
      obstacle.dy += speed;
      this.ctx.drawImage(image, dx, obstacle.dy);

      if (this.isCollision(this.obstacles[index], this.car)) {
        this.playing = false;
        setTimeout(() => {
          this.stopAnimation('gameover');
        }, 2000);

        break;
      }

      if (obstacle.dy > this.canvas.height) {
        this.score += 100;
      }

      this.newObstacles.push(obstacle);
    }

    this.obstacles = this.newObstacles;

    // this.obstacles.forEach((car) => {
    //   const { dx, image, speed } = car;
    //   this.ctx.drawImage(image, dx, (car.dy += speed));
    //   if (this.isCollision(car, this.car)) {
    //     alert('GAME OVER');
    //     this.stopAnimation();
    //   }
    // });

    // this.obstacles = this.obstacles.filter((car) => {
    //   if (car.dy > this.canvas.height) {
    //     this.score += 100;
    //     return false;
    //   }

    //   return true;
    // });
  }

  //need to combine with initObstacle
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

  isCollision(rect1, rect2) {
    return (
      rect1.dx < rect2.dx + rect2.width &&
      rect1.dx + rect1.width > rect2.dx &&
      rect1.dy < rect2.dy + rect2.height &&
      rect1.dy + rect1.height > rect2.dy
    );
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
    this.roadOffset += this.scrollSpeed;
  }

  drawMenu() {
    this.ctx.fillStyle = 'yellow';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    let y = 40;
    let modifier = 1;
    this.menu = 'active';

    const animateMenu = () => {
      if (this.playing || this.carSelect) return;
      // this.menu = 'active';
      this.ctx.font = `${40 + y / 20}px Arial`;
      y += modifier;

      if (y > 50) {
        modifier = -1;
      } else if (y < -50) {
        modifier = 1;
      }

      this.drawRoad();
      this.drawCarList();
      this.ctx.fillText(
        'START GAME',
        this.canvas.width / 2,
        this.canvas.height / 2
      );

      //requestAnimationFrame(animateMenu);
    };

    if (!this.animationFrameId) {
      this.animationFrameId = requestAnimationFrame(animateMenu);
    }
  }

  startGame() {
    this.carSelect = true;
  }

  async drawCarList() {
    this.carList = [];
    let pos = 0;
    const carSpacing = 100;
    const maxCars = 55;

    for (let index = 0; index < maxCars; index++) {
      const carSprite = await this.processCarSprite(this.carsCoords[index]);
      this.carList.push(carSprite);
    }

    const animateList = () => {
      if (this.playing) {
        return;
      }
      if (this.drivingRight) {
        pos += 3;
      }
      if (this.drivingLeft) {
        pos -= 3;
      }

      if (pos > carSpacing) pos = 0;

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      let currentPosition = pos;
      this.drawRoad();
      this.carList.forEach((car) => {
        const { image, width, height } = car;
        this.ctx.drawImage(image, currentPosition, this.canvas.height - height);
        currentPosition += width + carSpacing;
      });

      this.animationFrameId = requestAnimationFrame(animateList);
    };

    this.canvas.addEventListener('click', (event) => {
      const clickX = event.offsetX;
      const clickY = event.offsetY;

      let pos = 0;
      this.carList.forEach((car, index) => {
        const { width, height } = car;
        if (
          clickX >= pos &&
          clickX <= pos + width &&
          clickY >= this.canvas.height - height &&
          clickY <= this.canvas.height
        ) {
          console.log(pos);
          this.selectedCar = index;
        }
        pos += width + carSpacing;
      });
    });

    this.animationFrameId = requestAnimationFrame(animateList);
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
    this.drawRoad();
    this.drawCar();
    this.drawObstacles();
    this.ctx.font = '24px Arial';
    this.ctx.fillStyle = 'white';

    this.ctx.fillText(`Score: ${this.score}`, 50, 50);
    this.ctx.fillText(`Time: ${this.time}`, 50, 100);
  }

  startAnimation(sensivity) {
    this.menu = false;
    this.playing = true;
    this.setPlayState(true);
    if (sensivity >= 1) {
      this.sensivity = sensivity;
    }

    const loop = () => {
      if (this.playing) {
        this.updateRoad();
        this.animationFrameId = requestAnimationFrame(loop);
      }
    };

    this.interval = setInterval(() => {
      this.initObstacle();
    }, 2000);

    this.timer = setInterval(() => {
      this.time--;
    }, 1000);

    this.animationFrameId = requestAnimationFrame(loop);
  }

  gameOver() {
    this.ctx.font = '50px Arial';
    this.ctx.fillStyle = 'red';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      'GAME OVER',
      this.canvas.width / 2,
      this.canvas.height / 2
    );
    this.ctx.fillStyle = 'white';
    this.ctx.fillText(
      `Score: ${this.score}`,
      this.canvas.width / 2,
      this.canvas.height / 2 + 100
    );
  }

  stopAnimation(gameover) {
    if (this.menu) {
      return;
    }
    console.log('RESET');

    this.playing = false;
    this.setPlayState(false);
    if (this.animationFrameId) {
      console.log('Animation Frame ID before cancel:', this.animationFrameId);
      cancelAnimationFrame(this.animationFrameId);
      delete this.animationFrameId;
      console.log('Animation Frame ID after cancel:', this.animationFrameId);
    }
    if (this.interval) {
      clearInterval(this.interval);
    }
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.animationFrameId = null;
    this.ctx.clearRect(0, 0, this.size.width, this.size.height);

    this.obstacles = [];
    this.initRoad(gameover);
    this.initCar();
  }
}
