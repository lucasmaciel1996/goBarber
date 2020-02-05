import { Router } from 'express';
import User from './app/models/User';

const routes = new Router();

routes.get('/', async (req, res) => {
  const user = await User.create({
    name: 'Lucas Maciel',
    email: 'lucas333maciel@gmail.com',
    password_hash: '154844',
  });
  res.json(user);
});

export default routes;
