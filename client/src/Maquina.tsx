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
} from "@chakra-ui/react";
import { useNavigate } from "react-router";
import { Toaster, toaster } from "@/components/ui/toaster";
import { useParams } from "react-router-dom";
import { LuArrowLeft, LuCog } from "react-icons/lu";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";

import api from "./utils/axios";
import CCard from "./components/CCard";

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

const maquinaRequest = (id: number) =>
  api
    .get(import.meta.env.VITE_API_URL + "/maquinas/" + id, {
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
  const { idCliente, idMaquina } = useParams();
  const navigate = useNavigate();

  const maquinasQuery = useQuery({
    queryKey: ["maquina", idCliente, idMaquina],
    queryFn: () => maquinaRequest(Number(idMaquina)),
    staleTime: 5 * 60 * 1000,
  });

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

function MaquinaEdit() {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");

  const { idMaquina, idCliente } = useParams();

  const maquinasQuery = useQuery({
    queryKey: ["maquina", idCliente, idMaquina],
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
      // setCopyCode(true);
      // setCode(success.token_comunicacao);
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
                      onCheckedChange={(e) => setAtivo(e.checked)}
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
                  onClick={() => editMaq.mutate({ ativo, idMaquina, nome })}
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
