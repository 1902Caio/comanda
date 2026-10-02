import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { styles } from '../styles/styles';

export default function ComandaScreen({
  mesa,
  setMesa,
  cardapio,
  secoesCardapio,
  itensComanda,
  adicionarItemComanda,
  removerItemComanda,
  calcularTotalRascunho,
  enviarPedido
}) {
  const [secaoSelecionadaId, setSecaoSelecionadaId] = useState(null);
  const secaoSelecionada = secoesCardapio.find((secao) => secao.id === secaoSelecionadaId);
  const produtosDaSecao = secaoSelecionada
    ? cardapio.filter((produto) => produto.secaoId === secaoSelecionada.id)
    : [];

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
      {secoesCardapio.length === 0 ? (
        <Text style={styles.textoVazio}>O gerente precisa cadastrar as seções do cardápio.</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 48, marginBottom: 8 }}>
          {secoesCardapio.map((secao) => {
            const selecionada = secao.id === secaoSelecionada?.id;
            return (
              <TouchableOpacity
                key={secao.id}
                style={{
                  backgroundColor: selecionada ? '#1976D2' : '#E5E5E5',
                  borderRadius: 18,
                  marginRight: 8,
                  paddingHorizontal: 14,
                  paddingVertical: 10
                }}
                onPress={() => setSecaoSelecionadaId(secao.id)}
              >
                <Text style={{ color: selecionada ? '#fff' : '#222', fontWeight: '600' }}>{secao.nome}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      <View style={{ height: 130 }}>
        {!secaoSelecionada ? (
          <Text style={styles.textoVazio}>Escolha uma seção para ver os produtos.</Text>
        ) : produtosDaSecao.length === 0 ? (
          <Text style={styles.textoVazio}>Não há produtos nesta seção.</Text>
        ) : (
          <FlatList
            data={produtosDaSecao}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.cardCardapioComanda} onPress={() => adicionarItemComanda(item)}>
                <Text style={styles.nomeProduto}>{item.nome}</Text>
                <Text style={styles.precoVerde}>+ R$ {item.preco.toFixed(2)}</Text>
              </TouchableOpacity>
            )}
          />
        )}
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
      </View>
    </View>
  );
}
