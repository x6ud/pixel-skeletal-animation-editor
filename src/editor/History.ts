import {Workspace} from './Workspace'
import EditorClass from './Editor'

class Record {
    workspace: Workspace | null;
    undoAction: () => void;
    redoAction: () => void;
    merge?: string;

    constructor(workspace: Workspace | null, undoAction: () => void, redoAction: () => void, merge?: string) {
        this.workspace = workspace;
        this.undoAction = undoAction;
        this.redoAction = redoAction;
        this.merge = merge;
    }
}

const MAX_HISTORY_STACK_SIZE = 200;

export default class History {

    private static _instance: History;

    static instance(): History {
        if (!History._instance) {
            History._instance = new History();
        }
        return History._instance;
    }

    dirty = false;

    private undoStack: Array<Record> = [];

    private redoStack: Array<Record> = [];

    private constructor() {
    }

    editor?: EditorClass;

    undo() {
        const record = this.undoStack.pop();
        if (!record) {
            return;
        }
        record.merge = undefined;
        this.redoStack.push(record);
        if (this.editor && record.workspace) {
            this.editor.currentWorkspace = record.workspace;
        }
        record.undoAction();
        this.dirty = true;
    }

    redo() {
        const record = this.redoStack.pop();
        if (!record) {
            return;
        }
        this.undoStack.push(record);
        if (this.editor && record.workspace) {
            this.editor.currentWorkspace = record.workspace;
        }
        record.redoAction();
        this.dirty = true;
    }

    applyAndRecord(workspace: Workspace | null, action: () => void, undo: () => void, merge?: string) {
        action();
        this.record(workspace, action, undo, merge);
    }

    record(workspace: Workspace | null, redo: () => void, undo: () => void, merge?: string) {
        if (merge && this.undoStack.length) {
            if (this.undoStack[this.undoStack.length - 1].merge === merge) {
                const oldRecord = this.undoStack.pop();
                if (oldRecord) {
                    undo = oldRecord.undoAction;
                }
            }
        }
        this.undoStack.push(new Record(workspace, undo, redo, merge));
        if (this.undoStack.length >= MAX_HISTORY_STACK_SIZE) {
            this.undoStack.shift();
        }
        this.redoStack = [];
        this.dirty = true;
    }

    endMerge(name: string) {
        if (!this.undoStack.length) {
            return;
        }
        const record = this.undoStack[this.undoStack.length - 1];
        if (record.merge === name) {
            record.merge = undefined;
        }
    }

    clear() {
        this.undoStack = [];
        this.redoStack = [];
        this.dirty = false;
    }

}
