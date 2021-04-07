import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import Post from './post';

@Entity('users')
class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', unique: true })
  email!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @OneToMany(() => Post, (post) => post.user)
  posts?: Post[];
}

export default User;
