import {
  Flex,
  Image,
  Text,
  Button,
  AbsoluteCenter,
  Spinner,
  Dialog,
  Portal,
  Field,
  Input,
  CloseButton,
  Switch,
  Table,
  Card,
} from "@chakra-ui/react";
import { useNavigate } from "react-router";
import { Toaster, toaster } from "@/components/ui/toaster";
import { useParams } from "react-router-dom";
import { LuArrowLeft, LuCog } from "react-icons/lu";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";

import api from "./utils/axios";
import CCard from "./components/CCard";
import { useColorMode, useColorModeValue } from "@/components/ui/color-mode";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

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

interface CCards {
  color: string;
  title: string;
  icon: React.ReactNode;
  value: string;
  subtitle: string;
}

interface MaquinaCampos {
  ativo: boolean;
  idMaquina: string;
  nome: string;
}

interface TabelaRegistro {
  dataHora: string;
  operador: string;
  tipoPeca: string;
  qtdOk: number;
  refugo: number;
  energia: string;
  material: string;
  duracao: string;
}

const maquinaRequest = (id: number) =>
  api
    .get(import.meta.env.VITE_API_URL + "/maquinas/" + id, {
      withCredentials: true,
    })
    .then((res) => res.data);

const telemetriaRequest = (id: number) =>
  api
    .get(import.meta.env.VITE_API_URL + "/maquinas/" + id + "/telemetria", {
      withCredentials: true,
    })
    .then((res) => res.data);

const anomaliasRequest = (id: number) =>
  api
    .get(import.meta.env.VITE_API_URL + "/maquinas/" + id + "/anomalias", {
      withCredentials: true,
    })
    .then((res) => res.data);

const ciclosRequest = (id: number) =>
  api
    .get(import.meta.env.VITE_API_URL + "/maquinas/" + id + "/ciclos", {
      withCredentials: true,
    })
    .then((res) => res.data);

const editMaquinasRequest = ({ ativo, idMaquina, nome }: MaquinaCampos) =>
  api
    .patch(
      import.meta.env.VITE_API_URL + "/maquinas/" + idMaquina,
      { nome, ativo },
      {
        withCredentials: true,
      },
    )
    .then((res) => res.data);

function App() {
  const { idMaquina } = useParams();
  const navigate = useNavigate();

  const maquinasQuery = useQuery({
    queryKey: ["maquina", idMaquina],
    queryFn: () => maquinaRequest(Number(idMaquina)),
    staleTime: 5 * 60 * 1000,
  });

  const telemetriaQuery = useQuery({
    queryKey: ["telemetria", idMaquina],
    queryFn: () => telemetriaRequest(Number(idMaquina)),
    staleTime: 60 * 1000, 
  });

  const [page, setPage] = useState(1);
  const pageBg = useColorModeValue("gray.50", "gray.950");
  const pageText = useColorModeValue("gray.900", "white");
  const tabBarBg = useColorModeValue("white", "gray.900");
  const cardBg = useColorModeValue("white", "gray.900");
  const cardHeaderBg = useColorModeValue("gray.100", "gray.950");
  const cardBodyBg = useColorModeValue("white", "gray.900");
  const cardText = useColorModeValue("gray.700", "whiteAlpha.700");
  const cardSubtitle = useColorModeValue("gray.500", "whiteAlpha.600");
  const cards: CCards[] = [
    {
      color: "blue",
      title: "OEE",
      icon: <LuArrowLeft />,
      value: telemetriaQuery.isLoading ? "..." : `${telemetriaQuery.data?.oee || "0"}%`,
      subtitle: "Eficiência Global",
    },
    {
      color: "blue",
      title: "Disponibilidade",
      icon: <LuArrowLeft />,
      value: telemetriaQuery.isLoading ? "..." : `${telemetriaQuery.data?.disponibilidade || "0"}%`,
      subtitle: "Em operação",
    },
    {
      color: "blue",
      title: "Performance",
      icon: <LuArrowLeft />,
      value: telemetriaQuery.isLoading ? "..." : String(telemetriaQuery.data?.performance || "0"),
      subtitle: "Peças produzidas",
    },
    {
      color: "blue",
      title: "Qualidade",
      icon: <LuArrowLeft />,
      value: telemetriaQuery.isLoading ? "..." : String(telemetriaQuery.data?.qualidade || "0"),
      subtitle: "Requerem atenção",
    },
  ];

  const renderizarPagina = () => {
    switch (page) {
      case 1:
        return <Desempenho telemetria={telemetriaQuery.data} />;
      case 2:
        return <Consumo telemetria={telemetriaQuery.data} />;
      case 3:
        return <Anomalias idMaquina={idMaquina!} />;
      case 4:
        return <Ciclos idMaquina={idMaquina!} />;
      default:
        return <Desempenho telemetria={telemetriaQuery.data} />;
    }
  };

  if (maquinasQuery.isFetching) {
    return (
      <AbsoluteCenter>
        <Spinner />
      </AbsoluteCenter>
    );
  }

  return (
    <Flex
      w="100%"
      minH="100vh"
      h="full"
      direction="column"
      justify="flex-start"
      align="center"
      gap="2"
      pt="4"
      bg={pageBg}
      color={pageText}
    >
      <Flex
        w="100%"
        h="fit-content"
        borderBottomWidth="1px"
        bg="blue.700"
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
                {maquinasQuery.data.nome}
              </Text>
              <Text color="white" textStyle="sm">
                Área do Cliente/Máquina
              </Text>
            </Flex>
          </Flex>

          <Flex align="center" gap="2">
            <MaquinaEdit />
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
        rounded="2xl"
        shadow="2xl"
        align="center"
        bg={tabBarBg}
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

function Desempenho({ telemetria }: { telemetria: any }) {
  const makeHourly = (t: any) => {
    if (!t) return [];
    const baseOee = Number(t.oee) || 70;
    const baseDisp = Number(t.disponibilidade) || 80;
    const basePerf = Number(t.performance) || 75;
    const baseQual = Number(t.qualidade) || 90;
    const arr: any[] = [];
    for (let i = 11; i >= 0; i--) {
      const hour = `${i}h`;
      arr.push({
        hora: hour,
        oee: Math.max(0, Math.round((baseOee + (Math.random() * 6 - 3)) * 10) / 10),
        disponibilidade: Math.max(0, Math.round((baseDisp + (Math.random() * 6 - 3)) * 10) / 10),
        performance: Math.max(0, Math.round((basePerf + (Math.random() * 6 - 3)) * 10) / 10),
        qualidade: Math.max(0, Math.round((baseQual + (Math.random() * 4 - 2)) * 10) / 10),
      });
    }
    return arr.reverse();
  };

  const hourly = makeHourly(telemetria);

  const colorModeCardBg = useColorModeValue("white", "gray.900");
  const colorModeCardHeaderBg = useColorModeValue("gray.100", "gray.950");
  const colorModeCardBodyBg = useColorModeValue("white", "gray.900");
  const colorModeCardText = useColorModeValue("gray.700", "whiteAlpha.700");
  const colorModeCardSubtitleText = useColorModeValue("gray.500", "whiteAlpha.600");

  return (
    <Flex w={{ base: "90%", md: "80%" }} direction="column" gap="2">
      <Flex
        direction={{ base: "column", md: "row" }}
        gap="2"
        justify="space-between"
        w="100%"
      >
        <Card.Root w={{ base: "100%", md: "49%" }} shadow="md" bg={colorModeCardBg} borderWidth="1px" borderColor={useColorModeValue("gray.200","whiteAlpha.100")}> 
          <Card.Header padding="0" bg={colorModeCardHeaderBg} borderBottomWidth="1px" borderColor={useColorModeValue("gray.200","whiteAlpha.100")}>
            <Flex
              w="100%"
              justify="space-between"
              padding="2"
              direction="column"
            >
              <Text color={colorModeCardText} fontWeight="semibold">
                Desempenho Horário
              </Text>
              <Text color={colorModeCardSubtitleText} textStyle="xs">
                Produção e métricas OEE das últimas 12 horas
              </Text>
            </Flex>
          </Card.Header>
          <Card.Body color={colorModeCardText} bg={colorModeCardBodyBg} padding="2">
            {hourly.length === 0 ? (
              "A carregar gráfico..."
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={hourly} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hora" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="oee" stroke="#3182CE" fill="#3182CE" />
                  <Area type="monotone" dataKey="disponibilidade" stroke="#48BB78" fill="#48BB78" />
                  <Area type="monotone" dataKey="performance" stroke="#F6AD55" fill="#F6AD55" />
                  <Area type="monotone" dataKey="qualidade" stroke="#ED64A6" fill="#ED64A6" />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Card.Body>
        </Card.Root>
        <Card.Root w={{ base: "100%", md: "49%" }} shadow="md" bg={colorModeCardBg} borderWidth="1px" borderColor={useColorModeValue("gray.200","whiteAlpha.100")}> 
          <Card.Header padding="0" bg={colorModeCardHeaderBg} borderBottomWidth="1px" borderColor={useColorModeValue("gray.200","whiteAlpha.100")}>
            <Flex
              w="100%"
              justify="space-between"
              padding="2"
              direction="column"
            >
              <Text color={colorModeCardText} fontWeight="semibold">
                Distribuição de Tempo
              </Text>
              <Text color={colorModeCardSubtitleText} textStyle="xs">
                Últimas 24 horas (minutos)
              </Text>
            </Flex>
          </Card.Header>
          <Card.Body color={colorModeCardText} bg={colorModeCardBodyBg} padding="2">
            {hourly.length === 0 ? (
              "A carregar gráfico..."
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={hourly} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hora" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="oee" stroke="#3182CE" />
                  <Line type="monotone" dataKey="disponibilidade" stroke="#48BB78" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card.Body>
        </Card.Root>
      </Flex>

      <Card.Root w="100%" shadow="md" bg={colorModeCardBg} borderWidth="1px" borderColor={useColorModeValue("gray.200","whiteAlpha.100")}>
        <Card.Header padding="0" bg={colorModeCardHeaderBg} borderBottomWidth="1px" borderColor={useColorModeValue("gray.200","whiteAlpha.100")}>
          <Flex w="100%" justify="space-between" padding="2" direction="column">
            <Text color={colorModeCardText} fontWeight="semibold">
              Componentes OEE
            </Text>
            <Text color={colorModeCardSubtitleText} textStyle="xs">
              Disponibilidade, Performance e Qualidade por hora
            </Text>
          </Flex>
        </Card.Header>
        <Card.Body color={colorModeCardText} bg={colorModeCardBodyBg} padding="2">
          {hourly.length === 0 ? (
            "A carregar gráfico..."
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={hourly} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hora" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="disponibilidade" stroke="#48BB78" />
                <Line type="monotone" dataKey="performance" stroke="#F6AD55" />
                <Line type="monotone" dataKey="qualidade" stroke="#ED64A6" />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card.Body>
      </Card.Root>
    </Flex>
  );
}

function Consumo({ telemetria }: { telemetria: any }) {
  const makeHourly = (t: any) => {
    if (!t) return [];
    const baseOee = Number(t.oee) || 70;
    const baseDisp = Number(t.disponibilidade) || 80;
    const basePerf = Number(t.performance) || 75;
    const baseQual = Number(t.qualidade) || 90;
    const arr: any[] = [];
    for (let i = 23; i >= 0; i--) {
      const hour = `${i}h`;
      arr.push({
        hora: hour,
        oee: Math.max(0, Math.round((baseOee + (Math.random() * 6 - 3)) * 10) / 10),
        disponibilidade: Math.max(0, Math.round((baseDisp + (Math.random() * 6 - 3)) * 10) / 10),
        performance: Math.max(0, Math.round((basePerf + (Math.random() * 6 - 3)) * 10) / 10),
        qualidade: Math.max(0, Math.round((baseQual + (Math.random() * 4 - 2)) * 10) / 10),
      });
    }
    return arr.reverse();
  };

  const hourly = makeHourly(telemetria);
  const cards: CCards[] = [
    {
      color: "orange",
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
      color: "green",
      title: "Performance",
      icon: <LuArrowLeft />,
      value: "7,560",
      subtitle: "Peças produzidas",
    },
  ];
  const colorModeCardBg = useColorModeValue("white", "gray.900");
  const colorModeCardHeaderBg = useColorModeValue("gray.100", "gray.950");
  const colorModeCardBodyBg = useColorModeValue("white", "gray.900");
  const colorModeCardText = useColorModeValue("gray.700", "whiteAlpha.700");
  const colorModeCardSubtitleText = useColorModeValue("gray.500", "whiteAlpha.600");

  return (
    <Flex w={{ base: "90%", md: "80%" }} direction="column" gap="2">
      <Card.Root w="100%" shadow="md" bg={colorModeCardBg} borderWidth="1px" borderColor={useColorModeValue("gray.200","whiteAlpha.100")}>
        <Card.Header padding="0" bg={colorModeCardHeaderBg} borderBottomWidth="1px" borderColor={useColorModeValue("gray.200","whiteAlpha.100")}>
          <Flex w="100%" justify="space-between" padding="2" direction="column">
            <Text color={colorModeCardText} fontWeight="semibold">
              Componentes OEE
            </Text>
            <Text color={colorModeCardSubtitleText} textStyle="xs">
              Disponibilidade, Performance e Qualidade por hora
            </Text>
          </Flex>
        </Card.Header>
        <Card.Body color={colorModeCardText} bg={colorModeCardBodyBg} padding="2">
          {hourly.length === 0 ? (
            "A carregar gráfico..."
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={hourly} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hora" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="oee" stroke="#3182CE" />
                <Line type="monotone" dataKey="disponibilidade" stroke="#48BB78" />
                <Line type="monotone" dataKey="performance" stroke="#F6AD55" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card.Body>
      </Card.Root>
      <Flex
        direction={{ base: "column", md: "row" }}
        gap="2"
        justify="space-between"
        w="100%"
      >
        {cards.map((card: CCards, index: number) => (
          <CCard {...card} key={index} />
        ))}
      </Flex>
    </Flex>
  );
}

function Anomalias({ idMaquina }: { idMaquina: string }) {
  const anomaliasQuery = useQuery({
    queryKey: ["anomalias", idMaquina],
    queryFn: () => anomaliasRequest(Number(idMaquina)),
  });

  return (
    <Flex
      padding={{ base: "5px", md: "10px" }}
      shadow="xl"
      marginTop="2"
      direction="column"
      w={{ base: "90%", md: "80%" }}
      rounded="md"
    >
      <Flex
        w="100%"
        justify="space-between"
        align="center"
        gap="2"
        direction={{ base: "column", md: "row" }}
      >
        <Table.ScrollArea borderWidth="1px" w="100%">
          <Table.Root size="sm">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Data/Hora</Table.ColumnHeader>
                <Table.ColumnHeader>Operador</Table.ColumnHeader>
                <Table.ColumnHeader>Tipo de Peça</Table.ColumnHeader>
                <Table.ColumnHeader>Qtd. OK</Table.ColumnHeader>
                <Table.ColumnHeader>Refugo</Table.ColumnHeader>
                <Table.ColumnHeader>Energia (kWh)</Table.ColumnHeader>
                <Table.ColumnHeader>Material (kg)</Table.ColumnHeader>
                <Table.ColumnHeader>Duração (min)</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {anomaliasQuery.isLoading ? (
                <Table.Row>
                  <Table.Cell colSpan={8} textAlign="center">
                    Carregando anomalias...
                  </Table.Cell>
                </Table.Row>
              ) : (
                anomaliasQuery.data?.map((item: TabelaRegistro, i: number) => (
                  <Table.Row key={i}>
                    <Table.Cell textAlign="start">{item.dataHora}</Table.Cell>
                    <Table.Cell textAlign="start">{item.operador}</Table.Cell>
                    <Table.Cell textAlign="start">{item.tipoPeca}</Table.Cell>
                    <Table.Cell textAlign="start">{item.qtdOk}</Table.Cell>
                    <Table.Cell textAlign="start">{item.refugo}</Table.Cell>
                    <Table.Cell textAlign="center">{item.energia}</Table.Cell>
                    <Table.Cell textAlign="center">{item.material}</Table.Cell>
                    <Table.Cell textAlign="center">{item.duracao}</Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table.Root>
        </Table.ScrollArea>
      </Flex>
    </Flex>
  );
}

function Ciclos({ idMaquina }: { idMaquina: string }) {
  const ciclosQuery = useQuery({
    queryKey: ["ciclos", idMaquina],
    queryFn: () => ciclosRequest(Number(idMaquina)),
  });

  return (
    <Flex
      padding={{ base: "5px", md: "10px" }}
      shadow="xl"
      marginTop="2"
      direction="column"
      w={{ base: "90%", md: "80%" }}
      rounded="md"
    >
      <Flex
        w="100%"
        justify="space-between"
        align="center"
        gap="2"
        direction={{ base: "column", md: "row" }}
      >
        <Table.ScrollArea borderWidth="1px" w="100%">
          <Table.Root size="sm">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Data/Hora</Table.ColumnHeader>
                <Table.ColumnHeader>Operador</Table.ColumnHeader>
                <Table.ColumnHeader>Tipo de Peça</Table.ColumnHeader>
                <Table.ColumnHeader>Qtd. OK</Table.ColumnHeader>
                <Table.ColumnHeader>Refugo</Table.ColumnHeader>
                <Table.ColumnHeader>Energia (kWh)</Table.ColumnHeader>
                <Table.ColumnHeader>Material (kg)</Table.ColumnHeader>
                <Table.ColumnHeader>Duração (min)</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {ciclosQuery.isLoading ? (
                <Table.Row>
                  <Table.Cell colSpan={8} textAlign="center">
                    Carregando ciclos...
                  </Table.Cell>
                </Table.Row>
              ) : (
                ciclosQuery.data?.map((item: TabelaRegistro, i: number) => (
                  <Table.Row key={i}>
                    <Table.Cell textAlign="start">{item.dataHora}</Table.Cell>
                    <Table.Cell textAlign="start">{item.operador}</Table.Cell>
                    <Table.Cell textAlign="start">{item.tipoPeca}</Table.Cell>
                    <Table.Cell textAlign="start">{item.qtdOk}</Table.Cell>
                    <Table.Cell textAlign="start">{item.refugo}</Table.Cell>
                    <Table.Cell textAlign="center">{item.energia}</Table.Cell>
                    <Table.Cell textAlign="center">{item.material}</Table.Cell>
                    <Table.Cell textAlign="center">{item.duracao}</Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table.Root>
        </Table.ScrollArea>
      </Flex>
    </Flex>
  );
}

function MaquinaEdit() {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");

  const { idMaquina } = useParams();

  const maquinasQuery = useQuery({
    queryKey: ["maquina", idMaquina],
    queryFn: () => maquinaRequest(Number(idMaquina)),
    staleTime: 5 * 60 * 1000,
  });

  const [ativo, setAtivo] = useState();

  const editMaq = useMutation({
    mutationFn: editMaquinasRequest,
    onSuccess: (success) => {
      toaster.success({
        title: success.data || "Sucesso",
        description: success.data?.message || "Editado com sucesso",
      });
      maquinasQuery.refetch();
    },
    onError: (error: ApiError) => {
      console.log(error);
      const data = error.response?.data;

      let msgTitle = "Erro ao Adicionar";

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

  return (
    <>
      <Button
        variant="subtle"
        onClick={() => {
          setNome(maquinasQuery.data.nome);
          setAtivo(maquinasQuery.data.ativo);
          setOpen(true);
        }}
      >
        <LuCog />
      </Button>
      <Dialog.Root
        lazyMount
        open={open}
        onOpenChange={(e: { open: boolean }) => setOpen(e.open)}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Editar Máquina</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Flex direction="column" gap="2">
                  <Field.Root>
                    <Field.Label>Nome Maquina</Field.Label>
                    <Input
                      placeholder="Nome Exemplo"
                      value={nome}
                      onChange={(e: { target: { value: string } }) =>
                        setNome(e.target.value)
                      }
                    />
                    <Field.ErrorText>
                      Favor inserir o nome do usuario!
                    </Field.ErrorText>
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>Ativo</Field.Label>
                    <Switch.Root
                      checked={ativo}
                      onCheckedChange={(e) => setAtivo(e.checked as any)}
                    >
                      <Switch.HiddenInput />
                      <Switch.Control>
                        <Switch.Thumb />
                      </Switch.Control>
                      <Switch.Label />
                    </Switch.Root>

                    <Field.ErrorText>
                      Favor inserir o nome do usuario!
                    </Field.ErrorText>
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>Token Máquina</Field.Label>
                    <Input
                      placeholder="Basic "
                      readOnly
                      value={maquinasQuery.data.token_comunicacao}
                    />

                    <Field.ErrorText>
                      Favor inserir o nome do usuario!
                    </Field.ErrorText>
                  </Field.Root>
                </Flex>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline">Cancelar</Button>
                </Dialog.ActionTrigger>
                <Button
                  onClick={() => editMaq.mutate({ ativo: ativo!, idMaquina: idMaquina!, nome })}
                >
                  Salvar
                </Button>
              </Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
}