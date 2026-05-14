package com.chatapplication.controller;

import com.chatapplication.dto.LoginRequest;
import com.chatapplication.model.User;
import com.chatapplication.repository.UserRepository;
import com.chatapplication.service.AuthService;
import com.chatapplication.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService service;

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return service.register(user);
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody LoginRequest req) {
        String token = service.login(req.getEmail(), req.getPassword());
        return Map.of("token", token);
    }
}
