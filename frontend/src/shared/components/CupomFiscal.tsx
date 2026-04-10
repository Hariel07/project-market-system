import { useRef } from 'react';
import './CupomFiscal.css';

interface ItemCupom {
  nome: string;
  quantidade: number;
  precoUnitario: number;
}

interface CupomProps {
  pedidoId: string;
  comercioNome: string;
  comercioCnpj?: string;
  clienteNome: string;
  itens: ItemCupom[];
  subtotal: number;
  taxaEntrega: number;
  total: number;
  metodoPagto: string;
  data: string;
  onPrint?: () => void;
}

const PAGTO_LABEL: Record<string, string> = {
  PIX: 'PIX', CREDITO: 'Cartão Crédito', DEBITO: 'Cartão Débito', DINHEIRO: 'Dinheiro',
};

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function CupomFiscal({
  pedidoId, comercioNome, comercioCnpj, clienteNome,
  itens, subtotal, taxaEntrega, total, metodoPagto, data, onPrint,
}: CupomProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (onPrint) { onPrint(); return; }
    const el = ref.current;
    if (!el) return;
    const win = window.open('', '_blank', 'width=320,height=600');
    if (!win) return;
    win.document.write(`
      <html><head><title>Cupom #${pedidoId.slice(-6).toUpperCase()}</title>
      <style>
        body { font-family: 'Courier New', monospace; font-size: 12px; padding: 8px; margin: 0; max-width: 300px; }
        .line { border-top: 1px dashed #000; margin: 6px 0; }
        .center { text-align: center; }
        .right { text-align: right; }
        .bold { font-weight: bold; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 2px 0; vertical-align: top; }
        @media print { body { margin: 0; } }
      </style></head><body>${el.innerHTML}</body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 300);
  };

  const dataFormatada = new Date(data).toLocaleString('pt-BR');
  const numero = pedidoId.slice(-6).toUpperCase();

  return (
    <div>
      <div ref={ref} className="cupom-fiscal">
        <div className="cupom-header">
          <div className="cupom-store">{comercioNome}</div>
          {comercioCnpj && <div className="cupom-cnpj">CNPJ: {comercioCnpj}</div>}
          <div className="cupom-separator" />
          <div className="cupom-title">CUPOM DO PEDIDO</div>
          <div className="cupom-number">#{numero}</div>
          <div className="cupom-date">{dataFormatada}</div>
          <div className="cupom-separator" />
        </div>

        <div className="cupom-client">Cliente: {clienteNome}</div>
        <div className="cupom-separator" />

        <table className="cupom-items">
          <thead>
            <tr>
              <td className="cupom-bold">Item</td>
              <td className="cupom-bold cupom-right">Qtd</td>
              <td className="cupom-bold cupom-right">Unit.</td>
              <td className="cupom-bold cupom-right">Total</td>
            </tr>
          </thead>
          <tbody>
            {itens.map((item, i) => (
              <tr key={i}>
                <td>{item.nome}</td>
                <td className="cupom-right">{item.quantidade}</td>
                <td className="cupom-right">{fmt(item.precoUnitario)}</td>
                <td className="cupom-right">{fmt(item.precoUnitario * item.quantidade)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="cupom-separator" />

        <div className="cupom-totals">
          <div className="cupom-row">
            <span>Subtotal:</span>
            <span>{fmt(subtotal)}</span>
          </div>
          <div className="cupom-row">
            <span>Taxa entrega:</span>
            <span>{taxaEntrega === 0 ? 'Grátis' : fmt(taxaEntrega)}</span>
          </div>
          <div className="cupom-row cupom-bold cupom-total-line">
            <span>TOTAL:</span>
            <span>{fmt(total)}</span>
          </div>
        </div>

        <div className="cupom-separator" />
        <div className="cupom-pagto">Pagamento: {PAGTO_LABEL[metodoPagto] || metodoPagto}</div>
        <div className="cupom-separator" />
        <div className="cupom-footer">Obrigado pela preferência!</div>
      </div>

      <button className="btn btn-outline btn-sm cupom-print-btn" onClick={handlePrint}>
        🖨️ Imprimir cupom
      </button>
    </div>
  );
}
