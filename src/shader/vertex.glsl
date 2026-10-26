attribute vec2 uv1;
varying vec2 vUv;
varying vec2 vUv1;
void main() {
  vUv = uv;
  vUv1 = uv1;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
