<template>
  <Email>
    <Head>
      <Title>Reset Your Password - Makerly</Title>
    </Head>
    <Preview>Reset your Makerly password</Preview>
    <Body>
      <Container>
        <Section>
          <Img
            src="https://makerly.com/logo.png"
            width="120"
            height="40"
            alt="Makerly Logo"
          />
        </Section>

        <Section>
          <Heading>Reset Your Password</Heading>
          <Text>Hi {{ name }},</Text>
          <Text>
            We received a request to reset your password for your Makerly
            account. If you didn't make this request, you can safely ignore this
            email.
          </Text>

          <Section>
            <Button href="{{ resetUrl }}" style="primary">
              Reset Password
            </Button>
          </Section>

          <Text>
            This link will expire in {{ expirationHours }} hours for security
            reasons.
          </Text>

          <Text>
            If the button doesn't work, you can copy and paste this link into
            your browser:
          </Text>
          <Text style="word-break: break-all; color: #666">
            {{ resetUrl }}
          </Text>

          <Text>
            If you have any questions, please contact our support team.
          </Text>

          <Text>
            Best regards,<br />
            The Makerly Team
          </Text>
        </Section>

        <Section>
          <Text style="text-align: center; color: #666; font-size: 12px">
            © 2024 Makerly. All rights reserved.
          </Text>
        </Section>
      </Container>
    </Body>
  </Email>
</template>

<script setup lang="ts">
interface Props {
  name: string;
  resetUrl: string;
  expirationHours: number;
}

defineProps<Props>();
</script>
