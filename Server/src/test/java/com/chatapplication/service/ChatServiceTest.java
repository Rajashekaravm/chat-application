package com.chatapplication.service;

import com.chatapplication.model.Chat;
import com.chatapplication.repository.ChatRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    @Mock
    private ChatRepository chatRepository;

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
}
