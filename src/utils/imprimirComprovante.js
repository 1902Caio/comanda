import * as Print from 'expo-print';

export const imprimirComprovante = async (dadosComanda) => {
  const numeroMesa = dadosComanda.numeroMesa ?? dadosComanda.mesa ?? 'Balcão';
  const dataComprovante = dadosComanda.data
    ?? (dadosComanda.fechadaEm
      ? new Date(dadosComanda.fechadaEm).toLocaleString('pt-BR')
      : new Date().toLocaleString('pt-BR'));

  // Os registros atuais usam `quantidade`; `qtd` continua aceito para os dados de teste existentes.
  const itensHtml = dadosComanda.itens.map(item => {
    const quantidade = Number(item.quantidade ?? item.qtd ?? 0);
    const preco = Number(item.preco) || 0;

    return `
      <tr>
        <td style="text-align: left; padding: 4px 0;">${quantidade}x ${item.nome}</td>
        <td style="text-align: right; padding: 4px 0;">R$ ${(preco * quantidade).toFixed(2)}</td>
      </tr>
    `;
  }).join('');

  // 2. Monta o HTML completo dentro da função para ter acesso às variáveis
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <style>
        @page { 
          margin: 0; 
          size: auto; 
        }
        body { 
          font-family: 'Courier New', Courier, monospace; 
          width: 100%;
          margin: 0 auto; 
          padding: 5px; 
          font-size: 13px; 
          color: #000;
          box-sizing:border-box; 
        }
        .header { text-align: center; margin-bottom: 10px; }
        .title { font-size: 16px; font-weight: bold; margin: 0; }
        .subtitle { font-size: 11px; margin: 8px 0; }
        .divider { border-top: 1px dashed #000; margin: 8px 0; }
        .info { margin-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 8px 0; }
        .total-box { display: flex; justify-content: space-between; font-size: 14px; font-weight: bold; margin-top: 8px; }
        .footer { text-align: center; margin-top: 15px; font-size: 10px; }
      </style>
    </head>
    <body>
      <div class="header">
        <p class="title">Rudge Grill</p>
        <p class="subtitle">Comprovante de consumo</p>
      </div>
      
      <div class="divider"></div>
      
      <div class="info">
        <div><strong>Mesa / Comanda:</strong> #${numeroMesa}</div>
        ${dadosComanda.cliente ? `<div><strong>Cliente:</strong> ${dadosComanda.cliente}</div>` : ''}
        <div><strong>Data:</strong> ${dataComprovante}</div>
      </div>
      
      <div class="divider"></div>
      
      <table>
        <thead>
          <tr>
            <th style="text-align: left; border-bottom: 1px solid #000;">Item</th>
            <th style="text-align: right; border-bottom: 1px solid #000;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itensHtml}
        </tbody>
      </table>
      
      <div class="divider"></div>
      
      <div class="total-box">
        <span>TOTAL:</span>
        <span>R$ ${Number(dadosComanda.total || 0).toFixed(2)}</span>
      </div>
      
      <div class="divider"></div>
      
      <div class="footer">
        <p>Obrigado pela preferência!</p>
        <p>*** Sistema Rudge Grill ***</p>
      </div>
    </body>
    </html>
  `;

  // 3. Executa a impressão por meio do Expo Print
  try {
    await Print.printAsync({
      html: htmlContent,
    });
  } catch (error) {
    console.error('Erro ao imprimir comprovante:', error);
  }
};


    



