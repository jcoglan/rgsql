'use strict'

const sql = require('./sql')

const actions = {
  mk_message (str, a, b, [_, query, ...rest]) {
    return query
  },

  mk_create_table_query (str, a, b, elems) {
    let table = elems[4].text
    let fields = elems[8]
    return new CreateTable(table, fields)
  },

  mk_field_def_list (str, a, b, [head, tail]) {
    return [head, ...tail.elements.map((n) => n.field_def)]
  },

  mk_field_def (str, a, b, [name, _, type]) {
    return { name: name.text, type: type.text }
  },

  mk_drop_table (str, a, b, elems) {
    let table = elems[5].text
    let if_exists = (elems[4].text !== '')
    return new DropTable(table, if_exists)
  },

  mk_insert (str, a, b, elems) {
    let table = elems[4].text
    let tuples = elems[8]
    return new Insert(table, tuples)
  },

  mk_insert_tuples (str, a, b, [head, tail]) {
    return [head, ...tail.elements.map((n) => n.insert_values)]
  },

  mk_insert_values (str, a, b, elems) {
    return [elems[2], ...elems[3].elements.map((n) => n.expr)]
  },

  mk_select (str, a, b, [_, list, from]) {
    let source = from?.field_id?.text || null
    return new Select(list, source)
  },

  mk_select_list (str, a, b, [_, head, tail]) {
    return [head, ...tail.elements.map((n) => n.select_expr)]
  },

  mk_empty_list () {
    return []
  },

  mk_select_expr (str, a, b, [expr, alias]) {
    alias = alias?.field_id?.text || ''
    expr = expr.text ? new FieldRef(expr.text) : expr
    return { alias, expr }
  },

  mk_bool (str, a, b, elems) {
    let val = str.substring(a, b).toUpperCase()
    return new Bool(val === 'TRUE')
  },

  mk_int (str, a, b, elems) {
    let val = str.substring(a, b)
    return new Int(parseInt(val, 10))
  }
}

class CreateTable {
  constructor (table, fields) {
    this.query_type = 'CREATE_TABLE'
    this.table = table
    this.fields = fields
  }
}

class DropTable {
  constructor (table, if_exists) {
    this.query_type = 'DROP_TABLE'
    this.table = table
    this.if_exists = if_exists
  }
}

class Insert {
  constructor (table, tuples) {
    this.query_type = 'INSERT'
    this.table = table
    this.tuples = tuples
  }
}

class Select {
  constructor (list, source) {
    this.query_type = 'SELECT'
    this.list = list
    this.source = source
  }
}

class FieldRef {
  constructor (name) {
    this.name = name
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
