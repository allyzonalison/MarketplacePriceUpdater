import ProductsPage from "./pages/ProductsPage";

import { ProgressProvider } from "./context/ProgressProvider";
import ProgressModal from "./components/common/ProgressModal";
import { useProgress } from "./hooks/useProgress";

function AppContent() {
  const { progress } = useProgress();

  return (
    <>
      <ProductsPage />

      <ProgressModal visible={progress.visible} title={progress.title} />
    </>
  );
}

function App() {
  return (
    <ProgressProvider>
      <AppContent />
    </ProgressProvider>
  );
}

export default App;
