import React from 'react';
import { ModalBody, ModalFooter } from 'react-bootstrap';
import '../css/chat/modal.css';
import { SubmitHandler, useForm } from 'react-hook-form';
import { SentData } from '../pages/Chat/Dms';
import { Button, ButtonGroup } from '@chakra-ui/react';
import { SocketContext } from '../socket';

const ModalSendMessage = (props: any) => {
    const socket = React.useContext(SocketContext);
    const { register, handleSubmit } = useForm<SentData>();
    const handleSendMessage: SubmitHandler<SentData> = (data) => {
        // if (data.to === 'ROBOT') {
        //     socket.emit('privateMessageROBOT', {
        //         message: data.message,
        //         to: data.to
        //     });
        // } else
        socket.emit('privateMessage', {
            message: data.message,
            to: data.to
        });
        props.onClose();
        props.setRender(!props.render);
    };
    return (
        <>
            <ModalBody>
                <form
                    style={{ padding: '2%' }}
                    onSubmit={handleSubmit(handleSendMessage)}
                >
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            className="form-control"
                            type="text"
                            placeholder="Type username"
                            id="username"
                            required
                            {...register('to', { required: true })}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="message">Message</label>
                        <textarea
                            id="message"
                            className="form-control"
                            placeholder="Type message Here"
                            {...register('message', { required: true })}
                        />
                    </div>
                    <ButtonGroup display={'Flex'} justifyContent={'flex-end'}>
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
                            Create
                        </Button>
                    </ButtonGroup>
                </form>
            </ModalBody>

            <ModalFooter></ModalFooter>
        </>
    );
};

export default ModalSendMessage;
