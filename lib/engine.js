'use strict'

class Engine {
  constructor () {
    this._tables = new Map()
  }

  createTable (table, fields) {
    if (this._tables.has(table)) {
      throw { error_type: 'validation_error', error_message: `table '${table}' already exists` }
    }

    let seen = new Set()

    for (let { name, type } of fields) {
      if (seen.has(name)) {
        throw { error_type: 'validation_error', error_message: 'column names must be unique' }
      }

      seen.add(name)
    }

    this._tables.set(table, { fields, rows: [] })
  }

  dropTable (table, ifExists) {
    if (!ifExists && !this._tables.has(table)) {
      throw { error_type: 'validation_error', error_message: `table '${table}' does not exist` }
    }

    this._tables.delete(table)
  }
}

module.exports = Engine
