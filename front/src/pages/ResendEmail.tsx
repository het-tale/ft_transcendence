import { useNavigate } from 'react-router-dom';
import '../css/login.css';
import client from '../components/Client';
import { useEffect } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { useToast } from '@chakra-ui/react';

function ResendEmail() {
    let navigate = useNavigate();
    const toast = useToast();
    const Email = async () => {
        try {
            const response = await client.get('/auth/resend-email', {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('token')
                }
            });
            // console.log('STATUS', response?.status);
            // console.log('MESSAGE', response?.data?.message);
            if (response.status === 200) {
                toast({
                    title: 'Email Sent.',
                    description:
                        "we've sent you an email to confirm your email address.",
                    status: 'success',
                    duration: 9000,
                    isClosable: true,
                    position: 'bottom-right'
                });
                navigate('/login');
            }
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message;
            const errorStatus = error?.response?.status;
            if (
                errorMessage === 'email already confirmed' &&
                errorStatus === 403
            ) {
                toast({
                    title: 'Email Failed.',
                    description: 'Email already confirmed.',
                    status: 'error',
                    duration: 9000,
                    isClosable: true,
                    position: 'bottom-right'
                });
                navigate('/login');
            } else {
                toast({
                    title: 'Email Failed.',
                    description: errorMessage,
                    status: 'error',
                    duration: 9000,
                    isClosable: true,
                    position: 'bottom-right'
                });
                navigate('/confirm-email');
            }
        }
    };
    useEffect(() => {
        const timer = setTimeout(() => {
            Email();
        }, 500);

        return () => {
            clearTimeout(timer);
        };
    }, [navigate]);
    return <></>;
}

export default ResendEmail;
