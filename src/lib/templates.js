export const STANDARD_TEMPLATES = [
    {
        id: 'bug-slayer',
        name: 'The Bug Slayer',
        description: 'Structured format for capturing complex bug fixes.',
        icon: 'Bug',
        content: `
<h3>🐛 The Bug Slayer</h3>
<p><strong>Problem:</strong> [What was broken?]</p>
<p><strong>Root Cause:</strong> [Why was it broken?]</p>
<p><strong>The Fix:</strong> [How did you fix it?]</p>
<p><strong>Impact:</strong> [Why does this matter?]</p>
`
    },
    {
        id: 'feature-builder',
        name: 'The Feature Builder',
        description: 'Track progress and challenges on new features.',
        icon: 'Hammer',
        content: `
<h3>🏗️ The Feature Builder</h3>
<p><strong>Goal:</strong> [What are we building?]</p>
<p><strong>Challenges:</strong> [What was hard?]</p>
<p><strong>Outcome:</strong> [What is the result?]</p>
<p><strong>Next Steps:</strong> [What is left?]</p>
`
    },
    {
        id: 'knowledge-sponge',
        name: 'The Knowledge Sponge',
        description: 'Capture new concepts or learnings.',
        icon: 'Brain',
        content: `
<h3>🧠 The Knowledge Sponge</h3>
<p><strong>Concept:</strong> [What did you learn?]</p>
<p><strong>Application:</strong> [How will you use it?]</p>
<p><strong>Source:</strong> [Where did you learn this?]</p>
`
    }
];

export function getTemplateContent(templateId) {
    const template = STANDARD_TEMPLATES.find(t => t.id === templateId);
    return template ? template.content : '';
}
