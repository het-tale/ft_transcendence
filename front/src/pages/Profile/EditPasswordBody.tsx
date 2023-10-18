import { useContext } from 'react';
import { UserType } from '../../Types/User';
import client from '../../components/Client';
import '../../css/chat/modal.css';
import {
    Button,
    ButtonGroup,
    FormControl,
    FormLabel,
    Switch,
    useToast
} from '@chakra-ui/react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { RenderContext } from '../../RenderContext';

interface EditPasswordBodyProps {
    onClose: () => void;
    user?: UserType;
}
interface EditPasswordData {
    oldPassword: string;
    newPassword: string;
    newPasswordConfirm: string;
}

const EditPasswordBody = (props: EditPasswordBodyProps) => {
    const toast = useToast();
    const renderData = useContext(RenderContext);
    const { register, handleSubmit } = useForm<EditPasswordData>();
    const handleEditPassword: SubmitHandler<EditPasswordData> = async (
        data
    ) => {
        // console.log('Edit Profile data', data);
        const sentData = {
            oldPassword: data.oldPassword,
            newPassword: data.newPassword,
            newPasswordConfirm: data.newPasswordConfirm
        };
        try {
            const response = await client.post(
                `user/change-password`,
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
            onSubmit={handleSubmit(handleEditPassword)}
        >
            <div className="form-group">
                <label htmlFor="oldPassword">Current Password</label>
                <input
                    className="form-control"
                    type="password"
                    placeholder="Type Password"
                    id="oldPassword"
                    {...register('oldPassword')}
                />
            </div>
            <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                    className="form-control"
                    type="password"
                    placeholder="Type Password"
                    id="newPassword"
                    {...register('newPassword')}
                />
            </div>
            <div className="form-group">
                <label htmlFor="newPasswordConfirm">Confirm New Password</label>
                <input
                    className="form-control"
                    type="password"
                    placeholder="Type Password"
                    id="newPasswordConfirm"
                    {...register('newPasswordConfirm')}
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

export default EditPasswordBody;
