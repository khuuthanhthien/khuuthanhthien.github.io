class GaussianViz extends HTMLElement {
  private _canvas: HTMLCanvasElement;
  private _controls: HTMLDivElement;
  private _meanSlider: HTMLInputElement;
  private _varianceSlider: HTMLInputElement;
  private _meanLabel: HTMLSpanElement;
  private _varianceLabel: HTMLSpanElement;
  private _resizeObserver: ResizeObserver | null = null;
  private _mean: number = 0;
  private _variance: number = 1;
  private _initialized: boolean = false;

  constructor() {
    super();
    this.classList.add('block', 'p-4', 'bg-white', 'border', 'border-neutral-200', 'rounded-sm');

    this._canvas = document.createElement('canvas');
    this._canvas.classList.add('w-full', 'cursor-crosshair');
    this._canvas.style.height = '300px';

    this._controls = document.createElement('div');
    this._controls.classList.add('mt-4', 'space-y-3', 'not-prose');

    const meanControl = this.createSliderControl('Mean (μ)', -10, 10, 0.1, this._mean);
    this._meanSlider = meanControl.slider;
    this._meanLabel = meanControl.label;

    const varianceControl = this.createSliderControl('Variance (σ²)', 0.1, 10, 0.1, this._variance);
    this._varianceSlider = varianceControl.slider;
    this._varianceLabel = varianceControl.label;

    this._meanSlider.addEventListener('input', () => this.update());
    this._varianceSlider.addEventListener('input', () => this.update());

    this._controls.appendChild(meanControl.container);
    this._controls.appendChild(varianceControl.container);

    this.replaceChildren(this._canvas, this._controls);

    this._canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this._canvas.addEventListener('mouseleave', () => this.draw());
  }

  connectedCallback() {
    this.init();
    this._resizeObserver = new ResizeObserver(() => {
      this.setupCanvas();
      this.draw();
    });
    this._resizeObserver.observe(this._canvas);
  }

  disconnectedCallback() {
    this._resizeObserver?.disconnect();
  }

  private init() {
    if (this._initialized) return;
    this._initialized = true;
    this.setupCanvas();
    this.update();
  }

  private setupCanvas() {
    const rect = this._canvas.getBoundingClientRect();
    if (rect.width === 0) return;
    const dpr = window.devicePixelRatio || 1;
    this._canvas.width = rect.width * dpr;
    this._canvas.height = 300 * dpr;
    const ctx = this._canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  }

  private createSliderControl(
    label: string,
    min: number,
    max: number,
    step: number,
    value: number
  ) {
    const container = document.createElement('div');
    container.classList.add('flex', 'flex-col', 'space-y-1');

    const header = document.createElement('div');
    header.classList.add('flex', 'justify-between', 'items-center');

    const labelEl = document.createElement('label');
    labelEl.classList.add('text-sm', 'font-medium', 'text-neutral-700');
    labelEl.textContent = label;

    const valueLabel = document.createElement('span');
    valueLabel.classList.add('text-sm', 'font-mono', 'text-neutral-600');
    valueLabel.textContent = value.toFixed(2);

    header.appendChild(labelEl);
    header.appendChild(valueLabel);

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = min.toString();
    slider.max = max.toString();
    slider.step = step.toString();
    slider.value = value.toString();
    slider.classList.add(
      'w-full',
      'h-2',
      'bg-neutral-200',
      'rounded-lg',
      'appearance-none',
      'cursor-pointer',
      'accent-blue-600'
    );

    container.appendChild(header);
    container.appendChild(slider);

    return { container, slider, label: valueLabel };
  }

  private update() {
    this._mean = parseFloat(this._meanSlider.value);
    this._variance = parseFloat(this._varianceSlider.value);
    this._meanLabel.textContent = this._mean.toFixed(2);
    this._varianceLabel.textContent = this._variance.toFixed(2);
    this.draw();
  }

  private gaussian(x: number, mean: number, variance: number): number {
    const stdDev = Math.sqrt(variance);
    return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
  }

  private draw() {
    const ctx = this._canvas.getContext('2d');
    if (!ctx) return;

    const rect = this._canvas.getBoundingClientRect();
    if (rect.width === 0) return;

    const width = rect.width;
    const height = 300;
    const padding = { top: 20, right: 30, bottom: 40, left: 50 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, width, height);

    const xMin = -10;
    const xMax = 10;
    const yMax = 0.5;

    const toCanvasX = (x: number) => padding.left + ((x - xMin) / (xMax - xMin)) * plotWidth;
    const toCanvasY = (y: number) => padding.top + plotHeight - (y / yMax) * plotHeight;

    this.drawGrid(ctx, padding, plotWidth, plotHeight, toCanvasX, toCanvasY);
    this.drawCurve(ctx, xMin, xMax, this._mean, this._variance, toCanvasX, toCanvasY);
    this.drawMeanLine(ctx, this._mean, toCanvasX, toCanvasY, padding, plotHeight);
    this.drawVarianceArea(ctx, this._mean, this._variance, toCanvasX, toCanvasY, padding, plotHeight);
    this.drawLabels(ctx, xMin, xMax, yMax, toCanvasX, toCanvasY, padding, plotWidth, plotHeight);
  }

  private drawGrid(
    ctx: CanvasRenderingContext2D,
    padding: { top: number; right: number; bottom: number; left: number },
    plotWidth: number,
    plotHeight: number,
    toCanvasX: (x: number) => number,
    toCanvasY: (y: number) => number
  ) {
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;

    for (let x = -10; x <= 10; x++) {
      const cx = toCanvasX(x);
      ctx.beginPath();
      ctx.moveTo(cx, padding.top);
      ctx.lineTo(cx, padding.top + plotHeight);
      ctx.stroke();
    }

    for (let y = 0; y <= 0.5; y += 0.1) {
      const cy = toCanvasY(y);
      ctx.beginPath();
      ctx.moveTo(padding.left, cy);
      ctx.lineTo(padding.left + plotWidth, cy);
      ctx.stroke();
    }

    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + plotHeight);
    ctx.lineTo(padding.left + plotWidth, padding.top + plotHeight);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + plotHeight);
    ctx.stroke();
  }

  private drawCurve(
    ctx: CanvasRenderingContext2D,
    xMin: number,
    xMax: number,
    mean: number,
    variance: number,
    toCanvasX: (x: number) => number,
    toCanvasY: (y: number) => number
  ) {
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    const steps = 200;
    for (let i = 0; i <= steps; i++) {
      const x = xMin + ((xMax - xMin) * i) / steps;
      const y = this.gaussian(x, mean, variance);
      const cx = toCanvasX(x);
      const cy = toCanvasY(y);

      if (i === 0) {
        ctx.moveTo(cx, cy);
      } else {
        ctx.lineTo(cx, cy);
      }
    }
    ctx.stroke();
  }

  private drawMeanLine(
    ctx: CanvasRenderingContext2D,
    mean: number,
    toCanvasX: (x: number) => number,
    toCanvasY: (y: number) => number,
    padding: { top: number; right: number; bottom: number; left: number },
    plotHeight: number
  ) {
    const cx = toCanvasX(mean);
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(cx, padding.top);
    ctx.lineTo(cx, padding.top + plotHeight);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#dc2626';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`μ=${mean.toFixed(1)}`, cx, padding.top - 5);
  }

  private drawVarianceArea(
    ctx: CanvasRenderingContext2D,
    mean: number,
    variance: number,
    toCanvasX: (x: number) => number,
    toCanvasY: (y: number) => number,
    padding: { top: number; right: number; bottom: number; left: number },
    plotHeight: number
  ) {
    const stdDev = Math.sqrt(variance);
    const x1 = mean - stdDev;
    const x2 = mean + stdDev;

    ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
    ctx.beginPath();

    const steps = 100;
    ctx.moveTo(toCanvasX(x1), padding.top + plotHeight);

    for (let i = 0; i <= steps; i++) {
      const x = x1 + ((x2 - x1) * i) / steps;
      const y = this.gaussian(x, mean, variance);
      ctx.lineTo(toCanvasX(x), toCanvasY(y));
    }

    ctx.lineTo(toCanvasX(x2), padding.top + plotHeight);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(toCanvasX(x1), padding.top);
    ctx.lineTo(toCanvasX(x1), padding.top + plotHeight);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(toCanvasX(x2), padding.top);
    ctx.lineTo(toCanvasX(x2), padding.top + plotHeight);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#3b82f6';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`±1σ (${(this.cumulativeGaussian(1) * 100).toFixed(1)}%)`, toCanvasX(mean), padding.top + 15);
  }

  private cumulativeGaussian(z: number): number {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;
    const sign = z < 0 ? -1 : 1;
    const absZ = Math.abs(z) / Math.sqrt(2);
    const t = 1.0 / (1.0 + p * absZ);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absZ * absZ);
    return 0.5 * (1.0 + sign * y);
  }

  private drawLabels(
    ctx: CanvasRenderingContext2D,
    xMin: number,
    xMax: number,
    yMax: number,
    toCanvasX: (x: number) => number,
    toCanvasY: (y: number) => number,
    padding: { top: number; right: number; bottom: number; left: number },
    plotWidth: number,
    plotHeight: number
  ) {
    ctx.fillStyle = '#6b7280';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';

    for (let x = Math.ceil(xMin); x <= xMax; x++) {
      ctx.fillText(x.toString(), toCanvasX(x), padding.top + plotHeight + 20);
    }

    ctx.textAlign = 'right';
    for (let y = 0; y <= yMax; y += 0.1) {
      ctx.fillText(y.toFixed(1), padding.left - 5, toCanvasY(y) + 4);
    }

    ctx.textAlign = 'center';
    ctx.font = '12px sans-serif';
    ctx.fillText('x', padding.left + plotWidth / 2, padding.top + plotHeight + 35);

    ctx.save();
    ctx.translate(15, padding.top + plotHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('P(x)', 0, 0);
    ctx.restore();
  }

  private handleMouseMove(e: MouseEvent) {
    const rect = this._canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    if (width === 0) return;
    const padding = { left: 50, right: 30 };
    const plotWidth = width - padding.left - padding.right;

    const xMin = -10;
    const xMax = 10;
    const dataX = xMin + ((x - padding.left) / plotWidth) * (xMax - xMin);

    if (dataX >= xMin && dataX <= xMax) {
      const y = this.gaussian(dataX, this._mean, this._variance);
      this.draw();

      const ctx = this._canvas.getContext('2d');
      if (!ctx) return;

      const height = 300;
      const plotHeight = height - 60;
      const toCanvasX = (val: number) => padding.left + ((val - xMin) / (xMax - xMin)) * plotWidth;
      const toCanvasY = (val: number) => 20 + plotHeight - (val / 0.5) * plotHeight;

      ctx.strokeStyle = '#6b7280';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(toCanvasX(dataX), 20);
      ctx.lineTo(toCanvasX(dataX), 20 + plotHeight);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.arc(toCanvasX(dataX), toCanvasY(y), 5, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = '#1f2937';
      ctx.font = '12px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(
        `x=${dataX.toFixed(2)}  P(x)=${y.toFixed(4)}`,
        toCanvasX(dataX) + 10,
        toCanvasY(y) - 10
      );
    }
  }
}

customElements.define('gaussian-viz', GaussianViz);
