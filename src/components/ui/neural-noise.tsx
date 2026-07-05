import { useEffect, useRef } from 'react';

// Registry component (user-supplied), adapted for this codebase: typed for
// strict astro check, canvas positioned absolute (fills its relative parent
// instead of the viewport), pointer uniform mapped to the canvas rect, RAF
// cancelled on unmount, and skipped under prefers-reduced-motion.
export function NeuralNoise({
  color = [0.9, 0.2, 0.4],
  opacity = 0.95,
  speed = 0.001,
}: {
  color?: [number, number, number];
  opacity?: number;
  speed?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const pointer = { x: 0, y: 0, tX: 0, tY: 0 };
    let raf = 0;
    let uniforms: Record<string, WebGLUniformLocation | null> = {};

    const vsSource = `
      precision mediump float;
      varying vec2 vUv;
      attribute vec2 a_position;
      void main() {
        vUv = 0.5 * (a_position + 1.0);
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;
    const fsSource = `
      precision mediump float;
      varying vec2 vUv;
      uniform float u_time;
      uniform float u_ratio;
      uniform vec2 u_pointer_position;
      uniform vec3 u_color;
      uniform float u_speed;
      vec2 rotate(vec2 uv, float th) {
        return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
      }
      float neuro_shape(vec2 uv, float t, float p) {
        vec2 sine_acc = vec2(0.0);
        vec2 res = vec2(0.0);
        float scale = 8.0;
        for (int j = 0; j < 15; j++) {
          uv = rotate(uv, 1.0);
          sine_acc = rotate(sine_acc, 1.0);
          vec2 layer = uv * scale + float(j) + sine_acc - t;
          sine_acc += sin(layer) + 2.4 * p;
          res += (0.5 + 0.5 * cos(layer)) / scale;
          scale *= 1.2;
        }
        return res.x + res.y;
      }
      void main() {
        vec2 uv = 0.5 * vUv;
        uv.x *= u_ratio;
        vec2 pointer = vUv - u_pointer_position;
        pointer.x *= u_ratio;
        float p = clamp(length(pointer), 0.0, 1.0);
        p = 0.5 * pow(1.0 - p, 2.0);
        float t = u_speed * u_time;
        vec3 col = vec3(0.0);
        float noise = neuro_shape(uv, t, p);
        noise = 1.2 * pow(noise, 3.0);
        noise += pow(noise, 10.0);
        noise = max(0.0, noise - 0.5);
        noise *= (1.0 - length(vUv - 0.5));
        col = u_color * noise;
        gl_FragColor = vec4(col, noise);
      }
    `;

    function createShader(gl: WebGLRenderingContext, source: string, type: number): WebGLShader | null {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    function createProgram(gl: WebGLRenderingContext, vs: WebGLShader, fs: WebGLShader): WebGLProgram | null {
      const program = gl.createProgram();
      if (!program) return null;
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
        return null;
      }
      return program;
    }

    function getUniforms(gl: WebGLRenderingContext, program: WebGLProgram): Record<string, WebGLUniformLocation | null> {
      const out: Record<string, WebGLUniformLocation | null> = {};
      const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) as number;
      for (let i = 0; i < uniformCount; i++) {
        const info = gl.getActiveUniform(program, i);
        if (info) out[info.name] = gl.getUniformLocation(program, info.name);
      }
      return out;
    }

    const gl = (canvasEl.getContext('webgl') ||
      canvasEl.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }
    const vertexShader = createShader(gl, vsSource, gl.VERTEX_SHADER);
    const fragmentShader = createShader(gl, fsSource, gl.FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) return;
    const shaderProgram = createProgram(gl, vertexShader, fragmentShader);
    if (!shaderProgram) return;
    uniforms = getUniforms(gl, shaderProgram);
    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.useProgram(shaderProgram);
    const positionLocation = gl.getAttribLocation(shaderProgram, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    function resizeCanvas() {
      if (!canvasEl || !gl) return;
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvasEl.width = canvasEl.clientWidth * dpr;
      canvasEl.height = canvasEl.clientHeight * dpr;
      if (uniforms.u_ratio) gl.uniform1f(uniforms.u_ratio, canvasEl.width / canvasEl.height);
      gl.viewport(0, 0, canvasEl.width, canvasEl.height);
    }

    // Pointer is normalized against the canvas rect (the original normalized
    // against the viewport, which only works for a fixed full-screen canvas).
    const updateMousePosition = (x: number, y: number) => {
      const r = canvasEl.getBoundingClientRect();
      pointer.tX = x - r.left;
      pointer.tY = y - r.top;
    };
    const pointermove = (e: PointerEvent) => updateMousePosition(e.clientX, e.clientY);
    const touchmove = (e: TouchEvent) => {
      if (e.targetTouches[0]) updateMousePosition(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
    };
    const click = (e: MouseEvent) => updateMousePosition(e.clientX, e.clientY);
    window.addEventListener('pointermove', pointermove);
    window.addEventListener('touchmove', touchmove);
    window.addEventListener('click', click);

    resizeCanvas();
    const resizeListener = () => resizeCanvas();
    window.addEventListener('resize', resizeListener);
    gl.uniform3f(uniforms.u_color, color[0], color[1], color[2]);
    gl.uniform1f(uniforms.u_speed, speed);

    function render() {
      raf = requestAnimationFrame(render);
      if (!gl || !canvasEl || document.hidden) return;
      const currentTime = performance.now();
      pointer.x += (pointer.tX - pointer.x) * 0.2;
      pointer.y += (pointer.tY - pointer.y) * 0.2;
      gl.uniform1f(uniforms.u_time, currentTime);
      gl.uniform2f(
        uniforms.u_pointer_position,
        pointer.x / canvasEl.clientWidth,
        1 - pointer.y / canvasEl.clientHeight,
      );
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    render();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resizeListener);
      window.removeEventListener('pointermove', pointermove);
      window.removeEventListener('touchmove', touchmove);
      window.removeEventListener('click', click);
    };
  }, [color, speed]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity,
      }}
    />
  );
}
