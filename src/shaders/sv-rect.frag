precision mediump float;

varying vec2 v_texCoords;
uniform float u_hue;

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    float x = v_texCoords.x;
    float y = v_texCoords.y;
    gl_FragColor = vec4(hsv2rgb(vec3(u_hue, x, y)), 1.0);
}
