import React from 'react';
import '../css/chat/modal.css';
import { Button, ButtonGroup, Input } from '@chakra-ui/react';
import {
    FormControl,
    FormLabel,
    FormErrorMessage,
    FormHelperText,
    Radio,
    RadioGroup,
    HStack
} from '@chakra-ui/react';
import { CreateChannelData } from '../pages/Chat/Dms';
import { SubmitHandler, useForm } from 'react-hook-form';
import { SocketContext } from '../socket';

const ModalBodyUi = (props: any) => {
    const socket = React.useContext(SocketContext);
    const { register, handleSubmit } = useForm<CreateChannelData>();
    const handleCreateChannel: SubmitHandler<CreateChannelData> = (data) => {
        // console.log('Create Channel Data', data);
        // console.log('password', data.password);
        if (!props.showField) data.password = undefined;
        // console.log('password after', data.password);
        socket.emit('createRoom', {
            room: data.room,
            type: data.type,
            password: data.password
        });
        props.onClose();
        props.setRender(!props.render);
        props.setUpdate(!props.update);
    };
    return (
        <form
            style={{ padding: '5px' }}
            onSubmit={handleSubmit(handleCreateChannel)}
        >
            <div className="form-group">
                <label htmlFor="name">Channel Name</label>
                <input
                    className="form-control"
                    type="text"
                    placeholder="Type name"
                    id="name"
                    required
                    {...register('room', { required: true })}
                />
            </div>
            <FormControl as="fieldset">
                <FormLabel>Channel Type</FormLabel>
                <RadioGroup>
                    <HStack spacing="24px">
                        <Radio
                            value="public"
                            checked={props.selectedOption === 'public'}
                            {...register('type', {
                                onChange: props.handleRadioChange
                            })}
                        >
                            Public
                        </Radio>
                        <Radio
                            value="private"
                            checked={props.selectedOption === 'private'}
                            {...register('type', {
                                onChange: props.handleRadioChange
                            })}
                        >
                            Private
                        </Radio>
                        <Radio
                            value="protected"
                            checked={props.selectedOption === 'protected'}
                            {...register('type', {
                                onChange: props.handleRadioChange
                            })}
                        >
                            Protected
                        </Radio>
                    </HStack>
                </RadioGroup>
            </FormControl>
            {props.showField ? (
                <div className="form-group">
                    <label htmlFor="password">Channel Password</label>
                    <input
                        className="form-control"
                        type="password"
                        placeholder="Type password"
                        id="password"
                        required
                        {...register('password')}
                    />
                </div>
            ) : null}
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
                    Create
                </Button>
            </ButtonGroup>
        </form>
    );
};

export default ModalBodyUi;
