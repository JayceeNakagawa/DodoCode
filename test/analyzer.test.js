import assert from "assert/strict";
import analyze from "../src/analyzer.js";
import * as core from "../src/core.js";
import parse from "../src/parser.js";
const semanticChecks = [
  ["variables can be printed", "int x = 1; tweet: x;"],
  ["variables can be reassigned", "let x = 1; x = x + 3;"],
];

const semanticErrors = [
  ["using undeclared identifiers", "tweet:x;", /Identifier x not declared/],
  [
    "a variable used as function",
    "int x = 1; x();",
    /Expected "=" or a letter/,
  ],
  [
    "a function used as variable",
    "tweet:sin + 1;",
    /Functions can not appear here/,
  ],
  [
    "re-declared identifier",
    "let x = 1; let x = 2;",
    /Identifier x already declared/,
  ],
  ["an attempt to write a read-only var", "π = 3;", /π is read only/],
  //checks output correctly but don't pass?
  ["too few arguments", "tweet:sin();", /1 arguments required but 0 passed/],
  [
    "too many arguments",
    "tweet:sin(5, 10);",
    /1 arguments required but 2 passed/,
  ],
];

const sample =
  // "int x=sqrt(9);action f(int x) {return 3*x;}sleep(true){x=3;tweet:0?f(x):2;}";
  "int x=sqrt(9);";

describe("The analyzer", () => {
  for (const [scenario, source] of semanticChecks) {
    it(`recognizes ${scenario}`, () => {
      assert.ok(analyze(parse(source)));
    });
  }
  for (const [scenario, source, errorMessagePattern] of semanticErrors) {
    it(`throws on ${scenario}`, () => {
      assert.throws(() => analyze(parse(source)), errorMessagePattern);
    });
  }

  it(`produces the expected graph for the simple sample program`, () => {
    const program = analyze(parse(sample));
    let x = new core.Variable("x", false);
    let f = new core.Function("f", 1, true);
    let localX = new core.Variable("x", true);
    assert.deepEqual(
      program,
      new core.Program([
        new core.VariableDeclaration(
          x,
          new core.Call(core.standardLibrary.sqrt, [9])
        ),
        // new core.FunctionDeclaration(
        //   f,
        //   [localX],
        //   new core.BinaryExpression("*", 3, localX)
        // ),
        // new core.WhileStatement(true, [
        //   new core.Assignment(x, 3),
        //   new core.PrintStatement(
        //     new core.Conditional(0, new core.Call(f, [x]), 2)
        //   ),
        // ]),
      ])
    );
  });
});
