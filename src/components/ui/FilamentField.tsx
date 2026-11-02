import React, { useEffect, useRef } from 'react';

interface FilamentFieldProps {
  className?: string;
  speed?: number;
  opacity?: number;
}

/**
 * FilamentField - WebGL-Powered Glowing Filament Field (NeuroNoise)
 * Renders an organic, fluid web of glowing filaments designed to overlay video or dark backgrounds.
 */
export const FilamentField: React.FC<FilamentFieldProps> = ({
  className = '',
  speed = 1.0,
  opacity = 0.6,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { alpha: true, antialias: true });
    if (!gl) {
      // Fallback for browsers with WebGL disabled
      return;
    }

    // Vertex shader: Full-screen quad
    const vsSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Fragment shader: Organic domain-warped glowing filaments
    const fsSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_time;

      float wave(vec2 p, float t, float freq) {
        vec2 q = p * freq;
        float v = sin(q.x + sin(q.y + t * 0.8) + cos(q.x * 0.7 + t * 0.4));
        v += cos(q.y + sin(q.x - t * 0.6) + cos(q.y * 1.1 - t * 0.5));
        return abs(v) * 0.5;
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
        float t = u_time * 0.35;

        // Multi-tier domain warping creates organic neural filaments
        vec2 q = vec2(wave(uv, t, 1.6), wave(uv + vec2(2.7, 1.4), t * 1.1, 1.8));
        vec2 r = vec2(wave(uv + 2.5 * q + vec2(1.5, 3.2), t * 0.7, 2.2), wave(uv + 2.5 * q + vec2(4.1, 1.8), t * 0.9, 1.9));

        float f = wave(uv + 3.0 * r, t, 2.4);

        // Thin, sharp glowing filaments
        float filament = 0.018 / (abs(f - 0.42) + 0.035);
        filament = clamp(filament, 0.0, 1.0);

        // Subtle secondary web
        float secondary = 0.009 / (abs(q.x - 0.38) + 0.05);
        filament = max(filament, secondary * 0.5);

        // Soft peripheral vignette so center-left stays readable
        float vig = 1.0 - smoothstep(0.5, 1.5, length(uv));
        filament *= vig;

        // Monochrome luxury palette: silver-white luminescent filaments
        vec3 color = vec3(filament * 0.92, filament * 0.95, filament * 1.0);
        gl_FragColor = vec4(color, filament * 0.55);
      }
    `;

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertShader = compileShader(gl.VERTEX_SHADER, vsSource);
    const fragShader = compileShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vertShader || !fragShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      return;
    }

    gl.useProgram(program);

    // Quad geometry covering [-1, 1]
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0,
      ]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const timeLocation = gl.getUniformLocation(program, 'u_time');

    let animationFrameId: number;
    let startTime = performance.now();

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = canvas.parentElement?.clientWidth || window.innerWidth;
      const height = canvas.parentElement?.clientHeight || window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = (now: number) => {
      const elapsed = ((now - startTime) / 1000) * speed;

      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, elapsed);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      gl.deleteProgram(program);
      gl.deleteShader(vertShader);
      gl.deleteShader(fragShader);
      gl.deleteBuffer(positionBuffer);
    };
  }, [speed]);

  return (
    <canvas
      ref={canvasRef}
      style={{ opacity }}
      className={`pointer-events-none mix-blend-screen ${className}`}
      aria-hidden="true"
    />
  );
};
