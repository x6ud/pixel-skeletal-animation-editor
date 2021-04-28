<template>
    <div class="editor" @contextmenu.prevent>
        <div class="top-bar">
            <button title="New"
                    @click="newProject"
            >
                <img src="../assets/editor/toolbar/new.png" alt="">
            </button>
            <div class="button" title="Open">
                <img src="../assets/editor/toolbar/open.png" alt="">
                <input type="file" accept=".zip" @input="open">
            </div>
            <button title="Save"
                    @click="save"
            >
                <img src="../assets/editor/toolbar/save.png" alt="">
            </button>
            <button title="Settings"
                    @click="onSettingsButtonClick"
            >
                <img src="../assets/editor/toolbar/settings.png" alt="">
            </button>
            <popup-menu ref="menu">
                <menu-item name="Rename Project" popup @click="renameProject"/>
                <menu-item name="Canvas Background" popup @click="canvasBackground"/>
            </popup-menu>

            <div class="sep"></div>

            <button title="Undo"
                    @click="undo"
            >
                <img src="../assets/editor/toolbar/undo.png" alt="">
            </button>
            <button title="Redo"
                    @click="redo"
            >
                <img src="../assets/editor/toolbar/redo.png" alt="">
            </button>

            <div class="fill"></div>

            <div class="tabs">
                <div class="tab"
                     v-for="workspace in workspaces"
                     :class="{active: workspace.id === currentWorkspace}"
                     @click="currentWorkspace = workspace.id"
                >
                    {{workspace.name}}
                </div>
            </div>
        </div>
        <div class="inner-wrapper">
            <keep-alive>
                <workspace-paint v-if="currentWorkspace === 'paint'"/>
                <workspace-skeleton v-if="currentWorkspace === 'skeleton'"/>
                <workspace-animate v-if="currentWorkspace === 'animate'"/>
            </keep-alive>
        </div>

        <create-new-project-window ref="createNewProjectWindow"/>
        <rename-project-window ref="renameProjectWindow"/>
        <canvas-background-window ref="canvasBackgroundWindow"/>

        <popup-window ref="errorMessageWindow"
                      title="An error occurred"
                      modal
                      closable
                      class="error-message-window"
        >
            <textarea readonly>{{errorMessage}}</textarea>
        </popup-window>
    </div>
</template>

<script lang="ts">
    import Editor from './Editor'

    export default Editor;
</script>

<style lang="scss" scoped>
    .editor {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        background: #111;
        color: #fff;

        & /deep/ {
            ::selection {
                background-color: #222;
                color: #fff;
            }

            input[type=text] {
                border: none;
                outline: none;
                background-color: #555;
                color: #fff;
            }

            input[type=range] {
                -webkit-appearance: none;
                height: 6px;
                border-radius: 3px;
                background: #555;
                outline: none;

                &::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: #777;
                }
            }
        }

        & > .top-bar {
            display: flex;
            height: 32px;
            user-select: none;
            cursor: default;
            padding: 0 0 0 4px;

            button,
            .button {
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                width: 32px;
                height: 32px;
                padding: 0;
                margin: 0;
                background: transparent;
                border: none;
                outline: none;
                opacity: .65;
                transition: opacity .3s, background-color .3s;

                &:hover {
                    opacity: 1;
                    background-color: #222;
                }

                &:active {
                    opacity: .65;
                }

                input[type=file] {
                    position: absolute;
                    left: 0;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    opacity: 0;
                }
            }

            .sep {
                width: 1px;
                height: 24px;
                margin: 4px 4px;
                background-color: #333;
            }

            .fill {
                flex: 1 1;
            }

            .tabs {
                display: flex;
                height: 100%;

                .tab {
                    display: flex;
                    height: 100%;
                    align-items: center;
                    padding: 0 1em;
                    border-radius: 6px 6px 0 0;
                    transition: background-color .3s;

                    &:hover {
                        background: #222;
                    }

                    &.active {
                        background: #333;
                    }
                }
            }
        }

        & > .inner-wrapper {
            flex: 1 1;
            width: 100%;
            background: #333;
            overflow: hidden;

            & > .workspace {
                width: 100%;
                height: 100%;
                box-sizing: border-box;
            }
        }

        & > .error-message-window {
            textarea {
                resize: none;
                width: 100%;
                height: 100%;
                padding: 8px 12px;
                margin: 0;
                box-sizing: border-box;
                outline: none;
                background: #555;
                border: none;
                color: #fff;
            }

            & /deep/ {
                .window-body {
                    width: 480px;
                    height: 180px;
                    padding: 0;
                    margin: 0;
                }

                .window-buttons {
                    display: none;
                }
            }
        }
    }
</style>
