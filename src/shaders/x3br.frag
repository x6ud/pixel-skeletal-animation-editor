precision mediump float;

varying vec2 v_texCoords;

uniform sampler2D u_texture;
uniform vec2 u_inputSize;

const float Y_WEIGHT = 40.0;
const float U_WEIGHT = 6.0;
const float V_WEIGHT = 6.0;
const float A_WEIGHT = 1000.0;

vec4 getPixel(float x, float y, float w, float h, float sx, float sy) {
    if (x < 0.0 || y < 0.0 || x > w || y > h) {
        return vec4(0.0, 0.0, 0.0, 0.0);
    }
    return texture2D(u_texture, vec2(x * sx, y * sy));
}

float dist(vec4 colorA, vec4 colorB) {
    float r = abs(colorA.x - colorB.x);
    float g = abs(colorA.y - colorB.y);
    float b = abs(colorA.z - colorB.z);
    float a = abs(colorA.w - colorB.w);
    float y = +0.299 * r + 0.587 * g + 0.114 * b;
    float u = -0.147 * r - 0.289 * g + 0.436 * b;
    float v = +0.615 * r - 0.515 * g - 0.100 * b;
    return y * Y_WEIGHT + u * U_WEIGHT + v * V_WEIGHT + a * A_WEIGHT;
}

void main() {
    float w = u_inputSize.x;
    float h = u_inputSize.y;
    float x = v_texCoords.x * w;
    float y = v_texCoords.y * h;
    float sx = 1.0 / w;
    float sy = 1.0 / h;

    /*
          -2  -1  0  +1  +2
    +2      [ 0][ 1][ 2]
    +1  [ 3][ 4][ 5][ 6][ 7]
     0  [ 8][ 9][10][11][12]
    -1  [13][14][15][16][17]
    -2      [18][19][20]

    */

    vec4 p0 = getPixel(x - 1.0, y + 2.0, w, h, sx, sy);
    vec4 p1 = getPixel(x + 0.0, y + 2.0, w, h, sx, sy);
    vec4 p2 = getPixel(x + 1.0, y + 2.0, w, h, sx, sy);

    vec4 p3 = getPixel(x - 2.0, y + 1.0, w, h, sx, sy);
    vec4 p4 = getPixel(x - 1.0, y + 1.0, w, h, sx, sy);
    vec4 p5 = getPixel(x + 0.0, y + 1.0, w, h, sx, sy);
    vec4 p6 = getPixel(x + 1.0, y + 1.0, w, h, sx, sy);
    vec4 p7 = getPixel(x + 2.0, y + 1.0, w, h, sx, sy);

    vec4 p8 = getPixel(x - 2.0, y + 0.0, w, h, sx, sy);
    vec4 p9 = getPixel(x - 1.0, y + 0.0, w, h, sx, sy);
    vec4 p10 = getPixel(x + 0.0, y + 0.0, w, h, sx, sy);
    vec4 p11 = getPixel(x + 1.0, y + 0.0, w, h, sx, sy);
    vec4 p12 = getPixel(x + 2.0, y + 0.0, w, h, sx, sy);

    vec4 p13 = getPixel(x - 2.0, y - 1.0, w, h, sx, sy);
    vec4 p14 = getPixel(x - 1.0, y - 1.0, w, h, sx, sy);
    vec4 p15 = getPixel(x + 0.0, y - 1.0, w, h, sx, sy);
    vec4 p16 = getPixel(x + 1.0, y - 1.0, w, h, sx, sy);
    vec4 p17 = getPixel(x + 2.0, y - 1.0, w, h, sx, sy);

    vec4 p18 = getPixel(x - 1.0, y - 2.0, w, h, sx, sy);
    vec4 p19 = getPixel(x + 0.0, y - 2.0, w, h, sx, sy);
    vec4 p20 = getPixel(x + 1.0, y - 2.0, w, h, sx, sy);


    float dx = mod(v_texCoords.x * u_inputSize.x * 3.0, 3.0);
    float dy = mod(v_texCoords.y * u_inputSize.y * 3.0, 3.0);

    gl_FragColor = p10;

    if (dx < 1.0) {
        if (dy < 1.0) {
            // bottom left

            float d_5_9 = dist(p5, p9);
            float d_9_13 = dist(p9, p13);
            float d_11_15 = dist(p11, p15);
            float d_15_18 = dist(p15, p18);
            float d_10_14 = dist(p10, p14);

            float d_4_10 = dist(p4, p10);
            float d_10_16 = dist(p10, p16);
            float d_8_14 = dist(p8, p14);
            float d_14_19 = dist(p14, p19);
            float d_9_15 = dist(p9, p15);

            float s_10_14 = d_5_9 + d_9_13 + d_11_15 + d_15_18 + 4.0 * d_10_14;
            float s_9_15 = d_4_10 + d_10_16 + d_8_14 + d_14_19 + 4.0 * d_9_15;

            if (s_9_15 < s_10_14) {
                float d_9_10 = dist(p9, p10);
                float d_10_15 = dist(p10, p15);
                gl_FragColor = d_9_10 < d_10_15 ? p9 : p15;
            }
        } else if (dy < 2.0) {
            // left
        } else {
            // top left

            float d_1_4 = dist(p1, p4);
            float d_4_8 = dist(p4, p8);
            float d_6_10 = dist(p6, p10);
            float d_10_14 = dist(p10, p14);
            float d_5_9 = dist(p5, p9);

            float d_0_5 = dist(p0, p5);
            float d_5_11 = dist(p5, p11);
            float d_3_9 = dist(p3, p9);
            float d_9_15 = dist(p9, p15);
            float d_4_10 = dist(p4, p10);

            float s_5_9 = d_10_14 + d_6_10 + d_4_8 + d_1_4 + 4.0 * d_5_9;
            float s_4_10 = d_0_5 + d_5_11 + d_3_9 + d_9_15 + 4.0 * d_4_10;

            if (s_5_9 < s_4_10) {
                float d_9_10 = dist(p9, p10);
                float d_5_10 = dist(p5, p10);
                gl_FragColor = d_9_10 < d_5_10 ? p9 : p5;
            }
        }
    } else if (dx < 2.0) {
        if (dy < 1.0) {
            // bottom
        } else if (dy < 2.0) {
            // center
        } else {
            // top
        }
    } else {
        if (dy < 1.0) {
            // bottom right

            float d_5_11 = dist(p5, p11);
            float d_11_17 = dist(p11, p17);
            float d_9_15 = dist(p9, p15);
            float d_15_20 = dist(p15, p20);
            float d_10_16 = dist(p10, p16);

            float d_6_10 = dist(p6, p10);
            float d_10_14 = dist(p10, p14);
            float d_12_16 = dist(p12, p16);
            float d_16_19 = dist(p16, p19);
            float d_11_15 = dist(p11, p15);

            float s_10_16 = d_5_11 + d_11_17 + d_9_15 + d_15_20 + 4.0 * d_10_16;
            float s_11_15 = d_6_10 + d_10_14 + d_12_16 + d_16_19 + 4.0 * d_11_15;

            if (s_11_15 < s_10_16) {
                float d_10_11 = dist(p10, p11);
                float d_10_15 = dist(p10, p15);
                gl_FragColor = d_10_11 < d_10_15 ? p11 : p15;
            } else {
                gl_FragColor = p10;
            }
        } else if (dy < 2.0) {
            // right
        } else {
            // top right

            float d_2_5 = dist(p2, p5);
            float d_5_9 = dist(p5, p9);
            float d_7_11 = dist(p7, p11);
            float d_11_15 = dist(p11, p15);
            float d_6_10 = dist(p6, p10);

            float d_1_6 = dist(p1, p6);
            float d_6_12 = dist(p6, p12);
            float d_4_10 = dist(p4, p10);
            float d_10_16 = dist(p10, p16);
            float d_5_11 = dist(p5, p11);

            float s_6_10 = d_2_5 + d_5_9 + d_7_11 + d_11_15 + 4.0 * d_6_10;
            float s_5_11 = d_1_6 + d_6_12 + d_4_10 + d_10_16 + 4.0 * d_5_11;

            if (s_5_11 < s_6_10) {
                float d_5_10 = dist(p5, p10);
                float d_10_11 = dist(p10, p11);
                gl_FragColor = d_5_10 < d_10_11 ? p5 : p11;
            }
        }
    }
}
