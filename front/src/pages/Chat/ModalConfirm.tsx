import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button
} from '@chakra-ui/react';
import React from 'react';

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
    onClose,
    title,
    body,
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
