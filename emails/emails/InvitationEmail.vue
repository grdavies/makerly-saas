<template>
  <Email>
    <Head>
      <Title>You're Invited to Join {{ teamName }} on Makerly</Title>
    </Head>
    <Preview>Join {{ teamName }} on Makerly</Preview>
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
          <Heading>You're Invited!</Heading>
          <Text>Hi {{ inviteeName }},</Text>
          <Text>
            {{ inviterName }} has invited you to join the
            <strong>{{ teamName }}</strong> team on Makerly.
          </Text>

          <Text>
            Makerly is a powerful inventory management platform that helps teams
            track, organize, and manage their inventory efficiently.
          </Text>

          <Section>
            <Button href="{{ invitationUrl }}" style="primary">
              Accept Invitation
            </Button>
          </Section>

          <Text>
            Your role will be: <strong>{{ role }}</strong>
          </Text>

          <Text>
            If the button doesn't work, you can copy and paste this link into
            your browser:
          </Text>
          <Text style="word-break: break-all; color: #666">
            {{ invitationUrl }}
          </Text>

          <Text>
            This invitation will expire in {{ expirationDays }} days.
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
  inviteeName: string;
  inviterName: string;
  teamName: string;
  role: string;
  invitationUrl: string;
  expirationDays: number;
}

defineProps<Props>();
</script>
