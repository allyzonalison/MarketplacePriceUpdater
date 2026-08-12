import { ProgressProvider } from "./context/ProgressProvider";
import ProgressModal from "./components/common/ProgressModal";
import { useProgress } from "./hooks/useProgress";

import ProductsPage from "./pages/ProductsPage";
import Login from "./pages/Login";

function AppContent() {
  const { progress } = useProgress();

  const token = localStorage.getItem("token");

  return (
    <>
      {token ? <ProductsPage /> : <Login />}

      <ProgressModal
        visible={progress.visible}
        title={progress.title}
        completed={progress.completed}
        total={progress.total}
        percent={progress.percent}
      />
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
