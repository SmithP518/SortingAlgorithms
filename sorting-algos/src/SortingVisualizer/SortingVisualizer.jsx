import React, { useEffect, useRef, useState } from 'react';
import './SortingVisualizer.css';

export default function SortingVisualizer() {
  const [array, setArray] = useState([]);
  const [size, setSize] = useState(100);
  const [frames, setFrames] = useState([]);
  const [frameIdx, setFrameIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(8); // lower = faster
  const timerRef = useRef(null);

  // Generate new array on mount or when size changes
  useEffect(() => {
    generateArray(size);
  }, [size]);

  const generateArray = (n) => {
    const next = [];
    for (let i = 0; i < n; i++) {
      next.push(randomIntFromInterval(5, 500));
    }
    setArray(next);
    setFrames([]);
    setFrameIdx(0);
    setIsPlaying(false);
  };

  const onNewArray = () => generateArray(size);
  const onSizeChange = (e) => setSize(Number(e.target.value));

  // Playback controls
  const play = () => {
    if (isPlaying || frames.length === 0) return;
    setIsPlaying(true);
    timerRef.current = setInterval(() => {
      setFrameIdx((i) => {
        const next = i + 1;
        if (next >= frames.length) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          setIsPlaying(false);
          return i;
        }
        return next;
      });
    }, speedMs);
  };

  const pause = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setIsPlaying(false);
  };

  const stop = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setIsPlaying(false);
    setFrameIdx(0);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const pushFrame = (targetFrames, values, active = [], swapped = []) => {
    targetFrames.push({ values: [...values], active, swapped });
  };

  // Bubble Sort
  const recordBubbleSort = () => {
    pause();
    setFrameIdx(0);

    const a = [...array];
    const newFrames = [];
    pushFrame(newFrames, a);

    for (let i = 0; i < a.length - 1; i++) {
      let swapped = false;
      for (let j = 0; j < a.length - i - 1; j++) {
        pushFrame(newFrames, a, [j, j + 1], []);
        if (a[j] > a[j + 1]) {
          const t = a[j];
          a[j] = a[j + 1];
          a[j + 1] = t;
          pushFrame(newFrames, a, [j, j + 1], [j, j + 1]);
          swapped = true;
        }
      }
      if (!swapped) break;
    }

    pushFrame(newFrames, a);
    setFrames(newFrames);
    setFrameIdx(0);
  };

  // Rendering
  const displayValues = frames.length ? frames[frameIdx].values : array;
  const active = frames.length ? new Set(frames[frameIdx].active || []) : new Set();
  const swapped = frames.length ? new Set(frames[frameIdx].swapped || []) : new Set();

  return (
    <div style={{ padding: '16px' }}>
      {/* Controls */}
      <div
        style={{
          marginBottom: '12px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
        }}
      >
        <button onClick={onNewArray} disabled={isPlaying}>New Array</button>
        <button onClick={recordBubbleSort} disabled={isPlaying}>Bubble Sort</button>
        <button onClick={play} disabled={isPlaying || frames.length === 0}>Play</button>
        <button onClick={pause} disabled={!isPlaying}>Pause</button>
        <button onClick={stop} disabled={frames.length === 0}>Stop</button>

        <label style={{ marginLeft: 12 }}>
          Size: {size}
          <input
            type="range"
            min="5"
            max="244"
            value={size}
            onChange={onSizeChange}
            style={{ marginLeft: 8 }}
            disabled={isPlaying}
          />
        </label>

        <label style={{ marginLeft: 12 }}>
          Speed: {speedMs}ms
          <input
            type="range"
            min="2"
            max="40"
            value={speedMs}
            onChange={(e) => setSpeedMs(Number(e.target.value))}
            style={{ marginLeft: 8 }}
            disabled={isPlaying}
          />
        </label>

        <span style={{ marginLeft: 12 }}>
          Frame {frameIdx}/{Math.max(0, frames.length - 1)}
        </span>
      </div>

      {/* Bars */}
      <div className="array-container">
        {displayValues.map((value, idx) => {
          let bg = 'black';
          if (swapped.has(idx)) bg = '#02fe5eff';     // green for swap
          else if (active.has(idx)) bg = '#ff0000ff'; // red for compare

          return (
            <div
              className="array-bar"
              key={idx}
              style={{ height: `${value}px`, backgroundColor: bg }}
            />
          );
        })}
      </div>
    </div>
  );
}


function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
