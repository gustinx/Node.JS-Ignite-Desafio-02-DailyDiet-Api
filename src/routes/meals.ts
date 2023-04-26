import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'
import { checkUserExists } from '../middlewares/check-user-exists'

interface Meals {
  id: string
  name: string
  description: string
  datetime: Date
  isInDiet: boolean
  user_id?: string
}

export async function mealsRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [checkUserExists] }, async (request) => {
    const userId = request.cookies.userId

    const meals = await knex('meals').where('user_id', userId).select()

    return {
      meals,
    }
  })

  app.get('/:id', { preHandler: [checkUserExists] }, async (request, reply) => {
    const getMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getMealParamsSchema.parse(request.params)

    const userId = request.cookies.userId

    const meal = await knex('meals')
      .where({
        id,
        user_id: userId,
      })
      .first()

    if (!meal) {
      return reply.status(404).send({
        error: 'Meal doesnt exists',
      })
    }

    return { meal }
  })

  app.post('/', { preHandler: [checkUserExists] }, async (request, reply) => {
    const createMealsBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      datetime: z.date(),
      isInDiet: z.boolean(),
    })

    const { name, description, datetime, isInDiet } =
      createMealsBodySchema.parse(request.body)

    const userId = request.cookies.userId

    await knex('meals').insert({
      id: randomUUID(),
      name,
      description,
      datetime,
      isInDiet,
      user_id: userId,
    })
    return reply.status(201).send()
  })

  app.put('/:id', { preHandler: [checkUserExists] }, async (request, reply) => {
    const updateMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = updateMealParamsSchema.parse(request.params)

    const userId = request.cookies.userId

    const checkIfMealsExists = await knex('meals')
      .where({
        id,
        user_id: userId,
      })
      .first()

    if (!checkIfMealsExists) {
      return reply.status(404).send({
        error: 'Meal doesnt exists',
      })
    }

    const updateMealsBodySchema = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      datetime: z.date(),
      isInDiet: z.boolean().optional(),
    })

    const { name, description, datetime, isInDiet } =
      updateMealsBodySchema.parse(request.body)

    await knex('meals').where({ user_id: userId }).update({
      name,
      description,
      datetime,
      isInDiet,
    })
    return reply.status(201).send()
  })

  app.delete(
    '/:id',
    { preHandler: [checkUserExists] },
    async (request, reply) => {
      const deleteMealsParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = deleteMealsParamsSchema.parse(request.params)

      const userId = request.cookies.userId

      const checkIfMealsExists = await knex('meals')
        .where({
          id,
          user_id: userId,
        })
        .first()

      if (!checkIfMealsExists) {
        return reply.status(404).send({
          error: 'Meal doesnt exists',
        })
      }

      await knex('meals')
        .where({
          id,
          user_id: userId,
        })
        .delete()

      return reply.status(200).send()
    },
  )

  app.get(
    '/metrics',
    { preHandler: [checkUserExists] },
    async (request, reply) => {
      const userId = request.cookies.userId

      const meals = await knex('meals').where('user_id', userId).select()

      const filteredMeals = meals.filter((meal) => meal.isInDiet)

      if (filteredMeals.length === 0) {
        return 0
      }

      filteredMeals.sort(
        (a, b) =>
          new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
      )

      if (filteredMeals.length === 0) {
        return 0
      }

      console.log(filteredMeals)

      const mealsByDay: Meals[][] = []
      let today = filteredMeals[0].datetime
      let todayMeal: Meals[] = []

      for (const meal of filteredMeals) {
        if (
          new Date(meal.datetime).toDateString() ===
          new Date(today).toDateString()
        ) {
          todayMeal.push(meal)
        } else {
          mealsByDay.push(todayMeal)
          today = meal.datetime
          todayMeal = [meal]
        }
      }
      mealsByDay.push(todayMeal)

      let maxMealsInDietDay = 0

      for (const daysMeals of mealsByDay) {
        const mealsDiet = daysMeals.length

        if (mealsDiet > maxMealsInDietDay) {
          maxMealsInDietDay = mealsDiet
        }
      }

      return {
        totalMeals: meals.length,
        totalInDiet: meals.filter((meal) => meal.isInDiet === 1).length,
        totalOffDiet: meals.filter((meal) => meal.isInDiet === 0).length,
        maxDaysMealsInDiet: maxMealsInDietDay,
      }
    },
  )
}
