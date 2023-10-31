import { useContext } from 'react';
import { UserType } from '../../Types/User';
import '../../css/chat/modal.css';
import { Button, ButtonGroup, useToast } from '@chakra-ui/react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { RenderContext } from '../../RenderContext';
import React from 'react';
import { SocketContext } from '../../socket';

interface EditUserNameBodyProps {
    onClose: () => void;
    user?: UserType;
}
interface EditUserNameData {
    username: string;
}

const EditUserNameBody = (props: EditUserNameBodyProps) => {
    const renderData = useContext(RenderContext);
    const { register, handleSubmit } = useForm<EditUserNameData>();
    const socket = React.useContext(SocketContext);
    const handleEditUserName: SubmitHandler<EditUserNameData> = async (
        data
    ) => {
        socket.emit('changeUsername', {
            name: data.username
        });
        renderData.setRenderData(!renderData.renderData);
        props.onClose();
    };
    return (
        <form
            style={{ padding: '15px' }}
            onSubmit={handleSubmit(handleEditUserName)}
        >
            <div className="form-group">
                <label htmlFor="username">Edit Username</label>
                <input
                    className="form-control"
                    type="text"
                    placeholder={props.user?.username}
                    id="username"
                    {...register('username')}
                />
            </div>
            <ButtonGroup
                display={'Flex'}
                justifyContent={'flex-end'}
                marginTop={'8px'}
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
                    Save
                </Button>
            </ButtonGroup>
        </form>
    );
};

export default EditUserNameBody;
