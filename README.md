# 5to6

Convert your es5 code to es6, using basic transforms.
Right now what happens is that simple anonymous functions are converted to arrow syntax.

```
function(a,b,c) {
   a = b + c;
   return a + 2;
}
```

gets converted to
```
(a,b,c) => {a = b + c; return a + 2;}
```

## Using

Just call ```node index.js <file.js>``` to transpile to sysout
```
> node index.js test.js
```

alternatively, write directly to same infile

```
> cat test.js | node index.js | tee test.js

```

## TODO
- [~] use parens-free expressions when possible
- [ ] allow flexible configuration
- [ ] add more visitors (single arrow fn expressions to parens free returns, var to let/const, etc)