import { useEffect, useRef, useState } from "react";

interface IRect {
    x: number;
    y: number;
    width: number;
    height: number;
    image?: HTMLImageElement; // Добавляем поддержку изображения
}

interface IPosition {
    x: number;
    y: number;
}


export default function Rally() {
    const [score, setScore] = useState(0); // Очки игрока
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const carRef = useRef<IRect | null>(null);
    const obstaclesRef = useRef<IRect[]>([]);
    const intervalRef = useRef<number | null>(null);
    const animationRef = useRef<number | null>(null);
    const [canvasRect, setCanvasRect] = useState<DOMRect>(DOMRect.fromRect());
    const scrollSpeed = 2; // Скорость прокрутки дороги
    let roadImage: HTMLImageElement | null = null; // Текстура дороги
    let roadOffset = 0; // Смещение текстуры дороги
    const obstacleSpeed = 3; // Скорость падения препятствий
    const canvasHeigth = 800;
    const containerRef = useRef<HTMLDivElement | null>(null);

    const loadRoadImage = () => {
        roadImage = new Image();
        roadImage.src = "/road2.jpg"; // Укажите путь к вашему изображению дороги
        roadImage.onload = () => {
            console.log("Road image loaded.");
        };
    };

    const drawCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Рисуем дорогу
        const patternHeight = canvasHeigth; // Высота текстуры дороги
        const yPosition1 = roadOffset % patternHeight;
        const yPosition2 = yPosition1 - patternHeight;

        if (roadImage) {
            ctx.drawImage(roadImage, 0, yPosition1, canvas.width, patternHeight);
            ctx.drawImage(roadImage, 0, yPosition2, canvas.width, patternHeight);
        }

        // Рисуем машину
        if (carRef.current) {
            const { x, y, width, height, image } = carRef.current;
            if (image) {
                ctx.drawImage(image, x, y, width, height);
            }
        }

        // Рисуем препятствия
        obstaclesRef.current.forEach((obstacle) => {
            ctx.fillStyle = "red";
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });
    };

    const moveObstacles = () => {
        obstaclesRef.current = obstaclesRef.current.map((obstacle) => ({
            ...obstacle,
            y: obstacle.y + obstacleSpeed,
        })).filter((obstacle) => {
            if (carRef.current && isColliding(carRef.current, obstacle)) {
                handleCollision();
                return false;
            }

            if (obstacle.y >= canvasRect.height) {
                setScore((prevScore) => prevScore + 100); // Добавляем очки за избегание препятствия
            }
            return obstacle.y < canvasRect.height;
        });
    };

    const addObstacle = () => {
        const width = 100;
        const height = 20;
        const x = Math.random() * (canvasRect.width - width);
        obstaclesRef.current.push({ x, y: 0, width, height });
    };

    const isColliding = (rect1: IRect, rect2: IRect) => {
        const tolerance = 16;
        return (
            rect1.x < rect2.x + rect2.width - tolerance &&
            rect1.x + rect1.width > rect2.x + tolerance &&
            rect1.y < rect2.y + rect2.height - tolerance &&
            rect1.y + rect1.height > rect2.y + tolerance
        );
    };

    const handleCollision = () => {
        alert("Игра окончена!");
        handleReset();
    };

    const handleReset = () => {
        carRef.current = null;
        obstaclesRef.current = [];
        setScore(0);
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (containerRef.current) {
            containerRef.current.focus(); // Regain focus after reset
        }
        drawCanvas(); // Сбрасываем Canvas
    };

    const keysPressed: { [key: string]: boolean } = {};

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        keysPressed[event.key] = true; // Устанавливаем состояние нажатой клавиши
    };

    const handleKeyUp = (event: React.KeyboardEvent<HTMLDivElement>) => {
        keysPressed[event.key] = false; // Убираем состояние нажатой клавиши
    };

    const moveCar = () => {
        if (carRef.current) {
            if (keysPressed["ArrowLeft"]) {
                carRef.current.x = Math.max(carRef.current.x - 3, 0); // Движение влево
            }
            if (keysPressed["ArrowRight"]) {
                carRef.current.x = Math.min(carRef.current.x + 3, canvasRect.width - carRef.current.width); // Движение вправо
            }
        }
    };

    const startAnimation = () => {
        if (!intervalRef.current) {
            intervalRef.current = setInterval(addObstacle, 2000); // Добавляем препятствия
        }
        const animate = () => {
            roadOffset += scrollSpeed; // Двигаем дорогу
            moveCar(); // Проверяем состояние клавиш и двигаем машину
            moveObstacles(); // Двигаем препятствия
            drawCanvas(); // Перерисовываем всё
            animationRef.current = requestAnimationFrame(animate);
        };
        animationRef.current = requestAnimationFrame(animate);
    };

    const handleStart = () => {
        handleReset(); // Сбрасываем игру перед стартом
        loadRoadImage();
        const newImage = new Image();
        newImage.src = "/car-white.svg"; // Укажите путь к изображению машины
        newImage.onload = () => {
            carRef.current = {
                x: canvasRect.width / 2 - 50,
                y: canvasRect.height - 110,
                width: 100,
                height: 100,
                image: newImage,
            };
            startAnimation();
        };
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            setCanvasRect(canvas.getBoundingClientRect());
        }
        if (containerRef.current) {
            containerRef.current.focus(); // Automatically focuses the div
        }
        loadRoadImage();
    }, []);

    return (
        <div
            ref={containerRef}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            tabIndex={0} // Важно: делает div фокусируемым
            style={{ outline: "none" }} // Убирает стандартное выделение
        >

            <div style={{ fontSize: 24, color: "white" }}>Score: {score}</div>
            <canvas
                ref={canvasRef}
                width={400}
                height={canvasHeigth}
                style={{ display: "block", border: "2px solid white" }}
            ></canvas>
            <div style={{ marginTop: 20, display: "flex", justifyContent: "space-around" }}>
                <button onClick={handleStart}>Start</button>
                <button onClick={handleReset} style={{ backgroundColor: "#ff000099" }}>
                    Reset
                </button>
            </div>
        </div>
    );
}
