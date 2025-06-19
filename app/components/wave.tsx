'use client';
import { useEffect, useRef } from 'react';

interface WaveSettings {
  waveCount: number;
  amplitude: number;
  baseSpeed: number;
  waveSpacing: number;
  baseColor: [number, number, number];
  lineWidth: number;
  direction: 'left' | 'right';
  leftOffset: number;
  rightOffset: number;
}

class Wave {
  private index: number;
  private phase: number;
  private settings: WaveSettings;
  private canvas: HTMLCanvasElement;
  private color: string;
  private yOffset: number = 0;

  constructor(index: number, settings: WaveSettings, canvas: HTMLCanvasElement) {
    this.index = index;
    this.phase = index * 0.3;
    this.settings = settings;
    this.canvas = canvas;
    this.color = `rgba(${settings.baseColor[0]}, ${
      settings.baseColor[1]
    }, ${settings.baseColor[2]}, ${1 - (this.index / this.settings.waveCount)})`;
    this.updateOffset();
  }

  updateOffset() {
    const totalHeight = (this.settings.waveCount - 1) * this.settings.waveSpacing;
    const centerOffset = (this.canvas.height - totalHeight) / 2;
    this.yOffset = centerOffset + this.index * this.settings.waveSpacing;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.settings.lineWidth;

    let firstX = 0;
    const leftOffsetPx = (this.settings.leftOffset / 100) * this.canvas.height;
    let firstY =
      this.yOffset +
      leftOffsetPx +
      Math.sin(firstX * 0.005 + this.phase) * this.settings.amplitude +
      Math.cos(firstX * 0.002 + this.phase) * this.settings.amplitude * 0.5;
    ctx.moveTo(firstX, firstY);

    for (let x = 0; x <= this.canvas.width; x += 20) {
      const t = x / this.canvas.width;
      const leftOffsetPx = (this.settings.leftOffset / 100) * this.canvas.height;
      const rightOffsetPx = (this.settings.rightOffset / 100) * this.canvas.height;
      const offset = leftOffsetPx * (1 - t) + rightOffsetPx * t;
      const y =
        this.yOffset +
        offset +
        Math.sin(x * 0.005 + this.phase) * this.settings.amplitude +
        Math.cos(x * 0.002 + this.phase) * this.settings.amplitude * 0.5;
      ctx.lineTo(x, y);
    }

    ctx.stroke();
  }

  update() {
    const speed = this.settings.direction === "right"
      ? -this.settings.baseSpeed
      : this.settings.baseSpeed;
    this.phase += speed;
  }
}

class WavesCanvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private settings: WaveSettings;
  private waves: Wave[] = [];
  private animationFrame: number = 0;

  constructor(elm: HTMLCanvasElement | null, options: Partial<WaveSettings> = {}) {
    if (!elm) throw new Error('Canvas element is required');
    this.canvas = elm;
    
    const data = this.canvas.dataset;
    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error('Could not get 2D context');
    this.ctx = ctx;

    this.settings = {
      waveCount: parseInt(data.waveCount as string) || options.waveCount || 6,
      amplitude: parseInt(data.amplitude as string) || options.amplitude || 40,
      baseSpeed: parseFloat(data.baseSpeed as string) || options.baseSpeed || 0.005,
      waveSpacing: parseInt(data.waveSpacing as string) || options.waveSpacing || 40,
      baseColor: data.baseColor ? data.baseColor.split(',').map(Number) as [number, number, number] : options.baseColor || [50, 205, 50], // Lime green
      lineWidth: parseInt(data.lineWidth as string) || options.lineWidth || 2,
      direction: (data.direction as 'left' | 'right') || options.direction || "left",
      leftOffset: parseFloat(data.leftOffset as string) || options.leftOffset || 0,
      rightOffset: parseFloat(data.rightOffset as string) || options.rightOffset || 0,
    };

    this.init();
  }

  private resizeCanvas = () => {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.waves.forEach((wave) => wave.updateOffset());
  };

  private init() {
    window.addEventListener("resize", this.resizeCanvas);
    this.resizeCanvas();

    for (let i = 0; i < this.settings.waveCount; i++) {
      this.waves.push(new Wave(i, this.settings, this.canvas));
    }

    this.animate();
  }

  private animate = () => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.waves.forEach((wave) => {
      wave.updateOffset();
      wave.update();
      wave.draw(this.ctx);
    });

    this.animationFrame = requestAnimationFrame(this.animate);
  };

  destroy() {
    window.removeEventListener("resize", this.resizeCanvas);
    this.waves = [];
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    cancelAnimationFrame(this.animationFrame);
  }

  updateSettings(newSettings: Partial<WaveSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.waves = [];
    for (let i = 0; i < this.settings.waveCount; i++) {
      this.waves.push(new Wave(i, this.settings, this.canvas));
    }
  }
}

interface WaveBackgroundProps {
  className?: string;
}

export default function WaveBackground({ className = '' }: WaveBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wavesInstanceRef = useRef<WavesCanvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    wavesInstanceRef.current = new WavesCanvas(canvasRef.current);

    return () => {
      wavesInstanceRef.current?.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      data-waves
      className={`w-full h-full ${className}`}
    />
  );
}