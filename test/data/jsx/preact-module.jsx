import * as Preact from "preact";

export default function Script({ children, ...attributes }) {
  return (
    <script {...attributes} dangerouslySetInnerHTML={{ __html: children }} />
  );
}
