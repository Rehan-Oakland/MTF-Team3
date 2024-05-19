import React, { useState } from "react";
import {
  IconButton,
  Box,
  CloseButton,
  Flex,
  Icon,
  useColorModeValue,
  Link,
  Drawer,
  DrawerContent,
  Text,
  useDisclosure,
  BoxProps,
  FlexProps,
} from "@chakra-ui/react";
import {
  FiHome,
  FiTrendingUp,
  FiCompass,
  FiStar,
  FiSettings,
  FiMenu,
} from "react-icons/fi";
import { useLocation } from "react-router-dom";
const LinkItems = [
  { name: "Home", icon: FiHome, url: "/" }, // Set URL for Home
  { name: "Upload Receipt", icon: FiTrendingUp, url: "/uploadreceipt" },

  {
    name: "Outstanding Receipts",
    icon: FiTrendingUp,
    url: "/outstandingreceipt",
  },
  { name: "View Receipt", icon: FiStar, url: "/viewreceipt" }, // Replace URL as needed
];
const SimpleSidebar = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box minH="100vh" bg="white">
      {" "}
      {/* Set background color to white */}
      <SidebarContent
        onClose={onClose}
        display={{ base: "none", md: "block" }}
      />
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerContent>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>
      <MobileNav display={{ base: "flex", md: "none" }} onOpen={onOpen} />
      <Box ml={{ base: 0, md: 60 }} p="4">
        {children}
      </Box>
    </Box>
  );
};
const SidebarContent = ({ onClose, ...rest }) => {
  const location = useLocation(); // Get current location from react-router-dom

  return (
    <Box
      bg={useColorModeValue("white", "gray.900")}
      borderRight="1px"
      borderRightColor={useColorModeValue("gray.200", "gray.700")}
      w={{ base: "full", md: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Box
          as="img"
          src="https://www.charityright.org.uk/front/images/logo.png"
          alt="Logo"
          h="auto"
          w="150px"
        />{" "}
        {/* Replace logo with image */}
        <CloseButton display={{ base: "flex", md: "none" }} onClick={onClose} />
      </Flex>
      {LinkItems.map((link) => (
        <NavItem
          key={link.name}
          icon={link.icon}
          url={link.url}
          isActive={location.pathname === link.url} // Check if link matches current URL
        >
          {link.name}
        </NavItem>
      ))}
    </Box>
  );
};
const NavItem = ({ icon, url, children, isActive, ...rest }) => {
  return (
    <Link
      href={url}
      style={{ textDecoration: "none" }}
      _focus={{ boxShadow: "none" }}
    >
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        _hover={{ bg: "pink.500", color: "white" }}
        bg={isActive ? "pink.500" : "transparent"} // Set background color for active link
        color={isActive ? "white" : "inherit"} // Set text color for active link
        {...rest}
      >
        {icon && (
          <Icon
            mr="4"
            fontSize="16"
            _groupHover={{ color: "white" }}
            as={icon}
          />
        )}
        {children}
      </Flex>
    </Link>
  );
};
const MobileNav = ({ onOpen, ...rest }) => {
  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 24 }}
      height="20"
      alignItems="center"
      bg={useColorModeValue("white", "gray.900")}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue("gray.200", "gray.700")}
      justifyContent="flex-start"
      {...rest}
    >
      <IconButton
        variant="outline"
        onClick={onOpen}
        aria-label="open menu"
        icon={<FiMenu />}
      />
      <Text fontSize="2xl" ml="8" fontFamily="monospace" fontWeight="bold">
        Logo
      </Text>
    </Flex>
  );
};
export default SimpleSidebar;
