import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useMemo } from 'react';
import { MessageSquare, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
const { FixedSizeList: List } = require('react-window');
import { SoftCard } from '../SoftUI';
import { ConversationItem } from './ConversationItem';
/**
 * Row renderer for virtual scrolling
 * Receives item index and style from FixedSizeList
 * Renders ConversationItem with memoization
 */
const Row = React.memo(function Row({ index, style, data }) {
    const { conversations, selectedConversationId, onSelectConversation, onUpdateStatus, } = data;
    const conversation = conversations[index];
    return (_jsx("div", { style: style, children: _jsx("div", { className: "px-2", children: _jsx(ConversationItem, { conversation: conversation, isSelected: selectedConversationId === conversation.id, onSelect: onSelectConversation, onUpdateStatus: onUpdateStatus, index: index }) }) }));
});
export function ConversationsList({ conversations, selectedConversationId, onSelectConversation, onUpdateStatus, isLoading = false, containerHeight = 600, }) {
    /**
     * Memoized row data object
     * Prevents row renderer from being called unnecessarily
     * Only recalculates when conversations or selection changes
     */
    const rowData = useMemo(() => ({
        conversations,
        selectedConversationId,
        onSelectConversation,
        onUpdateStatus,
    }), [conversations, selectedConversationId, onSelectConversation, onUpdateStatus]);
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center py-8", children: _jsx(motion.div, { animate: { rotate: 360 }, transition: { duration: 2, repeat: Infinity }, children: _jsx(Loader, { className: "w-6 h-6 text-primary" }) }) }));
    }
    if (conversations.length === 0) {
        return (_jsxs(SoftCard, { className: "text-center py-12", children: [_jsx(MessageSquare, { className: "w-12 h-12 text-muted-foreground/50 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-foreground mb-2", children: "No Conversations" }), _jsx("p", { className: "text-muted-foreground", children: "Conversations will appear here when members text your church number" })] }));
    }
    return (_jsx(List, { height: containerHeight, itemCount: conversations.length, itemSize: 88, width: "100%", itemData: rowData, overscanCount: 5, children: Row }));
}
//# sourceMappingURL=ConversationsList.js.map