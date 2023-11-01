import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody
} from '@chakra-ui/react';
import '../../../css/chat/modal.css';
import { SubmitHandler, UseFormHandleSubmit } from 'react-hook-form';
import { SentData } from '../Dms';
import { Button, ButtonGroup } from '@chakra-ui/react';
import React from 'react';
import { SocketContext } from '../../../socket';
import { Channel } from '../../../Types/Channel';
import { useForm } from 'react-hook-form';
import { UserType } from '../../../Types/User';

interface DeleteRoomModalProps {
    isOpen: boolean;
    onOpen: () => void;
    title: string;
    children?: React.ReactNode;
    handleData?: () => void;
    handleMessageData?: SubmitHandler<SentData>;
    handleSubmit?: UseFormHandleSubmit<SentData>;
    onClose: () => void;
    setRender?: React.Dispatch<React.SetStateAction<boolean>>;
    render?: boolean;
    channelDm?: Channel;
    user?: UserType;
    onUpdated?: (password: string) => void;
    setIsClosed?: React.Dispatch<React.SetStateAction<boolean>>;
}
interface deleteChannel {
    password: string;
}

const DeleteRoomModal = (props: DeleteRoomModalProps) => {
    const socket = React.useContext(SocketContext);
    const { register, handleSubmit } = useForm<deleteChannel>();
    const handleDeleteChannel: SubmitHandler<deleteChannel> = (data) => {
        props.onUpdated && props.onUpdated(data.password);
        // socket.emit('deleteChannel', {
        //     room: props.channelDm?.name,
        //     password: data.password
        // });
        // props.setRender && props.setRender(!props.render);
        // // props.onUpdated && props.onUpdated();
        // props.setIsClosed && props.setIsClosed(true);
        // props.onClose();
    };
    return (
        <>
            <Modal isOpen={props.isOpen} onClose={props.onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{props.title}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
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
                            <ButtonGroup
                                display={'Flex'}
                                justifyContent={'flex-end'}
                                p={3}
                            >
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
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
};

export default DeleteRoomModal;
