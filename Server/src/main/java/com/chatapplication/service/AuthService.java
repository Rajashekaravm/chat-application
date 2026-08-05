package com.chatapplication.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import com.chatapplication.model.User;
import com.chatapplication.repository.UserRepository;
import com.chatapplication.util.JwtUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository repo;
    private final JwtUtil jwt;
    private final SmsService smsService;

    private final Map<String, OtpEntry> otpCache = new ConcurrentHashMap<>();

    public User register(User user) {
        return repo.save(user);
    }

    public String sendOtp(String phoneNumber) {
        User user = repo.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String otp = String.valueOf((int) (Math.random() * 900000) + 100000);
        otpCache.put(phoneNumber, new OtpEntry(otp, Instant.now().plus(5, ChronoUnit.MINUTES)));

        // Log for development
        log.info("========================================");
        log.info("OTP Generated - Phone: {}, OTP: {}", phoneNumber, otp);
        log.info("Valid for 5 minutes");
        log.info("========================================");

        // Send via AWS SNS
        try {
            smsService.sendOtpSms(phoneNumber, otp);
        } catch (Exception e) {
            log.error("Failed to send OTP via SMS: {}", e.getMessage());
            // Don't throw - still return OTP for testing. In production, you may want to throw
        }
        
        return otp;
    }

    public String verifyOtp(String phoneNumber, String otp) {
        User user = repo.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new RuntimeException("User not found"));

        OtpEntry entry = otpCache.get(phoneNumber);
        if (entry == null || !entry.code().equals(otp) || Instant.now().isAfter(entry.expiresAt())) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        otpCache.remove(phoneNumber);
        return jwt.generateToken(user.getPhoneNumber());
    }

    private record OtpEntry(String code, Instant expiresAt) {
    }
}
