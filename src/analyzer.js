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

export default function analyze(sourceCode) {
  //   const analyzer = DodoGrammar.createSemantics().addOperation("rep", {
  //     Program(body) {
  //       return new core.Program(body.children.map((s) => s.rep())); //because it has a star? if you have _iter, you can use:
  //       //_iter(...children) in bella code.
  //     },
  //     //may need to use new keyword here and there...
  //     PrintStmt(_tweet, _left, argument, _right, _semicolon) {
  //       return core.PrintStatement(argument.rep());
  //     },
  //     //building things for...things...uhhh... analyzer func for ... ohm
  //     //i don't have some of thesee...i need to use my brain bruh.
  //     //coo keyword, var object, _eq not gonna use, bird not gonna use, initalizer.
  //     //do that for all...???
  //     //some return different things...
  //     VarDec(_coo, variable, _eq, initalizer, _bird) {
  //       return new core.VariableDeclaration(variable.rep(), initalizer.rep());
  //     },
  //     AssignmentStmnt() {},
  //     IfStmt() {},
  //     id() {},
  //     Var() {},
  //     Exp_add() {},
  //     Exp_sub() {},
  //     Term_parens() {},
  //     numeral() {},
  //     strlit() {},
  //   });
  const match = DodoGrammar.match(sourceCode);
  if (!match.succeeded()) error(match.message);
  console.log("Yay, program is syntactically correct");
  // return analyzer(match).rep();
}
