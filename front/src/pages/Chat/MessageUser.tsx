import {
    Card, CardHeader, CardBody, CardFooter, Image, Stack,
    Heading, Text, Button
}
from '@chakra-ui/react'
import { UserType } from '../../Types/User';

interface MessageUserProps {
  profile: string;
  name: string;
  message: string;
  children?: React.ReactNode;
  onClick?: () => void;
  design?: string;
  setId?: React.Dispatch<React.SetStateAction<number>>;
  id?: number;
  dm?: UserType;
  setUserDm?: React.Dispatch<React.SetStateAction<UserType | undefined>>;
}

const MessageUser = ({profile , name, message, children, design, setUserDm, dm} : MessageUserProps) => {
  const HandleDm = () => {
    console.log("Hellooo");
    if (setUserDm && dm) {
      setUserDm(dm);
    }
  }
  return (
        <div onClick={HandleDm}>
            <Card
            className={design}
        direction={{ base: 'column', sm: 'row' }}
        overflow='hidden'
        variant='outline'
        bg={"#F5F5F5"}
        boxShadow={"2xl"}
        p={2}
        h={"100px"}
        w={"100%"}
        style={{boxShadow: 'none'}}
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
        marginLeft={"-10px"}
        marginTop={"8px"}
        marginBottom={1}
      >{name}</Heading>

      <Text
      marginLeft={"-10px"}
      color={"#808080"}
      >
        {message}
      </Text>
    </CardBody>
  </Stack>
<>{children}</>
</Card>
        </div>
    );
}

export default MessageUser;