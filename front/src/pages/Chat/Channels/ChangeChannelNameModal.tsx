import { Button, ButtonGroup, useToast } from '@chakra-ui/react';
import React from 'react';
import { SocketContext } from '../../../socket';
import { Channel } from '../../../Types/Channel';
import { UserType } from '../../../Types/User';
import { SubmitHandler, useForm } from 'react-hook-form';
import client from '../../../components/Client';

interface changeName {
    name: string;
}

interface ChangeChannelNameModalProps {
    onClose: () => void;
    setRender?: React.Dispatch<React.SetStateAction<boolean>>;
    render?: boolean;
    channelDm?: Channel;
    user?: UserType;
}

const ChangeChannelNameModal = (props: ChangeChannelNameModalProps) => {
    const socket = React.useContext(SocketContext);
    const toast = useToast();
    const { register, handleSubmit } = useForm<changeName>();
    const handleChangeName: SubmitHandler<changeName> = async (data) => {
        // console.log('Change Channel Name Data', data);
        const sentData = {
            name: data.name
        };
        try {
            const response = await client.post(
                `chat/change-channel-name/${props.channelDm?.name}`,
                sentData,
                {
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem('token')
                    }
                }
            );
            props.setRender && props.setRender(!props.render);
            props.onClose();
        } catch (error: any) {
            // console.log('error', error);
            toast({
                title: 'Error',
                description: error.response.data.message,
                status: 'error',
                duration: 9000,
                isClosable: true,
                position: 'bottom-right'
            });
            props.onClose();
        }
    };

    return (
        <form
            style={{ padding: '5px' }}
            onSubmit={handleSubmit(handleChangeName)}
        >
            <div className="form-group">
                <label htmlFor="name">Channel Name</label>
                <input
                    className="form-control"
                    type="text"
                    placeholder="Type Name"
                    id="name"
                    required
                    {...register('name')}
                />
            </div>
            <ButtonGroup display={'Flex'} justifyContent={'flex-end'} p={3}>
                <Button
                    bg={'#E9ECEF'}
                    color={'white'}
                    mr={3}
                    onClick={props.onClose}
                >
                    Close
                </Button>
                <Button
                    variant="ghost"
                    bg={'#a435f0'}
                    color={'white'}
                    type="submit"
                    className="excludeSubmit"
                >
                    Send
                </Button>
            </ButtonGroup>
        </form>
    );
};
export default ChangeChannelNameModal;
