import { Node, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export const PlaceholderNode = Node.create({
    name: 'placeholderNode',

    group: 'block',

    content: 'inline*',

    defining: true,

    addAttributes() {
        return {
            label: {
                default: 'Fill in...',
                parseHTML: element => element.getAttribute('data-placeholder-label'),
                renderHTML: attributes => {
                    return {
                        'data-placeholder-label': attributes.label,
                    };
                },
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-placeholder-node]',
            },
        ];
    },

    renderHTML({ node, HTMLAttributes }) {
        return [
            'div',
            mergeAttributes(HTMLAttributes, {
                'data-placeholder-node': '',
                'data-placeholder-label': node.attrs.label,
                'class': 'placeholder-node',
            }),
            0,
        ];
    },

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('placeholderNodePlugin'),
                props: {
                    decorations: (state) => {
                        const decorations = [];
                        const { doc } = state;

                        doc.descendants((node, pos) => {
                            if (node.type.name === 'placeholderNode') {
                                // Only add decoration if the node is empty
                                if (node.textContent.length === 0) {
                                    decorations.push(
                                        Decoration.node(pos, pos + node.nodeSize, {
                                            class: 'placeholder-node-empty',
                                        })
                                    );
                                }
                            }
                        });

                        return DecorationSet.create(doc, decorations);
                    },
                    handleKeyDown: (view, event) => {
                        // Handle Tab key to navigate between placeholders
                        if (event.key === 'Tab') {
                            const { state, dispatch } = view;
                            const { selection } = state;
                            const { $from } = selection;

                            if (event.shiftKey) {
                                // Shift+Tab: go to previous placeholder
                                let prevPlaceholderPos = null;

                                state.doc.descendants((node, pos) => {
                                    if (node.type.name === 'placeholderNode' && pos < $from.pos) {
                                        prevPlaceholderPos = pos;
                                    }
                                });

                                if (prevPlaceholderPos !== null) {
                                    event.preventDefault();
                                    const tr = state.tr.setSelection(
                                        state.selection.constructor.near(state.doc.resolve(prevPlaceholderPos + 1))
                                    );
                                    dispatch(tr);
                                    return true;
                                }
                            } else {
                                // Tab: go to next placeholder
                                let nextPlaceholderPos = null;
                                let found = false;

                                state.doc.descendants((node, pos) => {
                                    if (found) return false;

                                    if (node.type.name === 'placeholderNode' && pos > $from.pos) {
                                        nextPlaceholderPos = pos;
                                        found = true;
                                        return false;
                                    }
                                });

                                if (nextPlaceholderPos !== null) {
                                    event.preventDefault();
                                    const tr = state.tr.setSelection(
                                        state.selection.constructor.near(state.doc.resolve(nextPlaceholderPos + 1))
                                    );
                                    dispatch(tr);
                                    return true;
                                }
                            }
                        }
                        return false;
                    },
                },
            }),
        ];
    },
});

export default PlaceholderNode;
