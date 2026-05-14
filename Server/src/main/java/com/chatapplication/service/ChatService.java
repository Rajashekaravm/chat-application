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
}
