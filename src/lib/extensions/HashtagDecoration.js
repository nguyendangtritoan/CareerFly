import { Extension } from '@tiptap/core'
import { Plugin } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

function findRegEx(doc, regex, decorationClass) {
    const decorations = []

    doc.descendants((node, pos) => {
        if (!node.isText) {
            return
        }

        const text = node.text

        let match
        while ((match = regex.exec(text))) {
            const start = pos + match.index
            const end = start + match[0].length
            decorations.push(Decoration.inline(start, end, { class: decorationClass }))
        }
    })

    return decorations
}

export const HashtagDecoration = Extension.create({
    name: 'hashtagDecoration',

    addProseMirrorPlugins() {
        return [
            new Plugin({
                state: {
                    init: (_, { doc }) => {
                        const tags = findRegEx(doc, /#[\w-]+/g, 'mention-tag')
                        const cats = findRegEx(doc, /@[\w]+/g, 'mention-category')
                        return DecorationSet.create(doc, [...tags, ...cats])
                    },
                    apply: (tr, old) => {
                        // Simplify: just re-scan document on change. Ideally mappable, but this is fast enough for small logs.
                        if (!tr.docChanged) return old

                        const tags = findRegEx(tr.doc, /#[\w-]+/g, 'mention-tag')
                        const cats = findRegEx(tr.doc, /@[\w]+/g, 'mention-category')
                        return DecorationSet.create(tr.doc, [...tags, ...cats])
                    },
                },
                props: {
                    decorations(state) {
                        return this.getState(state)
                    },
                },
            }),
        ]
    },
})
