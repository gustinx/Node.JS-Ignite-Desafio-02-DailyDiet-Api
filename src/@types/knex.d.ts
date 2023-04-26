// eslint-disable-next-line
import { knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      name: string
      email: string
      created_at: string
    }
    meals: {
      id: string
      name: string
      description: string
      datetime: Date
      isInDiet: boolean
      user_id?: string
    }
  }
}
