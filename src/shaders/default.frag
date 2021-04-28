precision mediump float;

varying vec2 v_texCoords;

uniform vec4 u_color;
uniform sampler2D u_texture;

void main() {
    gl_FragColor = u_color * texture2D(u_texture, v_texCoords);
}
