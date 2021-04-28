#ifdef GL_ES
precision mediump float;
#endif

varying vec2 v_texCoords;

uniform sampler2D u_texture;
uniform vec2 u_inputSize;

void main() {
    float w = u_inputSize.x;
    float h = u_inputSize.y;
    float x = v_texCoords.x * w;
    float y = v_texCoords.y * h;
    float sx = 1.0 / w;
    float sy = 1.0 / h;

    // [ A B C ]
    // [ D E F ]
    // [ G H I ]
    vec4 A = texture2D(u_texture, vec2((x - 1.0) * sx, (y - 1.0) * sy));
    vec4 B = texture2D(u_texture, vec2(x * sx, (y - 1.0) * sy));
    vec4 C = texture2D(u_texture, vec2((x + 1.0) * sx, (y - 1.0) * sy));
    vec4 D = texture2D(u_texture, vec2((x + 1.0) * sx, y * sy));
    vec4 E = texture2D(u_texture, vec2(x * sx, y * sy));
    vec4 F = texture2D(u_texture, vec2((x + 1.0) * sx, y * sy));
    vec4 G = texture2D(u_texture, vec2((x - 1.0) * sx, (y + 1.0) * sy));
    vec4 H = texture2D(u_texture, vec2(x * sx, (y + 1.0) * sy));
    vec4 I = texture2D(u_texture, vec2((x + 1.0) * sx, (y + 1.0) * sy));

    vec4 avg = (A + B + C + D + E + F + G + H + I) / 9.0;
    vec4 best = E;
    float minDist = distance(avg, E);

    vec4 target = A;
    float dist = distance(avg, target);
    if (dist < minDist) {
        minDist = dist;
        best = target;
    }
    target = B;
    dist = distance(avg, target);
    if (dist < minDist) {
        minDist = dist;
        best = target;
    }
    target = C;
    dist = distance(avg, target);
    if (dist < minDist) {
        minDist = dist;
        best = target;
    }
    target = D;
    dist = distance(avg, target);
    if (dist < minDist) {
        minDist = dist;
        best = target;
    }
    target = F;
    dist = distance(avg, target);
    if (dist < minDist) {
        minDist = dist;
        best = target;
    }
    target = G;
    dist = distance(avg, target);
    if (dist < minDist) {
        minDist = dist;
        best = target;
    }
    target = H;
    dist = distance(avg, target);
    if (dist < minDist) {
        minDist = dist;
        best = target;
    }
    target = I;
    dist = distance(avg, target);
    if (dist < minDist) {
        minDist = dist;
        best = target;
    }

    gl_FragColor = best;
}
