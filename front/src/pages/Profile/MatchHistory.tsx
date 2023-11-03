import {
    Card,
    Flex,
    Image,
    Stack,
    CardBody,
    Heading,
    Grid,
    GridItem
} from '@chakra-ui/react';
import { Match } from '../../Types/Match';
import React, { useContext, useEffect } from 'react';
import { RenderContext } from '../../RenderContext';
import { GetMatchHistory } from './GetMatchHistory';

interface MatchHistoryProps {
    id?: number;
    username?: string;
}

const MatchHistory = (props: MatchHistoryProps) => {
    const [matchHistory, setMatchHistory] = React.useState<Match[]>([]);
    const renderData = useContext(RenderContext);
    useEffect(() => {
        GetMatchHistory(props.username).then((data) => {
            setMatchHistory(data);
        });
    }, [renderData.renderData]);
    return (
        <div>
            {matchHistory.length > 0 &&
            matchHistory.some(
                (match) =>
                    match.playerAId === props.id || match.playerBId === props.id
            ) ? (
                matchHistory.map((match) => {
                    return (
                        <Card
                            direction={{ base: 'column', sm: 'row' }}
                            overflow="hidden"
                            variant="outline"
                            bg={'#EEEEFF'}
                            boxShadow={'2xl'}
                            p={2}
                            h={'100px'}
                            w={'100%'}
                            style={{ boxShadow: 'none' }}
                            marginBottom={'0.5rem'}
                        >
                            <Grid templateColumns="repeat(5, 1fr)" gap={40} key={match?.id}>
                                <GridItem w="200%" h="10">
                                    <Flex>
                                        <Image
                                            objectFit="cover"
                                            width={'50px'}
                                            height={'50px'}
                                            marginTop={'18px'}
                                            src={match.playerA?.avatar}
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
                                                    {match.playerA?.username}
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
                                            src={match.playerB?.avatar}
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
                                                    {match.playerB?.username}
                                                </Heading>
                                            </CardBody>
                                        </Stack>
                                    </Flex>
                                </GridItem>
                            </Grid>
                        </Card>
                    );
                })
            ) : (
                <div className="noDms">No Matches</div>
            )}
        </div>
    );
};

export default MatchHistory;
