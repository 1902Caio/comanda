import React from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { styles } from '../styles/styles';
import { imprimirComprovante } from '../utils/imprimirComprovante';

export default function ComandaScreen({
  mesa,
  setMesa,
  cardapio,
  itensComanda,
  adicionarItemComanda,
  removerItemComanda,
  calcularTotalRascunho,
  enviarPedido
}) {
  return (
    <View style={styles.conteudoAba}>
      <View style={styles.areaMesa}>
        <Text style={styles.label}>Mesa / Comanda:</Text>
        <TextInput
          style={styles.inputMesa}
          placeholder="Ex: 05"
          value={mesa}
          onChangeText={setMesa}
          keyboardType="numeric"
        />
      </View>

      <Text style={styles.subtitulo}>Toque para adicionar itens:</Text>
      <View style={{ height: 130 }}>
        <FlatList
          data={cardapio}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.cardCardapioComanda} onPress={() => adicionarItemComanda(item)}>
              <Text style={styles.nomeProduto}>{item.nome}</Text>
              <Text style={styles.precoVerde}>+ R$ {item.preco.toFixed(2)}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <Text style={styles.subtitulo}>Itens a Enviar:</Text>
      <View style={styles.areaResumo}>
        {itensComanda.length === 0 ? (
          <Text style={styles.textoVazio}>Nenhum item selecionado.</Text>
        ) : (
         <FlatList
  data={itensComanda}
  keyExtractor={(item) => String(item.id)}
  renderItem={({ item }) => {
    const precoItem = Number(item.preco) || 0;
    const quantidadeItem = Number(item.quantidade) || 1;
    const totalItem = precoItem * quantidadeItem;

    return (
      <View style={styles.linhaItemComanda}>
        <Text style={styles.textoItem}>
          {quantidadeItem}x {item.nome}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[styles.nomeProduto, { marginRight: 10 }]}>
            R$ {totalItem.toFixed(2)}
          </Text>
          <TouchableOpacity 
            onPress={() => removerItemComanda(item.id)} 
            style={styles.botaoRemover}
          >
            <Text style={styles.textoRemover}>❌</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }}
/>
        )}
      </View>

      <View style={styles.rodape}>
        <View style={styles.linhaTotal}>
          <Text style={styles.labelTotal}>Subtotal:</Text>
          <Text style={styles.valorTotal}>R$ {calcularTotalRascunho().toFixed(2)}</Text>
        </View>

        <TouchableOpacity style={styles.botaoAzul} onPress={enviarPedido}>
          <Text style={styles.textoBotao}>Enviar Pedido para o Balcão</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.botaoAzul, { backgroundColor: '#28a745', marginTop: 10 }]} 
          onPress={() => imprimirComprovante({
            mesa,
            itens: itensComanda,
            total: calcularTotalRascunho()
          })}
        >
          <Text style={styles.textoBotao}>🖨️ Imprimir Comprovante</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}