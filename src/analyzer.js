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
  const match = DodoGrammar.match(sourceCode);
  if (!match.succeeded()) error(match.message);
  console.log("Yay, program is syntactically correct");
}
