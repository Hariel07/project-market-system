import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import BottomNav from './shared/components/BottomNav';
import { NotificationCenter } from './shared/components/NotificationCenter';
import MaintenancePage from './shared/components/MaintenancePage';
import { useAppConfig } from './lib/useAppName';

// Auth
import LoginPage from './modules/auth/LoginPage';
import CadastroPage from './modules/auth/CadastroPage';

// Cliente
import ClienteDashboard from './modules/cliente/ClienteDashboard';
import MercadosPage from './modules/cliente/MercadosPage';
import MercadoDetalhePage from './modules/cliente/MercadoDetalhePage';
import ProdutoPage from './modules/cliente/ProdutoPage';
import CarrinhoPage from './modules/cliente/CarrinhoPage';
import CheckoutPage from './modules/cliente/CheckoutPage';
import PedidosPage from './modules/cliente/PedidosPage';
import PedidoStatusPage from './modules/cliente/PedidoStatusPage';
import PerfilPage from './modules/cliente/PerfilPage';
import EnderecosPage from './modules/cliente/EnderecosPage';
import EnderecoFormPage from './modules/cliente/EnderecoFormPage';

// Comerciante
import ComercianteDashboard from './modules/comerciante/ComercianteDashboard';
import ComerciantePedidos from './modules/comerciante/ComerciantePedidos';
import ComercianteCatalogo from './modules/comerciante/ComercianteCatalogo';
import ComercianteEstoque from './modules/comerciante/ComercianteEstoque';
import ComercianteItemForm from './modules/comerciante/ComercianteItemForm';
import ComercianteConfig from './modules/comerciante/ComercianteConfig';
import ComerciantePerfilConfig from './modules/comerciante/ComerciantePerfilConfig';
import ComerciantePerfilPage from './modules/comerciante/ComerciantePerfilPage';
import ComercianteCaixa from './modules/comerciante/ComercianteCaixa';
import ComercianteFuncionarios from './modules/comerciante/ComercianteFuncionarios';

// Entregador
import EntregadorDashboard from './modules/entregador/EntregadorDashboard';
import EntregadorRota from './modules/entregador/EntregadorRota';
import EntregadorHistorico from './modules/entregador/EntregadorHistorico';
import EntregadorGanhos from './modules/entregador/EntregadorGanhos';
import EntregadorConfig from './modules/entregador/EntregadorConfig';
import EditarPerfilPage from './modules/entregador/EditarPerfilPage';
import ContaBancariaPage from './modules/entregador/ContaBancariaPage';
import PreferenciasPage from './modules/entregador/PreferenciasPage';
import SuportePage from './modules/entregador/SuportePage';

// Admin
import AdminDashboard from './modules/admin/AdminDashboard';
import AdminComercios from './modules/admin/AdminComercios';
import AdminPlanos from './modules/admin/AdminPlanos';
import AdminUsuarios from './modules/admin/AdminUsuarios';
import AdminSistema from './modules/admin/AdminSistema';
import AdminPerfilPage from './modules/admin/AdminPerfilPage';

// Rotas reservadas para outros módulos (não são do cliente)
const NON_CLIENTE_PREFIXES = ['/comerciante', '/entregador', '/admin', '/login', '/cadastro'];

function isRotaCliente(pathname: string) {
  return !NON_CLIENTE_PREFIXES.some(p => pathname.startsWith(p));
}

// Redireciona a raiz '/' com base no perfil do usuário logado
function RootRedirect() {
  const userStr = localStorage.getItem('@MarketSystem:user');
  if (!userStr) return <ClienteDashboard />;
  try {
    const user = JSON.parse(userStr);
    const role = user?.role;
    if (role === 'DONO' || role === 'GERENTE' || role === 'CAIXA' || role === 'ESTOQUE' || role === 'AJUDANTE_GERAL' || role === 'GARCOM') {
      return <Navigate to="/comerciante" replace />;
    }
    if (role === 'ENTREGADOR') return <Navigate to="/entregador" replace />;
    if (role === 'ADMIN') return <Navigate to="/admin" replace />;
  } catch {}
  return <ClienteDashboard />;
}

function AppRoutes() {
  const location = useLocation();
  const config = useAppConfig();

  const userStr = localStorage.getItem('@MarketSystem:user');
  let isAdmin = false;
  try {
    const user = userStr ? JSON.parse(userStr) : null;
    isAdmin = user?.role === 'ADMIN';
  } catch {}

  if (config.modoManutencao && !isAdmin && !location.pathname.includes('/admin') && location.pathname !== '/login') {
    return <MaintenancePage />;
  }

  return (
    <>
      <Routes>
        {/* Raiz inteligente */}
        <Route path="/" element={<RootRedirect />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<CadastroPage />} />

        {/* Cliente — sem prefixo /cliente */}
        <Route path="/mercados" element={<MercadosPage />} />
        <Route path="/mercado/:id" element={<MercadoDetalhePage />} />
        <Route path="/produto/:id" element={<ProdutoPage />} />
        <Route path="/carrinho" element={<CarrinhoPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/pedidos" element={<PedidosPage />} />
        <Route path="/pedido/:id" element={<PedidoStatusPage />} />
        <Route path="/perfil" element={<PerfilPage />} />
        <Route path="/enderecos" element={<EnderecosPage />} />
        <Route path="/enderecos/novo" element={<EnderecoFormPage />} />
        <Route path="/enderecos/editar/:id" element={<EnderecoFormPage />} />

        {/* Comerciante */}
        <Route path="/comerciante" element={<ComercianteDashboard />} />
        <Route path="/comerciante/pedidos" element={<ComerciantePedidos />} />
        <Route path="/comerciante/catalogo" element={<ComercianteCatalogo />} />
        <Route path="/comerciante/catalogo/novo" element={<ComercianteItemForm />} />
        <Route path="/comerciante/catalogo/editar/:id" element={<ComercianteItemForm />} />
        <Route path="/comerciante/estoque" element={<ComercianteEstoque />} />
        <Route path="/comerciante/item/:id" element={<ComercianteItemForm />} />
        <Route path="/comerciante/caixa" element={<ComercianteCaixa />} />
        <Route path="/comerciante/equipe" element={<ComercianteFuncionarios />} />
        <Route path="/comerciante/config" element={<ComercianteConfig />} />
        <Route path="/comerciante/config/perfil" element={<ComerciantePerfilConfig />} />
        <Route path="/comerciante/perfil" element={<ComerciantePerfilPage />} />

        {/* Entregador */}
        <Route path="/entregador" element={<EntregadorDashboard />} />
        <Route path="/entregador/rota/:id" element={<EntregadorRota />} />
        <Route path="/entregador/historico" element={<EntregadorHistorico />} />
        <Route path="/entregador/ganhos" element={<EntregadorGanhos />} />
        <Route path="/entregador/config" element={<EntregadorConfig />} />
        <Route path="/entregador/editar-perfil" element={<EditarPerfilPage />} />
        <Route path="/entregador/conta-bancaria" element={<ContaBancariaPage />} />
        <Route path="/entregador/preferencias" element={<PreferenciasPage />} />
        <Route path="/entregador/suporte" element={<SuportePage />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/comercios" element={<AdminComercios />} />
        <Route path="/admin/planos" element={<AdminPlanos />} />
        <Route path="/admin/usuarios" element={<AdminUsuarios />} />
        <Route path="/admin/sistema" element={<AdminSistema />} />
        <Route path="/admin/perfil" element={<AdminPerfilPage />} />
      </Routes>

      {/* BottomNav apenas nas rotas do cliente */}
      {isRotaCliente(location.pathname) && <BottomNav />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <CartProvider>
        <div className="app-layout">
          <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 100 }}>
            <NotificationCenter />
          </div>
          <AppRoutes />
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}
