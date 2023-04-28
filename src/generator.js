import { If, Type, standardLibrary } from "./core.js";

export default function generate(program) {
  const output = [];
  const targetName = ((mapping) => {
    return (entity) => {
      if (!mapping.has(entity)) {
        mapping.set(entity, mapping.size + 1);
      }
      return `${entity.name ?? entity.lexeme}_${mapping.get(entity)}`;
    };
  })(new Map());

  function gen(node) {
    return generators[node.constructor.name](node);
  }

  const generators = {
    Program(p) {
      gen(p.statements);
    },
    VariableDeclaration(d) {
      output.push(`let ${gen(d.variable)} = ${gen(d.initializer)};`);
    },
    FunctionDeclaration(d) {
      output.push(`function ${gen(d.value)} (${gen(d.params).join(", ")}) {`);
      gen(d.block);
      output.push("}");
    },
    FuncParam(p) {
      return targetName(p.id);
    },
    Variable(v) {
      return targetName(v);
    },
    Function(f) {
      return targetName(f);
    },
    Assignment(s) {
      output.push(`${gen(s.target)} = ${gen(s.source)};`);
    },
    BreakStatement(s) {
      output.push("break;");
    },
    ReturnStatement(s) {
      output.push(`return ${gen(s.value)};`);
    },
    If(s) {
      output.push(`if (${gen(s.condition)}) {`);
      gen(s.block);
      if (s.elseifs) {
        gen(s.elseifs);
      }
      if (s.elseStatement) {
        gen(s.elseStatement);
      }
      output.push(`}`);
    },
    ElseIf(s) {
      output.push(`} else if (${gen(s.condition)}) { `);
      gen(s.block);
    },
    Else(s) {
      output.push(`} else {`);
      gen(s.block);
    },
    WhileStatement(s) {
      output.push(`while (${gen(s.test)}) {`);
      gen(s.body);
      output.push("}");
    },
    PrintStatement(s) {
      output.push(`console.log(${gen(s.argument)})`);
    },
    Conditional(e) {
      return `((${gen(e.test)}) ? (${gen(e.consequent)}) : (${gen(
        e.alternate
      )}))`;
    },
    BinaryExpression(e) {
      let op = { "==": "===", "!=": "!==" }[e.op] ?? e.op;
      if (op == "=") {
        op = "===";
      }
      return `(${gen(e.left)} ${op} ${gen(e.right)})`;
    },
    UnaryExpression(e) {
      return `${e.op}(${gen(e.operand)})`;
    },
    SubscriptExpression(e) {
      return `${gen(e.array)}[${gen(e.index)}]`;
    },
    DodoArray(e) {
      return `[${gen(e.values).join(",")}]`;
    },
    Call(c) {
      const targetCode = `${gen(c.callee)}(${gen(c.args).join(", ")})`;
      if (c.callee instanceof Type || c.callee.type.returnType !== Type.VOID) {
        return targetCode;
      }
      output.push(`${targetCode};`);
    },
    Number(e) {
      return e;
    },
    BigInt(e) {
      return e;
    },
    Boolean(e) {
      return e;
    },
    String(e) {
      return e;
    },
    Array(a) {
      return a.map(gen);
    },
  };

  gen(program);
  return output.join("\n");
}
