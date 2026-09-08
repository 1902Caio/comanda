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
      <Text style={styles.titulo}>📋 Gerenciar Cardápio</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Nome do Produto:</Text>
        <TextInput
          style={styles.inputMesa}
          placeholder="Ex: Churrasco"
          value={novoNome}
          onChangeText={setNovoNome}
        />

        <Text style={styles.label}>Preço (R$):</Text>
        <TextInput
          style={styles.inputMesa}
          placeholder="Ex: 25.00"
          value={novoPreco}
          onChangeText={setNovoPreco}
          keyboardType="numeric"
        />

        <TouchableOpacity 
          style={[styles.botaoAzul, { backgroundColor: '#28a745', marginTop: 10 }]} 
          onPress={adicionarProdutoCardapio}
        >
          <Text style={styles.textoBotao}>➕ Cadastrar Produto</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitulo}>Itens do Cardápio Atual:</Text>
      
      {cardapio.length === 0 ? (
        <Text style={styles.textoVazio}>Nenhum produto cadastrado.</Text>
      ) : (
        <FlatList
          data={cardapio}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.linhaItemComanda}>
              <View>
                <Text style={styles.nomeProduto}>{item.nome}</Text>
                <Text style={styles.precoVerde}>R$ {Number(item.preco).toFixed(2)}</Text>
              </View>
              <TouchableOpacity 
                onPress={() => removerProdutoCardapio(item.id)} 
                style={styles.botaoRemover}
              >
                <Text style={styles.textoRemover}>❌</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}