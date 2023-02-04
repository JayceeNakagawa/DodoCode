# DodoCode
![thing](https://user-images.githubusercontent.com/60021118/215258174-5a9479dd-af19-43d0-b78d-7a161d88d5b0.JPG)

# Introduction
Dodobird was made with the goal of learning how to build a language. It’s meant to be easy and fun to use.

# Features
- Themed Langauge 
- Static Typing 
- Basic Functions 
- File Extension (.DODO)  
- End statements with ";” 
- Data Structures such as arrays and dictionaries 

# Examples

### Hello World  
Javascript
```` Javascript
console.log("Hello, World!")
````
DodoCode
````
tweet:"Hello World";
````

### Declarations
Javascript
```` Javascript
x = true
````
DodoCode
````
State x = Flying
````

## Conditionals
Javascript
```` Javascript
if (x==1) {
  console.log("x is 1");
}
else if (x == 2) {
  console.log("x is 2");
}
else {
  console.log("x is not 2 or 1");
}
````
DodoCode
````
pet (x == 1) {
    tweet:"x is 1";
}
feed (x == 2) {
    tweet:"x is not 2";
}
interact {
    tweet:"x is not 2 or 1";
}
````

## Loops
```` Javascript
int x = 0;
while (x < 10) {
  console.log(x);
  x = x + 1;
}
````

DodoCode
````
int x = 0;
sleep (x < 10) : {
    tweet:x;
    x = x + 1;
}
````

## Functions
```` Javascript
function f(x, y) {
  if (x < y) {
    console.log("y is greater than x");
  }
  else {
    console.log("y is not greater than x");
  }
}
````

DodoCode
````
action f(int x, int y) {
    pet: x < y {
        tweet: "y is greater than x";
    }
    interact {
        tweet: "y is not greater than x";
    }
}

f(1,2)
````
