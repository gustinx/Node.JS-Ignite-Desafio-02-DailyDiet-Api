import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary()
    table.text('name').notNullable()
    table.text('description').notNullable()
    table.dateTime('datetime', { precision: 3 }).notNullable()
    table.boolean('isInDiet').notNullable()
    table.uuid('user_id').references('id').inTable('users').notNullable()
    table.timestamps(true, true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals')
}
