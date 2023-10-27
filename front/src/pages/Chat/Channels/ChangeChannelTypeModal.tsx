import React from 'react';
import '../../../css/chat/modal.css';
import { Button, ButtonGroup } from '@chakra-ui/react';
import {
    FormControl,
    FormLabel,
    Radio,
    RadioGroup,
    HStack,
    useToast
} from '@chakra-ui/react';

import { SubmitHandler, useForm } from 'react-hook-form';
import client from '../../../components/Client';

interface ChangeTypeData {
    type: string;
    password?: string;
}

interface ChangeChannelTypeModalProps {
    onClose: () => void;
    setRender?: React.Dispatch<React.SetStateAction<boolean>>;
    render?: boolean;
    channelDm?: any;
    user?: any;
}

const ChangeChannelTypeModal = (props: ChangeChannelTypeModalProps) => {
    const [selectedOption, setSelectedOption] = React.useState('');
    const [showField, setShowField] = React.useState(false);
    const toast = useToast();
    const handleRadioChange = (event: any) => {
        setSelectedOption(event.target.value);
        setShowField(event.target.value === 'protected');
    };
    const { register, handleSubmit } = useForm<ChangeTypeData>();
    const handleChangeChannelType: SubmitHandler<ChangeTypeData> = async (
        data
    ) => {
        if (!showField) data.password = undefined;

        const sentData = {
            name: props.channelDm?.name,
            password: data.password,
            type: data.type
        };
        try {
            await client.post(`chat/change-channel-type/`, sentData, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('token')
                }
            });
            props.setRender && props.setRender(!props.render);
            props.onClose();
        } catch (error: any) {
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
            onSubmit={handleSubmit(handleChangeChannelType)}
        >
            <FormControl as="fieldset">
                <FormLabel>Channel Type</FormLabel>
                <RadioGroup>
                    <HStack spacing="24px">
                        <Radio
                            value="public"
                            checked={selectedOption === 'public'}
                            {...register('type', {
                                onChange: handleRadioChange
                            })}
                        >
                            Public
                        </Radio>
                        <Radio
                            value="private"
                            checked={selectedOption === 'private'}
                            {...register('type', {
                                onChange: handleRadioChange
                            })}
                        >
                            Private
                        </Radio>
                        <Radio
                            value="protected"
                            checked={selectedOption === 'protected'}
                            {...register('type', {
                                onChange: handleRadioChange
                            })}
                        >
                            Protected
                        </Radio>
                    </HStack>
                </RadioGroup>
            </FormControl>
            {showField ? (
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

export default ChangeChannelTypeModal;
