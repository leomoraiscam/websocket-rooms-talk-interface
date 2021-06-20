import { io } from '../http'
import { container } from 'tsyringe';
import CreateUserService from '../services/CreateUserService';
import ListUsersService from '../services/ListUsersService';
import CreateChatRoomService from '../services/CreateChatRoomService';
import GetUserBySocketIdService from '../services/GetUserBySocketIdService';

io.on("connect", (socket) => {
  socket.on("start", async (data) => {
    const { name, email, avatar  } = data;

    const createUserService = container.resolve(CreateUserService);

    const user = await createUserService.execute({
      name, 
      email,
      avatar,
      socket_id: socket.id
    })

    socket.broadcast.emit("new_users", user);
  });

  socket.on("get_users", async (callback) => {
    const getAllUsersService = container.resolve(ListUsersService);

    const users = await getAllUsersService.execute();

    callback(users);
  });


  socket.on("start_chat", async (data, callback) => {
    const createChatRoomService = container.resolve(CreateChatRoomService);
    const getUserBySocketIdService = container.resolve(GetUserBySocketIdService);

    const userLogged = await getUserBySocketIdService.execute(socket.id)

    const room = await createChatRoomService.execute([
      data.idUser, 
      userLogged._id
    ]);
  
    console.log('room', room);

    callback(room)
  });
})