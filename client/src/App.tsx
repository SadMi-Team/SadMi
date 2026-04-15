import {Flex, Box, Button, Field, Input, Image  } from "@chakra-ui/react"
import {
  PasswordInput
} from "@/components/ui/password-input"


function App() {
  return (
    <Flex w="100%" h="fit" justify="center" align="center" direction="column">
      <Box>
        <Image rounded="md" src="sadmi-logo.png" alt="John Doe"  margin="8"/>
      </Box>
      <Flex padding="4" bg="bg.muted" justify="center" align="center" w={{base: "11/12", sm: "96"}} direction="column" shadow="lg" rounded="md" gap="2">
        <Field.Root>
          <Field.Label>Email</Field.Label>
          <Input placeholder="Coloque seu e-mail" />
          <Field.ErrorText>This field is required</Field.ErrorText>
        </Field.Root>
        <Field.Root>
          <Field.Label>Senha</Field.Label>
          <PasswordInput placeholder="Coloque sua senha" />
          <Field.ErrorText>This field is required</Field.ErrorText>
        </Field.Root>

        <Button w="full">Entrar</Button>
      </Flex>
    </Flex>
  )
}

export default App
