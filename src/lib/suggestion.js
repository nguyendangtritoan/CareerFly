import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'
import SuggestionList from '../components/SuggestionList'
import { db } from './db'

export default {
    items: async ({ query }) => {
        // Fetch unique tags from DB
        const tags = await db.tags.toArray();
        const tagLabels = tags.map(t => t.label);

        // Also scan recent logs for ad-hoc tags if strictly needed, but let's stick to 'UserTags' collection

        // Filter
        const results = tagLabels
            .filter(item => item.toLowerCase().startsWith(query.toLowerCase()))
            .slice(0, 5);

        // If query is new, suggest it as a new tag option (handled in UI mostly, but here we return it)
        if (query && !results.includes(query)) {
            results.push(query);
        }

        return results;
    },

    render: () => {
        let component
        let popup

        return {
            onStart: props => {
                component = new ReactRenderer(SuggestionList, {
                    props,
                    editor: props.editor,
                })

                if (!props.clientRect) {
                    return
                }

                popup = tippy('body', {
                    getReferenceClientRect: props.clientRect,
                    appendTo: () => document.body,
                    content: component.element,
                    showOnCreate: true,
                    interactive: true,
                    trigger: 'manual',
                    placement: 'bottom-start',
                })
            },

            onUpdate(props) {
                component.updateProps(props)

                if (!props.clientRect) {
                    return
                }

                popup[0].setProps({
                    getReferenceClientRect: props.clientRect,
                })
            },

            onKeyDown(props) {
                if (props.event.key === 'Escape') {
                    popup[0].hide()

                    return true
                }

                return component.ref?.onKeyDown(props)
            },

            onExit() {
                popup[0].destroy()
                component.destroy()
            },
        }
    },
}
