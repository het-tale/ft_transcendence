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
        console.log('Create Channel Data', data);
        console.log('password', data.password);
        socket.emit('createRoom', {
            room: data.room,
            type: data.type,
            password: data.password,
            avatar: data.avatar
        });
    };
    return (
        <form
            style={{ padding: '5px' }}
            onSubmit={handleSubmit(handleCreateChannel)}
        >
            <FormControl>
                <FormLabel>Channel Avatar</FormLabel>
                <Input
                    type="file"
                    w={'400px'}
                    {...register('avatar', { required: false })}
                />
            </FormControl>
            <FormControl>
                <FormLabel>Channel Name</FormLabel>
                <Input
                    type="text"
                    w={'400px'}
                    {...register('room', { required: true })}
                />
            </FormControl>
            <FormControl as="fieldset">
                <FormLabel>Channel Type</FormLabel>
                <RadioGroup defaultValue="public">
                    <HStack spacing="24px">
                        <Radio
                            value="public"
                            checked={props.selectedOption === 'public'}
                            {...register('type')}
                            onChange={props.handleRadioChange}
                        >
                            Public
                        </Radio>
                        <Radio
                            value="private"
                            checked={props.selectedOption === 'private'}
                            {...register('type')}
                            onChange={props.handleRadioChange}
                        >
                            Private
                        </Radio>
                        <Radio
                            value="protected"
                            checked={props.selectedOption === 'protected'}
                            {...register('type')}
                            onChange={props.handleRadioChange}
                        >
                            Protected
                        </Radio>
                    </HStack>
                </RadioGroup>
            </FormControl>
            {props.showField ? (
                <FormControl>
                    <FormLabel>Password</FormLabel>
                    <Input
                        type="password"
                        w={'400px'}
                        required
                        {...register('password')}
                    />
                </FormControl>
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
