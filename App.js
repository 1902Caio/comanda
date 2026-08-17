import React, { useState } from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { styles } from './styles';
import { useComandas } from './useComandas';

import MenuAbas from './MenuAbas';
import ComandaScreen from './ComandaScreen';
import MesasScreen from './MesasScreen';
import BalcaoScreen from './BalcaoScreen';
import HistoricoScreen from './HistoricoScreen';
import CardapioScreen from './CardapioScreen';

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState('comanda');
  const c = useComandas();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <MenuAbas abaAtiva={abaAtiva} setAbaAtiva={setAbaAtiva} totalMesasAtivas={c.comandasAtivas.length} />

      {abaAtiva === 'comanda' && (
        <ComandaScreen
          mesa={c.mesa}
          setMesa={c.setMesa}
          cardapio={c.cardapio}
          itensComanda={c.itensComanda}
          adicionarItemComanda={c.adicionarItemComanda}
          removerItemComanda={c.removerItemComanda}
          calcularTotalRascunho={c.calcularTotalRascunho}
          enviarPedido={c.enviarPedido}
        />
      )}

      {abaAtiva === 'ativas' && (
        <MesasScreen
          comandasAtivas={c.comandasAtivas}
          calcularTotalComanda={c.calcularTotalComanda}
          removerItemDaMesa={c.removerItemDaMesa}
          selecionarMesaParaAdicionar={(numeroMesa) => c.selecionarMesaParaAdicionar(numeroMesa, setAbaAtiva)}
          fecharComanda={c.fecharComanda}
          reabrirComanda={c.reabrirComanda}
        />
      )}

      {abaAtiva === 'balcao' && (
        <BalcaoScreen
          comandasAtivas={c.comandasAtivas}
          calcularTotalComanda={c.calcularTotalComanda}
          confirmarPagamento={c.confirmarPagamento}
        />
      )}

      {abaAtiva === 'historico' && (
        <HistoricoScreen
          historicoComandas={c.historicoComandas}
          historicoAutorizado={c.historicoAutorizado}
          senhaDigitada={c.senhaDigitada}
          setSenhaDigitada={c.setSenhaDigitada}
          verificarSenha={c.verificarSenha}
        />
      )}

      {abaAtiva === 'cardapio' && (
        <CardapioScreen
          cardapio={c.cardapio}
          novoNome={c.novoNome}
          setNovoNome={c.setNovoNome}
          novoPreco={c.novoPreco}
          setNovoPreco={c.setNovoPreco}
          adicionarProdutoCardapio={c.adicionarProdutoCardapio}
          removerProdutoCardapio={c.removerProdutoCardapio}
        />
      )}
    </SafeAreaView>
  );
}