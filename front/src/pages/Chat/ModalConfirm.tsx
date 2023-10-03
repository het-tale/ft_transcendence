import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Button,
    FormControl,
    FormLabel,
    Input,
    Flex,
    Avatar,
    Icon
} from '@chakra-ui/react';
import React from 'react';
import { Form } from 'react-bootstrap';
// import '../css/chat/modal.css';
import { BsPerson, BsPersonFill } from 'react-icons/bs';
import { SubmitHandler, UseFormHandleSubmit } from 'react-hook-form';
import { Interface } from 'readline';
import { socket } from '../../socket';

interface ModalConfirmProps {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
    title: string;
    children?: React.ReactNode;
    body: React.ReactNode;
    handleData?: () => void;
    target?: number;
    blocked?: boolean;
    setBlocked?: React.Dispatch<React.SetStateAction<boolean>>;
    socket?: any;
    handleBlockedUser?: () => void;
}

function ModalConfirm({
    isOpen,
    onOpen,
    onClose,
    title,
    children,
    body,
    target,
    blocked,
    setBlocked,
    handleBlockedUser
}: ModalConfirmProps) {
    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay
                    bg="rgba(164,53,240, 0.4)"
                    backdropFilter="blur(10px) hue-rotate(90deg)"
                />
                <ModalContent>
                    <ModalHeader>{title}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>{body}</ModalBody>

                    <ModalFooter>
                        <Button
                            bg={'#E9ECEF'}
                            color={'white'}
                            mr={3}
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="ghost"
                            bg={'#a435f0'}
                            color={'white'}
                            onClick={handleBlockedUser}
                        >
                            Confirm
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}

export default ModalConfirm;
