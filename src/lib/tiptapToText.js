import { generateText } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import PlaceholderNode from '../lib/extensions/PlaceholderNode';

/**
 * Converts TipTap JSON content to plain text
 * @param {Object} json - TipTap JSON document
 * @returns {string} Plain text representation
 */
export function tiptapToPlainText(json) {
    if (!json) return '';

    try {
        // Use TipTap's generateText to convert JSON to plain text
        const text = generateText(json, [StarterKit, PlaceholderNode]);
        return text.trim();
    } catch (error) {
        console.error('Error converting TipTap JSON to text:', error);
        // Fallback: try to extract text manually
        return extractTextFromNodes(json);
    }
}

/**
 * Fallback text extraction by walking the JSON tree
 * @param {Object} node - TipTap node
 * @returns {string} Extracted text
 */
function extractTextFromNodes(node) {
    if (!node) return '';

    if (typeof node === 'string') return node;

    if (node.type === 'text') {
        return node.text || '';
    }

    if (node.type === 'placeholderNode') {
        // For placeholder nodes, check if they have content
        if (node.content && node.content.length > 0) {
            return node.content.map(extractTextFromNodes).join('');
        }
        // Empty placeholder - return the label as a hint
        return `[${node.attrs?.label || 'empty'}]`;
    }

    if (node.content && Array.isArray(node.content)) {
        return node.content.map(extractTextFromNodes).join(' ');
    }

    return '';
}

export default tiptapToPlainText;
