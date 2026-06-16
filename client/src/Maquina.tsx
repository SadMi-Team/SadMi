import {
  Flex,
  Image,
  Text,
  Button,
  Card,
  SimpleGrid,
  Table,
  Status,
  Dialog,
  Portal,
  Field,
  Input,
  CloseButton,
} from "@chakra-ui/react";
import { useNavigate } from "react-router";
import { Toaster, toaster } from "@/components/ui/toaster";
import { useParams } from "react-router-dom";
import { LuArrowLeft } from "react-icons/lu";
import { useState } from "react";

import CCard from "./components/CCard";

interface CCards {
  color: string;
  title: string;
  icon: React.ReactNode;
  value: string;
  subtitle: string;
}

function App() {
  const { idCliente, idMaquina } = useParams();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const cards: CCards[] = [
    {
      color: "blue",
      title: "OEE",
      icon: <LuArrowLeft />,
      value: "87.0%",
      subtitle: "Eficiência Global",
    },
    {
      color: "blue",
      title: "Disponibilidade",
      icon: <LuArrowLeft />,
      value: "5/8",
      subtitle: "Em operação",
    },
    {
      color: "blue",
      title: "Performance",
      icon: <LuArrowLeft />,
      value: "7,560",
      subtitle: "Peças produzidas",
    },
    {
      color: "blue",
      title: "Qualidade",
      icon: <LuArrowLeft />,
      value: "2",
      subtitle: "Requerem atenção",
    },
  ];
  const renderizarPagina = () => {
    switch (page) {
      case 1:
        return <Desempenho />;
      case 2:
        return <Consumo />;
      case 3:
        return <Anomalias />;
      case 4:
        return <Ciclos />;
      default:
        return <Desempenho />;
    }
  };

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
        h="fit-content"
        borderBottomWidth="1px"
        bg="blue.solid"
        shadow="md"
        justify="center"
        align="center"
        direction="column"
      >
        <Toaster />
        <Flex
          w={{ base: "90%", md: "80%" }}
          justify="space-between"
          align="center"
          marginTop="5"
        >
          <Flex align="center" gap="2">
            <Button
              variant="subtle"
              w="fit-content"
              padding="0"
              onClick={() => navigate("/cliente")}
            >
              <LuArrowLeft />
            </Button>
            <Flex borderRadius="md" borderWidth="5px" borderColor="white/20">
              <Image
                rounded="md"
                src="/sadmi-logo.png"
                alt="logo"
                height="40px"
              />
            </Flex>

            <Flex direction="column">
              <Text color="white" textStyle="md" fontWeight="semibold">
                Nome Máquina
              </Text>
              <Text color="white" textStyle="sm">
                Área do Cliente
              </Text>
            </Flex>
          </Flex>

          <Flex align="center" gap="2">
            Em Operação
          </Flex>
        </Flex>
        <Flex
          marginTop="2"
          marginBottom="2"
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
      </Flex>
      <Flex
        w={{ base: "90%", md: "80%" }}
        justify="space-between"
        rounded="xl"
        shadow="2xl"
        align="center"
        gap="2"
        direction={{ base: "column", md: "row" }}
        paddingTop={{ base: "2", md: "1" }}
        paddingBottom={{ base: "2", md: "1" }}
      >
        <Flex
          w={{ base: "96%", md: "20%" }}
          bg={page == 1 ? "blue.solid" : "none"}
          justify="center"
          align="center"
          rounded="xl"
          cursor="pointer"
          onClick={() => setPage(1)}
        >
          <Text fontWeight="medium" color={page == 1 ? "fg.inverted" : "fg"}>
            Desempenho
          </Text>
        </Flex>
        <Flex
          w={{ base: "96%", md: "20%" }}
          bg={page == 2 ? "blue.solid" : "none"}
          justify="center"
          align="center"
          rounded="xl"
          cursor="pointer"
          onClick={() => setPage(2)}
        >
          <Text fontWeight="medium" color={page == 2 ? "fg.inverted" : "fg"}>
            Consumo
          </Text>
        </Flex>
        <Flex
          w={{ base: "96%", md: "20%" }}
          bg={page == 3 ? "blue.solid" : "none"}
          justify="center"
          align="center"
          rounded="xl"
          cursor="pointer"
          onClick={() => setPage(3)}
        >
          <Text fontWeight="medium" color={page == 3 ? "fg.inverted" : "fg"}>
            Anomalias
          </Text>
        </Flex>
        <Flex
          w={{ base: "96%", md: "20%" }}
          bg={page == 4 ? "blue.solid" : "none"}
          justify="center"
          align="center"
          rounded="xl"
          cursor="pointer"
          onClick={() => setPage(4)}
        >
          <Text fontWeight="medium" color={page == 4 ? "fg.inverted" : "fg"}>
            Ciclos
          </Text>
        </Flex>
      </Flex>
      {renderizarPagina()}
    </Flex>
  );
}

export default App;

function Desempenho() {
  return "a";
}

function Consumo() {
  return "b";
}

function Anomalias() {
  return "c";
}

function Ciclos() {
  return "d";
}
