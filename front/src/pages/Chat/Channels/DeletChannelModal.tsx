import { Button, ButtonGroup, useToast } from '@chakra-ui/react';
import React from 'react';
import { SocketContext } from '../../../socket';
import { Channel } from '../../../Types/Channel';
import { UserType } from '../../../Types/User';
import { SubmitHandler, useForm } from 'react-hook-form';

interface deleteChannel {
    password: string;
}

interface deleteChannelProps {
    onClose: () => void;
    setRender?: React.Dispatch<React.SetStateAction<boolean>>;
    render?: boolean;
    channelDm?: Channel;
    user?: UserType;
}

const DeletChannelModal = (props: deleteChannelProps) => {
    const socket = React.useContext(SocketContext);
    const toast = useToast();
    const { register, handleSubmit } = useForm<deleteChannel>();
    const handleDeleteChannel: SubmitHandler<deleteChannel> = (data) => {
        console.log('Delete Channel Data', data);
        console.log('pass', data.password);
        socket.emit('deleteChannel', {
            room: props.channelDm?.name,
            password: data.password
        });
        props.setRender && props.setRender(!props.render);
        props.onClose();
    };

    return (
        <form
            style={{ padding: '5px' }}
            onSubmit={handleSubmit(handleDeleteChannel)}
        >
            <div className="form-group">
                <label htmlFor="name">Password</label>
                <input
                    className="form-control"
                    type="password"
                    placeholder="Type Password"
                    id="name"
                    {...register('password')}
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
export default DeletChannelModal;
