package com.chatapplication.dto;

import lombok.Data;

@Data
public class MessageDTO {
    private String chatId;
    private String senderId;
    private String content;
}