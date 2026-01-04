export const STANDARD_TEMPLATES = [
    {
        id: 'bug-slayer',
        name: 'The Bug Slayer',
        description: 'Structured format for capturing complex bug fixes.',
        icon: 'Bug',
        content: {
            type: 'doc',
            content: [
                {
                    type: 'heading',
                    attrs: { level: 3 },
                    content: [{ type: 'text', text: '🐛 The Bug Slayer' }]
                },
                {
                    type: 'paragraph',
                    content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Problem: ' }]
                },
                {
                    type: 'placeholderNode',
                    attrs: { label: 'What was broken? Describe the bug or issue...' },
                    content: []
                },
                {
                    type: 'paragraph',
                    content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Root Cause: ' }]
                },
                {
                    type: 'placeholderNode',
                    attrs: { label: 'Why was it broken? What caused the issue?' },
                    content: []
                },
                {
                    type: 'paragraph',
                    content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'The Fix: ' }]
                },
                {
                    type: 'placeholderNode',
                    attrs: { label: 'How did you fix it? What solution did you implement?' },
                    content: []
                },
                {
                    type: 'paragraph',
                    content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Impact: ' }]
                },
                {
                    type: 'placeholderNode',
                    attrs: { label: 'Why does this matter? What was the impact?' },
                    content: []
                },
            ]
        }
    },
    {
        id: 'feature-builder',
        name: 'The Feature Builder',
        description: 'Track progress and challenges on new features.',
        icon: 'Hammer',
        content: {
            type: 'doc',
            content: [
                {
                    type: 'heading',
                    attrs: { level: 3 },
                    content: [{ type: 'text', text: '🏗️ The Feature Builder' }]
                },
                {
                    type: 'paragraph',
                    content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Goal: ' }]
                },
                {
                    type: 'placeholderNode',
                    attrs: { label: 'What are we building? What is the objective?' },
                    content: []
                },
                {
                    type: 'paragraph',
                    content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Challenges: ' }]
                },
                {
                    type: 'placeholderNode',
                    attrs: { label: 'What was hard? What obstacles did you face?' },
                    content: []
                },
                {
                    type: 'paragraph',
                    content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Outcome: ' }]
                },
                {
                    type: 'placeholderNode',
                    attrs: { label: 'What is the result? What did you accomplish?' },
                    content: []
                },
            ]
        }
    },
    {
        id: 'knowledge-sponge',
        name: 'The Knowledge Sponge',
        description: 'Capture new concepts or learnings.',
        icon: 'Brain',
        content: {
            type: 'doc',
            content: [
                {
                    type: 'heading',
                    attrs: { level: 3 },
                    content: [{ type: 'text', text: '🧠 The Knowledge Sponge' }]
                },
                {
                    type: 'paragraph',
                    content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Concept: ' }]
                },
                {
                    type: 'placeholderNode',
                    attrs: { label: 'What did you learn? What is the new concept?' },
                    content: []
                },
                {
                    type: 'paragraph',
                    content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Application: ' }]
                },
                {
                    type: 'placeholderNode',
                    attrs: { label: 'How will you use it? Where can this be applied?' },
                    content: []
                },
            ]
        }
    }
];

export function getTemplateContent(templateId) {
    const template = STANDARD_TEMPLATES.find(t => t.id === templateId);
    return template ? template.content : null;
}
