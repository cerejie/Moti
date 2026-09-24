import { Hammer } from "lucide-react";
import { useMatches } from "react-router-dom";
import StateBox from "../../components/common/status/StateBox";
import ContentView from "../../components/common/view/ContentView";

// Read from the route's `handle`, not the route list, which imports this page.
const noteOf = (handle: unknown) =>
  handle && typeof handle === "object" && "note" in handle && typeof handle.note === "string"
    ? handle.note
    : null;

// Stands in for a nav entry whose screen arrives in a later phase; the topbar
// already names the page.
const ComingSoonView = () => {
  const note = noteOf(useMatches().at(-1)?.handle);

  return (
    <ContentView>
      <StateBox icon={<Hammer />} title="Coming soon">
        {note}
      </StateBox>
    </ContentView>
  );
};

export default ComingSoonView;
