package com.chatapplication.service;

import com.chatapplication.dto.ChatSummaryDTO;
import com.chatapplication.model.Chat;
import com.chatapplication.model.Message;
import com.chatapplication.repository.ChatRepository;
import com.chatapplication.repository.MessageRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    @Mock
    private ChatRepository chatRepository;

    @Mock
    private MessageRepository messageRepository;

    @InjectMocks
    private ChatService chatService;

    @Test
    void getOrCreateChatReturnsExistingConversation() {
        Chat existingChat = new Chat();
        existingChat.setId("chat-1");
        existingChat.setParticipants(List.of("user-1", "user-2"));
        when(chatRepository.findByParticipantsContaining("user-1"))
                .thenReturn(List.of(existingChat));

        Chat chat = chatService.getOrCreateChat("user-1", "user-2");

        assertThat(chat).isSameAs(existingChat);
        verify(chatRepository, never()).save(any(Chat.class));
    }

    @Test
    void getOrCreateChatCreatesConversationForNewPair() {
        when(chatRepository.findByParticipantsContaining("user-1")).thenReturn(List.of());
        when(chatRepository.save(any(Chat.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Chat chat = chatService.getOrCreateChat("user-1", "user-2");

        assertThat(chat.getParticipants()).containsExactly("user-1", "user-2");
    }

    @Test
    void getUserChatSummariesSortsByLatestAndCountsUnreadIncomingMessages() {
        Instant lastReadAt = Instant.parse("2026-11-21T10:00:00Z");
        Chat chat = new Chat();
        chat.setId("chat-1");
        chat.setParticipants(List.of("user-1", "user-2"));
        chat.setLastReadAt(Map.of("user-1", lastReadAt));
        Chat olderChat = new Chat();
        olderChat.setId("chat-2");
        olderChat.setParticipants(List.of("user-1", "user-3"));

        Message readIncoming = message("chat-1", "user-2", "read", lastReadAt.minusSeconds(30));
        Message unreadIncoming = message("chat-1", "user-2", "unread", lastReadAt.plusSeconds(30));
        Message latestOutgoing = message("chat-1", "user-1", "sent", lastReadAt.plusSeconds(60));
        Message latestInOlderChat = message("chat-2", "user-1", "older", lastReadAt.plusSeconds(45));
        when(chatRepository.findByParticipantsContaining("user-1")).thenReturn(List.of(chat, olderChat));
        when(messageRepository.findByChatIdIn(List.of("chat-1", "chat-2")))
                .thenReturn(List.of(readIncoming, unreadIncoming, latestOutgoing, latestInOlderChat));

        List<ChatSummaryDTO> summaries = chatService.getUserChatSummaries("user-1");

        assertThat(summaries).hasSize(2);
        assertThat(summaries.get(0).id()).isEqualTo("chat-1");
        assertThat(summaries.get(0).lastMessage()).isEqualTo(latestOutgoing);
        assertThat(summaries.get(0).unreadCount()).isEqualTo(1);
        assertThat(summaries.get(1).id()).isEqualTo("chat-2");
    }

    @Test
    void markReadPersistsReadTimeForCurrentUser() {
        Chat chat = new Chat();
        chat.setId("chat-1");
        chat.setParticipants(List.of("user-1", "user-2"));
        when(chatRepository.findById("chat-1")).thenReturn(Optional.of(chat));
        when(chatRepository.save(chat)).thenReturn(chat);

        chatService.markRead("chat-1", "user-1");

        assertThat(chat.getLastReadAt()).containsKey("user-1");
        assertThat(chat.getLastReadAt().get("user-1")).isNotNull();
    }

    private Message message(String chatId, String senderId, String content, Instant timestamp) {
        Message message = new Message();
        message.setChatId(chatId);
        message.setSenderId(senderId);
        message.setContent(content);
        message.setTimestamp(timestamp);
        return message;
    }
}
