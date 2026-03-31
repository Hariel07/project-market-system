import { useState } from 'react';
import AdminLayout from './AdminLayout';
import './AdminUsuarios.css';

// Mock rápido para usuários globais
const usuariosMock = [
  { id: 101, nome: 'Hariel Soares', email: 'hariel@admin.com', perfil: 'Admin', status: 'ativo', ultimoAcesso: 'Agora mesmo' },
  { id: 204, nome: 'João Cliente', email: 'joao.cli@gmail.com', perfil: 'Cliente', status: 'ativo', ultimoAcesso: 'Há 5 min' },
  { id: 312, nome: 'Carlos Silva', email: 'carlos@burguerhouse.com', perfil: 'Comerciante', status: 'ativo', ultimoAcesso: 'Ontem 18:30' },
  { id: 450, nome: 'José Motoboy', email: 'ze.entrega@yahoo.com', perfil: 'Entregador', status: 'ativo', ultimoAcesso: 'Há 2 horas' },
  { id: 501, nome: 'Maria Bloqueada', email: 'fakeuser@spam.com', perfil: 'Cliente', status: 'bloqueado', ultimoAcesso: '01/01/2026' },
];

export default function AdminUsuarios() {
  const [busca, setBusca] = useState('');
  const [perfilFiltro, setPerfilFiltro] = useState('todos');

  const filtrados = usuariosMock.filter(u => {
    const matchBusca = u.nome.toLowerCase().includes(busca.toLowerCase()) || u.email.toLowerCase().includes(busca.toLowerCase());
    const matchPerfil = perfilFiltro === 'todos' || u.perfil.toLowerCase() === perfilFiltro;
    return matchBusca && matchPerfil;
  });

  return (
    <AdminLayout title="Gestão Global de Usuários">
      <div className="admin-usuarios animate-fade-in-up">
        
        {/* Controle/Filtros */}
        <div className="admin-card mb-4 p-4">
          <div className="admin-filter-bar">
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
              <option value="cliente">📱 Clientes</option>
              <option value="comerciante">🏪 Comerciantes</option>
              <option value="entregador">🛵 Entregadores</option>
              <option value="admin">👨‍💻 Admins</option>
            </select>
          </div>
        </div>

        {/* Tabela de Usuários */}
        <div className="admin-card table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuário</th>
                <th>E-mail</th>
                <th>Perfil Principal</th>
                <th>Último Acesso</th>
                <th>Status</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(user => (
                <tr key={user.id}>
                  <td><strong>#{user.id}</strong></td>
                  <td>
                    <div className="user-profile-cell">
                      <div className="user-avatar-mini">{user.nome.charAt(0)}</div>
                      <strong>{user.nome}</strong>
                    </div>
                  </td>
                  <td><span className="text-secondary">{user.email}</span></td>
                  <td><span className={`badge-role role-${user.perfil.toLowerCase()}`}>{user.perfil}</span></td>
                  <td><span className="text-tertiary">{user.ultimoAcesso}</span></td>
                  <td>
                    <span className={`status-dot status-${user.status === 'ativo' ? 'green' : 'red'}`}></span>
                    {user.status === 'ativo' ? 'Ativo' : 'Bloqueado'}
                  </td>
                  <td className="text-right admin-table-actions">
                    <button className="btn-icon-admin" title="Ver rastros/logs">👣</button>
                    <button className="btn-icon-admin text-danger" title="Banir usuário">🔨</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </AdminLayout>
  );
}
