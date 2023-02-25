import assert from "assert/strict";
import fs from "fs";
import ohm from "ohm-js";

const syntaxChecks = [
  ["string literal", 'tweet:"Hello, World!";'],
  ["variable declaration", "int x = 5;"],
  ["array declarations", "tweet:[1,2];"],
  ["function with two parameters", "action f(int x, int y) {}"],
  ["if,elseif,else statement", "pet (x<=1) {} feed (x<=2) {} interact {}"],
  ["while statement", "sleep(x==10){}"],
  ["boolean literal declaration", "boolean x = true; boolean y = false;"],
  ["character variables", "cat garfield = r;"],
  ["strings variables", 'cat garfield = "lasagna";'],
  ["int variables", "food chocolate = 2;"],
  ["arithmetic operators", "int x = 3+3-3*3**2/2%1- -1;"],
  ["comments", "int x = 3; //hi there "],
  ["shift operators", "int x = 3 << 5 >> 8 << 13 >> 21;"],
  ["relational operators", "tweet:1<2||1<=2||1==2||1!=2||1>=2||1>2;"],
  ["special numbers", "int x  = 3.1-E;"],
  ["or/and chaining", "tweet: 1&&2&&3&&4; tweet: 1||2||3||4;"],
  ["unary op", "boolean x = true; x = !x;"],
];

const syntaxErrors = [
  ["non-letter in an identifier", "int ab😭c = 2", /Line 1, col 7/],
  ["missing semicolon", "boolean x = true", /Line 1, col 17/],
  ["malformed number", "x= 2.", /Line 1, col 6/],
  ["a missing right operand", "tweet:5 -", /Line 1, col 10/],
  ["a non-operator", "x=7 * 2 _ 3;", /Line 1, col 9/],
  ["an expression starting with a )", "x=);", /Line 1, col 3/],
  ["a statement starting with expression", "x * 5;", /Line 1, col 3/],
  ["an illegal statement on line 2", "tweet:5;\nx * 5;", /Line 2, col 3/],
  ["a statement starting with a )", ") * 5", /Line 1, col 1/],
  ["an expression starting with a *", "x = * 71;", /Line 1, col 5/],
];

describe("The grammar", () => {
  const grammar = ohm.grammar(fs.readFileSync("src/Dodo.ohm"));
  for (const [scenario, source] of syntaxChecks) {
    it(`properly specifies ${scenario}`, () => {
      assert(grammar.match(source).succeeded());
    });
  }
  for (const [scenario, source, errorMessagePattern] of syntaxErrors) {
    it(`does not permit ${scenario}`, () => {
      const match = grammar.match(source);
      assert(!match.succeeded());
      assert(new RegExp(errorMessagePattern).test(match.message));
    });
  }
});
