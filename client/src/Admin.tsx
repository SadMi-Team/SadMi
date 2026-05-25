import { Flex, Button, Card, Heading, Table, CloseButton, Dialog, Portal, Input } from "@chakra-ui/react";
import { Toaster, toaster } from "@/components/ui/toaster";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useState } from "react";

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

interface AddCliProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const logoutRequest = () =>
  axios.post(import.meta.env.VITE_API_URL + "/auth/logout", {
    withCredentials: true,
  });

function App() {
  const [open, setOpen] = useState(false)
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
  ]

  return (
    <Flex
      w="100%"
      h="full"
      direction="column"
      justify="center"
      align="center"
    >
      <Toaster /> 
      <Flex w="100%" h="20" borderBottomWidth="1px" bg="blue.fg" shadow="md" justify="center" align="center">
        <Flex w={{base: "98%", md: "75%"}} justify="space-between" align="center">
          <Flex>Sadmi</Flex>
          <Button onClick={() => logout.mutate()}>Logout</Button>
        </Flex>
      </Flex>
      <Flex marginTop="2" w={{base: "100%", md: "80%"}} justify="space-between" align="center"  direction={{base: "column", md: "row"}}>
        <CCard />
        <CCard />
        <CCard />
      </Flex>
      <Flex marginTop="2" w={{base: "100%", md: "80%"}} justify="space-between" align="center" gap="2" >
        Gerenciar Clientes
        <Button onClick={() => setOpen(true)}>+ Adicionar Cliente</Button>
      </Flex>
      <Flex marginTop="2" w={{base: "100%", md: "80%"}} justify="space-between" align="center" gap="2" direction={{base: "column", md: "row"}}>
        <Table.Root size="sm">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Product</Table.ColumnHeader>
              <Table.ColumnHeader>Category</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">Price</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {items.map((item) => (
              <Table.Row key={item.id}>
                <Table.Cell>{item.name}</Table.Cell>
                <Table.Cell>{item.category}</Table.Cell>
                <Table.Cell textAlign="end">{item.price}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Flex>
      <AddCli open={open} setOpen={setOpen}/>
    </Flex>
  );
}

function CCard(){
  return ( 
    <Card.Root size="sm" w={{base: "90%", sm: "80%", md: "30%"}}>
      <Card.Header>
        <Heading size="md"> Card - sm</Heading>
      </Card.Header>
      <Card.Body color="fg.muted">
        This is the card body. Lorem ipsum dolor sit amet, consectetur
        adipiscing elit.
      </Card.Body>
    </Card.Root>
  )
}

function AddCli({ open, setOpen } : AddCliProps){

  return (
    <Dialog.Root lazyMount open={open} onOpenChange={(e : {open: boolean}) => setOpen(e.open)}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Adicionar Cliente</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Input />
              <Input />
              <Input />
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </Dialog.ActionTrigger>
              <Button>Save</Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
export default App;
