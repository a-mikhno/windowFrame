import React, { memo, useState, useEffect, useRef, useCallback } from 'react';
import * as QuickHull from 'quickhull';
import classes from './app.module.scss';

const WIDTH = 600;
const HEIGHT = 400;

const initialPoints = [
  { id: 1, x: 200, y: 100 },
  { id: 2, x: 400, y: 100 },
  { id: 3, x: 400, y: 300 },
  { id: 4, x: 200, y: 300 },
];

const Point = ({ point: { id, x, y } }) => {
  return <circle cx={x} cy={y} r={5} id={id} />
}

const GetLinesArray = (points) => {
  const lines = [];
  const sortedPoints =  QuickHull(points);

  for (let i = 0; i < sortedPoints.length; i++) {
    if (sortedPoints[i + 1]) {
      lines.push(
        <line
          key={sortedPoints[i].id}
          x1={sortedPoints[i].x}
          y1={sortedPoints[i].y}
          x2={sortedPoints[i + 1].x}
          y2={sortedPoints[i + 1].y}
          stroke="black"
        />
      );
    }
  }

  return lines;
}

const App = () => {
  const [points, changePoints] = useState(initialPoints);

  const ref = useRef();

  const [selectedPointId, changeSelectedPointId] = useState(null);

  const startDrag = useCallback((e) => {
    if (e.target.id) {
      changeSelectedPointId(Number(e.target.id));
    }
  }, []);

  const drag = useCallback((e) => {
    if (selectedPointId) {
      e.preventDefault();

      const refCurrent = ref.current;
      const CTM = refCurrent.getScreenCTM();

      changePoints(prev => prev.map(p => {
        if (p.id !== selectedPointId) {
          return p;
        }
        return { id: selectedPointId, x: (e.clientX - CTM.e) / CTM.a, y: (e.clientY - CTM.f) / CTM.d }
      }))
    }
  }, [selectedPointId]);

  const endDrag = useCallback(() => {
    changeSelectedPointId(null);
  }, []);

  useEffect(() => {
    const refCurrent = ref.current;
    refCurrent.addEventListener('mousedown', startDrag);
    refCurrent.addEventListener('mousemove', drag);
    refCurrent.addEventListener('mouseup', endDrag);
    refCurrent.addEventListener('mouseleave', endDrag);
    return () => {
      refCurrent.removeEventListener('mousedown', startDrag);
      refCurrent.removeEventListener('mousemove', drag);
      refCurrent.removeEventListener('mouseup', endDrag);
      refCurrent.removeEventListener('mouseleave', endDrag);
    }
  }, [startDrag, drag, endDrag]);

  return (
    <div className={classes.wrapper}>
      <div className={classes.drawingArea}>
        <svg ref={ref} width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} xmlns="http://www.w3.org/2000/svg">
          {points.map((point) => <Point key={point.id} point={point} /> )}
          {GetLinesArray(points).map(i => i)}
        </svg>
      </div>
    </div>
  );
};

export default memo(App);