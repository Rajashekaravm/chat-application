package com.chatapplication.service;

import com.chatapplication.model.Message;
import com.chatapplication.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository repo;

    public Message save(Message msg) {
        msg.setTimestamp(Instant.now());
        return repo.save(msg);
    }

    public List<Message> getMessages(String chatId) {
        return repo.findByChatId(chatId);
    }
}
