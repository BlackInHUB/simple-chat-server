const { trimString } = require("./utils");

let users = [];

const findUser = (user) => {
    const userName = trimString(user.name);
    const userRoom = trimString(user.room);

    return users.find(({name, room}) =>
        trimString(name) === userName && trimString(room) === userRoom
        );
}

const addUser = (user) => {
    const isExist = findUser(user);

    !isExist && users.push(user);

    const currentUser = isExist || user;

    return {isExist: !!isExist, user: currentUser};
};

const getRoomUsers = (room) => users.filter(user => user.room === room);

const removeUser = (user) => {
    const found = findUser(user);

    users = users.filter(({name, room}) => room === found.room && name !== found.name)

    return found;
}

module.exports = {addUser, findUser, getRoomUsers, removeUser};