'use strict'

const { parse } = require('./parser')

class Server {
  constructor (engine) {
    this._engine = engine
  }

  handle (msg) {
    try {
      let result = this._processQuery(msg)
      return { status: 'ok', ...result }
    } catch (error) {
      return { status: 'error', ...error }
    }
  }

  _processQuery (msg) {
    let query = this._parse(msg)
    let type = query.query_type.toLowerCase()
    return this['_process_' + type](query)
  }

  _process_create_table (query) {
    this._engine.createTable(query.table, query.fields)
    return {}
  }

  _process_drop_table (query) {
    this._engine.dropTable(query.table, query.if_exists)
    return {}
  }

  _process_select (query) {
    return {
      column_names: query.list.map((expr) => expr.alias),
      rows: [
        query.list.map((expr) => expr.expr.value)
      ]
    }
  }

  _parse (msg) {
    try {
      return parse(msg)
    } catch (error) {
      throw { error_type: 'parsing_error', error_message: error.message }
    }
  }
}

module.exports = Server
