import { Button, ButtonGroup } from '@chakra-ui/react';
import React from 'react';
import { SocketContext } from '../../../socket';
import { Channel } from '../../../Types/Channel';
import { UserType } from '../../../Types/User';
import { SubmitHandler, useForm } from 'react-hook-form';

interface Invitation {
    username: string;
}

interface InviteUsersModalProps {
    onClose: () => void;
    setRender?: React.Dispatch<React.SetStateAction<boolean>>;
    render?: boolean;
    channelDm?: Channel;
    user?: UserType;
}

const InviteUsersModal = (props: InviteUsersModalProps) => {
    const socket = React.useContext(SocketContext);
    const { register, handleSubmit } = useForm<Invitation>();
    const handleInvitation: SubmitHandler<Invitation> = (data) => {
        socket.emit('sendRoomInvitation', {
            room: props.channelDm?.name,
            target: data.username
        });
        props.setRender && props.setRender(!props.render);
        props.onClose();
    };

    return (
        <form
            style={{ padding: '5px' }}
            onSubmit={handleSubmit(handleInvitation)}
        >
            <div className="form-group">
                <label htmlFor="name">UserName</label>
                <input
                    className="form-control"
                    type="text"
                    placeholder="Type name"
                    id="name"
                    {...register('username')}
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
export default InviteUsersModal;
