precision mediump float;

varying vec2 v_texCoords;

uniform vec4 u_color;
uniform sampler2D u_texture;

void main() {
    vec4 color = texture2D(u_texture, v_texCoords);
    gl_FragColor = u_color.a * vec4(color.rgb * color.a, color.a);
}
