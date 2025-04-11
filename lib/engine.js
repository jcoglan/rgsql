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
        let values = tuple.map((term) => this._eval(term))
        table.rows.push(values)
      }
    }
  }

  select (query) {
    let column_names = query.list.map((p) => p.alias || p.term.name || '')
    let rows = []

    if (query.source) {
      let table = this._tables.get(query.source)

      rows = table.rows.map((row) => {
        return query.list.map((p) => this._eval(p.term, table.columns, row))
      })
    } else {
      rows = [query.list.map((p) => this._eval(p.term))]
    }

    return { column_names, rows }
  }

  _eval (term, columns, row) {
    if ('value' in term) return term.value

    if ('name' in term) {
      let column = columns.get(term.name)
      return row[column.offset]
    }

    if ('op' in term && 'term' in term) {
      let value = this._eval(term.term, columns, row)
      if (term.op === '-') {
        return -value
      } else if (term.op.toUpperCase() === 'NOT') {
        return !value
      }
    }

    if ('op' in term && 'lhs' in term && 'rhs' in term) {
      let lhs = this._eval(term.lhs, columns, row)
      let rhs = this._eval(term.rhs, columns, row)

      switch (term.op.toUpperCase()) {
        case '+':   return lhs + rhs
        case '-':   return lhs - rhs
        case '*':   return lhs * rhs
        case '/':   return Math.floor(lhs / rhs)
        case '<':   return lhs < rhs
        case '<=':  return lhs <= rhs
        case '>':   return lhs > rhs
        case '>=':  return lhs >= rhs
        case '<>':  return lhs !== rhs
        case '=':   return lhs === rhs
        case 'AND': return lhs && rhs
        case 'OR':  return lhs || rhs
      }
    }

    if ('fn' in term) {
      let args = term.args.map((arg) => this._eval(arg, columns, row))

      switch (term.fn.toUpperCase()) {
        case 'ABS':
          return Math.abs(...args)
        case 'MOD':
          let [a, b] = args
          return a % b
      }
    }
  }
}

module.exports = Engine
