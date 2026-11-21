package com.chatapplication.service;

import com.chatapplication.dto.ChatSummaryDTO;
import com.chatapplication.model.Chat;
import com.chatapplication.model.Message;
import com.chatapplication.repository.ChatRepository;
import com.chatapplication.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRepository chatRepo;
    private final MessageRepository messageRepo;

    public Chat create(Chat chat) {
        return chatRepo.save(chat);
    }

    public List<Chat> getUserChats(String userId) {
        return chatRepo.findByParticipantsContaining(userId);
    }

    public List<ChatSummaryDTO> getUserChatSummaries(String userId) {
        List<Chat> chats = chatRepo.findByParticipantsContaining(userId);
        if (chats.isEmpty()) {
            return List.of();
        }

        List<String> chatIds = chats.stream().map(Chat::getId).toList();
        Map<String, List<Message>> messagesByChatId = messageRepo.findByChatIdIn(chatIds)
                .stream()
                .collect(Collectors.groupingBy(Message::getChatId));

        List<ChatSummaryDTO> summaries = chats.stream()
                .map(chat -> {
                    List<Message> chatMessages = messagesByChatId.getOrDefault(chat.getId(), List.of());
                    Message lastMessage = chatMessages.stream()
                            .max((first, second) -> compareAscending(
                                    first.getTimestamp(),
                                    second.getTimestamp()
                            ))
                            .orElse(null);
                    Instant lastReadAt = chat.getLastReadAt() == null
                            ? null
                            : chat.getLastReadAt().get(userId);
                    long unreadCount = chatMessages.stream()
                            .filter(message -> !userId.equals(message.getSenderId()))
                            .filter(message -> lastReadAt == null
                                    || message.getTimestamp() == null
                                    || message.getTimestamp().isAfter(lastReadAt))
                            .count();

                    return new ChatSummaryDTO(chat.getId(), chat.getParticipants(), lastMessage, unreadCount);
                })
                .collect(Collectors.toCollection(ArrayList::new));

        summaries.sort((first, second) -> compareTimestamps(
                first.lastMessage() == null ? null : first.lastMessage().getTimestamp(),
                second.lastMessage() == null ? null : second.lastMessage().getTimestamp()
        ));
        return summaries;
    }

    public Chat getOrCreateChat(String firstUserId, String secondUserId) {
        return chatRepo.findByParticipantsContaining(firstUserId).stream()
                .filter(chat -> chat.getParticipants() != null
                        && chat.getParticipants().size() == 2
                        && chat.getParticipants().contains(secondUserId))
                .findFirst()
                .orElseGet(() -> {
                    Chat chat = new Chat();
                    chat.setParticipants(List.of(firstUserId, secondUserId));
                    return chatRepo.save(chat);
                });
    }

    public void markRead(String chatId, String userId) {
        Chat chat = chatRepo.findById(chatId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chat not found"));
        if (chat.getParticipants() == null || !chat.getParticipants().contains(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot mark another user's chat as read");
        }

        Map<String, Instant> lastReadAt = chat.getLastReadAt() == null
                ? new HashMap<>()
                : new HashMap<>(chat.getLastReadAt());
        lastReadAt.put(userId, Instant.now());
        chat.setLastReadAt(lastReadAt);
        chatRepo.save(chat);
    }

    private int compareTimestamps(Instant first, Instant second) {
        if (first == null) {
            return second == null ? 0 : 1;
        }
        if (second == null) {
            return -1;
        }
        return second.compareTo(first);
    }

    private int compareAscending(Instant first, Instant second) {
        if (first == null) {
            return second == null ? 0 : -1;
        }
        if (second == null) {
            return 1;
        }
        return first.compareTo(second);
    }
}
