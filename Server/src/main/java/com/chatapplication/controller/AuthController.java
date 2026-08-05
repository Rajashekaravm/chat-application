package com.chatapplication.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chatapplication.dto.OtpRequest;
import com.chatapplication.dto.OtpVerifyRequest;
import com.chatapplication.model.User;
import com.chatapplication.service.AuthService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService service;

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return service.register(user);
    }

    @PostMapping("/otp/send")
    public Map<String, String> sendOtp(@RequestBody OtpRequest req) {
        String otp = service.sendOtp(req.getPhoneNumber());
        return Map.of(
            "message", "OTP sent successfully",
            "otp", otp  // For development/testing only - remove in production
        );
    }

    @PostMapping("/otp/verify")
    public Map<String, String> verifyOtp(@RequestBody OtpVerifyRequest req) {
        String token = service.verifyOtp(req.getPhoneNumber(), req.getOtp());
        return Map.of("token", token);
    }
}
