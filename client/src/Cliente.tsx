import {
  Flex,
  Image,
  Text,
  Button,
} from "@chakra-ui/react";
import {
  LuUsers,
  LuLogOut
} from "react-icons/lu";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { Toaster, toaster } from "@/components/ui/toaster";

import api from "./utils/axios";
import CCard from "./components/CCard";

interface CCards {
  color: string;
  title: string;
  icon: React.ReactNode;
  value: string;
  subtitle: string;
}

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


const logoutRequest = () =>
  api
    .post(import.meta.env.VITE_API_URL + "/auth/logout", {
      withCredentials: true,
    })
    .then((res) => res.data);

function App() {
    const navigate = useNavigate();

    const logout = useMutation({
    mutationFn: logoutRequest,
    onSuccess: (success) => {
      console.log(success);
      navigate("/login");
    },
    onError: (error: ApiError) => {
      console.log(error);
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
    const cards: CCards[] = [
        {
          color: "blue",
          title: "Total de Clientes",
          icon: <LuUsers />,
          value: "0",
          subtitle: "0",
        },
        {
          color: "green",
          title: "Maquinas Cadastradas",
          icon: <LuUsers />,
          value: "26",
          subtitle: "Em todos os clientes",
        },
        {
          color: "red",
          title: "Taxa de Utilização",
          icon: <LuUsers />,
          value: "87.3%",
          subtitle: "Média global",
        },
      ];

    return (<Flex w="100%" h="full" direction="column" justify="center" align="center">      <Flex
            w="100%"
            h="20"
            borderBottomWidth="1px"
            bg="blue.solid"
            shadow="md"
            justify="center"
            align="center"
          >
            <Toaster />
            <Flex
              w={{ base: "90%", md: "80%" }}
              justify="space-between"
              align="center"
            >
              <Flex align="center" gap="2">
                <Flex borderRadius="md" borderWidth="5px" borderColor="white/20">
                  <Image
                    rounded="md"
                    src="sadmi-logo.png"
                    alt="John Doe"
                    height="40px"
                  />
                </Flex>
    
                <Flex direction="column">
                  <Text color="white" textStyle="md" fontWeight="semibold">
                    Dashboard de Produção
                  </Text>
                  <Text color="white" textStyle="sm">
                    Adminstrador
                  </Text>
                </Flex>
              </Flex>
    
              <Button
                colorPalette="gray"
                variant="surface"
                onClick={() => logout.mutate()}
              >
                <LuLogOut />
                <Text>Sair</Text>
              </Button>
            </Flex>
          </Flex></Flex>)
}
export default App;