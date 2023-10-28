import { useEffect } from 'react';
import client from '../components/Client';
import QRCode from 'react-qr-code';

const GenerateQr = () => {
    // const [qr, setQr] = useState("");
    let qr: any = '';
    const generate = async () => {
        const response = await client.get('/auth/2fa/generate', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            responseType: 'blob'
        });
        //    setQr(response.data);
        // const url = createObjectURL(response);
        qr = response.data.Blob;
    };
    useEffect(() => {
        const timer = setTimeout(() => {
            generate();
        }, 1000000);

        return () => {
            clearTimeout(timer);
        };
    }, []);
    return (
        <div style={{ position: 'absolute', top: '300px', left: '30%' }}>
            <QRCode value={qr} />
        </div>
    );
};

export default GenerateQr;
