import {
  Flex,
  Card,
  Text,
} from "@chakra-ui/react";

interface CCards {
  color: string;
  title: string;
  icon: React.ReactNode;
  value: string;
  subtitle: string;
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

export default CCard;