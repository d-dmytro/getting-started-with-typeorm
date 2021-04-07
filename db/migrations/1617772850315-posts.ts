import { MigrationInterface, QueryRunner } from 'typeorm';

export class posts1617772850315 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        CREATE TABLE posts (
          id SERIAL,
          title VARCHAR(255) NOT NULL,
          user_id INT NOT NULL,
          CONSTRAINT fk_users_posts FOREIGN KEY (user_id) REFERENCES users (id),
          CONSTRAINT pk_posts_id PRIMARY KEY (id)
        );
      `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('posts');
  }
}
