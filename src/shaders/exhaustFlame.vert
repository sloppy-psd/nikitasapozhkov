varying vec2 vUv;
varying float vAlong;

void main() {
  vUv = uv;
  vAlong = clamp((position.y + 0.19) / 0.38, 0.0, 1.0);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
