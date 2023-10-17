import { Box, Button, Slide, useDisclosure } from '@chakra-ui/react';

export function SlideEx() {
    const { isOpen, onToggle } = useDisclosure();

    return (
        <>
            <Button onClick={onToggle}>Click Me</Button>
            <Slide direction="top" in={isOpen} style={{ zIndex: 10 }}>
                <Box
                    p="40px"
                    color="white"
                    bg="#a435f0"
                    rounded="md"
                    shadow="md"
                    mt={'4'}
                    w={'20%'}
                    // marginTop={'3rem'}
                    // marginLeft={'10%'}
                >
                    <p>
                        Lorem ipsum dolor sit, amet consectetur adipisicing
                        elit. Voluptatem ipsa rem exercitationem nam inventore
                        quis reprehenderit optio quos sit enim, qui voluptate
                        repellat! Quas excepturi quos molestiae provident fugit
                        deleniti?
                    </p>
                </Box>
            </Slide>
        </>
    );
}
