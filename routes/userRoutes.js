const express = require('express');
const { register, getAllUsers, getUserById, updateUserById, deleteUserById } = require('../controllers/userController');


const userRouter = express.Router();


userRouter.post('/', register);
userRouter.get('/', getAllUsers);
userRouter.get('/:id', getUserById);
userRouter.put('/:id', updateUserById);
userRouter.delete('/:id', deleteUserById);



module.exports = userRouter;
