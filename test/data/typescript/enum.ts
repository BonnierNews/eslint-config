enum Foo {
    Up,
    Down,
    Left,
    Right,
}

function fooer(f: Foo): number {
  if (f === Foo.Down) return 1;
  return 2;
}

fooer(Foo.Right);
