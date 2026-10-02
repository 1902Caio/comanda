import React, { useState, useEffect } from 'react';
import { SafeAreaView, StatusBar, ActivityIndicator, View } from 'react-native';
import { styles } from './src/styles/styles';
import { useComandas } from './src/hooks/useComandas';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/config/firebaseConfig';
import LoginScreen from './src/screens/LoginScreen';

import MenuAbas from './src/components/MenuAbas';
import ComandaScreen from './src/screens/ComandaScreen';
import MesasScreen from './src/screens/MesasScreen';
import BalcaoScreen from './src/screens/BalcaoScreen';
import HistoricoScreen from './src/screens/HistoricoScreen';
import CardapioScreen from './src/screens/CardapioScreen';

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState('comanda');
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [menuAberto, setMenuAberto] = useState(false);

  const c = useComandas();

  const trocarAba = (proximaAba) => {
    if (abaAtiva === 'historico' && proximaAba !== 'historico') {
      c.setHistoricoAutorizado(false);
      c.setSenhaDigitada('');
    }

    setAbaAtiva(proximaAba);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      setCarregando(false);
    });

    return () => unsubscribe();
  }, []);

  if (carregando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!usuario) {
    return <LoginScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <MenuAbas abaAtiva={abaAtiva} setAbaAtiva={trocarAba} totalMesasAtivas={c.comandasAtivas.length} />

      {abaAtiva === 'comanda' && (
        <ComandaScreen
          mesa={c.mesa}
          setMesa={c.setMesa}
          cardapio={c.cardapio}
          secoesCardapio={c.secoesCardapio}
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
          selecionarMesaParaAdicionar={(numeroMesa) => c.selecionarMesaParaAdicionar(numeroMesa, trocarAba)}
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
          setHistoricoAutorizado={c.setHistoricoAutorizado}
        />
      )}

      {abaAtiva === 'cardapio' && (
        <CardapioScreen
          cardapio={c.cardapio}
          secoesCardapio={c.secoesCardapio}
          validarSenhaGestao={c.validarSenhaGestao}
          adicionarSecaoCardapio={c.adicionarSecaoCardapio}
          renomearSecaoCardapio={c.renomearSecaoCardapio}
          removerSecaoCardapio={c.removerSecaoCardapio}
          adicionarProdutoCardapio={c.adicionarProdutoCardapio}
          atualizarProdutoCardapio={c.atualizarProdutoCardapio}
          removerProdutoCardapio={c.removerProdutoCardapio}
        />
      )}
    </SafeAreaView>
  );
}
