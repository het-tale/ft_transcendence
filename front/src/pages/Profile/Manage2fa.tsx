import { Button, ButtonGroup, useToast } from '@chakra-ui/react';
import { useContext, useEffect, useState } from 'react';
import client from '../../components/Client';
import QRCode from 'react-qr-code';
import { UserType } from '../../Types/User';
import { SubmitHandler, useForm } from 'react-hook-form';
import { RenderContext } from '../../RenderContext';

interface Manage2faProps {
    onClose: () => void;
    user?: UserType;
}
interface Manage2faData {
    code: string;
}

const Manage2fa = (props: Manage2faProps) => {
    const [qrCodeImageUrl, setQrCodeImageUrl] = useState('');
    const toast = useToast();
    const { register, handleSubmit } = useForm<Manage2faData>();
    const renderData = useContext(RenderContext);
    const handleGenerateQrCode: SubmitHandler<Manage2faData> = async (data) => {
        // console.log('The code', data);
        const sentData = {
            code: data.code
        };
        try {
            // console.log('enable 2fa');
            const response = await client.post(`auth/2fa/enable`, sentData, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('token')
                }
            });
            props.onClose();
            renderData.setRenderData(!renderData.renderData);
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
            // props.onClose();
            renderData.setRenderData(!renderData.renderData);
        }
    };
    useEffect(() => {
        const generate2fa = async () => {
            try {
                // console.log('generate 2fa');
                const response = await client.get(
                    `auth/2fa/generate`,

                    {
                        headers: {
                            Authorization:
                                'Bearer ' + localStorage.getItem('token')
                        }
                    }
                );
                if (response.status === 200) {
                    // console.log('response generate', response.data);
                    setQrCodeImageUrl(response.data);
                }
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
            }
        };
        generate2fa();
    }, []);
    // console.log('qr code', qrCodeImageUrl);
    return (
        <>
            <div>
                <h6 style={{ color: '#CCC', paddingLeft: '15px' }}>
                    Scan The QR code with your Google Authenticator app
                </h6>
                <QRCode value={qrCodeImageUrl} style={{ marginLeft: '5rem' }} />
            </div>
            <form
                style={{ padding: '15px' }}
                onSubmit={handleSubmit(handleGenerateQrCode)}
            >
                <div className="form-group">
                    <label htmlFor="code">Enter The verification code </label>
                    <input
                        className="form-control"
                        type="text"
                        placeholder="Type Password"
                        id="code"
                        {...register('code')}
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
        </>
    );
};
export default Manage2fa;
