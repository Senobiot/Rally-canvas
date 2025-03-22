import { useEffect, useRef, useState } from 'react';
import { parseAtlas } from '../../utils';
import Racing from './canvas';

export default function Rally() {
  const [cars, setCars] = useState(null);
  const [sensivity, setSensivity] = useState(1);
  const [playState, setPlayState] = useState(false);
  const canvasContainerRef = useRef(null);
  const canvasInstance = useRef(null);

  const keyToProperty = {
    ArrowLeft: 'drivingLeft',
    ArrowRight: 'drivingRight',
    ArrowUp: 'drivingUp',
    ArrowDown: 'drivingDown',
  };

  console.log('render');

  const handleStart = () => {
    canvasContainerRef.current.focus();
    canvasInstance.current.startAnimation(sensivity);
  };

  const handleReset = (event) => {
    canvasInstance.current.stopAnimation();
    event.target.blur();
  };

  const handleKeyDown = (event) => {
    const { current: canvas } = canvasInstance;
    const direction = keyToProperty[event.key];
    const oppositeDirection = {
      drivingLeft: 'drivingRight',
      drivingRight: 'drivingLeft',
      drivingUp: 'drivingDown',
      drivingDown: 'drivingUp',
    };

    if (direction) {
      canvas[direction] = true;

      const opposite = oppositeDirection[direction];
      if (opposite) {
        canvas[opposite] = false;
      }
    }
    console.log(event.key);
    if (event.key === 'Enter') {
      !playState && canvas.startGame();
    }
  };

  const handleKeyUp = (event) => {
    const { current: canvas } = canvasInstance;
    const direction = keyToProperty[event.key];
    if (direction) {
      canvas[direction] = false;
    }
  };

  useEffect(() => {
    if (!canvasInstance.current) {
      const getSprites = async () => {
        const sprites = await fetch('/cars.atlas');
        const text = await sprites.text();
        const coords = parseAtlas(text);

        canvasInstance.current = new Racing({
          roadImgUrl: '/road2.jpg',
          size: { width: 400, height: 800 },
          selectedCar: { x: 1, y: 131, width: 54, height: 123 },
          carsImgUrl: '/cars.png',
          carsCoords: coords,
          setPlayState,
        });

        canvasContainerRef.current.appendChild(canvasInstance.current.init());
        canvasContainerRef.current.focus();
      };
      getSprites();
    }
  }, []);

  return (
    <div>
      <div
        style={{ outline: 'none' }}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        ref={canvasContainerRef}
        tabIndex='0'
        onClick={handleKeyDown}
      ></div>
      <div
        style={{
          marginTop: 20,
          display: 'flex',
          justifyContent: 'space-around',
        }}
      >
        <button
          disabled={playState}
          style={{
            pointerEvents: playState && 'none',
            userSelect: playState && 'none',
          }}
          onClick={handleStart}
        >
          Start
        </button>
        <button
          onClick={() =>
            setSensivity(sensivity > 1 ? sensivity - 1 : sensivity)
          }
        >
          -
        </button>
        <span>Sensivity: {sensivity}</span>
        <button
          onClick={() =>
            setSensivity(sensivity < 4 ? sensivity + 1 : sensivity)
          }
        >
          +
        </button>
        <button onClick={handleReset} style={{ backgroundColor: '#ff000099' }}>
          Reset
        </button>
      </div>
    </div>
  );
}

// export default function Rally() {
//     console.log('render APP');
//     const [score, setScore] = useState(0);
//     const [roadImage, setScore] = useState(0);
//     // Очки игрока
//     const [gameArea, setGameArea] = useState<DOMRect>(() => DOMRect.fromRect());
//     const [sprites, setSprites] = useState<any>(null);

//     const canvasRef = useRef<HTMLCanvasElement>(null);
//     const carRef = useRef<IRect | null>(null);
//     const obstacleRef = useRef<IRect>(null);
//     const obstaclesRef = useRef<IRect[]>([]);
//     const intervalRef = useRef<number | null>(null);
//     const animationRef = useRef<number | null>(null);
//     const containerRef = useRef<HTMLDivElement | null>(null);

//     const scrollSpeed = 2;
//     const obstacleSpeed = 3;
//     let roadImage: HTMLImageElement | null = null; // Текстура дороги
//     let roadOffset = 0; // ???
//     const canvasHeigth = 800;

//     const loadRoadImage = () => {
//         roadImage = new Image();
//         roadImage.src = "/road2.jpg";

//         roadImage.onload = () => {
//             const canvas = canvasRef.current;
//             if (!canvas) return;

//             const ctx = canvas.getContext("2d");
//             if (!ctx) return;

//             if (roadImage) {
//                 ctx.drawImage(roadImage, 0, 0, gameArea.width, gameArea.height);
//             }
//         }

//         console.log('ROAD LOADED');
//     };

//     const moveObstacles = () => {
//         obstaclesRef.current = obstaclesRef.current.map((obstacle) => ({
//             ...obstacle,
//             y: obstacle.y + obstacleSpeed,
//         })).filter((obstacle) => {
//             if (carRef.current && isColliding(carRef.current, obstacle)) {
//                 handleCollision();
//                 return false;
//             }

//             if (obstacle.y >= gameArea.height) {
//                 setScore((prevScore) => prevScore + 100); // Добавляем очки за избегание препятствия
//             }
//             return obstacle.y < gameArea.height;
//         });
//     };

//     const addObstacle = () => {
//         const width = 100;
//         const height = 20;
//         const x = Math.random() * (gameArea.width - width);
//         obstaclesRef.current.push({ x, y: 0, width, height });
//     };

//     const isColliding = (rect1: IRect, rect2: IRect) => {
//         const tolerance = 16;
//         return (
//             rect1.x < rect2.x + rect2.width - tolerance &&
//             rect1.x + rect1.width > rect2.x + tolerance &&
//             rect1.y < rect2.y + rect2.height - tolerance &&
//             rect1.y + rect1.height > rect2.y + tolerance
//         );
//     };

//     const handleCollision = () => {
//         alert("Игра окончена!");
//         handleReset();
//     };

//     const handleReset = () => {
//         carRef.current = null;
//         obstaclesRef.current = [];
//         setScore(0);
//         if (animationRef.current) {
//             cancelAnimationFrame(animationRef.current);
//             animationRef.current = null;
//         }
//         if (intervalRef.current) {
//             clearInterval(intervalRef.current);
//             intervalRef.current = null;
//         }
//         if (containerRef.current) {
//             containerRef.current.focus(); // Regain focus after reset
//         }
//         drawCanvas(); // Сбрасываем Canvas
//     };

//     const keysPressed: { [key: string]: boolean } = {};

//     const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
//         keysPressed[event.key] = true; // Устанавливаем состояние нажатой клавиши
//     };

//     const handleKeyUp = (event: React.KeyboardEvent<HTMLDivElement>) => {
//         keysPressed[event.key] = false; // Убираем состояние нажатой клавиши
//     };

//     const moveCar = () => {
//         if (carRef.current) {
//             if (keysPressed["ArrowLeft"]) {
//                 carRef.current.x = Math.max(carRef.current.x - 3, 0); // Движение влево
//             }
//             if (keysPressed["ArrowRight"]) {
//                 carRef.current.x = Math.min(carRef.current.x + 3, canvasRect.width - carRef.current.width); // Движение вправо
//             }
//         }
//     };

//     const startAnimation = () => {
//         if (!intervalRef.current) {
//             intervalRef.current = setInterval(addObstacle, 2000); // Добавляем препятствия
//         }
//         const animate = () => {
//             roadOffset += scrollSpeed; // Двигаем дорогу
//             moveCar(); // Проверяем состояние клавиш и двигаем машину
//             moveObstacles(); // Двигаем препятствия
//             drawCanvas(); // Перерисовываем всё
//             animationRef.current = requestAnimationFrame(animate);
//         };
//         animationRef.current = requestAnimationFrame(animate);
//     };

//     const createObstacle = () => {
//         const newImage = new Image();
//         newImage.src = "/cars.png";
//         newImage.onload = () => {
//             // Создаём временный canvas
//             const tempCanvas = document.createElement("canvas");
//             const ctx = tempCanvas.getContext("2d");

//             if (!ctx) return;

//             // Задаём размеры canvas и масштабируем
//             tempCanvas.width = 33; // Ширина области вырезки
//             tempCanvas.height = 69; // Высота области вырезки
//             ctx.scale(1, -1); // Отражение по вертикали
//             ctx.translate(0, -tempCanvas.height); // Корректируем позицию

//             // Вырезаем и отражаем спрайт
//             ctx.drawImage(newImage, 92, 185, 33, 69, 0, 0, 33, 69);

//             // Создаём новое изображение из временного canvas
//             const flippedImage = new Image();
//             flippedImage.src = tempCanvas.toDataURL();

//             // Сохраняем препятствие с перевёрнутым изображением
//             obstacleRef.current = {
//                 sx: 0,
//                 sy: 0,
//                 swidth: 33,
//                 sheight: 69,
//                 x: 0,
//                 y: 0,
//                 width: 33,
//                 height: 69,
//                 image: flippedImage,
//             };
//         };
//     };

//     const handleStart = () => {
//         const newImage = new Image();
//         newImage.src = "/cars.png";
//         newImage.onload = () => {
//             carRef.current = {
//                 sx: 179,
//                 sy: 89,
//                 swidth: 25,
//                 sheight: 47,
//                 x: gameArea.width / 2 - 50,
//                 y: gameArea.height - 110,
//                 width: 100,
//                 height: 100,
//                 image: newImage,
//             }
//             createObstacle();
//             startAnimation();
//         };
//     };

//     const drawCanvas = () => {
//         const canvas = canvasRef.current;
//         if (!canvas) return;

//         const ctx = canvas.getContext("2d");
//         if (!ctx) return;

//         // Рисуем дорогу
//         const patternHeight = canvasHeigth; // Высота текстуры дороги
//         const yPosition1 = roadOffset % patternHeight;
//         const yPosition2 = yPosition1 - patternHeight;

//         if (roadImage) {
//             console.log(yPosition1, yPosition2);
//             ctx.drawImage(roadImage, 0, yPosition1, canvas.width, patternHeight);
//             ctx.drawImage(roadImage, 0, yPosition2, canvas.width, patternHeight);
//         }

//         // Рисуем машину
//         if (carRef.current) {
//             const { image, sx, sy, swidth, sheight, x, y } = carRef.current;
//             if (image) {
//                 ctx.drawImage(image, x, y, swidth * 2, sheight * 2);
//             }
//         }

//         // Рисуем препятствия
//         obstaclesRef.current.forEach((obstacle) => {
//             if (obstacleRef.current) {
//                 const { image, sx, sy, swidth, sheight } = obstacleRef.current;
//                 if (image) {
//                     ctx.drawImage(image, sx, sy, swidth, sheight, obstacle.x, obstacle.y, swidth * 2, sheight * 2);
//                 }
//             }
//             // ctx.fillStyle = "red";
//             // ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
//             // ctx.drawImage(image, sx, sy, swidth, sheight, x, y, swidth * 2, sheight * 2)
//         });
//     };

//     useEffect(() => {
//         const canvas = canvasRef.current;
//         if (canvas) {
//             setGameArea(canvas.getBoundingClientRect());
//         }

//         const getSprites = async () => {
//             const sprites = await fetch('/cars.atlas');
//             const text = await sprites.text();
//             const parsedSprites = parseAtlas(text);
//             setSprites(parsedSprites);

//         }

//         getSprites();
//     }, []);

//     useEffect(() => loadRoadImage(), [gameArea])

//     return (
//         <div
//             ref={containerRef}
//             onKeyDown={handleKeyDown}
//             onKeyUp={handleKeyUp}
//             tabIndex={0} // Важно: делает div фокусируемым
//             style={{ outline: "none" }} // Убирает стандартное выделение
//         >

//             <div style={{ fontSize: 24, color: "white" }}>Score: {score}</div>
//             <canvas
//                 ref={canvasRef}
//                 width={400}
//                 height={canvasHeigth}
//                 style={{ display: "block", border: "2px solid white" }}
//             ></canvas>
//             <div style={{ marginTop: 20, display: "flex", justifyContent: "space-around" }}>
//                 <button onClick={handleStart}>Start</button>
//                 <button onClick={handleReset} style={{ backgroundColor: "#ff000099" }}>
//                     Reset
//                 </button>
//             </div>
//         </div>
//     );
// }
