import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db, generateId } from '../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import Dexie from 'dexie';
import { useAuth } from './useAuth';

export function useLogs({ startDate, endDate } = {}) {
    const { user, loading: authLoading } = useAuth();
    const userId = user ? user.uid : 'guest';

    // Use useLiveQuery for real-time updates from Dexie
    const logs = useLiveQuery(
        () => {
            // Wait for auth to settle. If loading, verify what we should do.
            // Actually useLiveQuery runs immediately. 
            // If we are loading, we might want to return null/empty or skip array fetch?
            // But we can't easily "skip" inside the callback based on outer variable if we want it to be reactive? 
            // Actually we can:
            if (authLoading) return [];

            // If date range is provided, use composite index [userId+dateIso]
            if (startDate && endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);

                // Dexie composite key range: [userId, startDate] -> [userId, endDate]
                return db.logs
                    .where('[userId+dateIso]')
                    .between(
                        [userId, new Date(startDate).toISOString()],
                        [userId, end.toISOString()],
                        true,
                        true
                    )
                    .reverse()
                    .toArray();
            }

            // If no date range, fallback to fetching all for user
            return db.logs
                .where('[userId+dateIso]')
                .between(
                    [userId, Dexie.minKey],
                    [userId, Dexie.maxKey]
                )
                .reverse()
                .toArray();
        },
        [startDate, endDate, userId, authLoading] // Re-run when user or loading changes
    );

    return { logs, isLoading: !logs || authLoading };
}

export function useAddLog() {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const userId = user ? user.uid : 'guest';

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
                dateIso = targetDate.toISOString();
            }

            // 1. Tag Extraction (#Tag)
            const tags = (plainText.match(/#[\w-]+/g) || []).map(t => t.substring(1));

            // PERF-CAT: Performance Category Extraction (@Category)
            const validCategories = [
                'Quality', 'FunctionalExpertise', 'Productivity',
                'ServiceExcellence', 'Leadership', 'Innovation', 'Teamwork'
            ];
            // Normalize for matching (remove spaces, lowercase)
            // Regex to find @Word
            const mentionMatches = (plainText.match(/@[\w]+/g) || []).map(m => m.substring(1));

            const performanceCategories = mentionMatches.filter(m => {
                // Check if it matches any valid category (case-insensitive)
                // We handle 'FunctionalExpertise' which might be typed as @FunctionalExpertise or just @Expertise maybe? 
                // Let's stick to simple matching against the list for now, maybe loosely.
                return validCategories.some(vc => vc.toLowerCase() === m.toLowerCase());
            }).map(m => {
                // Canonicalize
                return validCategories.find(vc => vc.toLowerCase() === m.toLowerCase());
            });


            // Save tags to UserTags collection
            await Promise.all(tags.map(async tag => {
                // Check for existing tag for THIS user
                const existing = await db.tags.where({ userId: userId, label: tag }).first();
                if (existing) {
                    await db.tags.update(existing.id, { usageCount: existing.usageCount + 1, lastUsed: Date.now() });
                } else {
                    await db.tags.add({
                        id: generateId(),
                        userId: userId,
                        label: tag,
                        normalizedLabel: tag.toLowerCase(),
                        category: 'skill', // default
                        usageCount: 1,
                        lastUsed: Date.now()
                    });
                }
            }));

            // 2. Smart Ticket Parsing (PROJ-123)
            const ticketRegex = /\b[A-Z]{2,}-\d+\b/g;
            const ticketMatches = [...new Set(plainText.match(ticketRegex) || [])]; // Deduplicate
            const linkedTicketIds = [];

            await Promise.all(ticketMatches.map(async (ticketKey) => {
                // Scope tickets to userId as well
                let ticket = await db.externalTickets.where({ userId: userId, ticketKey: ticketKey }).first();
                const now = new Date().toISOString();

                if (ticket) {
                    const current = await db.externalTickets.get(ticket.id);
                    await db.externalTickets.update(ticket.id, {
                        lastWorkedOn: now,
                        totalLogCount: (current.totalLogCount || 0) + 1
                    });

                    linkedTicketIds.push(ticket.id);
                } else {
                    // Create new
                    const newId = generateId();
                    await db.externalTickets.add({
                        id: newId,
                        userId: userId,
                        ticketSystem: 'unknown',
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
                userId: userId,
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
                    isStarred: false,
                    performanceCategories: performanceCategories // Store detected categories
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

export function useToggleLogStar() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            const log = await db.logs.get(id);
            if (log) {
                const currentMeta = log.metadata || {};
                await db.logs.update(id, {
                    metadata: {
                        ...currentMeta,
                        isStarred: !currentMeta.isStarred
                    }
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['logs']);
        },
    });
}

export function useGoals() {
    const { user, loading: authLoading } = useAuth();
    const userId = user ? user.uid : 'guest';
    const queryClient = useQueryClient();

    const goals = useLiveQuery(
        () => {
            if (authLoading) return [];
            return db.careerGoals.where('userId').equals(userId).toArray();
        },
        [userId, authLoading]
    );

    const addGoal = useMutation({
        mutationFn: async ({ title, description, targetDate }) => {
            const goal = {
                id: generateId(),
                userId: userId,
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

    return { goals, isLoading: !goals || authLoading, addGoal, toggleGoalStatus, deleteGoal };

}

export function useTags() {
    const { user, loading: authLoading } = useAuth();
    const userId = user ? user.uid : 'guest';

    const tags = useLiveQuery(
        async () => {
            if (authLoading) return [];
            const userTags = await db.tags.where('userId').equals(userId).toArray();
            return userTags.sort((a, b) => b.usageCount - a.usageCount);
        },
        [userId, authLoading]
    );
    return { tags, isLoading: !tags || authLoading };
}
