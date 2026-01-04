import { Extension } from '@tiptap/core';
import { STANDARD_TEMPLATES } from '../templates';

export const SlashCommands = Extension.create({
    name: 'slashCommands',

    addOptions() {
        return {
            onTemplateSelect: () => { },
        };
    },

    addProseMirrorPlugins() {
        return [];
    },

    addCommands() {
        return {
            insertTemplate: (templateId) => ({ commands }) => {
                const template = STANDARD_TEMPLATES.find(t => t.id === templateId);
                if (template && template.content) {
                    return commands.setContent(template.content);
                }
                return false;
            },
        };
    },
});

export default SlashCommands;
