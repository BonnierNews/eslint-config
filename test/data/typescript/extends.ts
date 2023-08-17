class Foo {
  bar;
  constructor(bar) {
    this.bar = bar;
  }
}

class Bar extends Foo {
  foo(foo) {
    this.bar = foo;
  }
}

function fooer() {
  return new Bar("test");
}

fooer();
