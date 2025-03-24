import { useEffect, useRef, useState } from 'react';
import { parseAtlas } from '../../utils';
import Racing from './canvas';

export default function Rally() {
  const canvasContainerRef = useRef(null);
  const canvasInstance = useRef(null);

  console.log('render');

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
        });
        canvasContainerRef.current.appendChild(
          await canvasInstance.current.init()
        );
        canvasContainerRef.current.focus();
      };
      getSprites();
    }
  }, []);

  return (
    <div>
      <div
        style={{ outline: 'none' }}
        ref={canvasContainerRef}
        tabIndex='0'
      ></div>
      <div
        style={{
          marginTop: 20,
          display: 'flex',
          justifyContent: 'space-around',
        }}
      ></div>
    </div>
  );
}
