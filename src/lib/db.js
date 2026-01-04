import Dexie from 'dexie';

export const db = new Dexie('CareerFlyDB');

db.version(1).stores({
    // Primary key: id
    // Indexes: dateIso, [userId+dateIso] (for range queries), tags (multi-entry)
    logs: 'id, userId, dateIso, [userId+dateIso], *tags, *externalTickets, syncState.isSynced',

    // Primary key: id
    // Indexes: userId, category, usageCount
    tags: 'id, userId, category, usageCount, label',

    // Primary key: id
    // Indexes: userId, status
    careerGoals: 'id, userId, status, *linkedLogIds',

    // Primary key: id
    // Indexes: userId, ticketKey
    externalTickets: 'id, userId, ticketKey, status',

    // Primary key: id (e.g. "stats_2026")
    // Primary key: id (e.g. "stats_2026")
    stats: 'id'
});

// V2: Add Templates Support
db.version(2).stores({
    // Primary key: id
    // Indexes: userId
    templates: 'id, userId, name, createdAt'
});

// Helper to generate UUIDs if needed, though we might use crypto.randomUUID()
export const generateId = () => crypto.randomUUID();

// FTUX: Populate with Welcome Log (FR-12ish / FTUX)
db.on('populate', () => {
    db.logs.add({
        id: generateId(),
        userId: 'guest',
        dateIso: new Date().toISOString(),
        tags: ['CareerGrowth'],
        externalTickets: [], // We could mock one, but let's keep it simple or implement the logic to create the ticket entity too
        metadata: {
            impact: 'high',
            isMajorWin: true
        },
        content: {
            format: 'tiptap-json', // simplified
            plainTextSnippet: "Welcome to CareerFly! 🚀 Try editing this log. Today I learned about #CareerGrowth and configured the [PROJECT-101] dashboard.",
            body: {
                // Tiptap JSON structure is verbose, we'll keep it minimal or empty as the UI might fallback to plainText
                type: 'doc',
                content: [
                    {
                        type: 'heading',
                        attrs: { level: 3 },
                        content: [{ type: 'text', text: "Welcome to CareerFly! 🚀" }]
                    },
                    {
                        type: 'paragraph',
                        content: [
                            { type: 'text', text: "Try editing this log. Today I learned about " },
                            {
                                type: 'mention',
                                attrs: { id: 'CareerGrowth', label: '#CareerGrowth' }
                            },
                            { type: 'text', text: " and configured the app." }
                        ]
                    }
                ]
            }
        },
        syncState: { isSynced: false, lastModified: new Date().toISOString() }
    });
});

