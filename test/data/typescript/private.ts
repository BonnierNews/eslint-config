class Foo {
  private bar;
  constructor(bar) {
    this.bar = bar;
  }
}

function fooer() {
  return new Foo();
}

fooer();
