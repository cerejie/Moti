import WhatToBuyTabSwitch from "../../components/analyzer/menus/WhatToBuyTabSwitch";
import ReorderPanel from "../../components/analyzer/panels/ReorderPanel";
import ContentView from "../../components/common/view/ContentView";

const WhatToBuyView = () => (
  <ContentView
    title="What to buy"
    subtitle="What is running out, and what sells the most"
    tabs={<WhatToBuyTabSwitch />}
  >
    <ReorderPanel />
  </ContentView>
);

export default WhatToBuyView;
