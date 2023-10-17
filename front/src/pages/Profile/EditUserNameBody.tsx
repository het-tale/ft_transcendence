import { useContext } from 'react';
import { UserType } from '../../Types/User';
import client from '../../components/Client';
import '../../css/chat/modal.css';
import { Button, ButtonGroup, useToast } from '@chakra-ui/react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { RenderContext } from '../../RenderContext';

interface EditUserNameBodyProps {
    onClose: () => void;
    user?: UserType;
}
interface EditUserNameData {
    username: string;
}

const EditUserNameBody = (props: EditUserNameBodyProps) => {
    const toast = useToast();
    const renderData = useContext(RenderContext);
    const { register, handleSubmit } = useForm<EditUserNameData>();
    const handleEditUserName: SubmitHandler<EditUserNameData> = async (
        data
    ) => {
        console.log('Edit Profile data', data);
        const sentData = {
            name: data.username
        };
        try {
            const response = await client.post(
                `user/change-username`,
                sentData,
                {
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem('token')
                    }
                }
            );
            renderData.setRenderData(!renderData.renderData);
            props.onClose();
        } catch (error: any) {
            console.log('error', error);
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
