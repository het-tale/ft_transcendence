import React from 'react';
import { Form } from 'react-bootstrap';
import "../css/chat/modal.css";

const ModalBodyUi = (props: any) => {
    return (
        <div>
            <Form ref={props.formRef}>
    <Form.Group className="mb-3 fileField">
        <Form.Label style={{'color': '#a435f0'}}>Channel Avatar</Form.Label>
        <Form.Control type="file" name='avatar'/>
      </Form.Group>
    <Form.Group className="mb-3">
        <Form.Label style={{'color': '#a435f0'}}>Channel Name</Form.Label>
        <Form.Control type="text" placeholder="Type the name here..." name='name' />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label style={{'color': '#a435f0'}}>Channel Type</Form.Label>
        <div key={`inline-radio`} className="mb-3">
        <Form.Check
        className='radioInput'
          inline
            type='radio'
            id='public'
            label='Public'
            value='public'
            name='group1'
            checked={props.selectedOption === 'public'}
            onChange={props.handleRadioChange}
          />
          <Form.Check
          className='radioInput'
          inline
            type='radio'
            id='private'
            label='Private'
            value='private'
            name='group1'
            checked={props.selectedOption === 'private'}
            onChange={props.handleRadioChange}
          />
           <Form.Check
           className='radioInput'
          inline
            type='radio'
            id='protected'
            label='Protected'
            value='protected'
            name='group1'
            checked={props.selectedOption === 'protected'}
            onChange={props.handleRadioChange}
          />
          </div>
      </Form.Group>
      {props.showField && (
        <Form.Group className="mb-3">
        <Form.Label style={{'color': '#a435f0'}}>Password</Form.Label>
        <Form.Control type="password" placeholder="Type password" name='password'/>
      </Form.Group>
      )}
</Form>
        </div>
    );
};

export default ModalBodyUi;