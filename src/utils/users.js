const users = []

const addUser = ({id, name, room}) => {
    name = name.trim().toLowerCase()
    room = room.trim().toLowerCase()
    if (!name || !room) {
        return {error: 'Username and room are required'}
    }
    if (users.find((user) => user.name === name && user.room === room)) {
        return {error: 'Username is taken'}
    }
    const user = {id, name, room}
    users.push(user)
    return user
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)
    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
    return {}
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
    room = room?.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}

export {addUser, removeUser, getUser, getUsersInRoom}