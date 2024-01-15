function Item() {
  const data = ["a", "b", "c"];
  return (
    <div>
      <h1>Data</h1>
      <SubItem input={{ name: "Anders", role: "Developer" }} />
    </div>
  );
}

function SubItem(props) {
  return (
    <div>
      <h2>{props.input.name}</h2>
      <h3>{props.input.role}</h3>
    </div>
  );
}
