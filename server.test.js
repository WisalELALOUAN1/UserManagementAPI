const request = require('supertest');
const { app, resetUsers } = require('./server');

describe('User API', () => {
  beforeEach(() => {
    resetUsers();
  });

  describe('POST /users', () => {
    it('should create a new user', async () => {
      const res = await request(app)
        .post('/users')
        .send({
          username: 'wisal_el_alouan',
          age: 22,
          email: 'wisalelalouan@gmail.com'
        });
      
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.username).toBe('wisal_el_alouan');
      expect(res.body.age).toBe(22);
      expect(res.body.email).toBe('wisalelalouan@gmail.com');
    });

    it('should reject user with age less than 18', async () => {
      const res = await request(app)
        .post('/users')
        .send({
          username: 'young_user',
          age: 17,
          email: 'younguser@gmail.com'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('at least 18');
    });

    it('should reject user without username', async () => {
      const res = await request(app)
        .post('/users')
        .send({
          age: 25,
          email: 'anonyme@gmail.com'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Username');
    });

    it('should reject user with invalid email - no @', async () => {
      const res = await request(app)
        .post('/users')
        .send({
          username: 'test_user',
          age: 25,
          email: 'invalidemail'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('email');
    });

    it('should reject user with invalid email - no domain', async () => {
      const res = await request(app)
        .post('/users')
        .send({
          username: 'test_user',
          age: 25,
          email: 'invalid@'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('email');
    });

    it('should reject user with invalid email - no extension', async () => {
      const res = await request(app)
        .post('/users')
        .send({
          username: 'test_user',
          age: 25,
          email: 'invalid@domain'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('email');
    });

    it('should accept valid email formats', async () => {
      const validEmails = [
        'usertotest@gmail.com',
        'user@um5.ac.ma',
        'user_name@ensias-um5.com',
        'user123@test123.com'
      ];

      for (const email of validEmails) {
        const res = await request(app)
          .post('/users')
          .send({
            username: `user_${email.split('@')[0]}`,
            age: 25,
            email: email
          });
        
        expect(res.status).toBe(201);
      }
    });

    it('should reject duplicate username', async () => {
      await request(app)
        .post('/users')
        .send({
          username: 'duplicate',
          age: 25,
          email: 'first@gmail.com'
        });
      
      const res = await request(app)
        .post('/users')
        .send({
          username: 'duplicate',
          age: 30,
          email: 'second@gmail.com'
        });
      
      expect(res.status).toBe(409);
      expect(res.body.error).toContain('already exists');
    });

    it('should maintain users sorted by username', async () => {
      await request(app).post('/users').send({
        username: 'charlie',
        age: 25,
        email: 'charlie@gmail.com'
      });
      
      await request(app).post('/users').send({
        username: 'alice',
        age: 30,
        email: 'alice@gmail.com'
      });
      
      await request(app).post('/users').send({
        username: 'bob',
        age: 28,
        email: 'bob@gmail.com'
      });
      
      const res = await request(app).get('/users');
      expect(res.body[0].username).toBe('alice');
      expect(res.body[1].username).toBe('bob');
      expect(res.body[2].username).toBe('charlie');
    });
  });

  describe('GET /users/:id', () => {
    it('should get user by ID', async () => {
      const created = await request(app)
        .post('/users')
        .send({
          username: 'test_user',
          age: 25,
          email: 'test@gmail.com'
        });
      
      const res = await request(app).get(`/users/${created.body.id}`);
      
      expect(res.status).toBe(200);
      expect(res.body.username).toBe('test_user');
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app).get('/users/999');
      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid ID', async () => {
      const res = await request(app).get('/users/invalid');
      expect(res.status).toBe(400);
    });
  });

  describe('GET /users/username/:username', () => {
    it('should get user by username', async () => {
      await request(app)
        .post('/users')
        .send({
          username: 'findme',
          age: 25,
          email: 'findme@gmail.com'
        });
      
      const res = await request(app).get('/users/username/findme');
      
      expect(res.status).toBe(200);
      expect(res.body.username).toBe('findme');
    });

    it('should be case insensitive', async () => {
      await request(app)
        .post('/users')
        .send({
          username: 'TestUser',
          age: 25,
          email: 'test@example.com'
        });
      
      const res = await request(app).get('/users/username/testuser');
      expect(res.status).toBe(200);
    });

    it('should return 404 for non-existent username', async () => {
      const res = await request(app).get('/users/username/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /users/:id', () => {
    it('should update user', async () => {
      const created = await request(app)
        .post('/users')
        .send({
          username: 'old_name',
          age: 25,
          email: 'old@gmail.com'
        });
      
      const res = await request(app)
        .put(`/users/${created.body.id}`)
        .send({
          username: 'new_name',
          age: 30,
          email: 'new@gmail.com'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.username).toBe('new_name');
      expect(res.body.age).toBe(30);
    });

    it('should reject update with age less than 18', async () => {
      const created = await request(app)
        .post('/users')
        .send({
          username: 'test',
          age: 25,
          email: 'test@gmail.com'
        });
      
      const res = await request(app)
        .put(`/users/${created.body.id}`)
        .send({
          username: 'test',
          age: 17,
          email: 'test@gmail.com'
        });
      
      expect(res.status).toBe(400);
    });

    it('should maintain sorted order after update', async () => {
      await request(app).post('/users').send({
        username: 'alice',
        age: 25,
        email: 'alice@gmail.com'
      });
      
      const created = await request(app).post('/users').send({
        username: 'bob',
        age: 30,
        email: 'bob@gmail.com'
      });
      
      await request(app)
        .put(`/users/${created.body.id}`)
        .send({
          username: 'zack',
          age: 30,
          email: 'zack@gmail.com'
        });
      
      const res = await request(app).get('/users');
      expect(res.body[0].username).toBe('alice');
      expect(res.body[1].username).toBe('zack');
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app)
        .put('/users/999')
        .send({
          username: 'test',
          age: 25,
          email: 'test@gmail.com'
        });
      
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete user', async () => {
      const created = await request(app)
        .post('/users')
        .send({
          username: 'delete_me',
          age: 25,
          email: 'delete@gmail.com'
        });
      
      const res = await request(app).delete(`/users/${created.body.id}`);
      expect(res.status).toBe(204);
      
      const getRes = await request(app).get(`/users/${created.body.id}`);
      expect(getRes.status).toBe(404);
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app).delete('/users/999');
      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid ID', async () => {
      const res = await request(app).delete('/users/invalid');
      expect(res.status).toBe(400);
    });
  });

  describe('GET /users', () => {
    beforeEach(async () => {
      await request(app).post('/users').send({
        username: 'alice',
        age: 25,
        email: 'alice@gmail.com'
      });
      
      await request(app).post('/users').send({
        username: 'bob',
        age: 30,
        email: 'bob@gmail.com'
      });
      
      await request(app).post('/users').send({
        username: 'charlie',
        age: 25,
        email: 'charlie@gmail.com'
      });
    });

    it('should list all users', async () => {
      const res = await request(app).get('/users');
      
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(3);
    });

    it('should filter users by age', async () => {
      const res = await request(app).get('/users?age=25');
      
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.every(u => u.age === 25)).toBe(true);
    });

    it('should return empty array for no matches', async () => {
      const res = await request(app).get('/users?age=99');
      
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(0);
    });

    it('should return error for invalid age filter', async () => {
      const res = await request(app).get('/users?age=invalid');
      expect(res.status).toBe(400);
    });

    it('should return users sorted by username', async () => {
      const res = await request(app).get('/users');
      
      expect(res.body[0].username).toBe('alice');
      expect(res.body[1].username).toBe('bob');
      expect(res.body[2].username).toBe('charlie');
    });
  });
});
