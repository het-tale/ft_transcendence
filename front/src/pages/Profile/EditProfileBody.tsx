import { Form } from 'react-bootstrap';
import "../../css/chat/modal.css";

const EditProfileBody = (props: any) => {
    return (
        <div>
            <Form ref={props.formRef}>
    <Form.Group className="mb-3 fileField">
        <Form.Label style={{'color': '#a435f0'}}>Edit Avatar</Form.Label>
        <Form.Control type="file" name='avatar'/>
      </Form.Group>
    <Form.Group className="mb-3">
        <Form.Label style={{'color': '#a435f0'}}>Edit Username</Form.Label>
        <Form.Control type="text" placeholder="Type the name here..." name='name' />
    </Form.Group>
    <Form.Group className="mb-3">
        <Form.Label style={{'color': '#a435f0', display: "inline"}}>Enable 2FA</Form.Label>
        <Form.Check
            type="switch"
            id="custom-switch"
            style={{display: "inline", marginLeft: "15rem"}}
        />
    </Form.Group>
</Form>
        </div>
    );
};

export default EditProfileBody;