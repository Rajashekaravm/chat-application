package com.chatapplication.dto;

import com.chatapplication.model.Message;

import java.util.List;

public record ChatSummaryDTO(
        String id,
        List<String> participants,
        Message lastMessage,
        long unreadCount
) {
}
