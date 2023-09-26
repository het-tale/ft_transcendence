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
    Icon,
  } from '@chakra-ui/react'
import React from 'react';
import { Form } from 'react-bootstrap';
import "../css/chat/modal.css";
import { BsPerson, BsPersonFill } from 'react-icons/bs';
import ModalBodyUi from './ModalBodyUi';

interface ModalUiProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  title: string;
  children?: React.ReactNode;
  body: React.ReactNode;
  handleSubmit?: () => void;
}

function ModalUi({isOpen, onOpen, onClose, title, children, body, handleSubmit}: ModalUiProps) {
    return (
      <>
<Modal isOpen={isOpen} onClose={onClose}>
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>{title}</ModalHeader>
    <ModalCloseButton />
    <ModalBody>
      {body}
    </ModalBody>

    <ModalFooter>
      <Button bg={"#E9ECEF"} color={"white"} mr={3} onClick={onClose}>
        Close
      </Button>
      <Button variant='ghost' bg={"#a435f0"} color={"white"} onClick={handleSubmit}>Create</Button>
    </ModalFooter>
  </ModalContent>
</Modal>
      </>
    )
  }

export default ModalUi;