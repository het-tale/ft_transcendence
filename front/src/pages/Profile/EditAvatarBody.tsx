import { useContext, useState } from 'react';
import { UserType } from '../../Types/User';
import client from '../../components/Client';
import '../../css/chat/modal.css';
import { Button, ButtonGroup, useToast } from '@chakra-ui/react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { RenderContext } from '../../RenderContext';

interface EditAvatarProps {
    onClose: () => void;
    user?: UserType;
    isHovered?: boolean;
    setIsHovered?: React.Dispatch<React.SetStateAction<boolean>>;
}
interface EditAvatarData {
    file: FileList;
}

const EditAvatarBody = (props: EditAvatarProps) => {
    const toast = useToast();
    const renderData = useContext(RenderContext);
    const [image, setImage] = useState<any>();
    const { register, handleSubmit } = useForm<EditAvatarData>();
    const formData = new FormData();
    formData.append('file', image);
    const handleEditAvatar: SubmitHandler<EditAvatarData> = async (data) => {
        // console.log('Edit Profile data', data);
        try {
            await client.post(`auth/upload-avatar`, formData, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('token')
                }
            });
            renderData.setRenderData(!renderData.renderData);
            props.onClose();
            props.setIsHovered && props.setIsHovered(false);
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
            props.setIsHovered && props.setIsHovered(false);
        }
    };
    return (
        <form
            style={{ padding: '15px' }}
            onSubmit={handleSubmit(handleEditAvatar)}
        >
            <div className="form-group">
                <label htmlFor="name">Change Avatar</label>
                <input
                    className="form-control"
                    type="file"
                    placeholder="Type Name"
                    id="name"
                    required
                    {...register('file')}
                    onChange={(e) => {
                        setImage(e.target.files![0]);
                    }}
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

export default EditAvatarBody;
