import React from 'react';
import '../../../css/chat/modal.css';
import { Button, ButtonGroup } from '@chakra-ui/react';

import { SubmitHandler, useForm } from 'react-hook-form';
import { SocketContext } from '../../../socket';
import { UserType } from '../../../Types/User';
import { Channel } from '../../../Types/Channel';

interface LeaveChannel {
    newOwner: string;
}

interface BodySetOwnerModalProps {
    onClose: () => void;
    setRender?: React.Dispatch<React.SetStateAction<boolean>>;
    render?: boolean;
    channelDm?: Channel;
    user?: UserType;
}

const BodySetOwnerModal = (props: BodySetOwnerModalProps) => {
    const socket = React.useContext(SocketContext);
    const { register, handleSubmit } = useForm<LeaveChannel>();
    const handleLeaveChannelOwner: SubmitHandler<LeaveChannel> = (data) => {
        if (data.newOwner === props.channelDm?.owner.username)
            data.newOwner = '';
        socket.emit('leaveRoom', {
            room: props.channelDm?.name,
            newOwner: data.newOwner
        });
        props.onClose();
        props.setRender && props.setRender(!props.render);
    };
    return (
        <form
            style={{ padding: '5px' }}
            onSubmit={handleSubmit(handleLeaveChannelOwner)}
        >
            <div className="form-group">
                <label htmlFor="name">Owner Name</label>
                <input
                    className="form-control"
                    type="text"
                    placeholder="Type name"
                    id="name"
                    {...register('newOwner')}
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
                    Set
                </Button>
            </ButtonGroup>
        </form>
    );
};

export default BodySetOwnerModal;
