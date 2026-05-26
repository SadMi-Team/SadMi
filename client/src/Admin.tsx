import {
  Flex,
  Button,
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

interface ModCliProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  title_modcli: string;
  setTitleCli: React.Dispatch<React.SetStateAction<string>>;
  nome_cli: string;
  setNomeCli: React.Dispatch<React.SetStateAction<string>>;
  email_cli: string;
  setEmailCli: React.Dispatch<React.SetStateAction<string>>;
  status_cli: boolean;
  setStatusCli: React.Dispatch<React.SetStateAction<boolean>>;
  senha_cli: string;
  setSenhaCli: React.Dispatch<React.SetStateAction<string>>;
  errorName: boolean;
  setErrorName: React.Dispatch<React.SetStateAction<boolean>>;
  errorMail: boolean;
  setErrorMail: React.Dispatch<React.SetStateAction<boolean>>;
  errorSenha: boolean;
  setErrorSenha: React.Dispatch<React.SetStateAction<boolean>>;
  adicionar: (data: clienteCampos) => void;
  modificar: (data: clienteCampos, id: number) => void;
  idCliente: number;
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
  delteCli: (id: number) => void;
}

interface clienteCampos {
  id?: number;
  nome: string;
  email: string;
  senha?: string;
  ativo: boolean;
}

interface modClienteCampos {
  data: clienteCampos;
  id: number;
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

const addCLiente = (data: clienteCampos) =>
  api
    .post(import.meta.env.VITE_API_URL + "/clientes", data, {
      withCredentials: true,
    })
    .then((res) => res.data);

const modCLiente = (data: modClienteCampos) =>
  api
    .patch(import.meta.env.VITE_API_URL + "/clientes/" + data.id, data.data, {
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
  const [status_cli, setStatusCli] = useState(true);
  const [senha_cli, setSenhaCli] = useState("");
  const [id_cli, setIdCli] = useState(0);

  const [errorName, setErrorName] = useState(false);
  const [errorMail, setErrorMail] = useState(false);
  const [errorSenha, setErrorSenha] = useState(false);

  const [openDel, setOpenDel] = useState(false);
  const [idCli, setidCli] = useState(0);

  const navigate = useNavigate();

  const clientesQuery = useQuery({
    queryKey: ["clientes"],
    queryFn: clientesRequest,
    staleTime: 5 * 60 * 1000,
  });

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
      toaster.success({
        title: success.data || "Sucesso",
        description: success.data?.message || "Deletado com sucesso",
      });
      clientesQuery.refetch();
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

  const addCLi = useMutation({
    mutationFn: addCLiente,
    onSuccess: (success) => {
      toaster.success({
        title: success.data || "Sucesso",
        description: success.data?.message || "Adicionado com sucesso",
      });
      clientesQuery.refetch();
      setOpen(false);
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

  const modCli = useMutation({
    mutationFn: modCLiente,
    onSuccess: (success) => {
      toaster.success({
        title: success.data || "Sucesso",
        description: success.data?.message || "Modificado com sucesso",
      });
      clientesQuery.refetch();
      setOpen(false);
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
    setErrorName(false);
    setErrorMail(false);
    setErrorSenha(false);
    if (mode == "MOD") {
      setTitleCli("Modificar Cliente");
      setNomeCli(cliente.nome);
      setEmailCli(cliente.email);
      setStatusCli(cliente.ativo);
      setSenhaCli("");
      setIdCli(cliente.id);
      setOpen(true);
    } else {
      setTitleCli("Adicionar Cliente");
      setNomeCli("");
      setEmailCli("");
      setStatusCli(true);
      setSenhaCli("");
      setOpen(true);
    }
  }

  function opendel(id: number, nome: string) {
    setNomeCli(nome);
    setidCli(id);
    setOpenDel(true);
  }
  function delteCli(id: number) {
    deleteCLi.mutate(id);
    setOpenDel(false);
  }

  function adicionarCliente(data: clienteCampos) {
    addCLi.mutate(data);
  }

  function modificarCliente(data: clienteCampos, id: number) {
    modCli.mutate({ data, id });
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
            <Text>Sair</Text>
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
        {cards.map((card: CCards, index: number) => (
          <CCard {...card} key={index} />
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
        status_cli={status_cli}
        setStatusCli={setStatusCli}
        senha_cli={senha_cli}
        setSenhaCli={setSenhaCli}
        adicionar={adicionarCliente}
        modificar={modificarCliente}
        errorName={errorName}
        setErrorName={setErrorName}
        errorMail={errorMail}
        setErrorMail={setErrorMail}
        errorSenha={errorSenha}
        setErrorSenha={setErrorSenha}
        idCliente={id_cli}
      />
      <ConfirmaDeleta
        open={openDel}
        setOpen={setOpenDel}
        nomeCli={nome_cli}
        idCli={idCli}
        delteCli={delteCli}
      />
    </Flex>
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
  status_cli,
  setStatusCli,
  senha_cli,
  setSenhaCli,
  adicionar,
  modificar,
  errorName,
  setErrorName,
  errorMail,
  setErrorMail,
  errorSenha,
  setErrorSenha,
  idCliente,
}: ModCliProps) {
  function modCli() {
    let data;
    if (title_modcli == "Modificar Cliente") {
      if (senha_cli !== "") {
        data = {
          nome: nome_cli,
          email: email_cli,
          senha: senha_cli,
          ativo: status_cli,
        };
      } else {
        data = {
          nome: nome_cli,
          email: email_cli,
          ativo: status_cli,
        };
      }
      modificar(data, idCliente);
    } else {
      setErrorName(false);
      setErrorMail(false);
      setErrorSenha(false);

      let erro = 0;
      if (nome_cli == "") {
        setErrorName(true);
        erro++;
      }

      if (email_cli == "") {
        setErrorMail(true);
        erro++;
      }

      if (senha_cli == "") {
        setErrorSenha(true);
        erro++;
      }

      if (erro > 0) {
        return;
      }

      data = {
        nome: nome_cli,
        email: email_cli,
        senha: senha_cli,
        ativo: status_cli,
      };
      adicionar(data);
    }
  }
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
                <Field.Root invalid={errorName}>
                  <Field.Label>Nome Cliente</Field.Label>
                  <Input
                    placeholder="Nome Exemplo"
                    value={nome_cli}
                    onChange={(e: { target: { value: string } }) =>
                      setNomeCli(e.target.value)
                    }
                  />
                  <Field.ErrorText>
                    Favor inserir o nome do usuario!
                  </Field.ErrorText>
                </Field.Root>
                <Field.Root invalid={errorMail}>
                  <Field.Label>Email</Field.Label>
                  <Input
                    placeholder="me@example.com"
                    value={email_cli}
                    onChange={(e: { target: { value: string } }) =>
                      setEmailCli(e.target.value)
                    }
                  />
                  <Field.ErrorText>
                    Favor inserir o email do usuario!
                  </Field.ErrorText>
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
                <Field.Root invalid={errorSenha}>
                  <Field.Label>Senha</Field.Label>
                  <PasswordInput
                    value={senha_cli}
                    onChange={(e: { target: { value: string } }) =>
                      setSenhaCli(e.target.value)
                    }
                  />
                  <Field.ErrorText>
                    Favor inserir a senha do usuario!
                  </Field.ErrorText>
                </Field.Root>
              </Flex>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">Cancelar</Button>
              </Dialog.ActionTrigger>
              <Button onClick={() => modCli()}>Salvar</Button>
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

function ConfirmaDeleta({
  open,
  setOpen,
  idCli,
  nomeCli,
  delteCli,
}: CamposDelete) {
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
              <Button colorPalette="red" onClick={() => delteCli(idCli)}>
                Confirmar
              </Button>
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
