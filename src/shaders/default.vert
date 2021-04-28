attribute vec4 a_position;
attribute vec2 a_texCoord0;

uniform mat4 u_projTrans;
uniform bool u_flipX;
uniform bool u_flipY;

varying vec2 v_texCoords;

void main() {
    v_texCoords = a_texCoord0;
    if (u_flipX) {
        v_texCoords.x = 1.0 - v_texCoords.x;
    }
    if (u_flipY) {
        v_texCoords.y = 1.0 - v_texCoords.y;
    }
    vec4 pos = u_projTrans * vec4(a_position.xy, 1.0, 1.0);
    gl_Position = vec4(pos.xy, 0.0, 1.0);
}
