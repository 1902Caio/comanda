import React from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { styles } from '../styles/styles';

export default function CardapioScreen({
  cardapio,
  novoNome,
  setNovoNome,
  novoPreco,
  setNovoPreco,
  adicionarProdutoCardapio,
  removerProdutoCardapio
}) {
  return (
    <View style={styles.conteudoAba}>
      <Text style={styles.titulo}>🍔 Cardápio</Text>

      <View style={styles.form}>
        <TextInput style={styles.input} placeholder="Nome do produto" value={novoNome} onChangeText={setNovoNome} />
        <TextInput
          style={styles.input}
          placeholder="Preço (ex: 12.50)"
          value={novoPreco}
          onChangeText={setNovoPreco}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.botaoAzul} onPress={adicionarProdutoCardapio}>
          <Text style={styles.textoBotao}>Cadastrar Produto</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={cardapio}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.linhaItemComanda}>
            <Text style={styles.textoItem}>{item.nome}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ marginRight: 10 }}>R$ {item.preco.toFixed(2)}</Text>
              <TouchableOpacity onPress={() => removerProdutoCardapio(item.id)} style={styles.botaoRemover}>
                <Text style={styles.textoRemover}>❌</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}