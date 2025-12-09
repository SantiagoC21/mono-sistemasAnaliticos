import { AnalysisProvider } from './context/AnalysisContext';
import Layout from './components/layout/Layout';
import AnalysisDashboard from './pages/AnalysisDashboard';
import './assets/css/global.css'; // Crea este archivo vacío si quieres estilos

function App() {
  return (
    <AnalysisProvider>
      <Layout>
        <AnalysisDashboard />
      </Layout>
    </AnalysisProvider>
  );
}

export default App;