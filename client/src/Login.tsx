import { Flex, Box, Button, Field, Input, Image } from "@chakra-ui/react";
import { PasswordInput } from "@/components/ui/password-input";
import { Toaster, toaster } from "@/components/ui/toaster";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router";

import api from "@/utils/axios";

interface ApiError {
  response?: {
    data?: ApiReturn;
  };
}

interface ApiReturn {
  erro?: string | ApiReturnMessage[];
  error?: string;
}

interface ApiReturnMessage {
  message: string;
}

interface LoginData {
  email: string;
  senha: string;
}

interface LoginData {
  email: string;
  senha: string;
}

const loginRequest = (data: LoginData) =>
  api
    .post(import.meta.env.VITE_API_URL + "/auth/login", data, {
      withCredentials: true,
    })
    .then((res) => res.data);

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const navigate = useNavigate();

  const login = useMutation({
    mutationFn: loginRequest,
    onSuccess: (success) => {
      console.log(success);
      if (success.usuario.perfil == "administrador") {
        navigate("/admin");
      } else {
        navigate("/cliente");
      }
    },
    onError: (error: ApiError) => {
      const data = error.response?.data;

      let msgTitle = "Erro";

      if (typeof data?.erro === "string") {
        msgTitle = data.erro;
      } else if (Array.isArray(data?.erro) && data.erro.length > 0) {
        msgTitle = data.erro[0].message;
      }
      const msgDesc = data?.error || "Descrição desconhecida";

      toaster.error({
        title: msgTitle,
        description: msgDesc,
      });
    },
  });

  const handleSubmit = () => {
    setUsernameError(false);
    setPasswordError(false);
    let hasError = false;

    if (username === "") {
      setUsernameError(true);
      hasError = true;
    }

    if (password === "") {
      setPasswordError(true);
      hasError = true;
    }

    if (hasError) {
      return;
    }

    const data: LoginData = {
      email: username,
      senha: password,
    };

    login.mutate(data);
  };

  return (
    <Flex w="100%" h="95vh" justify="center" align="center" direction="column">
      <Toaster />
      <Box>
        <Image rounded="md" src="sadmi-logo.png" alt="John Doe" margin="8" />
      </Box>
      <form
        style={{ display: "contents" }}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <Flex
          padding="4"
          bg="bg.muted"
          justify="center"
          align="center"
          w={{ base: "11/12", sm: "96" }}
          direction="column"
          shadow="lg"
          rounded="md"
          gap="2"
        >
          <Field.Root invalid={usernameError}>
            <Field.Label>Email</Field.Label>
            <Input
              value={username}
              onChange={(e: { target: { value: string } }) =>
                setUsername(e.target.value)
              }
              placeholder="Coloque seu e-mail"
            />
            <Field.ErrorText>Favor preencher o campo de email</Field.ErrorText>
          </Field.Root>
          <Field.Root invalid={passwordError}>
            <Field.Label>Senha</Field.Label>
            <PasswordInput
              placeholder="Coloque sua senha"
              value={password}
              onChange={(e: { target: { value: string } }) =>
                setPassword(e.target.value)
              }
            />
            <Field.ErrorText>Favor preencher o campo de senha</Field.ErrorText>
          </Field.Root>

          <Button
            w="full"
            colorPalette="gray"
            type="submit"
            alignSelf="center"
            loading={login.isPending}
            loadingText={"Entrando..."}
          >
            Entrar
          </Button>
        </Flex>
      </form>
    </Flex>
  );
}

export default App;
