uniform float uTime;
uniform float uThrottle;

varying vec2 vUv;
varying float vAlong;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  float thr = clamp(uThrottle, 0.0, 1.0);
  vec2 uv = vUv;
  float tip = vAlong;
  float flick = sin(uTime * 38.0 + uv.x * 22.0) * 0.5 + 0.5;
  float f2 = sin(uTime * 52.0 - vAlong * 31.0) * 0.5 + 0.5;
  float n =
    mix(flick, f2, 0.45) * (0.75 + 0.25 * hash(uv * 10.0 + uTime));

  float core = pow(tip, 0.55) * (0.92 + n * 0.25);
  float body =
    smoothstep(0.02, 0.28, vAlong) * (1.0 - smoothstep(0.85, 1.0, vAlong));
  float a = core * body * thr * (0.65 + n * 0.5);

  vec3 white = vec3(1.0, 0.98, 0.88);
  vec3 yellow = vec3(1.0, 0.82, 0.15);
  vec3 orange = vec3(1.0, 0.38, 0.02);
  vec3 deep = vec3(0.55, 0.08, 0.02);

  vec3 col = mix(deep, orange, smoothstep(0.0, 0.45, tip));
  col = mix(col, yellow, smoothstep(0.25, 0.75, tip) * n);
  col = mix(col, white, smoothstep(0.55, 1.0, tip) * 0.85);

  gl_FragColor = vec4(col, a);
}
