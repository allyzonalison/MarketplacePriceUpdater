import Login from "./pages/Login";

import { ProgressProvider } from "./context/ProgressProvider";
import ProgressModal from "./components/common/ProgressModal";
import { useProgress } from "./hooks/useProgress";

function AppContent() {
  const { progress } = useProgress();

  return (
    <>
      <Login />

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
