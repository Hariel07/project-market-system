import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import BottomNav from './shared/components/BottomNav';
import { NotificationCenter } from './shared/components/NotificationCenter';
import MaintenancePage from './shared/components/MaintenancePage';
import { PrivateRoute } from './shared/components/PrivateRoute';
import { useAppConfig } from './lib/useAppName';
import { isTokenValid } from './lib/utils';

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
import ComerciantePDV from './modules/comerciante/ComerciantePDV';
import ComercianteFuncionarios from './modules/comerciante/ComercianteFuncionarios';
import ComercianteAreaEntrega from './modules/comerciante/ComercianteAreaEntrega';

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
  const token = localStorage.getItem('@MarketSystem:token');
  const userStr = localStorage.getItem('@MarketSystem:user');

  // Token ausente ou expirado — limpa silenciosamente e mostra a vitrine como visitante
  if (!userStr || !isTokenValid(token)) {
    if (token || userStr) {
      localStorage.removeItem('@MarketSystem:token');
      localStorage.removeItem('@MarketSystem:user');
    }
    return <ClienteDashboard />;
  }

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

        {/* Cliente — rotas públicas */}
        <Route path="/mercados" element={<MercadosPage />} />
        <Route path="/mercado/:id" element={<MercadoDetalhePage />} />
        <Route path="/produto/:id" element={<ProdutoPage />} />
        <Route path="/carrinho" element={<CarrinhoPage />} />

        {/* Cliente — rotas protegidas (requer CLIENTE logado) */}
        <Route path="/checkout" element={<PrivateRoute roles={['CLIENTE']} element={<CheckoutPage />} />} />
        <Route path="/pedidos" element={<PrivateRoute roles={['CLIENTE']} element={<PedidosPage />} />} />
        <Route path="/pedido/:id" element={<PrivateRoute roles={['CLIENTE']} element={<PedidoStatusPage />} />} />
        <Route path="/perfil" element={<PrivateRoute roles={['CLIENTE']} element={<PerfilPage />} />} />
        <Route path="/enderecos" element={<PrivateRoute roles={['CLIENTE']} element={<EnderecosPage />} />} />
        <Route path="/enderecos/novo" element={<PrivateRoute roles={['CLIENTE']} element={<EnderecoFormPage />} />} />
        <Route path="/enderecos/editar/:id" element={<PrivateRoute roles={['CLIENTE']} element={<EnderecoFormPage />} />} />

        {/* Comerciante */}
        <Route path="/comerciante" element={<PrivateRoute roles={['DONO','GERENTE','CAIXA','ESTOQUE','AJUDANTE_GERAL','GARCOM']} element={<ComercianteDashboard />} />} />
        <Route path="/comerciante/pedidos" element={<PrivateRoute roles={['DONO','GERENTE','CAIXA','ESTOQUE','AJUDANTE_GERAL','GARCOM']} element={<ComerciantePedidos />} />} />
        <Route path="/comerciante/catalogo" element={<PrivateRoute roles={['DONO','GERENTE','CAIXA','ESTOQUE','AJUDANTE_GERAL','GARCOM']} element={<ComercianteCatalogo />} />} />
        <Route path="/comerciante/catalogo/novo" element={<PrivateRoute roles={['DONO','GERENTE','ESTOQUE']} element={<ComercianteItemForm />} />} />
        <Route path="/comerciante/catalogo/editar/:id" element={<PrivateRoute roles={['DONO','GERENTE','ESTOQUE']} element={<ComercianteItemForm />} />} />
        <Route path="/comerciante/estoque" element={<PrivateRoute roles={['DONO','GERENTE','ESTOQUE']} element={<ComercianteEstoque />} />} />
        <Route path="/comerciante/item/:id" element={<PrivateRoute roles={['DONO','GERENTE','ESTOQUE']} element={<ComercianteItemForm />} />} />
        <Route path="/comerciante/caixa" element={<PrivateRoute roles={['DONO','GERENTE','CAIXA']} element={<ComercianteCaixa />} />} />
        <Route path="/comerciante/pdv/:pdvId" element={<PrivateRoute roles={['DONO','GERENTE','CAIXA','AJUDANTE_GERAL','GARCOM']} element={<ComerciantePDV />} />} />
        <Route path="/comerciante/equipe" element={<PrivateRoute roles={['DONO','GERENTE']} element={<ComercianteFuncionarios />} />} />
        <Route path="/comerciante/config" element={<PrivateRoute roles={['DONO','GERENTE']} element={<ComercianteConfig />} />} />
        <Route path="/comerciante/config/perfil" element={<PrivateRoute roles={['DONO','GERENTE']} element={<ComerciantePerfilConfig />} />} />
        <Route path="/comerciante/config/area-entrega" element={<PrivateRoute roles={['DONO','GERENTE']} element={<ComercianteAreaEntrega />} />} />
        <Route path="/comerciante/perfil" element={<PrivateRoute roles={['DONO','GERENTE','CAIXA','ESTOQUE','AJUDANTE_GERAL','GARCOM']} element={<ComerciantePerfilPage />} />} />

        {/* Entregador */}
        <Route path="/entregador" element={<PrivateRoute roles={['ENTREGADOR']} element={<EntregadorDashboard />} />} />
        <Route path="/entregador/rota/:id" element={<PrivateRoute roles={['ENTREGADOR']} element={<EntregadorRota />} />} />
        <Route path="/entregador/historico" element={<PrivateRoute roles={['ENTREGADOR']} element={<EntregadorHistorico />} />} />
        <Route path="/entregador/ganhos" element={<PrivateRoute roles={['ENTREGADOR']} element={<EntregadorGanhos />} />} />
        <Route path="/entregador/config" element={<PrivateRoute roles={['ENTREGADOR']} element={<EntregadorConfig />} />} />
        <Route path="/entregador/editar-perfil" element={<PrivateRoute roles={['ENTREGADOR']} element={<EditarPerfilPage />} />} />
        <Route path="/entregador/conta-bancaria" element={<PrivateRoute roles={['ENTREGADOR']} element={<ContaBancariaPage />} />} />
        <Route path="/entregador/preferencias" element={<PrivateRoute roles={['ENTREGADOR']} element={<PreferenciasPage />} />} />
        <Route path="/entregador/suporte" element={<PrivateRoute roles={['ENTREGADOR']} element={<SuportePage />} />} />

        {/* Admin */}
        <Route path="/admin" element={<PrivateRoute roles={['ADMIN']} element={<AdminDashboard />} />} />
        <Route path="/admin/comercios" element={<PrivateRoute roles={['ADMIN']} element={<AdminComercios />} />} />
        <Route path="/admin/planos" element={<PrivateRoute roles={['ADMIN']} element={<AdminPlanos />} />} />
        <Route path="/admin/usuarios" element={<PrivateRoute roles={['ADMIN']} element={<AdminUsuarios />} />} />
        <Route path="/admin/sistema" element={<PrivateRoute roles={['ADMIN']} element={<AdminSistema />} />} />
        <Route path="/admin/perfil" element={<PrivateRoute roles={['ADMIN']} element={<AdminPerfilPage />} />} />
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
