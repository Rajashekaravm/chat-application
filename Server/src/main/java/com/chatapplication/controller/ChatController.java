package com.chatapplication.controller;

import com.chatapplication.model.Chat;
import com.chatapplication.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/chats")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService service;

    @PostMapping
    public Chat create(@RequestBody Chat chat) {
        return service.create(chat);
    }

    @GetMapping("/{userId}")
    public List<Chat> getChats(@PathVariable String userId) {
        return service.getUserChats(userId);
    }
}
