declare module '*.png' {
    const content: string;
    export default content;
}

declare module '*.jpg' {
    const content: string;
    export default content;
}

declare module '*.vert' {
    const content: string;
    export default content;
}

declare module '*.frag' {
    const content: string;
    export default content;
}

declare module '*.vue' {
    import Vue from 'vue';
    export default Vue;
}
