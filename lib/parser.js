'use strict'

const sql = require('./sql')

const actions = {
  mk_message (str, a, b, [_, query, ...rest]) {
    return query
  },

  mk_select (str, a, b, [_, list]) {
    return new Select(list)
  },

  mk_select_list (str, a, b, [_, head, tail]) {
    return [head, ...tail.elements.map((n) => n.select_expr)]
  },

  mk_empty_list () {
    return []
  },

  mk_expr (str, a, b, [expr, alias]) {
    alias = alias?.column_name?.text || ''
    return { alias, expr }
  },

  mk_bool (str, a, b, elems) {
    let val = str.substring(a, b)
    return new Bool(val === 'TRUE')
  },

  mk_int (str, a, b, elems) {
    let val = str.substring(a, b)
    return new Int(parseInt(val, 10))
  }
}

class Select {
  constructor (list) {
    this.list = list
  }
}

class Bool {
  constructor (value) {
    this.value = value
  }
}

class Int {
  constructor (value) {
    this.value = value
  }
}

function parse (str) {
  return sql.parse(str, { actions })
}

module.exports = {
  parse
}
