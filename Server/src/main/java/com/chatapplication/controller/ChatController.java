package com.chatapplication.controller;

import com.chatapplication.dto.ChatSummaryDTO;
import com.chatapplication.model.Chat;
import com.chatapplication.model.User;
import com.chatapplication.repository.UserRepository;
import com.chatapplication.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/chats")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService service;
    private final UserRepository userRepository;

    @PostMapping
    public Chat create(@RequestBody Chat chat) {
        return service.create(chat);
    }

    @GetMapping("/me")
    public List<ChatSummaryDTO> getMyChats(Authentication authentication) {
        return service.getUserChatSummaries(getCurrentUser(authentication).getId());
    }

    @PostMapping("/{chatId}/read")
    public void markRead(@PathVariable String chatId, Authentication authentication) {
        service.markRead(chatId, getCurrentUser(authentication).getId());
    }

    @PostMapping("/with/{otherUserId}")
    public Chat getOrCreateChat(
            @PathVariable String otherUserId,
            Authentication authentication
    ) {
        User currentUser = getCurrentUser(authentication);
        if (currentUser.getId().equals(otherUserId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot start a chat with yourself");
        }
        userRepository.findById(otherUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return service.getOrCreateChat(currentUser.getId(), otherUserId);
    }

    @GetMapping("/{userId}")
    public List<Chat> getChats(
            @PathVariable String userId,
            Authentication authentication
    ) {
        if (!getCurrentUser(authentication).getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot access another user's chats");
        }
        return service.getUserChats(userId);
    }

    private User getCurrentUser(Authentication authentication) {
        return userRepository.findByPhoneNumber(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }
}
