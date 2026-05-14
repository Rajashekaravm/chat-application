package com.chatapplication.controller;

import com.chatapplication.model.Message;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class ChatWebSocketController {

    @MessageMapping("/chat")
    @SendTo("/topic/messages")
    public Message sendMessage(Message message) {

        return message;
    }
}