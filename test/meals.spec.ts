import { beforeAll, it, describe, afterAll, beforeEach, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'

describe('Users Routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback -all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'John Doe',
      email: 'johndoe@example.com',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Example Meal',
        description: 'This is a example',
        datetime: '2023-04-25T16:36:46.288Z',
        isInDiet: 'Yes',
      })
      .expect(201)
  })

  it('should be able to list all meals', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'John Doe',
      email: 'johndoe@example.com',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Example Meal',
      description: 'This is a example',
      datetime: '2023-04-25T16:36:46.288Z',
      isInDiet: 'Yes',
    })

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    expect(listMealsResponse.body.meals).toEqual([
      expect.objectContaining({
        name: 'Example Meal',
        description: 'This is a example',
        datetime: '2023-04-25T16:36:46.288Z',
        isInDiet: 'Yes',
      }),
    ])
  })

  it('should be able to list a specific meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'John Doe',
      email: 'johndoe@example.com',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Example Meal',
      description: 'This is a example',
      datetime: '2023-04-25T16:36:46.288Z',
      isInDiet: 'Yes',
    })

    const listMealResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    const mealId = listMealResponse.body.meals[0].id

    const getMealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getMealResponse.body.meal).toEqual(
      expect.objectContaining({
        name: 'Example Meal',
        description: 'This is a example',
        datetime: '2023-04-25T16:36:46.288Z',
        isInDiet: 'Yes',
      }),
    )
  })

  it('should be able to update a meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'John Doe',
      email: 'johndoe@example.com',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Example Meal',
      description: 'This is a example',
      datetime: '2023-04-25T16:36:46.288Z',
      isInDiet: 'Yes',
    })

    const listMealResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    const mealId = listMealResponse.body.meals[0].id

    await request(app.server)
      .put(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .send({
        name: 'Example Meal 2',
        description: 'This is a example 2',
        datetime: '2023-04-23T13:36:46.288Z',
        isInDiet: 'No',
      })

    const getUpdatedMealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getUpdatedMealResponse.body.meal).toEqual(
      expect.objectContaining({
        name: 'Example Meal 2',
        description: 'This is a example 2',
        datetime: '2023-04-23T13:36:46.288Z',
        isInDiet: 'No',
      }),
    )
  })

  it('should be able to delete a meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'John Doe',
      email: 'johndoe@example.com',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Example Meal',
      description: 'This is a example',
      datetime: '2023-04-25T16:36:46.288Z',
      isInDiet: 'Yes',
    })

    const listMealResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    const mealId = listMealResponse.body.meals[0].id

    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(200)
  })
})
