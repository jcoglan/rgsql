'use strict'

const { parse } = require('./parser')

class Server {
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
