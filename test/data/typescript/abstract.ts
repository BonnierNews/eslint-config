abstract class Foo {
  bar;
  constructor(bar) {
    this.bar = bar;
  }
}

function fooer() {
  return new Foo();
}

fooer();
