import util from "util";
export class Program {
  constructor(statements) {
    this.statements = statements;
  }
}

export class VariableDeclaration {
  constructor(type, variable, initializer) {
    Object.assign(this, { type, variable, initializer });
  }
}

export class Conditional {
  constructor(test, consequent, alternate) {
    Object.assign(this, { test, consequent, alternate });
  }
}

export class If {
  constructor(condition, block, elseifs, elseStatement) {
    Object.assign(this, { condition, block, elseifs, elseStatement });
  }
}

export class ElseIf {
  constructor(condition, block) {
    Object.assign(this, { condition, block });
  }
}

export class Else {
  constructor(block) {
    Object.assign(this, { block });
  }
}

export class FunctionDeclaration {
  constructor(type, id, params, block) {
    Object.assign(this, { type, id, params, block });
  }
}

export class FuncParam {
  constructor(type, id) {
    Object.assign(this, { type, id });
  }
}

export class Assignment {
  constructor(target, source) {
    Object.assign(this, { target, source });
  }
}

export class WhileStatement {
  constructor(test, body) {
    Object.assign(this, { test, body });
  }
}

export class ReturnStatement {
  constructor(value) {
    Object.assign(this, { value });
  }
}

export class PrintStatement {
  constructor(argument) {
    Object.assign(this, { argument });
  }
}

export class Call {
  constructor(callee, args) {
    Object.assign(this, { callee, args });
  }
}

export class BreakStatement {
  // Intentionally empty
}

export class Type {
  // Type of all basic type int, float, string, etc. and superclass of others
  static BOOLEAN = new Type("boolean");
  static INT = new Type("int");
  static DOUBLE = new Type("double");
  static STRING = new Type("string");
  static VOID = new Type("void");
  constructor(typename) {
    Object.assign(this, { typename });
  }
}

export class ArrayType extends Type {
  constructor(elementType) {
    if (elementType instanceof Type) {
      super(`[${elementType.typename}]`);
      Object.assign(this, { elementType });
    }
  }
}
//named differently because it conflicts with Array.isArray()
export class DodoArray {
  constructor(values) {
    Object.assign(this, { values });
  }
}

export class BinaryExpression {
  constructor(op, left, right) {
    Object.assign(this, { op, left, right });
  }
}

export class UnaryExpression {
  constructor(op, operand) {
    Object.assign(this, { op, operand });
  }
}

export class SubscriptExpression {
  constructor(array, index) {
    Object.assign(this, { array, index });
  }
}

export class MemberExpression {
  constructor(object, field) {
    Object.assign(this, { object, field });
  }
}

// Token objects are wrappers around the Nodes produced by Ohm. We use
// them here just for simple things like numbers and identifiers. The
// Ohm node will go in the "source" property.
export class Token {
  constructor(category, source) {
    Object.assign(this, { category, source });
  }
  get lexeme() {
    return this.source.contents;
  }
}

export class Variable {
  constructor(name, readOnly) {
    Object.assign(this, { name, readOnly });
  }
}

export class Function {
  constructor(name, params) {
    Object.assign(this, { name, params });
  }
}

export class FunctionType extends Type {
  // Example: (boolean,[string]?)->float
  constructor(paramTypes, returnType) {
    super(
      `(${paramTypes.map((t) => t.typename).join(",")})->${returnType.typename}`
    );
    Object.assign(this, { paramTypes, returnType });
  }
}

// Throw an error message that takes advantage of Ohm's messaging
export function error(message, token) {
  //   if (token?.source) {
  //     throw new Error(`${token.source.getLineAndColumnMessage()}${message}`)
  //   }
  throw new Error(message);
}

export const standardLibrary = Object.freeze({
  π: new Variable("π", true),
  sqrt: new Function("sqrt", 1),
  sin: new Function("sin", 1),
  cos: new Function("cos", 1),
  exp: new Function("exp", 1),
  ln: new Function("ln", 1),
  hypot: new Function("hypot", 2),
});

//tree
Program.prototype[util.inspect.custom] = function () {
  const tags = new Map();

  // Attach a unique integer tag to every node
  function tag(node) {
    if (tags.has(node) || typeof node !== "object" || node === null) return;
    tags.set(node, tags.size + 1);
    for (const child of Object.values(node)) {
      Array.isArray(child) ? child.forEach(tag) : tag(child);
    }
  }

  function* lines() {
    function view(e) {
      if (tags.has(e)) return `#${tags.get(e)}`;
      if (Array.isArray(e)) return `[${e.map(view)}]`;
      return util.inspect(e);
    }
    for (let [node, id] of [...tags.entries()].sort((a, b) => a[1] - b[1])) {
      let type = node.constructor.name;
      let props = Object.entries(node).map(([k, v]) => `${k}=${view(v)}`);
      yield `${String(id).padStart(4, " ")} | ${type} ${props.join(" ")}`;
    }
  }

  tag(this);
  return [...lines()].join("\n");
};
