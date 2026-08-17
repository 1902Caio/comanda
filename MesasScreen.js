import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { styles } from './styles';

export default function MesasScreen({
  comandasAtivas,
  calcularTotalComanda,
  removerItemDaMesa,
  selecionarMesaParaAdicionar,
  fecharComanda,
  reabrirComanda
}) {
  return (
    <View style={styles.conteudoAba}>
      <Text style={styles.titulo}>📋 Mesas Ocupadas</Text>
      {comandasAtivas.length === 0 ? (
        <Text style={styles.textoVazio}>Nenhuma mesa ocupada no momento.</Text>
      ) : (
        <FlatList
          data={comandasAtivas}
          keyExtractor={(item) => item.mesa}
          renderItem={({ item }) => (
            <View style={[styles.form, { marginBottom: 15 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[styles.subtitulo, { marginTop: 0, color: '#1976D2' }]}>Mesa {item.mesa}</Text>
                {item.status === 'fechada' && (
                  <View style={styles.badgeFechada}>
                    <Text style={styles.badgeFechadaTexto}>CONTA FECHADA</Text>
                  </View>
                )}
              </View>

              {item.itens.map((it) => (
                <View key={it.id} style={styles.linhaItemComanda}>
                  <Text style={styles.textoItem}>
                    • {it.quantidade}x {it.nome}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontWeight: '500', marginRight: 8 }}>
                      R$ {(it.preco * it.quantidade).toFixed(2)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => removerItemDaMesa(item.mesa, it.id)}
                      style={styles.botaoRemoverMesa}
                    >
                      <Text style={{ fontSize: 12 }}>❌</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <View style={[styles.linhaTotal, { marginTop: 10 }]}>
                <Text style={{ fontWeight: 'bold' }}>Total Acumulado:</Text>
                <Text style={{ fontWeight: 'bold', color: '#1976D2', fontSize: 16 }}>
                  R$ {calcularTotalComanda(item.itens).toFixed(2)}
                </Text>
              </View>

              {item.status === 'fechada' ? (
                <TouchableOpacity
                  style={[styles.botaoCinza, { marginTop: 10, padding: 10 }]}
                  onPress={() => reabrirComanda(item)}
                >
                  <Text style={styles.textoBotao}>🔓 Reabrir Comanda</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity
                    style={[styles.botaoAzul, { marginTop: 10, padding: 10 }]}
                    onPress={() => selecionarMesaParaAdicionar(item.mesa)}
                  >
                    <Text style={styles.textoBotao}>➕ Adicionar mais itens</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.botaoVerde, { marginTop: 8, padding: 10 }]}
                    onPress={() => fecharComanda(item)}
                  >
                    <Text style={styles.textoBotao}>✅ Fechar Comanda (pedir conta)</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}