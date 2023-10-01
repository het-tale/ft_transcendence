import { Card, Flex, Image, Box, Stack, CardBody, Heading, Text, Spacer, IconButton, Grid, GridItem } from "@chakra-ui/react";
import { BsChatLeftFill } from "react-icons/bs";
import { Link } from "react-router-dom";

const MatchHistory = () => {
    return (
        <div>
        <Card
        direction={{ base: 'column', sm: 'row' }}
        overflow='hidden'
        variant='outline'
        bg={"#EEEEFF"}
        boxShadow={"2xl"}
        p={2}
        h={"100px"}
        w={"98%"}
        style={{boxShadow: 'none'}}
>
<Grid templateColumns='repeat(5, 1fr)' gap={40}>
  <GridItem w='200%' h='10'>
  <Flex>
                <Image
                    objectFit='cover'
                    width={"50px"}
                    height={"50px"}
                    marginTop={"18px"}
                    src={"/assets/het-tale.jpg"}
                    alt={"name"}
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
                    >het-tale</Heading>

                    </CardBody>
                </Stack>
            </Flex>
  </GridItem>
  <GridItem w='100%' h='10'
  paddingLeft={10}
  m={8}
  fontWeight={"bold"}
  fontSize={25}>7</GridItem>
  <GridItem w='100%' h='10' marginTop={8} >
    <Image
    src={"/assets/versus.png"}
    alt={"name"}
    borderRadius={"50%"}
    w={50}
    h={100}
    marginTop={-10}
    marginLeft={10}
    />
  </GridItem>
  <GridItem w='100%' h='10'
    paddingLeft={10}
    m={8}
    fontWeight={"bold"}
    fontSize={25}
  >13</GridItem>
  <GridItem w='100%' h='10' >
  <Flex>
                <Image
                    objectFit='cover'
                    width={"50px"}
                    height={"50px"}
                    marginTop={"18px"}
                    src={"/assets/slahrach.jpg"}
                    alt={"name"}
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
                    >Hricha</Heading>

                    </CardBody>
                </Stack>
            </Flex>
  </GridItem>
</Grid>
    {/* <Flex>
            <Flex>
                <Image
                    objectFit='cover'
                    width={"50px"}
                    height={"50px"}
                    marginTop={"18px"}
                    src={"/assets/het-tale.jpg"}
                    alt={"name"}
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
                    >het-tale</Heading>

                    </CardBody>
                </Stack>
            </Flex>
            <Spacer w={"30em"} />
            <Flex justifyContent={"space-between"}>
                <Text>13</Text>
                <Text>7</Text>
            </Flex>
            <Spacer w={"27em"} />
            <Box marginTop={1}>
            
            <Flex>
                <Image
                    objectFit='cover'
                    width={"50px"}
                    height={"50px"}
                    marginTop={"18px"}
                    src={"/assets/slahrach.jpg"}
                    alt={"name"}
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
                    >Hricha</Heading>

                    </CardBody>
                </Stack>
            </Flex>
            </Box>

    </Flex> */}
</Card>
        </div>
    );
};

export default MatchHistory;