import { Button, ButtonGroup, useToast } from '@chakra-ui/react';
import React from 'react';
import { SocketContext } from '../../../socket';
import { Channel } from '../../../Types/Channel';
import { UserType } from '../../../Types/User';
import { SubmitHandler, useForm } from 'react-hook-form';
import client from '../../../components/Client';

interface changeAvatar {
    file: FileList;
}

interface ChangeChannelAvatarModalProps {
    onClose: () => void;
    setRender?: React.Dispatch<React.SetStateAction<boolean>>;
    render?: boolean;
    channelDm?: Channel;
    user?: UserType;
}

const ChangeChannelAvatarModal = (props: ChangeChannelAvatarModalProps) => {
    const socket = React.useContext(SocketContext);
    const [image, setImage] = React.useState<any>();
    const toast = useToast();
    const { register, handleSubmit } = useForm<changeAvatar>();
    const formData = new FormData();
    formData.append('file', image);
    const handleChangeAvatar: SubmitHandler<changeAvatar> = async (data) => {
        console.log('Change Channel Avatar Data', data);

        const sentData = {
            file: data.file
        };
        try {
            const response = await client.post(
                `chat/channel-avatar/${props.channelDm?.name}`,
                formData,
                {
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem('token')
                    }
                }
            );
            props.setRender && props.setRender(!props.render);
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
            onSubmit={handleSubmit(handleChangeAvatar)}
        >
            <div className="form-group">
                <label htmlFor="name">Channel Avatar</label>
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
                    Send
                </Button>
            </ButtonGroup>
        </form>
    );
};
export default ChangeChannelAvatarModal;
