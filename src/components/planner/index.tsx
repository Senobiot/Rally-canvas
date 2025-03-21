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

export default function Planner() {
    const rectsRef = useRef<IRect[]>([]); // Прямоугольники и изображения
    const [currentRectIndex, setCurrentRectIndex] = useState<number | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cursorPositionRef = useRef<IPosition>({ x: 0, y: 0 }); // Позиция курсора
    const [canvasRect, setCanvasRect] = useState<DOMRect>(DOMRect.fromRect()); // Границы canvas

    const getCoordinates = (event: React.MouseEvent<HTMLCanvasElement>) => {
        return { x: event.clientX - canvasRect.left, y: event.clientY - canvasRect.top };
    };

    const isIntersect = (x: number, y: number, rect: IRect) => {
        return x > rect.x && x < rect.x + rect.width && y > rect.y && y < rect.y + rect.height;
    };

    const isOverlapping = (rect1: IRect, rect2: IRect) => {
        return !(
            rect1.x + rect1.width <= rect2.x ||
            rect1.x >= rect2.x + rect2.width ||
            rect1.y + rect1.height <= rect2.y ||
            rect1.y >= rect2.y + rect2.height
        );
    };

    const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const coords = getCoordinates(event);
        const rectIndex = rectsRef.current.findIndex((rect) => isIntersect(coords.x, coords.y, rect));
        if (rectIndex !== -1) {
            setCurrentRectIndex(rectIndex);
            cursorPositionRef.current = {
                x: coords.x - rectsRef.current[rectIndex].x,
                y: coords.y - rectsRef.current[rectIndex].y,
            };
        }
    };

    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (currentRectIndex === null) return;

        const coords = getCoordinates(event);
        const newRect = {
            ...rectsRef.current[currentRectIndex],
            x: Math.max(
                0,
                Math.min(coords.x - cursorPositionRef.current.x, canvasRect.width - rectsRef.current[currentRectIndex].width)
            ),
            y: Math.max(
                0,
                Math.min(coords.y - cursorPositionRef.current.y, canvasRect.height - rectsRef.current[currentRectIndex].height)
            ),
        };

        const hasOverlap = rectsRef.current.some((rect, index) =>
            index !== currentRectIndex && isOverlapping(newRect, rect)
        );

        if (!hasOverlap) {
            rectsRef.current[currentRectIndex] = newRect;
            drawCanvas();
        }
    };

    const handleMouseUp = () => {
        if (currentRectIndex !== null) {
            setCurrentRectIndex(null);
        }
    };

    const handleAdd = () => {
        const newRect: IRect = {
            x: Math.random() * (canvasRect.width - 100),
            y: Math.random() * (canvasRect.height - 50),
            width: 100,
            height: 50,
        };

        rectsRef.current.push(newRect);
        drawCanvas();
    };

    const handleAddImage = () => {
        const newImage = new Image();
        newImage.src = "/vite.svg"; // Укажите путь к вашему изображению
        newImage.onload = () => {
            const newRect: IRect = {
                x: Math.random() * (canvasRect.width - 100),
                y: Math.random() * (canvasRect.height - 50),
                width: 100,
                height: 100,
                image: newImage, // Добавляем изображение
            };

            rectsRef.current.push(newRect);
            drawCanvas();
        };
    };

    const handleReset = () => {
        rectsRef.current = [];
        setCurrentRectIndex(null);
        drawCanvas();
    };

    const drawCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        rectsRef.current.forEach((rect, index) => {
            if (rect.image) {
                ctx.drawImage(rect.image, rect.x, rect.y, rect.width, rect.height);
            } else {
                ctx.fillStyle = "white";
                ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
            }

            if (!rect.image && index === currentRectIndex) {
                ctx.strokeStyle = "red";
                ctx.lineWidth = 5;
                ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
            }
        });
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        setCanvasRect(canvas.getBoundingClientRect());
        drawCanvas();
    }, []);

    useEffect(() => {
        drawCanvas();
    }, [currentRectIndex]);

    return (
        <div>
            <canvas
                style={{ display: "block", border: "2px solid white" }}
                onMouseLeave={handleMouseUp}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                ref={canvasRef}
                width={400}
                height={400}
            ></canvas>
            <div style={{ marginTop: 20, display: "flex", justifyContent: "space-around" }}>
                <button onClick={handleAdd}>Add Rectangle</button>
                <button onClick={handleAddImage} style={{ backgroundColor: "#ff000099" }}>
                    Add Image
                </button>
                <button onClick={handleReset} style={{ backgroundColor: "#ff000099" }}>
                    Reset
                </button>
            </div>
        </div>
    );
}
