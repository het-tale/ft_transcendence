import { Card, CardBody, Flex, Image, Stack, Text } from '@chakra-ui/react';
import { BsIncognito, BsShieldLock } from 'react-icons/bs';
import { ChannelDisplayProps } from './ChannelDisplay';

const ChannelDmInfo = (props: ChannelDisplayProps) => {
    const renderChannelInfo = () => {
        if (props.setShowChannelInfo)
            props.setShowChannelInfo(!props.showChannelInfo);
        props.setRender && props.setRender(!props.render);
    };
    return (
        <>
            <button
                onClick={renderChannelInfo}
                style={{
                    boxSizing: 'border-box',
                    width: '100%',
                    backgroundColor: '#F5F5F5',
                    height: '100px',
                    marginBottom: '0.5rem'
                }}
            >
                <Flex flexDirection={'row'} justifyContent={'space-between'}>
                    <Card
                        direction={{ base: 'column', sm: 'row' }}
                        overflow="hidden"
                        // variant="outline"
                        bg={'#F5F5F5'}
                        boxShadow={'2xl'}
                        p={2}
                        h={'100px'}
                        w={'100%'}
                        style={{ boxShadow: 'none' }}
                        marginBottom={'0.5rem'}
                    >
                        <Image
                            objectFit="cover"
                            width={'50px'}
                            height={'50px'}
                            marginTop={'18px'}
                            src={props.profile}
                            borderRadius={'30px'}
                        />

                        <Stack>
                            <CardBody>
                                <Text
                                    as="h6"
                                    size="sm"
                                    fontWeight="bold"
                                    marginLeft={'-5px'}
                                    marginTop={'20px'}
                                    marginBottom={1}
                                >
                                    {props.name}
                                </Text>
                            </CardBody>
                        </Stack>
                    </Card>
                    {props.type === 'protected' ? (
                        <BsShieldLock
                            size={'2rem'}
                            style={{
                                margin: '2.5rem',
                                color: '#a435f0'
                            }}
                            title="Protected"
                        />
                    ) : props.type === 'private' ? (
                        <BsIncognito
                            size={'2rem'}
                            style={{ margin: '2.5rem', color: '#a435f0' }}
                            title="Private"
                        />
                    ) : null}
                </Flex>
            </button>
        </>
    );
};

export default ChannelDmInfo;
