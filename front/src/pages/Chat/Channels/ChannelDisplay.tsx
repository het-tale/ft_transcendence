import {
    Card,
    CardBody,
    Flex,
    Heading,
    Image,
    Stack,
    Text
} from '@chakra-ui/react';
import { Margin } from '@mui/icons-material';
import { BsIncognito, BsShieldLock } from 'react-icons/bs';
import { Channel } from '../../../Types/Channel';
import { useEffect } from 'react';

export interface ChannelDisplayProps {
    profile?: string;
    name?: string;
    type?: string;
    setChannelDm?: React.Dispatch<React.SetStateAction<Channel | undefined>>;
    channelDm?: Channel;
    roomDm?: Channel;
    activeCard?: string;
    setUpdateRoomClass?: React.Dispatch<
        React.SetStateAction<number | undefined>
    >;
    updateRoomClas?: number;
    id?: number;
    showChannelInfo?: boolean;
    setShowChannelInfo?: React.Dispatch<React.SetStateAction<boolean>>;
    render?: boolean;
    setRender?: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChannelDisplay = (props: ChannelDisplayProps) => {
    const handleRoomDm = () => {
        console.log('hello From Room Dm', props.id);
        if (props.setChannelDm && props.setUpdateRoomClass) {
            props.setChannelDm(props.roomDm);
            props.setUpdateRoomClass(props.id);
        }
        props.setRender && props.setRender(!props.render);
    };
    return (
        <div>
            <button
                onClick={handleRoomDm}
                style={{
                    boxSizing: 'border-box',
                    width: '100%',
                    backgroundColor: '#F5F5F5',
                    height: '100px',
                    marginBottom: '1rem'
                }}
                className={props.activeCard}
            >
                <Flex flexDirection={'row'} justifyContent={'space-between'}>
                    <Card
                        direction={{ base: 'column', sm: 'row' }}
                        overflow="hidden"
                        bg={'#F5F5F5'}
                        boxShadow={'2xl'}
                        p={2}
                        h={'100px'}
                        w={'100%'}
                        style={{ boxShadow: 'none' }}
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
        </div>
    );
};
export default ChannelDisplay;
