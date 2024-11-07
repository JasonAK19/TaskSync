import io from 'socket.io-client';

const socket = io('http://localhost:3000', {
  withCredentials: true
});

export const initializeSocket = (username) => {
  socket.emit('join', username);
  return socket;
};

export default socket;