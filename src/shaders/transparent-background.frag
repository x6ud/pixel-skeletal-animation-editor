precision mediump float;

varying vec2 v_texCoords;

uniform vec2 u_resolution;
uniform vec4 u_gridColor1;
uniform vec4 u_gridColor2;
uniform vec2 u_gridSize;
uniform vec2 u_offset;

void main() {
    float x = v_texCoords.x * u_resolution.x - u_offset.x;
    float y = v_texCoords.y * u_resolution.y - u_offset.y;
    float dx = floor(x / u_gridSize.x);
    float dy = floor(y / u_gridSize.y);
    float s = mod(dx + dy, 2.0);
    if (s > 0.0) {
        gl_FragColor = u_gridColor1;
    } else {
        gl_FragColor = u_gridColor2;
    }
}
