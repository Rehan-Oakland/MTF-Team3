import React, { useContext } from "react";
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
  Button,
} from "@chakra-ui/react";
import { FiHome, FiTrendingUp, FiStar, FiMenu } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext"; // Import AuthContext

const LinkItems = [
  { name: "Home", icon: FiHome, url: "/" },
  { name: "Upload Receipt", icon: FiTrendingUp, url: "/upload" },
  {
    name: "Outstanding Receipts",
    icon: FiTrendingUp,
    url: "/outstandingreceipt",
  },
  { name: "View Receipt", icon: FiStar, url: "/viewreceipt" },
];

const SimpleSidebar = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isLoggedIn, logout } = useContext(AuthContext); // Get isLoggedIn and logout from context

  return (
    <Box minH="100vh" bg="white">
      <SidebarContent
        onClose={onClose}
        isLoggedIn={isLoggedIn}
        logout={logout}
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
          <SidebarContent
            onClose={onClose}
            isLoggedIn={isLoggedIn}
            logout={logout}
          />
        </DrawerContent>
      </Drawer>
      <MobileNav display={{ base: "flex", md: "none" }} onOpen={onOpen} />
      <Box ml={{ base: 0, md: 60 }} p="4">
        {children}
      </Box>
    </Box>
  );
};

const SidebarContent = ({ onClose, isLoggedIn, logout, ...rest }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/"); // Redirect to login page
  };

  return (
    <Flex
      direction="column"
      justifyContent="space-between"
      bg={useColorModeValue("white", "gray.900")}
      borderRight="1px"
      borderRightColor={useColorModeValue("gray.200", "gray.700")}
      w={{ base: "full", md: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Box>
        <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
          <Box
            as="img"
            src="https://www.charityright.org.uk/front/images/logo.png"
            alt="Logo"
            h="auto"
            w="150px"
          />
          <CloseButton
            display={{ base: "flex", md: "none" }}
            onClick={onClose}
          />
        </Flex>
        {LinkItems.map((link) => (
          <NavItem
            key={link.name}
            icon={link.icon}
            url={link.url}
            isActive={location.pathname === link.url}
          >
            {link.name}
          </NavItem>
        ))}
      </Box>
      {isLoggedIn && (
        <Box p="4">
          <Button onClick={handleLogout} w="full" colorScheme="pink">
            Sign Out
          </Button>
        </Box>
      )}
    </Flex>
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
        bg={isActive ? "pink.500" : "transparent"}
        color={isActive ? "white" : "inherit"}
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
