package com.chatapplication.service;

import com.chatapplication.model.Chat;
import com.chatapplication.repository.ChatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRepository chatRepo;

    public Chat create(Chat chat) {
        return chatRepo.save(chat);
    }

    public List<Chat> getUserChats(String userId) {
        return chatRepo.findByParticipantsContaining(userId);
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
}
