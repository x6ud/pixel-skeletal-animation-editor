import Vue from 'vue'

import PopupMenu from './components/PopupMenu.vue'
import PopupMenuClass from './components/PopupMenu'
import MenuItem from './components/MenuItem.vue'
import PopupWindow from './components/PopupWindow.vue'
import PopupWindowClass from './components/PopupWindow'

import CreateNewProjectWindow from './dialogs/CreateNewProjectWindow.vue'
import CreateNewProjectWindowClass from './dialogs/CreateNewProjectWindow'
import RenameProjectWindow from './dialogs/RenameProjectWindow.vue'
import RenameProjectWindowClass from './dialogs/RenameProjectWindow'
import CanvasBackgroundWindow from './dialogs/CanvasBackgroundWindow.vue'
import CanvasBackgroundWindowClass from './dialogs/CanvasBackgroundWindow'

import WorkspacePaint from './workspace-paint/WorkspacePaint.vue'
import WorkspaceSkeleton from './workspace-skeleton/WorkspaceSkeleton.vue'
import WorkspaceAnimate from './workspace-animate/WorkspaceAnimate.vue'

import {Workspace} from './Workspace'
import Project from './project/Project'
import History from './History'

import {saveAs, readFile} from '../utils/file'

const project = Project.instance();
const history = History.instance();

const CONFIRM_MESSAGE = 'Unsaved changes will be lost.\nAre you sure you want to continue?';

export default class Editor extends Vue.extend({
    components: {
        PopupMenu,
        MenuItem,
        PopupWindow,

        WorkspacePaint,
        WorkspaceSkeleton,
        WorkspaceAnimate,

        CreateNewProjectWindow,
        RenameProjectWindow,
        CanvasBackgroundWindow
    },
    data() {
        return {
            projectState: project.state,
            workspaces: [
                {id: Workspace.PAINT, name: 'Paint'},
                {id: Workspace.SKELETON, name: 'Skeleton'},
                {id: Workspace.ANIMATE, name: 'Animate'}
            ],
            currentWorkspace: Workspace.PAINT,
            errorMessage: ''
        };
    },
    mounted() {
        history.editor = this as Editor;
        document.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('error', this.onError);
        window.addEventListener('unhandledrejection', this.onUnhandledRejection);
        window.addEventListener('beforeunload', this.onBeforeUnload);
        Vue.config.errorHandler = this.vueErrorHandler;
    },
    beforeDestroy() {
        document.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('error', this.onError);
        window.removeEventListener('unhandledrejection', this.onUnhandledRejection);
        window.removeEventListener('beforeunload', this.onBeforeUnload);
        delete Vue.config.errorHandler;
    },
    watch: {
        'projectState.name': {
            immediate: true,
            handler(name) {
                document.title = name || 'Untitled';
            }
        }
    },
    methods: {
        vueErrorHandler(err: Error, vm: Vue, info: string) {
            this.showErrorMessageWindow(err);
        },
        onError(e: ErrorEvent) {
            this.showErrorMessageWindow(e.error);
        },
        onUnhandledRejection(e: PromiseRejectionEvent) {
            this.showErrorMessageWindow(e.reason);
        },
        onBeforeUnload(e: Event) {
            if (history.dirty) {
                e.returnValue = true;
                return CONFIRM_MESSAGE;
            }
        },
        showErrorMessageWindow(error: any) {
            console.error(error);
            if (error instanceof Error) {
                this.errorMessage = error.stack + '';
            } else {
                this.errorMessage = error + '';
            }
            (this.$refs.errorMessageWindow as PopupWindowClass).show();
        },
        onKeyDown(e: KeyboardEvent) {
            const target = e.target as HTMLElement;
            if (target && target.tagName === 'INPUT') {
                return;
            }
            if (e.ctrlKey) {
                switch (e.key) {
                    case 'z':
                        this.undo();
                        break;
                    case 'y':
                        this.redo();
                        break;
                    case 's':
                        e.preventDefault();
                        this.save();
                        break;
                }
            }
        },
        onSettingsButtonClick(e: MouseEvent) {
            (this.$refs.menu as PopupMenuClass).show(e.target as HTMLElement, 'bottom');
        },
        async newProject() {
            const properties = await (this.$refs.createNewProjectWindow as CreateNewProjectWindowClass).show();
            if (properties) {
                if (!confirm(CONFIRM_MESSAGE)) {
                    return;
                }

                project.createNew(
                    properties.name,
                    properties.width,
                    properties.height
                );
                history.clear();
            }
        },
        async open(e: InputEvent) {
            if (history.dirty) {
                if (!confirm(CONFIRM_MESSAGE)) {
                    const input = e.target as HTMLInputElement;
                    input.value = '';
                    return;
                }
            }

            const input = e.target as HTMLInputElement;
            if (!input.files) {
                return;
            }
            try {
                const file = input.files[0];
                const bytes = await readFile(file);
                await project.read(bytes);
                history.clear();
            } finally {
                input.value = '';
            }
        },
        async save() {
            const bytes = await project.save();
            const filename = project.state.name.replace(/[-!$%^&*()+|~=`{}\[\]:";'<>?,.\/]/g, '_') || 'Untitled';
            saveAs(bytes, filename + '.zip');
            history.dirty = false;
        },
        async renameProject() {
            const properties = await (this.$refs.renameProjectWindow as RenameProjectWindowClass).show(project.state.name);
            if (properties) {
                const oldName = project.state.name;
                const newName = properties.name;
                history.applyAndRecord(
                    null,
                    () => {
                        project.state.name = newName;
                    },
                    () => {
                        project.state.name = oldName;
                    }
                );
            }
        },
        async canvasBackground() {
            const properties = await (this.$refs.canvasBackgroundWindow as CanvasBackgroundWindowClass).show();
            if (properties) {
                project.state.backgroundColor.color1 = properties.color1;
                project.state.backgroundColor.color2 = properties.color2;
            }
        },
        undo() {
            history.undo();
        },
        redo() {
            history.redo();
        }
    }
}) {
}
