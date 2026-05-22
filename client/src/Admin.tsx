import { Flex, Button } from "@chakra-ui/react";
//import { Toaster, toaster } from "@/components/ui/toaster";

function App() {
  return (
    <Flex
      w="100%"
      h="full"
      direction="column"
    >
      {/* <Toaster /> */}
      <Flex w="100%" h="20" borderBottomWidth="1px" bg="blue.fg" shadow="md" justify="center" align="center">
        <Flex w={{base: "100%", md: "75%"}} justify="space-between" align="center">
          <Flex>Sadmi</Flex>
          <Button>Logout</Button>
        </Flex>
      </Flex>
      
    </Flex>
  );
}

export default App;
