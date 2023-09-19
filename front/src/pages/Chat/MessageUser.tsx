import {
    Card, CardHeader, CardBody, CardFooter, Image, Stack,
    Heading, Text, Button
}
from '@chakra-ui/react'

interface MessageUserProps {
  profile: string;
  name: string;
  message: string;
}

const MessageUser = ({profile , name, message} : MessageUserProps) => {
    return (
        <div>
            <Card
        direction={{ base: 'column', sm: 'row' }}
        overflow='hidden'
        variant='outline'
        bg={"#F5F5F5"}
        boxShadow={"2xl"}
        p={2}
        h={"100px"}
        w={"100%"}
>
  <Image
    objectFit='cover'
    width={"50px"}
    height={"50px"}
    marginTop={"18px"}
    src={profile}
    alt={name}
    borderRadius={"30px"}
  />

  <Stack>
    <CardBody>
      <Heading
        as='h6'
        size='sm'
        fontWeight='bold'
        marginLeft={"10px"}
        marginTop={"25px"}
      >{name}</Heading>

      <Text
      marginLeft={"10px"}
      color={"#808080"}
      >
        {message}
      </Text>
    </CardBody>
  </Stack>
</Card>
        </div>
    );
}

export default MessageUser;