package com.chatapplication.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.sns.SnsClient;
import software.amazon.awssdk.services.sns.model.PublishRequest;
import software.amazon.awssdk.services.sns.model.PublishResponse;

@Service
@RequiredArgsConstructor
@Slf4j
public class SmsService {

    private final SnsClient snsClient;

    @Value("${aws.sns.enabled:false}")
    private boolean smsEnabled;

    public void sendOtpSms(String phoneNumber, String otp) {
        if (!smsEnabled) {
            log.info("SMS disabled. OTP for {}: {}", phoneNumber, otp);
            return;
        }

        try {
            String message = String.format("Your OTP is: %s. Valid for 5 minutes. Do not share this with anyone.", otp);
            
            // Ensure phone number has country code (e.g., +1 for US)
            String formattedPhone = phoneNumber.startsWith("+") ? phoneNumber : "+1" + phoneNumber;

            PublishRequest request = PublishRequest.builder()
                    .message(message)
                    .phoneNumber(formattedPhone)
                    .build();

            PublishResponse result = snsClient.publish(request);
            
            log.info("SMS sent successfully to {} with message ID: {}", formattedPhone, result.messageId());
        } catch (Exception e) {
            log.error("Failed to send SMS to {}: {}", phoneNumber, e.getMessage(), e);
            throw new RuntimeException("Failed to send OTP via SMS: " + e.getMessage());
        }
    }
}
