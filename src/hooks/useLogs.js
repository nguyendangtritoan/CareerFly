import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db, generateId } from '../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';

export function useLogs({ startDate, endDate } = {}) {
    // Use useLiveQuery for real-time updates from Dexie
    const logs = useLiveQuery(
        () => {
            let collection = db.logs.orderBy('dateIso').reverse();

            if (startDate && endDate) {
                // Ensure full day coverage
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);

                // Dexie strings comparison works for ISO dates
                // range: [min, max]
                collection = db.logs.where('dateIso').between(
                    new Date(startDate).toISOString(),
                    end.toISOString(),
                    true,
                    true
                ).reverse();
            }

            return collection.toArray();
        },
        [startDate, endDate]
    );

    return { logs, isLoading: !logs };
}

export function useAddLog() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ json, text, impact = 'medium', date }) => {
            const contentBody = json || {};
            let plainText = text || '';
            let dateIso = date ? new Date(date).toISOString() : new Date().toISOString();

            // 3. Natural Language Date Parsing (FR-11)
            // Patterns: "Yesterday:", "Last Friday:", "2 days ago:"
            const nlpRegex = /^(yesterday|last friday|last monday|last tuesday|last wednesday|last thursday|last saturday|last sunday|(\d+)\s+days?\s+ago):\s*/i;
            const nlpMatch = plainText.match(nlpRegex);

            if (nlpMatch) {
                const phrase = nlpMatch[1].toLowerCase();
                const daysAgoMatch = nlpMatch[2];
                let targetDate = new Date();

                if (phrase === 'yesterday') {
                    targetDate.setDate(targetDate.getDate() - 1);
                } else if (daysAgoMatch) {
                    targetDate.setDate(targetDate.getDate() - parseInt(daysAgoMatch));
                } else if (phrase.startsWith('last ')) {
                    const dayName = phrase.replace('last ', '');
                    const daysMap = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
                    const targetDay = daysMap[dayName];
                    const currentDay = targetDate.getDay();
                    let daysToSubtract = currentDay - targetDay;
                    if (daysToSubtract <= 0) daysToSubtract += 7;
                    targetDate.setDate(targetDate.getDate() - daysToSubtract);
                }

                // Strip the keyword from text
                plainText = plainText.replace(nlpMatch[0], '');
                // Also update the JSON body text if possible? 
                // Creating a new JSON from scratch is hard, so we just update the plainTextSnippet
                // and rely on the UI to maybe re-fetch or clear?
                // Ideally we'd modify the JSON content node, but Tiptap JSON structure is deep.
                // For MVP, we strip it from the snippet and rely on the fact that
                // the user intended to "meta-command" this.

                dateIso = targetDate.toISOString();
            }

            // 1. Tag Extraction (#Tag)
            const tags = (plainText.match(/#[\w-]+/g) || []).map(t => t.substring(1));

            // Save tags to UserTags collection
            await Promise.all(tags.map(async tag => {
                const existing = await db.tags.where('label').equals(tag).first();
                if (existing) {
                    await db.tags.update(existing.id, { usageCount: existing.usageCount + 1, lastUsed: Date.now() });
                } else {
                    await db.tags.add({
                        id: generateId(),
                        userId: 'guest',
                        label: tag,
                        normalizedLabel: tag.toLowerCase(),
                        category: 'skill', // default
                        usageCount: 1,
                        lastUsed: Date.now()
                    });
                }
            }));

            // 2. Smart Ticket Parsing (PROJ-123)
            // Regex: 2+ uppercase letters, hyphen, 1+ digits. e.g. "PROJ-123", "LINEAR-402"
            const ticketRegex = /\b[A-Z]{2,}-\d+\b/g;
            const ticketMatches = [...new Set(plainText.match(ticketRegex) || [])]; // Deduplicate
            const linkedTicketIds = [];

            await Promise.all(ticketMatches.map(async (ticketKey) => {
                let ticket = await db.externalTickets.where('ticketKey').equals(ticketKey).first();
                const now = new Date().toISOString();

                if (ticket) {
                    // Update existing
                    await db.externalTickets.update(ticket.id, {
                        lastWorkedOn: now,
                        // We will increment totalLogCount transactionally or lazy update? 
                        // For now simple atomic read-modify-write is okay for single user.
                        // Actually dexie update doesn't return new obj, so we use ticket id.
                    });
                    // Manual increment since update doesn't support $inc in basic dexie without addons?
                    // Let's just re-fetch or assume concurrency is low.
                    // Actually, we can just not store count and compute it? 
                    // Optimization: store count.
                    // To be safe:
                    const current = await db.externalTickets.get(ticket.id);
                    await db.externalTickets.update(ticket.id, {
                        totalLogCount: (current.totalLogCount || 0) + 1
                    });

                    linkedTicketIds.push(ticket.id);
                } else {
                    // Create new
                    const newId = generateId();
                    await db.externalTickets.add({
                        id: newId,
                        userId: 'guest',
                        ticketSystem: 'unknown', // Could infer from PROJ
                        ticketKey: ticketKey,
                        url: '',
                        firstWorkedOn: now,
                        lastWorkedOn: now,
                        totalLogCount: 1,
                        status: 'active'
                    });
                    linkedTicketIds.push(newId);
                }
            }));


            const newLog = {
                id: generateId(),
                userId: 'guest',
                dateIso: dateIso,
                content: {
                    format: 'tiptap-json',
                    body: contentBody,
                    plainTextSnippet: plainText.substring(0, 100),
                },
                tags: tags,
                externalTickets: linkedTicketIds,
                metadata: {
                    mood: 3,
                    impact: impact,
                    isMajorWin: false,
                },
                syncState: {
                    isSynced: false,
                    lastModified: Date.now()
                }
            };

            await db.logs.add(newLog);
            return newLog;
        },
        onSuccess: async (newLog) => {
            queryClient.invalidateQueries(['logs']);

            // Trigger Cloud Sync if logged in
            import('../lib/sync').then(({ syncEngine }) => {
                if (syncEngine.userId) {
                    // Fetch the full log object to push
                    db.logs.get(newLog.id).then(log => {
                        if (log) syncEngine.pushLog(log);
                    });
                }
            });
        },
    });
}

export function useDeleteLog() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            await db.logs.delete(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['logs']);
        },
    });
}

export function useGoals() {
    const queryClient = useQueryClient();
    const goals = useLiveQuery(() => db.careerGoals.toArray());

    const addGoal = useMutation({
        mutationFn: async ({ title, description, targetDate }) => {
            const goal = {
                id: generateId(),
                userId: 'guest',
                title,
                description,
                status: 'active',
                linkedLogIds: [],
                targetDate,
                createdAt: Date.now()
            };
            await db.careerGoals.add(goal);
            return goal;
        },
        onSuccess: () => {
            // Invalidation logic if needed
        }
    });

    const toggleGoalStatus = useMutation({
        mutationFn: async ({ id, status }) => {
            await db.careerGoals.update(id, { status });
        }
    });

    const deleteGoal = useMutation({
        mutationFn: async (id) => {
            await db.careerGoals.delete(id);
        }
    });

    return { goals, isLoading: !goals, addGoal, toggleGoalStatus, deleteGoal };

}

export function useTags() {
    const tags = useLiveQuery(() => db.tags.orderBy('usageCount').reverse().toArray());
    return { tags, isLoading: !tags };
}
