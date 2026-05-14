package com.chatapplication.controller;

import com.chatapplication.model.Message;
import com.chatapplication.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class MessageController {

    private final MessageService service;
    private final SimpMessagingTemplate template;

    @MessageMapping("/send")
    public void send(Message msg) {

        Message saved = service.save(msg);

        template.convertAndSend(
                "/topic/messages/" + msg.getChatId(),
                saved
        );
    }

    @GetMapping("/messages/{chatId}")
    @ResponseBody
    public List<Message> getMessages(
            @PathVariable String chatId
    ) {

        return service.getMessages(chatId);
    }
}