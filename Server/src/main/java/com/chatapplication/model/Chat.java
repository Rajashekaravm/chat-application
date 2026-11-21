package com.chatapplication.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Document("chats")
@Data
public class Chat {
    @Id
    private String id;
    private List<String> participants;
    private Map<String, Instant> lastReadAt;
}
