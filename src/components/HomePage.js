import React, { useState , useEffect } from "react";
import { Table, Thead, Tbody, Tr, Th, Td, Box, Text, Center } from '@chakra-ui/react';


function HomePage() {
  const [users,setUsers ] = useState([])
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };


  return (
    <Box p={4}>
      <Center>
        <Text fontSize="xl" fontWeight="bold">User List</Text>
      </Center>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>Username</Th>
            <Th>Email</Th>
          </Tr>
        </Thead>
        <Tbody>
          {users.map(user => (
            <Tr key={user.id}>
              <Td>{user.id}</Td>
              <Td>{user.username}</Td>
              <Td>{user.email}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}


export default HomePage;
