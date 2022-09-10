// users hardcoded for simplicity, store in a db for production applications
const users = [{ id: 1, username: 'Test', password: '123', firstName: 'Test', lastName: 'User' },
{ id: 2, username: 'Test2', password: '122', firstName: 'Test', lastName: 'User' }];

module.exports = {
    authenticate,
    getAll
};

 function authenticate({ username, password }) {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}

 function getAll() {
    return users.map(u => {
        const { password, ...userWithoutPassword } = u;
        return userWithoutPassword;
    });
}