import {
  Flex,
  Button,
  Card,
  Table,
  CloseButton,
  Dialog,
  Portal,
  Input,
  Text,
  Image,
  Field,
  Checkbox,
} from "@chakra-ui/react";
import { PasswordInput } from "@/components/ui/password-input";
import { Toaster, toaster } from "@/components/ui/toaster";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useState } from "react";
import {
  LuLogOut,
  LuUsers,
  LuNotebookPen,
  LuTrash2,
  LuBuilding2,
  LuTrendingUp,
} from "react-icons/lu";

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

interface ModCliProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  title_modcli: string;
  setTitleCli: React.Dispatch<React.SetStateAction<string>>;
  nome_cli: string;
  setNomeCli: React.Dispatch<React.SetStateAction<string>>;
  email_cli: string;
  setEmailCli: React.Dispatch<React.SetStateAction<string>>;
  cnpj_cli: string;
  setCnpjCli: React.Dispatch<React.SetStateAction<string>>;
  status_cli: boolean;
  setStatusCli: React.Dispatch<React.SetStateAction<boolean>>;
  senha_cli: string;
  setSenhaCli: React.Dispatch<React.SetStateAction<string>>;
}

interface CCards {
  color: string;
  title: string;
  icon: React.ReactNode;
  value: string;
  subtitle: string;
}

interface CamposCliente {
  id: number;
  nome: string;
  email: string;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

interface CamposDelete {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  idCli: number;
  nomeCli: string;
}

const logoutRequest = () =>
  api
    .post(import.meta.env.VITE_API_URL + "/auth/logout", {
      withCredentials: true,
    })
    .then((res) => res.data);

const clientesRequest = () =>
  api
    .get(import.meta.env.VITE_API_URL + "/clientes", {
      withCredentials: true,
    })
    .then((res) => res.data);

const deleteCLiente = (id: number) =>
  api
    .delete(import.meta.env.VITE_API_URL + "/clientes/" + id, {
      withCredentials: true,
    })
    .then((res) => res.data);

function App() {
  const [open, setOpen] = useState(false);
  const [title_cli, setTitleCli] = useState("");
  const [nome_cli, setNomeCli] = useState("");
  const [email_cli, setEmailCli] = useState("");
  const [cnpj_cli, setCnpjCli] = useState("");
  const [status_cli, setStatusCli] = useState(true);
  const [senha_cli, setSenhaCli] = useState("");

  const [openDel, setOpenDel] = useState(false);
  const [idCli, setidCli] = useState(0);

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

  const deleteCLi = useMutation({
    mutationFn: deleteCLiente,
    onSuccess: (success) => {
      console.log(success);
      toaster.success({
        title: success.data,
        description: success.data.message,
      });
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

  const clientesQuery = useQuery({
    queryKey: ["clientes"],
    queryFn: clientesRequest,
    staleTime: 5 * 60 * 1000,
  });

  const cards: CCards[] = [
    {
      color: "blue",
      title: "Total de Clientes",
      icon: <LuUsers />,
      value: clientesQuery.isLoading ? 0 : clientesQuery.data.length,
      subtitle: clientesQuery.isLoading
        ? "0"
        : String(
            clientesQuery.data.filter((cliente: CamposCliente) => cliente.ativo)
              .length,
          ) + " Ativos",
    },
    {
      color: "green",
      title: "Maquinas Cadastradas",
      icon: <LuBuilding2 />,
      value: "26",
      subtitle: "Em todos os clientes",
    },
    {
      color: "red",
      title: "Taxa de Utilização",
      icon: <LuTrendingUp />,
      value: "87.3%",
      subtitle: "Média global",
    },
  ];

  function openCliMod(
    mode: string,
    cliente: CamposCliente = {
      id: 0,
      nome: "",
      email: "",
      ativo: true,
      criado_em: "",
      atualizado_em: "",
    },
  ) {
    if (mode == "MOD") {
      setOpen(true);
      setTitleCli("Modificar Cliente");
      setNomeCli(cliente.nome);
      setEmailCli(cliente.email);
      setCnpjCli("não disponivel");
      setStatusCli(cliente.ativo);
      setSenhaCli("");
    } else {
      setOpen(true);
      setTitleCli("Adicionar Cliente");
      setNomeCli("");
      setEmailCli("");
      setCnpjCli("");
      setStatusCli(true);
      setSenhaCli("");
    }
  }

  function opendel(id: number, nome: string) {
    setNomeCli(nome);
    setidCli(id);
    setOpenDel(true);
  }
  function delteCli(id: number) {
    deleteCLi.mutate(id);
  }

  return (
    <Flex w="100%" h="full" direction="column" justify="center" align="center">
      <Toaster />
      <Flex
        w="100%"
        h="20"
        borderBottomWidth="1px"
        bg="blue.solid"
        shadow="md"
        justify="center"
        align="center"
      >
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
                Painel Administrativo{" "}
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
            <Text>Logout</Text>
          </Button>
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
        {cards.map((card: CCards) => (
          <CCard {...card} />
        ))}
      </Flex>
      <Flex
        padding={{ base: "5px", md: "10px" }}
        shadow="xl"
        marginTop="4"
        direction="column"
        w={{ base: "90%", md: "80%" }}
        rounded="md"
      >
        <Flex w="100%" justify="space-between" align="center" gap="2">
          <Flex direction="column">
            <Text color="fg.info" fontWeight="semibold">
              Gerenciar Clientes
            </Text>
            <Text color="fg.muted" textStyle="xs">
              Cadastre e gerencie as contas de clientes do sistema
            </Text>
          </Flex>
          <Button colorPalette="blue" onClick={() => openCliMod("NEW")}>
            + Novo Cliente
          </Button>
        </Flex>
        <Flex
          marginTop="2"
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
                  <Table.ColumnHeader>Cliente</Table.ColumnHeader>
                  <Table.ColumnHeader>Email</Table.ColumnHeader>
                  <Table.ColumnHeader>CNPJ</Table.ColumnHeader>
                  <Table.ColumnHeader>Maquinas</Table.ColumnHeader>
                  <Table.ColumnHeader>Status</Table.ColumnHeader>
                  <Table.ColumnHeader>Cadastro</Table.ColumnHeader>
                  <Table.ColumnHeader>Ações</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {clientesQuery.isLoading
                  ? "Carregando..."
                  : clientesQuery.data.map((cliente: CamposCliente) => (
                      <Table.Row key={cliente.id}>
                        <Table.Cell textAlign="start">
                          {cliente.nome}
                        </Table.Cell>
                        <Table.Cell textAlign="start">
                          {cliente.email}
                        </Table.Cell>
                        <Table.Cell textAlign="start">
                          {"não disponivel"}
                        </Table.Cell>
                        <Table.Cell textAlign="start">
                          {"não disponivel"}
                        </Table.Cell>
                        <Table.Cell textAlign="start">
                          {cliente.ativo ? (
                            <Flex
                              bg="bg.success"
                              rounded="md"
                              padding="3px"
                              align="center"
                              justify="center"
                              w="fit-content"
                            >
                              Ativo
                            </Flex>
                          ) : (
                            <Flex
                              bg="bg.muted"
                              rounded="md"
                              padding="3px"
                              align="center"
                              justify="center"
                              w="fit-content"
                            >
                              Desativado
                            </Flex>
                          )}
                        </Table.Cell>
                        <Table.Cell textAlign="start">
                          {cliente.criado_em}
                        </Table.Cell>
                        <Table.Cell textAlign="center">
                          <Flex gap="1">
                            <Button
                              size="xs"
                              variant="ghost"
                              onClick={() => openCliMod("MOD", cliente)}
                            >
                              <LuNotebookPen color="blue" />
                            </Button>
                            <Button
                              size="xs"
                              variant="ghost"
                              onClick={() => opendel(cliente.id, cliente.nome)}
                            >
                              <LuTrash2 color="red" />
                            </Button>
                          </Flex>
                        </Table.Cell>
                      </Table.Row>
                    ))}
              </Table.Body>
            </Table.Root>
          </Table.ScrollArea>
        </Flex>
      </Flex>

      <AddCli
        open={open}
        setOpen={setOpen}
        title_modcli={title_cli}
        setTitleCli={setTitleCli}
        nome_cli={nome_cli}
        setNomeCli={setNomeCli}
        email_cli={email_cli}
        setEmailCli={setEmailCli}
        cnpj_cli={cnpj_cli}
        setCnpjCli={setCnpjCli}
        status_cli={status_cli}
        setStatusCli={setStatusCli}
        senha_cli={senha_cli}
        setSenhaCli={setSenhaCli}
      />
      <ConfirmaDeleta
        open={openDel}
        setOpen={setOpenDel}
        nomeCli={nome_cli}
        idCli={idCli}
      />
    </Flex>
  );
}

function CCard({ color, title, icon, value, subtitle }: CCards) {
  return (
    <Card.Root
      size="sm"
      w={{ base: "100%", sm: "100%", md: "30%" }}
      shadow="md"
    >
      <Card.Header>
        <Flex justify="space-between" align="center">
          <Text textStyle="sm" fontWeight="semibold">
            {title}
          </Text>
          <Flex rounded="md" bg={color + ".muted"} padding="4px" align="center">
            {icon}
          </Flex>
        </Flex>
      </Card.Header>
      <Card.Body>
        <Text textStyle="3xl" fontWeight="bold" color={color}>
          {value}
        </Text>
        <Text textStyle="xs" color="fg.muted">
          {subtitle}
        </Text>
      </Card.Body>
    </Card.Root>
  );
}

function AddCli({
  open,
  setOpen,
  title_modcli,
  nome_cli,
  setNomeCli,
  email_cli,
  setEmailCli,
  cnpj_cli,
  setCnpjCli,
  status_cli,
  setStatusCli,
  senha_cli,
  setSenhaCli,
}: ModCliProps) {
  return (
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
              <Dialog.Title>{title_modcli}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Flex direction="column" gap="2">
                <Field.Root>
                  <Field.Label>Nome Cliente</Field.Label>
                  <Input
                    placeholder="Nome Exemplo"
                    value={nome_cli}
                    onChange={(e: { target: { value: string } }) =>
                      setNomeCli(e.target.value)
                    }
                  />
                </Field.Root>
                <Field.Root>
                  <Field.Label>Email</Field.Label>
                  <Input
                    placeholder="me@example.com"
                    value={email_cli}
                    onChange={(e: { target: { value: string } }) =>
                      setEmailCli(e.target.value)
                    }
                  />
                </Field.Root>
                <Field.Root>
                  <Field.Label>CNPJ</Field.Label>
                  <Input
                    placeholder="XX.XXX.XXX/0001-XX"
                    value={cnpj_cli}
                    onChange={(e: { target: { value: string } }) =>
                      setCnpjCli(e.target.value)
                    }
                  />
                </Field.Root>
                <Field.Root>
                  <Field.Label>Status</Field.Label>
                  <Checkbox.Root
                    defaultChecked
                    paddingLeft="10px"
                    colorPalette="blue"
                    checked={status_cli}
                    onCheckedChange={(e) => setStatusCli(!!e.checked)}
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Checkbox.Label>Ativo</Checkbox.Label>
                  </Checkbox.Root>
                </Field.Root>
                <Field.Root>
                  <Field.Label>Senha</Field.Label>
                  <PasswordInput
                    value={senha_cli}
                    onChange={(e: { target: { value: string } }) =>
                      setSenhaCli(e.target.value)
                    }
                  />
                </Field.Root>
              </Flex>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">Cancelar</Button>
              </Dialog.ActionTrigger>
              <Button>Salvar</Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

function ConfirmaDeleta({ open, setOpen, idCli, nomeCli }: CamposDelete) {
  return (
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
              <Dialog.Title>
                Você deseja mesmo deletar o cliente "{idCli + "- " + nomeCli}" ?
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              Clique no botão "Confirmar" para excluir o cliente, essa ação não
              pode ser desfeita.
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">Cancelar</Button>
              </Dialog.ActionTrigger>
              <Button colorPalette="red">Confirmar</Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
export default App;
