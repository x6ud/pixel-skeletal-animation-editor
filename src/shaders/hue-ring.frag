precision mediump float;

varying vec2 v_texCoords;

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    float angle = degrees(atan(v_texCoords.x - 0.5, v_texCoords.y - 0.5));
    float hue = mod((angle + 60.0) + 360.0, 360.0) / 360.0;
    gl_FragColor = vec4(hsv2rgb(vec3(hue, 1.0, 1.0)), 1.0);
}
