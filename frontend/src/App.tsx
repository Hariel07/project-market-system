import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import BottomNav from './shared/components/BottomNav';

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

// Comerciante
import ComercianteDashboard from './modules/comerciante/ComercianteDashboard';
import ComerciantePedidos from './modules/comerciante/ComerciantePedidos';
import ComercianteCatalogo from './modules/comerciante/ComercianteCatalogo';
import ComercianteEstoque from './modules/comerciante/ComercianteEstoque';
import ComercianteItemForm from './modules/comerciante/ComercianteItemForm';
import ComercianteConfig from './modules/comerciante/ComercianteConfig';

// Entregador
import EntregadorDashboard from './modules/entregador/EntregadorDashboard';
import EntregadorRota from './modules/entregador/EntregadorRota';
import EntregadorHistorico from './modules/entregador/EntregadorHistorico';
import EntregadorConfig from './modules/entregador/EntregadorConfig';

// Admin
import AdminDashboard from './modules/admin/AdminDashboard';
import AdminComercios from './modules/admin/AdminComercios';
import AdminUsuarios from './modules/admin/AdminUsuarios';
import AdminSistema from './modules/admin/AdminSistema';

function AppRoutes() {
  const location = useLocation();
  const isClienteRoute = location.pathname.startsWith('/cliente');

  return (
    <>
      <Routes>
        {/* Auth */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<CadastroPage />} />

        {/* Cliente */}
        <Route path="/cliente" element={<ClienteDashboard />} />
        <Route path="/cliente/mercados" element={<MercadosPage />} />
        <Route path="/cliente/mercado/:id" element={<MercadoDetalhePage />} />
        <Route path="/cliente/produto/:id" element={<ProdutoPage />} />
        <Route path="/cliente/carrinho" element={<CarrinhoPage />} />
        <Route path="/cliente/checkout" element={<CheckoutPage />} />
        <Route path="/cliente/pedidos" element={<PedidosPage />} />
        <Route path="/cliente/pedido/:id" element={<PedidoStatusPage />} />
        <Route path="/cliente/perfil" element={<PerfilPage />} />

        {/* Comerciante */}
        <Route path="/comerciante" element={<ComercianteDashboard />} />
        <Route path="/comerciante/pedidos" element={<ComerciantePedidos />} />
        <Route path="/comerciante/catalogo" element={<ComercianteCatalogo />} />
        <Route path="/comerciante/estoque" element={<ComercianteEstoque />} />
        <Route path="/comerciante/item/:id" element={<ComercianteItemForm />} />
        <Route path="/comerciante/config" element={<ComercianteConfig />} />

        {/* Entregador */}
        <Route path="/entregador" element={<EntregadorDashboard />} />
        <Route path="/entregador/rota/:id" element={<EntregadorRota />} />
        <Route path="/entregador/historico" element={<EntregadorHistorico />} />
        <Route path="/entregador/ganhos" element={<EntregadorHistorico />} />
        <Route path="/entregador/config" element={<EntregadorConfig />} />

        {/* Admin Platform */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/comercios" element={<AdminComercios />} />
        <Route path="/admin/usuarios" element={<AdminUsuarios />} />
        <Route path="/admin/sistema" element={<AdminSistema />} />
      </Routes>

      {/* Bottom nav only for cliente routes */}
      {isClienteRoute && <BottomNav />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <div className="app-layout">
          <AppRoutes />
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}
