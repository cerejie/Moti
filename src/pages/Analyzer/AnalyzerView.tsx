import AnalyzerPanel from "../../components/analyzer/panels/AnalyzerPanel";
import ContentView from "../../components/common/view/ContentView";

const AnalyzerView = () => (
  <ContentView title="Smart Analyzer" subtitle="What sells most, and what to reorder next">
    <AnalyzerPanel />
  </ContentView>
);

export default AnalyzerView;
