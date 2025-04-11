'use strict'

const sql = require('./sql')

const actions = {
  mk_message (str, a, b, [_, query, ...rest]) {
    return query
  },

  mk_field_id (str, a, b) {
    let name = str.substring(a, b)
    return new FieldId(name)
  },

  mk_create_table_query (str, a, b, elems) {
    let table = elems[4].name
    let fields = elems[8]
    return new CreateTable(table, fields)
  },

  mk_field_def_list (str, a, b, [head, tail]) {
    return [head, ...tail.elements.map((n) => n.field_def)]
  },

  mk_field_def (str, a, b, [name, _, type]) {
    return { name: name.name, type: type.text }
  },

  mk_drop_table (str, a, b, elems) {
    let table = elems[5].name
    let if_exists = (elems[4].text !== '')
    return new DropTable(table, if_exists)
  },

  mk_insert (str, a, b, elems) {
    let table = elems[4].name
    let tuples = elems[8]
    return new Insert(table, tuples)
  },

  mk_insert_tuples (str, a, b, [head, tail]) {
    return [head, ...tail.elements.map((n) => n.insert_values)]
  },

  mk_insert_values (str, a, b, elems) {
    return [elems[2], ...elems[3].elements.map((n) => n.term)]
  },

  mk_select (str, a, b, [_, list, from]) {
    let source = from?.field_id?.name || null
    return new Select(list, source)
  },

  mk_select_list (str, a, b, [_, head, tail]) {
    return [head, ...tail.elements.map((n) => n.select_expr)]
  },

  mk_empty_list () {
    return []
  },

  mk_select_expr (str, a, b, [term, alias]) {
    alias = alias?.field_id?.name || ''
    return { alias, term }
  },

  mk_unary_term (str, a, b, [op, _, term]) {
    return new Unary(op.text, term)
  },

  mk_bin_op_term (str, a, b, [lhs, _1, op, _2, rhs]) {
    return new Binary(op.text, lhs, rhs)
  },

  mk_fn_term (str, a, b, [fn, _1, _2, args]) {
    return new Fn(fn.text, args)
  },

  mk_fn_args (str, a, b, [head, tail]) {
    return [head, ...tail.elements.map((n) => n.term)]
  },

  mk_paren_term (str, a, b, elems) {
    return elems[2]
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

class FieldId {
  constructor (name) {
    this.name = name
  }
}

class Unary {
  constructor (op, term) {
    this.op = op
    this.term = term
  }
}

class Binary {
  constructor (op, lhs, rhs) {
    this.op = op
    this.lhs = lhs
    this.rhs = rhs
  }
}

class Fn {
  constructor (fn, args) {
    this.fn = fn
    this.args = args
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
