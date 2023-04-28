import ohm from "ohm-js";
import * as fs from "node:fs";
import * as core from "./core.js";

function error(message, node) {
  if (node) {
    throw new Error("${node.source.getLineAndColumnMessage()}${message}");
  }
  throw new Error(message);
}

function check(condition, message, node) {
  if (!condition) error(message, node);
}

function must(condition, message, errorLocation) {
  if (!condition) {
    const prefix = errorLocation.at.source.getLineAndColumnMessage();
    throw new Error(`${prefix}${message}`);
  }
}
const DodoGrammar = ohm.grammar(fs.readFileSync("Dodo.ohm"));
//context object to handle semantics.
class Context {
  constructor(parent = null) {
    this.parent = parent;
    this.locals = new Map();
  }
  add(name, entity) {
    this.locals.set(name, entity);
    return entity; //idk
  }
  lookup(name) {
    return this.locals.get(name) || this.parent?.lookup(name);
  }
  // get(name, expectedType, node) {
  //   let entity;
  //   for (let context = this; context; context = context.parent) {
  //     entity = context.locals.get(name);
  //     if (entity) break;
  //   }
  //   check(entity, `${name} has not been declared`, node);
  //   check(
  //     entity.constructor === expectedType,
  //     `${name} was expected to be a ${expectedType.name}`,
  //     node
  //   );
  //   return entity;
  // }
}

export default function analyze(match) {
  let context = new Context({});

  function mustNotHaveBeDeclared(name, at) {
    must(!context.locals.has(name), `Identifier ${name} already declared`, at);
  }

  function mustHaveBeenFound(entity, name, at) {
    must(entity, `Identifier ${name} not declared`, at);
  }

  function mustNotBeReadOnly(entity, at) {
    must(!entity.readOnly, `${entity.name} is read only`, at);
  }

  function mustBeAVariable(entity, at) {
    must(entity instanceof core.Variable, `Functions can not appear here`, at);
  }

  function mustBeAFunction(entity, at) {
    must(
      entity instanceof core.Function,
      `${entity.name} is not a function`,
      at
    );
  }

  function mustHaveRightNumberOfArguments(argCount, paramCount, at) {
    const message = `${paramCount} arguments required but ${argCount} passed`;
    must(argCount === paramCount, message, at);
  }

  const analyzer = DodoGrammar.createSemantics().addOperation("rep", {
    Program(statements) {
      return new core.Program(statements.children.map((s) => s.rep()));
    },
    Statement_declaration(_type, id, _eq, exp, _semicolon) {
      const initializerRep = exp.rep();
      const variable = new core.Variable(id.sourceString, false);
      mustNotHaveBeDeclared(id.sourceString, { at: id });
      context.add(id.sourceString, variable);
      return new core.VariableDeclaration(variable, initializerRep);
    },

    Statement_fundec(_fun, id, parameters, _equals, exp, _semicolon) {
      const fun = new core.Function(id.sourceString);
      mustNotHaveBeDeclared(id.sourceString, { at: id });
      context.add(id.sourceString, fun);
      context = new Context(context);
      const params = parameters.rep();
      fun.params = params.length;
      const body = exp.rep();
      context = context.parent;
      return new core.FunctionDeclaration(fun, params, body);
    },

    Params(idList) {
      return idList.asIteration().children.map((id) => {
        const param = new core.Variable(id.sourceString, true);
        mustNotHaveBeDeclared(id.sourceString, { at: id });
        context.add(id.sourceString, param);
        return param;
      });
    },

    Statement_assign(id, _eq, exp, _semicolon) {
      const target = id.rep();
      mustNotBeReadOnly(target, { at: id });
      return new core.Assignment(target, exp.rep());
    },

    Statement_print(_print, _colon, exp, _semicolo) {
      return new core.PrintStatement(exp.rep());
    },

    Statement_while(_while, _open, exp, _close, block) {
      return new core.WhileStatement(exp.rep(), block.rep());
    },

    Block(_open, statements, _close) {
      return statements.children.map((s) => s.rep());
    },
    Exp_conditional(test, _questionMark, consequent, _colon, alternate) {
      return new core.Conditional(
        test.rep(),
        consequent.rep(),
        alternate.rep()
      );
    },
    Exp1_and(left, op, right) {
      return new core.BinaryExpression(op.rep(), left.rep(), right.rep());
    },
    Exp1_or(left, op, right) {
      return new core.BinaryExpression(op.rep(), left.rep(), right.rep());
    },
    Exp1a_bitor(left, op, right) {
      return new core.BinaryExpression(op.rep(), left.rep(), right.rep());
    },
    Exp1a_bitxor(left, op, right) {
      return new core.BinaryExpression(op.rep(), left.rep(), right.rep());
    },
    Exp1a_bitand(left, op, right) {
      return new core.BinaryExpression(op.rep(), left.rep(), right.rep());
    },
    Exp2_binary(left, op, right) {
      return new core.BinaryExpression(op.rep(), left.rep(), right.rep());
    },
    Exp2a_shift(left, op, right) {
      return new core.BinaryExpression(op.rep(), left.rep(), right.rep());
    },
    Exp3_binary(left, op, right) {
      return new core.BinaryExpression(op.rep(), left.rep(), right.rep());
    },
    Exp4_binary(left, op, right) {
      return new core.BinaryExpression(op.rep(), left.rep(), right.rep());
    },
    Exp5_binary(left, op, right) {
      return new core.BinaryExpression(op.rep(), left.rep(), right.rep());
    },
    Exp6_unary(op, operand) {
      return new core.UnaryExpression(op.rep(), operand.rep());
    },
    Exp7_subscript(left, op, right, _bracket) {
      return new core.BinaryExpression(op.rep(), left.rep(), right.rep());
    },
    Exp7_member(left, op, right) {
      return new core.BinaryExpression(op.rep(), left.rep(), right.rep());
    },
    Exp7_parens(_left, op, _right) {
      return new core.BinaryExpression(op.rep(), _left.rep(), _right.rep());
    },
    // Statement_call(id, expList) {
    //   const callee = context.lookup(id.sourceString);
    //   mustHaveBeenFound(callee, id.sourceString, { at: id });
    //   mustBeAFunction(callee, { at: id });
    //   const args = expList.asIteration().children.map((arg) => arg.rep());
    //   mustHaveRightNumberOfArguments(args.length, callee.params, {
    //     at: id,
    //   });
    //   return new core.Call(callee, args);
    // },
    Call(id, _open, expList, _close) {
      const callee = context.lookup(id.sourceString);
      mustHaveBeenFound(callee, id.sourceString, { at: id });
      mustBeAFunction(callee, { at: id });
      const args = expList.asIteration().children.map((arg) => arg.rep());
      mustHaveRightNumberOfArguments(args.length, callee.params, {
        at: id,
      });
      return new core.Call(callee, args);
    },
    Exp7_id(id) {
      const entity = context.lookup(id.sourceString);
      mustHaveBeenFound(entity, id.sourceString, { at: id });
      mustBeAVariable(entity, { at: id });
      return entity;
    },
    // id(_first, _rest) {
    //   return context.get(this.sourceString, core.Variable, this);
    // },
    true(_) {
      return true;
    },

    false(_) {
      return false;
    },

    num(_whole, _point, _fraction, _e, _sign, _exponent) {
      return Number(this.sourceString);
    },
    _terminal() {
      return this.sourceString;
    },
    _iter(...children) {
      return children.map((child) => child.rep());
    },
    intlit(lit) {
      return lit;
    },
    stringlit(_left, lit, _right) {
      return lit;
    },
  });
  for (const [name, type] of Object.entries(core.standardLibrary)) {
    context.add(name, type);
  }
  const matchtest = DodoGrammar.match(match);
  if (!matchtest.succeeded()) error(matchtest.message);
  console.log("Yay, program is syntactically correct");
  return analyzer(matchtest).rep();
}
