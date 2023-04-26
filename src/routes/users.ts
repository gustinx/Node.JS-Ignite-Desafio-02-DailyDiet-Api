import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string(),
    })

    const { name, email } = createUserBodySchema.parse(request.body)

    const user = await knex('users').where({ email }).first()

    if (!user) {
      const userId = randomUUID()
      await knex('users').insert({
        id: userId,
        name,
        email,
      })
      reply.cookie('userId', userId, {
        path: '/',
        maxAge: 1000 * 60 * 24 * 7, // 7 days
      })
    } else {
      const userId = user.id

      reply.cookie('userId', userId, {
        path: '/',
        maxAge: 1000 * 60 * 24 * 7, // 7 days
      })
    }
    return reply.status(201).send()
  })
}
