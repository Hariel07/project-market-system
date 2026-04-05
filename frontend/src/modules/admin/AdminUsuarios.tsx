import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { api } from '../../lib/api';
import './AdminUsuarios.css';

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [perfilFiltro, setPerfilFiltro] = useState('todos');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Adicionado timestamp para evitar cache do navegador
      const res = await api.get(`/admin/users?t=${Date.now()}`);
      console.log('Dados recebidos:', res.data);
      setUsuarios(res.data);
    } catch (err: any) {
      console.error('Erro ao buscar usuários:', err);
      alert(`Erro ao carregar usuários: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSeeDetails = async (userId: string) => {
    try {
      const res = await api.get(`/admin/users/${userId}/details`);
      setSelectedUser(res.data);
    } catch (err) {
      alert('Erro ao buscar detalhes do usuário.');
    }
  };

  const filtrados = usuarios.filter(u => {
    const nome = u.nome || '';
    const email = u.account?.email || '';
    const role = u.role || '';
    
    const matchBusca = nome.toLowerCase().includes(busca.toLowerCase()) || 
                       email.toLowerCase().includes(busca.toLowerCase());
    
    const matchPerfil = perfilFiltro === 'todos' || 
                        role.toUpperCase() === perfilFiltro.toUpperCase();
                        
    return matchBusca && matchPerfil;
  });
return (
  <AdminLayout title="Gestão Global de Usuários">
    <div className="admin-usuarios animate-fade-in-up">

      {/* Controle/Filtros */}
      <div className="admin-card mb-4 p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Base de Usuários</h3>
          <div className="flex gap-2">
            <button className="btn btn-outline btn-sm" onClick={fetchUsers}>🔄 Atualizar</button>
            <button className="btn btn-primary btn-sm" onClick={() => window.location.href = '/cadastro'}>+ Novo Usuário</button>
          </div>
        </div>
        <div className="admin-filter-bar">
...
            <div className="input-search-group">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                className="input search-input" 
                placeholder="Buscar usuário por nome ou e-mail..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
              />
            </div>
            <select className="input admin-select" value={perfilFiltro} onChange={e => setPerfilFiltro(e.target.value)}>
              <option value="todos">Todos os Perfis</option>
              <option value="CLIENTE">📱 Clientes</option>
              <option value="DONO">🏪 Comerciantes</option>
              <option value="ENTREGADOR">🛵 Entregadores</option>
              <option value="ADMIN">👨‍💻 Admins</option>
            </select>
          </div>
        </div>

        {/* Tabela de Usuários */}
        <div className="admin-card table-wrapper">
          {loading ? (
            <div className="p-8 text-center">Carregando usuários...</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>E-mail / CPF</th>
                  <th>Perfil</th>
                  <th>Status</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-profile-cell">
                        <div className={`user-avatar-mini ${user.account?.isFake ? 'border-warning' : ''}`}>
                          {user.nome.charAt(0)}
                        </div>
                        <div>
                          <strong>{user.nome}</strong>
                          {user.account?.isFake && <span className="block text-xs text-warning">CONTA FAKE</span>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm">
                        <span className="block">{user.account?.email}</span>
                        <span className="text-tertiary">{user.account?.cpf}</span>
                      </div>
                    </td>
                    <td><span className={`badge-role role-${user.role.toLowerCase()}`}>{user.role}</span></td>
                    <td>
                      <span className={`status-dot status-${user.ativo ? 'green' : 'red'}`}></span>
                      {user.ativo ? 'Ativo' : 'Inativo'}
                    </td>
                    <td className="text-right admin-table-actions">
                      <button 
                        className="btn-icon-admin" 
                        title="Ver detalhes completos"
                        onClick={() => handleSeeDetails(user.id)}
                      >
                        👁️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal de Detalhes do Usuário (Modo Espião) */}
        {selectedUser && (
          <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
            <div className="modal-content animate-pop-in" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Detalhes do Usuário: {selectedUser.nome}</h3>
                <button className="close-btn" onClick={() => setSelectedUser(null)}>&times;</button>
              </div>
              <div className="modal-body user-details-grid">
                <div className="detail-section">
                  <h4>Informações de Conta</h4>
                  <p><strong>CPF:</strong> {selectedUser.account.cpf}</p>
                  <p><strong>E-mail:</strong> {selectedUser.account.email}</p>
                  <p><strong>Telefone:</strong> {selectedUser.account.telefone || 'N/A'}</p>
                  <p><strong>Criado em:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
                
                {selectedUser.comercio && (
                  <div className="detail-section">
                    <h4>Vínculo Comercial</h4>
                    <p><strong>Nome Fantasia:</strong> {selectedUser.comercio.nomeFantasia}</p>
                    <p><strong>Razão Social:</strong> {selectedUser.comercio.razaoSocial}</p>
                    <p><strong>CNPJ:</strong> {selectedUser.comercio.cnpj}</p>
                  </div>
                )}

                <div className="detail-section">
                  <h4>Endereços Cadastrados</h4>
                  {selectedUser.enderecos.length > 0 ? (
                    selectedUser.enderecos.map((addr: any) => (
                      <p key={addr.id} className="text-sm">
                        📍 {addr.logradouro}, {addr.numero} - {addr.bairro} ({addr.rotulo})
                      </p>
                    ))
                  ) : <p className="text-tertiary">Nenhum endereço.</p>}
                </div>

                <div className="detail-section">
                  <h4>Últimos Movimentos</h4>
                  {selectedUser.pedidosCliente?.length > 0 && <p>📦 {selectedUser.pedidosCliente.length} pedidos recentes.</p>}
                  {selectedUser.entregas?.length > 0 && <p>🛵 {selectedUser.entregas.length} entregas realizadas.</p>}
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline" onClick={() => setSelectedUser(null)}>Fechar</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
