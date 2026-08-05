# AWS SNS SMS Integration Guide

This chat application now supports OTP delivery via AWS SNS (Simple Notification Service).

## Setup Instructions

### 1. AWS Account & IAM Setup

1. **Create an AWS Account** (if you don't have one): https://aws.amazon.com
2. **Create an IAM User** with SNS permissions:
   - Go to AWS IAM console
   - Create a new user with programmatic access
   - Attach policy: `AmazonSNSFullAccess` (or create a custom policy)
   - Save the **Access Key ID** and **Secret Access Key**

### 2. Enable SMS in AWS SNS

1. Go to AWS SNS console
2. Click on **Text messaging (SMS)**
3. Set **Default message type** to `Transactional` (cheaper, faster)
4. Set **Monthly spend limit** (e.g., $1)
5. Request SMS sandbox access or verify your phone number

### 3. Configure Your Application

Edit `Server/src/main/resources/application.properties`:

```properties
# Enable SMS sending
aws.sns.enabled=true

# AWS region (choose closest to you)
aws.region=us-east-1

# Add your AWS credentials
aws.accessKeyId=YOUR_ACCESS_KEY_ID
aws.secretAccessKey=YOUR_SECRET_ACCESS_KEY
```

**Security Note**: For production, use environment variables instead:
```properties
aws.accessKeyId=${AWS_ACCESS_KEY_ID}
aws.secretAccessKey=${AWS_SECRET_ACCESS_KEY}
```

Then set environment variables:
```bash
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
```

### 4. Phone Number Format

When registering, use phone numbers with country code:
- **US**: +1-234-567-8900 or 12345678900
- **India**: +91-98765-43210
- **UK**: +44-7911-123456

### 5. Testing

1. Rebuild the backend: `mvn clean install`
2. Start the application
3. Register with a valid phone number
4. Click "Send OTP"
5. You'll receive an SMS with the OTP

## AWS SNS Pricing

- **Transactional SMS**: ~$0.00645 per SMS (US)
- **Promotional SMS**: ~$0.00100 per SMS (US, slower delivery)
- Free tier: 100 SMS per month

## Troubleshooting

### "User not found" error
- Make sure you registered first before requesting OTP

### "Failed to send SMS" error
- Check AWS credentials in application.properties
- Verify phone number format includes country code
- Check SMS spend limit hasn't been reached
- Ensure SMS is enabled in AWS SNS settings

### No SMS received but OTP shows in UI
- `aws.sns.enabled=false` - SMS is disabled. Set to `true`
- Check phone number is correct
- Check AWS region configuration
- Verify credentials are valid

### How to Disable AWS SNS

To disable AWS SNS and fall back to console logging:
```properties
aws.sns.enabled=false
```

The OTP will still be displayed in the UI for testing.

## Production Recommendations

1. **Use Environment Variables**: Don't commit credentials to git
2. **Use IAM Roles**: In production (EC2, Lambda), use IAM roles instead of access keys
3. **Monitor Costs**: Set CloudWatch alarms for SNS spending
4. **Rate Limiting**: Add rate limiting on OTP requests (max 5 per hour per phone)
5. **DLQ Setup**: Setup Dead Letter Queue for failed messages

## Security Best Practices

1. ✅ OTP expires after 5 minutes
2. ✅ One-time use only (removed after verification)
3. ✅ 6-digit random code (900,000 combinations)
4. ✅ Rate limited (implement on production)
5. ❌ Never share OTP via email - SMS only
6. ❌ Never log OTP to public logs in production

## Support

For AWS SNS documentation: https://docs.aws.amazon.com/sns/
For rate limiting implementation, see Spring Security documentation
