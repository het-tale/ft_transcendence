import {
    Card,
    Flex,
    Image,
    Stack,
    CardBody,
    Heading,
    GridItem,
    Grid
} from '@chakra-ui/react';
import { Match } from '../../Types/Match';
import React, { useContext, useEffect } from 'react';
import { RenderContext } from '../../RenderContext';
import { GetMatchHistory } from './GetMatchHistory';

const MatchHistory = () => {
    const [matchHistory, setMatchHistory] = React.useState<Match[]>([]);
    const renderData = useContext(RenderContext);
    useEffect(() => {
        GetMatchHistory().then((data) => {
            setMatchHistory(data);
        });
    }, [renderData.renderData]);
    // console.log('MATCH HISTORY', matchHistory);
    // console.log('First MATCH HISTORY', matchHistory[0]?.PlayerA);
    return (
        <div>
            {matchHistory.length > 0
                ? matchHistory.map((match) => {
                    //   console.log('MATCH', match.PlayerA);
                      return (
                          <Card
                              direction={{ base: 'column', sm: 'row' }}
                              overflow="hidden"
                              variant="outline"
                              bg={'#EEEEFF'}
                              boxShadow={'2xl'}
                              p={2}
                              h={'100px'}
                              w={'98%'}
                              style={{ boxShadow: 'none' }}
                              marginBottom={'0.5rem'}
                          >
                              <Grid templateColumns="repeat(5, 1fr)" gap={40}>
                                  <GridItem w="200%" h="10">
                                      <Flex>
                                          <Image
                                              objectFit="cover"
                                              width={'50px'}
                                              height={'50px'}
                                              marginTop={'18px'}
                                              src={match.PlayerA?.avatar}
                                              alt={'name'}
                                              borderRadius={'30px'}
                                          />
                                          <Stack>
                                              <CardBody>
                                                  <Heading
                                                      as="h6"
                                                      size="sm"
                                                      fontWeight="bold"
                                                      marginLeft={'-10px'}
                                                      marginTop={'8px'}
                                                      marginBottom={1}
                                                  >
                                                      {match.PlayerA?.username}
                                                  </Heading>
                                              </CardBody>
                                          </Stack>
                                      </Flex>
                                  </GridItem>
                                  <GridItem
                                      w="100%"
                                      h="10"
                                      paddingLeft={10}
                                      m={8}
                                      fontWeight={'bold'}
                                      fontSize={25}
                                  >
                                      {match.resultA}
                                  </GridItem>
                                  <GridItem w="100%" h="10" marginTop={8}>
                                      <Image
                                          src={'/assets/versus.png'}
                                          alt={'name'}
                                          borderRadius={'50%'}
                                          w={50}
                                          h={100}
                                          marginTop={-10}
                                          marginLeft={10}
                                      />
                                  </GridItem>
                                  <GridItem
                                      w="100%"
                                      h="10"
                                      paddingLeft={10}
                                      m={8}
                                      fontWeight={'bold'}
                                      fontSize={25}
                                  >
                                      {match.resultB}
                                  </GridItem>
                                  <GridItem w="100%" h="10">
                                      <Flex>
                                          <Image
                                              objectFit="cover"
                                              width={'50px'}
                                              height={'50px'}
                                              marginTop={'18px'}
                                              src={match.PlayerB?.avatar}
                                              alt={'name'}
                                              borderRadius={'30px'}
                                          />
                                          <Stack>
                                              <CardBody>
                                                  <Heading
                                                      as="h6"
                                                      size="sm"
                                                      fontWeight="bold"
                                                      marginLeft={'-10px'}
                                                      marginTop={'8px'}
                                                      marginBottom={1}
                                                  >
                                                      {match.PlayerB?.username}
                                                  </Heading>
                                              </CardBody>
                                          </Stack>
                                      </Flex>
                                  </GridItem>
                              </Grid>
                          </Card>
                      );
                  })
                : null}
        </div>
    );
};

export default MatchHistory;
