import '../../css/chat/modal.css';
import {
    Button,
    ButtonGroup,
    FormControl,
    FormLabel,
    Switch
} from '@chakra-ui/react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { UserType } from '../../Types/User';

interface EditProfileBodyProps {
    onClose: () => void;
    user?: UserType;
}

interface EditProfileData {
    avatar: FileList;
    username: string;
    twofa: boolean;
    password: string;
}

const EditProfileBody = (props: EditProfileBodyProps) => {
    const { register, handleSubmit } = useForm<EditProfileData>();
    const handleEditProfile: SubmitHandler<EditProfileData> = (data) => {
    };
    return (
        <form
            style={{ padding: '15px' }}
            onSubmit={handleSubmit(handleEditProfile)}
        >
            <div className="form-group">
                <label htmlFor="avatar">Edit Avatar</label>
                <input
                    className="form-control"
                    type="file"
                    id="avatar"
                    {...register('avatar')}
                />
            </div>
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
            <div className="form-group">
                <label htmlFor="password">Edit Password</label>
                <input
                    className="form-control"
                    type="password"
                    placeholder="Type Password"
                    id="password"
                    {...register('password')}
                />
            </div>

            <FormControl display="flex" justifyContent={'space-between'}>
                <FormLabel htmlFor="twofa" mb="0">
                    Enable/Disable 2FA
                </FormLabel>
                <Switch
                    id="twofa"
                    size={'lg'}
                    colorScheme="purple"
                    {...register('twofa')}
                    {...(props.user?.is2FaEnabled
                        ? { defaultChecked: true }
                        : {})}
                />
            </FormControl>
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

export default EditProfileBody;
