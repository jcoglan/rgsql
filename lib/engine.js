'use strict'

class Engine {
  constructor () {
    this._tables = new Map()
  }

  createTable (table, fields) {
    if (this._tables.has(table)) {
      throw { error_type: 'validation_error', error_message: `table '${table}' already exists` }
    }

    let columns = new Map()

    for (let { name, type } of fields) {
      if (columns.has(name)) {
        throw { error_type: 'validation_error', error_message: 'column names must be unique' }
      }

      columns.set(name, { type, offset: columns.size })
    }

    this._tables.set(table, { columns, rows: [] })
  }

  dropTable (table, ifExists) {
    if (!ifExists && !this._tables.has(table)) {
      throw { error_type: 'validation_error', error_message: `table '${table}' does not exist` }
    }

    this._tables.delete(table)
  }

  insert (table, tuples) {
    if (!this._tables.has(table)) {
      throw { error_type: 'validation_error', error_message: `table '${table}' does not exist` }
    }

    table = this._tables.get(table)

    for (let tuple of tuples) {
      if (tuple.length === table.columns.size) {
        let values = tuple.map((e) => e.value)
        table.rows.push(values)
      }
    }
  }

  select (query) {
    let column_names = query.list.map((p) => p.alias || p.expr.name || '')
    let rows = []

    if (query.source) {
      let table = this._tables.get(query.source)

      let list = query.list.map((p) => {
        if ('value' in p.expr) return p.expr

        if ('name' in p.expr) {
          let column = table.columns.get(p.expr.name)
          return { offset: column.offset }
        }
      })

      rows = table.rows.map((row) => {
        return list.map((p) => {
          if ('value' in p) return p.value
          if ('offset' in p) return row[p.offset]
        })
      })
    } else {
      rows = [query.list.map((p) => p.expr.value)]
    }

    return { column_names, rows }
  }
}

module.exports = Engine
