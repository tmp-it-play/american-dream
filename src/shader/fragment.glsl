// color = albedo * sum(lightmap[ch]^2 * scale * lamp.color * intensity), see lightmap.json
uniform sampler2D map;
uniform vec3 color;
uniform sampler2D lightMap;
uniform vec3 lamps[4];
varying vec2 vUv;
varying vec2 vUv1;
void main() {
  vec4 lm = texture2D(lightMap, vUv1);
  lm *= lm;
  vec3 irradiance = lm.r * lamps[0] + lm.g * lamps[1] + lm.b * lamps[2] + lm.a * lamps[3];
  gl_FragColor = vec4(color * texture2D(map, vUv).rgb * irradiance, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
