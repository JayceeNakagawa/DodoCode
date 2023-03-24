import fs from "fs";
import ohm from "ohm-js";
import * as core from "./core.js";
function error(message, node) {
  if (node) {
    throw new Error("${node.source.getLineAndColumnMessage()}${message}");
  }
  throw new Error(message);
}

const DodoGrammar = ohm.grammar(fs.readFileSync("src/Dodo.ohm"));

function check(condition, message, node) {
  if (!condition) error(message, node);
}

//context object to handle semantics.
class Context {
  constructor(parent = null) {
    this.parent = parent;
    this.locals = new Map();
  }
  add(name, entity, node) {
    check(!this.locals.has(name), `${name} has already been declared`, node);
    this.locals.set(name, entity);
    return entity;
  }
  get(name, expectedType, node) {
    let entity;
    for (let context = this; context; context = context.parent) {
      entity = context.locals.get(name);
      if (entity) break;
    }
    check(entity, `${name} has not been declared`, node);
    check(
      entity.constructor === expectedType,
      `${name} was expected to be a ${expectedType.name}`,
      node
    );
    return entity;
  }
}

export default function analyze(sourceCode) {
  let context = new Context();
  const analyzer = DodoGrammar.createSemantics().addOperation("rep", {
    Program(body) {
      return new core.Program(body.rep());
    },
    Statement_declaration(_type, id, _eq, initializer, _semicolon) {
      const initalizerRep = initializer.rep();
      const variable = new core.Variable(id.sourceString, false);
      context.add(id.sourceString, variable, id);
      return new core.VariableDeclaration(variable, initalizerRep);
    },
    Statement_fundec(_fun, id, _open, params, _close, body) {
      params = params.asIteration().children;
      const fun = new core.Function(id.sourceString, params.length, true);
      // Add the function to the context before analyzing the body, because
      // we want to allow functions to be recursive
      context.add(id.sourceString, fun, id);
      context = new Context(context);
      const paramsRep = params.map((p) => {
        let variable = new core.Variable(p.sourceString, true);
        context.add(p.sourceString, variable, p);
        return variable;
      });
      const bodyRep = body.rep();
      context = context.parent;
      return new core.FunctionDeclaration(fun, paramsRep, bodyRep);
    },
    Statement_assign(id, _eq, expression, _semicolon) {
      const target = id.rep();
      check(!target.readOnly, `${target.name} is read only`, id);
      return new core.Assignment(target, expression.rep());
    },
    If(_pet, _open, condition, _close, block, elseifs, elseStatement) {
      return new core.If(condition, block, elseifs, elseStatement);
    },
    ElseIf(_feed, _open, condition, _close, block) {
      return new core.ElseIf(condition, block);
    },
    Else(_interact, block) {
      return new core.Else(block);
    },
    Call(callee, left, args, _right) {
      const fun = context.get(callee.sourceString, core.Function, callee);
      const argsRep = args.asIteration().rep();
      check(
        argsRep.length === fun.paramCount,
        `Expected ${fun.paramCount} arg(s), found ${argsRep.length}`,
        left
      );
      return new core.Call(fun, argsRep);
    },
    break(_break) {
      return new core.BreakStatement();
    },
    Statement_while(_while, _open, test, _close, body) {
      return new core.WhileStatement(test.rep(), body.rep());
    },
    Statement_return(_return, val, _semicolon) {
      //test it
      return new core.ReturnStatement(val);
    },
    Statement_print(_print, _colon, argument, _semicolon) {
      return new core.PrintStatement(argument.rep());
    },
    Block(_open, body, _close) {
      return body.rep();
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
    stringlit(_open, string, _close) {
      return this.sourceString;
    },
    Array(_open, values, _close) {
      return new core.DodoArray(values);
    },
    id(_first, _rest) {
      return context.get(this.sourceString, core.Variable, this);
    },
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
  });

  const match = DodoGrammar.match(sourceCode);
  if (!match.succeeded()) error(match.message);
  console.log("Yay, program is syntactically correct");
  return analyzer(match).rep();
}
