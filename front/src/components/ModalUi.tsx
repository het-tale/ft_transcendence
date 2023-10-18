import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton
} from '@chakra-ui/react';
import React from 'react';
import '../css/chat/modal.css';
import { SubmitHandler, UseFormHandleSubmit } from 'react-hook-form';
import { SentData } from '../pages/Chat/Dms';

interface ModalUiProps {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
    title: string;
    children?: React.ReactNode;
    body: React.ReactNode;
    handleData?: () => void;
    handleMessageData?: SubmitHandler<SentData>;
    handleSubmit?: UseFormHandleSubmit<SentData>;
}

function ModalUi({
    isOpen,
    onOpen,
    onClose,
    title,
    children,
    body,
    handleMessageData,
    handleSubmit
}: ModalUiProps) {
    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{title}</ModalHeader>
                    <ModalCloseButton />
                    {/* <ModalBody> */}
                    {body}
                    {/* </ModalBody>

    <ModalFooter>
      <Button bg={"#E9ECEF"} color={"white"} mr={3} onClick={onClose}>
        Close
      </Button>
      <Button variant='ghost' bg={"#a435f0"} color={"white"} type='submit' className='excludeSubmit'
        >Create</Button>
    </ModalFooter> */}
                </ModalContent>
            </Modal>
        </>
    );
}

export default ModalUi;
