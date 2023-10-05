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
import { useForm } from 'react-hook-form';

const ModalBodyUi = (props: any) => {
    const { register, handleSubmit } = useForm<CreateChannelData>();
    return (
        <form style={{ padding: '5px' }}>
            <FormControl>
                <FormLabel>Channel Avatar</FormLabel>
                <Input type="file" w={'400px'} required />
            </FormControl>
            <FormControl>
                <FormLabel>Channel Name</FormLabel>
                <Input type="text" w={'400px'} required />
            </FormControl>
            <FormControl as="fieldset">
                <FormLabel>Channel Type</FormLabel>
                <RadioGroup defaultValue="Public">
                    <HStack spacing="24px">
                        <Radio
                            value="Public"
                            checked={props.selectedOption === 'public'}
                            onChange={props.handleRadioChange}
                        >
                            Public
                        </Radio>
                        <Radio
                            value="Private"
                            checked={props.selectedOption === 'private'}
                            onChange={props.handleRadioChange}
                        >
                            Private
                        </Radio>
                        <Radio
                            value="Protected"
                            checked={props.selectedOption === 'protected'}
                            onChange={props.handleRadioChange}
                        >
                            Protected
                        </Radio>
                    </HStack>
                </RadioGroup>
            </FormControl>
            {props.showField && (
                <FormControl>
                    <FormLabel>Password</FormLabel>
                    <Input type="password" w={'400px'} required />
                </FormControl>
            )}
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
