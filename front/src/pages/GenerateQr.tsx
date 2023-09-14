import client from "../components/Client";

const GenerateQr = () => {
    const generate = async () => {
        const response = await client.get("/auth/2fa/generate", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        console.log(response);
    }
    generate();
    return (
        <div>
            GenerateQr
        </div>
    )
}

export default GenerateQr;