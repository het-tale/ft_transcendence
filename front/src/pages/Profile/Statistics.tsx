import {
    Flex,
    Heading,
    List,
    ListItem,
    Avatar,
    Text,
    StatGroup,
    Stat,
    StatLabel,
    StatNumber,
    StatArrow
} from '@chakra-ui/react';
import React, { useContext, useEffect } from 'react';
import { RenderContext } from '../../RenderContext';
import { Achievement } from '../../Types/Achievement';
import { GetAchievements } from './GetAchievements';
import { UserType } from '../../Types/User';

interface StatisticsProps {
    user?: UserType;
}

const Statistics = (props: StatisticsProps) => {
    const [achievements, setAchievements] = React.useState<Achievement[]>([]);
    const renderData = useContext(RenderContext);
    useEffect(() => {
        GetAchievements().then((data) => {
            setAchievements(data);
        });
    }, [renderData.renderData]);
    // console.log('Achievements', achievements);
    // console.log('User', props.user);
    return (
        <Flex flexDirection={'column'}>
            <Flex flexDirection={'column'} marginTop={'1rem'}>
                <Heading color={'#a435f0'}>Achievements</Heading>
                <List spacing={3}>
                    {achievements?.length > 0
                        ? achievements.map((achievement) => {
                              return (
                                  <ListItem>
                                      <Avatar
                                          src={achievement.icon}
                                          size={'md'}
                                          marginRight={'1rem'}
                                      ></Avatar>
                                      <Text
                                          display={'inline'}
                                          fontSize={'md'}
                                          fontFamily={'Krona One'}
                                          align={'end'}
                                      >
                                          {achievement.name}
                                      </Text>
                                  </ListItem>
                              );
                          })
                        : null}
                </List>
            </Flex>
            <Flex flexDirection={'column'} marginTop={'1rem'}>
                <Heading color={'#a435f0'}>Statistics</Heading>
                <StatGroup>
                    <Stat>
                        <StatLabel>Rank</StatLabel>
                        <StatNumber>{props.user?.g_rank}</StatNumber>
                    </Stat>
                    <Stat>
                        <StatLabel>
                            Wins
                            <StatArrow type="increase" marginLeft={'10px'} />
                        </StatLabel>
                        <StatNumber>{props.user?.matchwin}</StatNumber>
                    </Stat>

                    <Stat>
                        <StatLabel>
                            Losses
                            <StatArrow type="decrease" marginLeft={'10px'} />
                        </StatLabel>
                        <StatNumber>{props.user?.matchlose}</StatNumber>
                    </Stat>
                </StatGroup>
            </Flex>
        </Flex>
    );
};

export default Statistics;
