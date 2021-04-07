import 'express-async-errors';
import express from 'express';
import { getConnection, getManager, getRepository } from 'typeorm';
import User from './entities/user';
import Post from './entities/post';

const app = express();

app.use(express.json());

app.get('/', (_req, res) => {
  res.send('Hello World!');
});

app.post('/users', async (req, res) => {
  const { email, name } = req.body;

  const user = new User();
  user.email = email;
  user.name = name;

  await getRepository(User).save(user);

  res.status(201).json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });
});

app.get('/users', async (_req, res) => {
  const userRepo = getRepository(User);
  const users = await userRepo.find({ take: 10 });
  res.json({
    users: users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
    })),
  });
});

app.post('/posts', async (req, res) => {
  const { userId, title } = req.body;

  const user = await getRepository(User).findOne({ id: userId });

  if (!user) {
    throw new Error('User not found');
  }

  const post = new Post();
  post.title = title;
  post.user = user;

  await getRepository(Post).save(post);

  res.status(201).json({
    post: {
      id: post.id,
      title: post.title,
      user: {
        id: post.user.id,
      },
    },
  });
});

app.get('/users/:id/posts', async (req, res) => {
  const { id } = req.params;
  const user = await getRepository(User).findOne({
    where: { id: parseInt(id, 10) },
    relations: ['posts'],
  });

  if (!user) {
    throw new Error('User not found');
  }

  res.json({
    posts: user.posts,
  });
});

app.get('/users-stats', async (_req, res) => {
  const results = await getConnection()
    .createQueryBuilder()
    .select('user.id', 'userId')
    .addSelect('COUNT(post.id)', 'postsCount')
    .from(User, 'user')
    .innerJoin(Post, 'post', 'post.user_id = user.id')
    // .where('user.role = :role', { role: 'guest' })
    .orderBy('COUNT(post.id)', 'DESC')
    .offset(0)
    .limit(10)
    .groupBy('user.id')
    .getRawMany();

  res.json({
    results: results.map((result) => ({
      userId: result.userId,
      postsCount: Number(result.postsCount),
    })),
  });
});

type PostsSQLQueryResult = {
  id: number;
  title: string;
  user_id: number;
}[];

app.get('/posts', async (req, res) => {
  const { limit = 10, offset = 0 } = req.query;
  const manager = getManager();
  const rawData: PostsSQLQueryResult = await manager.query(
    'SELECT * FROM posts ORDER BY id DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  );
  res.json({
    posts: rawData.map((row) => ({
      id: row.id,
      title: row.title,
      userId: row.user_id,
    })),
  });
});

export default app;
