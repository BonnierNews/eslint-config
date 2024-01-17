import * as Preact from "preact";

export function Item() {
  return (
    <div>
      <h1>Data</h1>
      <SubItem input={{name: "Anders", role: "Developer"}} />
      <SubItem input={ { name: "Anders", role: "Developer" } } />
    </div>
  );
}

function SubItem({ input }) {
  return (
    <div>
      <h2>{input.name}</h2>
      <h3>{input.role}</h3>
    </div>
  );
}
