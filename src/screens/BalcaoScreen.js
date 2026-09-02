import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { styles } from '../styles/styles';

export default function BalcaoScreen({ comandasAtivas, calcularTotalComanda, confirmarPagamento }) {
  return (
    <View style={styles.conteudoAba}>
      <Text style={styles.titulo}>🖨️ Balcão</Text>
      {comandasAtivas.length === 0 ? (
        <Text style={styles.textoVazio}>Nenhum pedido pendente.</Text>
      ) : (
        <FlatList
          data={[...comandasAtivas].sort((a, b) => (a.status === 'fechada' && b.status !== 'fechada' ? -1 : 0))}
          keyExtractor={(item) => item.mesa}
          renderItem={({ item }) => (
            <View style={[styles.form, item.status === 'fechada' && styles.formContaFechada, { marginBottom: 12 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[styles.subtitulo, { marginTop: 0 }]}>
                  Mesa {item.mesa} — {item.ultimaHora}
                </Text>
                {item.status === 'fechada' && (
                  <View style={styles.badgeFechada}>
                    <Text style={styles.badgeFechadaTexto}>PRONTA P/ PAGAR</Text>
                  </View>
                )}
              </View>

              {item.itens.map((it) => (
                <Text key={it.id} style={styles.textoItem}>
                  • {it.quantidade}x {it.nome} — R$ {(it.preco * it.quantidade).toFixed(2)}
                </Text>
              ))}

              <View style={[styles.linhaTotal, { marginTop: 10 }]}>
                <Text style={{ fontWeight: 'bold' }}>Total:</Text>
                <Text style={{ fontWeight: 'bold', color: '#1976D2', fontSize: 16 }}>
                  R$ {calcularTotalComanda(item.itens).toFixed(2)}
                </Text>
              </View>

              {item.status === 'fechada' && (
                <TouchableOpacity
                  style={[styles.botaoVerde, { marginTop: 10, padding: 10 }]}
                  onPress={() => confirmarPagamento(item)}
                >
                  <Text style={styles.textoBotao}>💰 Confirmar Pagamento</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}