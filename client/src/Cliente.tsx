import {
  Flex,
  Image,
  Text,
  Button,
  Card,
  SimpleGrid,
  Table,
  Status,
} from "@chakra-ui/react";
import {
  LuLogOut,
  LuActivity,
  LuCircleCheck,
  LuPackage,
  LuTriangleAlert,
} from "react-icons/lu";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { Toaster, toaster } from "@/components/ui/toaster";
import { ColorModeButton } from "@/components/ui/color-mode";

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

interface MaquinaCard {
  nome: string;
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
      title: "OEE Médio",
      icon: <LuActivity />,
      value: "87.0%",
      subtitle: "Eficiência Global",
    },
    {
      color: "green",
      title: "Máquinas Ativas",
      icon: <LuCircleCheck />,
      value: "5/8",
      subtitle: "Em operação",
    },
    {
      color: "purple",
      title: "Produção Semanal",
      icon: <LuPackage />,
      value: "7,560",
      subtitle: "Peças produzidas",
    },
    {
      color: "yellow",
      title: "Alertas",
      icon: <LuTriangleAlert />,
      value: "2",
      subtitle: "Requerem atenção",
    },
  ];

  return (
    <Flex
      w="100%"
      h="full"
      direction="column"
      justify="center"
      align="center"
      gap="2"
    >
      <Flex
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
                Área do Cliente
              </Text>
            </Flex>
          </Flex>

          <Flex align="center" gap="2">
            <ColorModeButton />
            <Button
              colorPalette="gray"
              variant="surface"
              onClick={() => logout.mutate()}
            >
              <LuLogOut />
              <Text>Sair</Text>
            </Button>
          </Flex>
        </Flex>
      </Flex>
      <Flex
        marginTop="2"
        w={{ base: "90%", md: "80%" }}
        justify="space-between"
        align="center"
        direction={{ base: "column", md: "row" }}
        gap="2"
      >
        {cards.map((card: CCards, index: number) => (
          <CCard {...card} key={index} />
        ))}
      </Flex>
      <Flex
        w={{ base: "90%", md: "80%" }}
        justify="space-between"
        direction={{ base: "column", md: "row" }}
        gap="2"
      >
        <Card.Root w={{ base: "100%", md: "49%" }} shadow="md">
          <Card.Header padding="0">
            <Flex
              w="100%"
              justify="space-between"
              padding="2"
              direction="column"
            >
              <Text color="fg.info" fontWeight="semibold">
                Gerenciar Clientes
              </Text>
              <Text color="fg.muted" textStyle="xs">
                Cadastre e gerencie as contas de clientes do sistema
              </Text>
            </Flex>
          </Card.Header>
          <Card.Body color="fg.muted">
            This is the card body. Lorem ipsum dolor sit amet, consectetur
            adipiscing elit.
          </Card.Body>
        </Card.Root>
        <Card.Root w={{ base: "100%", md: "49%" }} shadow="md">
          <Card.Header padding="0">
            <Flex
              w="100%"
              justify="space-between"
              padding="2"
              direction="column"
            >
              <Text color="fg.info" fontWeight="semibold">
                Gerenciar Clientes
              </Text>
              <Text color="fg.muted" textStyle="xs">
                Cadastre e gerencie as contas de clientes do sistema
              </Text>
            </Flex>
          </Card.Header>
          <Card.Body color="fg.muted">
            This is the card body. Lorem ipsum dolor sit amet, consectetur
            adipiscing elit.
          </Card.Body>
        </Card.Root>
      </Flex>
      <Card.Root w={{ base: "90%", md: "80%" }} shadow="md">
        <Card.Header padding="0">
          <Flex w="100%" justify="space-between" padding="2">
            <Flex direction="column">
              <Text color="fg.info" fontWeight="semibold">
                Gerenciar Clientes
              </Text>
              <Text color="fg.muted" textStyle="xs">
                Cadastre e gerencie as contas de clientes do sistema
              </Text>
            </Flex>
            <Button colorPalette="blue">+ Nova Maquina</Button>
          </Flex>
        </Card.Header>
        <Card.Body>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap="2">
            <Maquina nome="anos" />
            <Maquina nome="meses" />
            <Maquina nome="dias" />
            <Maquina nome="horas" />
          </SimpleGrid>
        </Card.Body>
      </Card.Root>
    </Flex>
  );
}
export default App;

function Maquina({ nome }: MaquinaCard) {
  return (
    <Card.Root size="sm">
      <Card.Header>
        <Flex justify="space-between">
          <Text fontWeight="semibold">{nome}</Text>
          <Status.Root colorPalette="red">
            <Status.Indicator />
          </Status.Root>
        </Flex>
      </Card.Header>
      <Card.Body color="fg.muted">
        <Table.Root size="sm">
          <Table.Header></Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Status:</Table.Cell>
              <Table.Cell>
                <Flex justify="end" w="100%">
                  <Text
                    bg="blue.fg"
                    w="fit-content"
                    rounded="md"
                    paddingLeft="1"
                    paddingRight="1"
                    color="fg.inverted"
                  >
                    Em Operação
                  </Text>
                </Flex>
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>OEE:</Table.Cell>
              <Table.Cell>
                <Flex justify="end" w="100%">
                  <Text color="fg.info">2</Text>
                </Flex>
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>1</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      </Card.Body>
    </Card.Root>
  );
}
