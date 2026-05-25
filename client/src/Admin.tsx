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
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
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
  nome_cli: string;
  email_cli: string;
  cnpj_cli: string;
}

interface CCards {
  color: string;
  title: string;
  icon: React.ReactNode;
  value: string;
  subtitle: string;
}

const logoutRequest = () =>
  axios.post(import.meta.env.VITE_API_URL + "/auth/logout", {
    withCredentials: true,
  });

function App() {
  const [open, setOpen] = useState(false);
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

  const items = [
    { id: 1, name: "Laptop", category: "Electronics", price: 999.99 },
    { id: 2, name: "Coffee Maker", category: "Home Appliances", price: 49.99 },
    { id: 3, name: "Desk Chair", category: "Furniture", price: 150.0 },
    { id: 4, name: "Smartphone", category: "Electronics", price: 799.99 },
    { id: 5, name: "Headphones", category: "Accessories", price: 199.99 },
  ];

  const cards: CCards[] = [
    {
      color: "blue",
      title: "Total de Clientes",
      icon: <LuUsers />,
      value: "3",
      subtitle: "2 ativos",
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
  return (
    <Flex w="100%" h="full" direction="column" justify="center" align="center">
      <Toaster />
      <Flex
        w="100%"
        h="20"
        borderBottomWidth="1px"
        bg="blue.fg"
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
          <Button colorPalette="blue" onClick={() => setOpen(true)}>
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
                {items.map((item) => (
                  <Table.Row key={item.id}>
                    <Table.Cell textAlign="start">{item.name}</Table.Cell>
                    <Table.Cell textAlign="start">{item.category}</Table.Cell>
                    <Table.Cell textAlign="start">{item.price}</Table.Cell>
                    <Table.Cell textAlign="start">{item.price}</Table.Cell>
                    <Table.Cell textAlign="start">{item.price}</Table.Cell>
                    <Table.Cell textAlign="start">{item.price}</Table.Cell>
                    <Table.Cell textAlign="center">
                      <Flex gap="1">
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => setOpen(true)}
                        >
                          <LuNotebookPen color="blue" />
                        </Button>
                        <Button size="xs" variant="ghost">
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

      <AddCli open={open} setOpen={setOpen} />
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

function AddCli({ open, setOpen }: ModCliProps) {
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
              <Dialog.Title>Adicionar Cliente</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Flex direction="column" gap="2">
                <Field.Root>
                  <Field.Label>Nome Cliente</Field.Label>
                  <Input placeholder="Nome Exemplo" />
                </Field.Root>
                <Field.Root>
                  <Field.Label>Email</Field.Label>
                  <Input placeholder="me@example.com" />
                </Field.Root>
                <Field.Root>
                  <Field.Label>CNPJ</Field.Label>
                  <Input placeholder="XX.XXX.XXX/0001-XX" />
                </Field.Root>
                <Field.Root>
                  <Field.Label>Status</Field.Label>
                  <Checkbox.Root
                    defaultChecked
                    paddingLeft="10px"
                    colorPalette="blue"
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Checkbox.Label>Ativo</Checkbox.Label>
                  </Checkbox.Root>
                </Field.Root>
                <Field.Root>
                  <Field.Label>Senha</Field.Label>
                  <PasswordInput />
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
export default App;
