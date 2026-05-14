package com.chatapplication.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document("messages")
@Data
public class Message {
    @Id
    private String id;
    private String chatId;
    private String senderId;
    private String content;
    private Instant timestamp;
}