import assert from "assert/strict";
import analyze from "../src/analyzer.js";
import * as core from "../src/core.js";

const semanticChecks = [
  ["variables can be printed", "int x = 1; tweet: x;"],
  ["variables can be reassigned", "let x = 1; x = x + 3;"],
];

const semanticErrors = [
  ["using undeclared identifiers", "tweet:x;", /x has not been declared/],
  //   ["a variable used as function", "x = 1; x(2);", /Expected "="/],
  //   ["a function used as variable", "print(sin + 1);", /expected/],
  //   [
  //     "re-declared identifier",
  //     "let x = 1; let x = 2;",
  //     /x has already been declared/,
  //   ],
  //   ["an attempt to write a read-only var", "π = 3;", /π is read only/],
  //   ["too few arguments", "print(sin());", /Expected 1 arg\(s\), found 0/],
  //   ["too many arguments", "print(sin(5, 10));", /Expected 1 arg\(s\), found 2/],
];

const sample =
  "let x=sqrt(9);function f(x)=3*x;while(true){x=3;print(0?f(x):2);}";

describe("The analyzer", () => {
  for (const [scenario, source] of semanticChecks) {
    it(`recognizes ${scenario}`, () => {
      assert.ok(analyze(source));
    });
  }
  for (const [scenario, source, errorMessagePattern] of semanticErrors) {
    it(`throws on ${scenario}`, () => {
      assert.throws(() => analyze(source), errorMessagePattern);
    });
  }
  it(`produces the expected graph for the simple sample program`, () => {
    const program = analyze(sample);
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
        new core.FunctionDeclaration(
          f,
          [localX],
          new core.BinaryExpression("*", 3, localX)
        ),
        new core.WhileStatement(true, [
          new core.Assignment(x, 3),
          new core.PrintStatement(
            new core.Conditional(0, new core.Call(f, [x]), 2)
          ),
        ]),
      ])
    );
  });
});
