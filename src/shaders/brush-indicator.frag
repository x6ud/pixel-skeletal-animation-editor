precision mediump float;

varying vec2 v_texCoords;

uniform vec4 u_color;
uniform sampler2D u_texture;
uniform sampler2D u_back;
uniform vec2 u_brushSize;
uniform vec2 u_backSize;

vec4 getPixel(float x, float y, float w, float h, float sx, float sy) {
    if (x < 0.0 || y < 0.0 || x > w || y > h) {
        return vec4(0.0, 0.0, 0.0, 0.0);
    }
    return texture2D(u_texture, vec2(x * sx, y * sy));
}

void main() {
    float w = u_brushSize.x;
    float h = u_brushSize.y;
    float x = v_texCoords.x * w;
    float y = v_texCoords.y * h;
    float sx = 1.0 / w;
    float sy = 1.0 / h;

    /*
        [A][B][C]
        [D][E][F]
        [G][H][I]
    */

    vec4 B = getPixel(x + 0.0, y + 1.0, w, h, sx, sy);
    vec4 D = getPixel(x - 1.0, y + 0.0, w, h, sx, sy);
    vec4 E = getPixel(x + 0.0, y + 0.0, w, h, sx, sy);
    vec4 F = getPixel(x + 1.0, y + 0.0, w, h, sx, sy);
    vec4 H = getPixel(x + 0.0, y - 1.0, w, h, sx, sy);

    bool edge = E.a > 0.5 && (B.a < 0.5 || D.a < 0.5 || F.a < 0.5 || H.a < 0.5);

    if (edge) {
        vec4 backColor = texture2D(u_back, vec2(gl_FragCoord.x / u_backSize.x, 1.0 - gl_FragCoord.y / u_backSize.y));
        float l = +0.299 * backColor.r + 0.587 * backColor.g + 0.114 * backColor.b;
        gl_FragColor = l > 0.5 ? vec4(0.0, 0.0, 0.0, 1.0) : vec4(1.0, 1.0, 1.0, 0.7);
    } else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
    }
}
