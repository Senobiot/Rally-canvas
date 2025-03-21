export default class Racing {
  constructor(
    size = { width: 400, height: 600 },
    roadImgUrl,
    carsImgUrl,
    carsCoords,
    selectedCar
  ) {
    this.size = size;
    this.roadImgUrl = roadImgUrl;
    this.carsImgUrl = carsImgUrl;
    this.carsCoords = carsCoords;
    this.selectedCar = selectedCar;
  }

  init() {
    const canvas = document.createElement('canvas');
    canvas.style.width = this.size.width + 'px';
    canvas.style.height = this.size.height + 'px';

    this.ctx = canvas.getContext('2d');
    this.roadImage = new Image();
    this.roadImage.src = this.roadImgUrl;
    this.roadImage.onload = () =>
      ctx.drawImage(this.roadImage, 0, 0, this.size.width, this.size.height);
    console.log('ROAD LOADED');
  }
}
