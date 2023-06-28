function foodec() {
  return function () {
    return "bar";
  };
}

class Foo {
  @foodec()
  foo() {
    return "foo";
  }
}

function fooer() {
  return new Foo();
}

fooer();
