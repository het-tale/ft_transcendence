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

interface ModalUiProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  title: string;
  children?: React.ReactNode;
  body: React.ReactNode;
}

function ModalUi({isOpen, onOpen, onClose, title, children, body}: ModalUiProps) {
  // const { isOpen, onOpen, onClose } = useDisclosure();
    const initialRef = React.useRef(null)
    const finalRef = React.useRef(null)
  
    return (
      <>
        {/* <Button onClick={onOpen}>Open Modal</Button> */}

<Modal isOpen={isOpen} onClose={onClose}>
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>{title}</ModalHeader>
    <ModalCloseButton />
    <ModalBody>
    <FormControl>
              <FormLabel
                fontSize="sm"
                fontWeight="md"
                color="gray.700"
                _dark={{
                  color: "gray.50",
                }}
              >
                Channel Icon
              </FormLabel>
              <Flex alignItems="center" mt={1}>
                <Avatar
                  boxSize={12}
                  bg="gray.100"
                  _dark={{
                    bg: "gray.800",
                  }}
                  icon={<BsPersonFill />
                    // <Icon
                    //   as={FaUser}
                    //   boxSize={9}
                    //   mt={3}
                    //   rounded="full"
                    //   color="gray.300"
                    //   _dark={{
                    //     color: "gray.700",
                    //   }}
                    // />
                  }
                >

                <input type="file" name="" id="fila" />
                </Avatar>
                <Button
                  type="button"
                  ml={5}
                  variant="outline"
                  size="sm"
                  fontWeight="medium"
                  _focus={{
                    shadow: "none",
                  }}
                >
                  Change
                </Button>
              </Flex>
            </FormControl>

    <Form.Group className="mb-3 fileField">
        <Form.Label style={{'color': '#a435f0'}}>Channel Name</Form.Label>
        <Form.Control type="file" />
      </Form.Group>
    <Form.Group className="mb-3">
        <Form.Label style={{'color': '#a435f0'}}>Channel Name</Form.Label>
        <Form.Control type="text" placeholder="Type the name here..." />
      </Form.Group>
    </ModalBody>

    <ModalFooter>
      <Button bg={"#E9ECEF"} color={"white"} mr={3} onClick={onClose}>
        Close
      </Button>
      <Button variant='ghost' bg={"#a435f0"} color={"white"}>Create</Button>
    </ModalFooter>
  </ModalContent>
</Modal>
      </>
    )
  }

export default ModalUi;