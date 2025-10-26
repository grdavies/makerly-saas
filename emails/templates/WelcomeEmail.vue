<template>
  <Email>
    <Head>
      <Title>Welcome to Makerly!</Title>
    </Head>
    <Preview>Welcome to Makerly - Your inventory management solution</Preview>
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
          <Heading>Welcome to Makerly!</Heading>
          <Text>Hi {{ name }},</Text>
          <Text>
            Welcome to Makerly! We're excited to have you on board. Your account
            has been successfully created and you're ready to start managing
            your inventory.
          </Text>

          <Section>
            <Button href="{{ loginUrl }}" style="primary"> Get Started </Button>
          </Section>

          <Text>
            If you have any questions or need help getting started, don't
            hesitate to reach out to our support team.
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
  loginUrl: string;
}

defineProps<Props>();
</script>
