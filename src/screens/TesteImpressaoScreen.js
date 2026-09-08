import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { imprimirComprovante } from '../utils/imprimirComprovante';

export default function TesteImpressaoScreen() {

  const handleImprimir = () => {
    // Dados de exemplo simulando uma comanda do restaurante
    const comandaExemplo = {
      numeroMesa: '05',
      cliente: 'Caio Lima',
      data: new Date().toLocaleString('pt-BR'),
      itens: [
        { nome: 'Espeto de Carne', qtd: 2, preco: 12.00 },
        { nome: 'Cerveja Original 600ml', qtd: 1, preco: 14.00 },
        { nome: 'Refrigerante Lata', qtd: 1, preco: 6.00 }
      ],
      total: 44.00
    };

    imprimirComprovante(comandaExemplo);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Teste de Impressão de Comprovante</Text>
      <Button 
        title="Imprimir Comprovante de Teste" 
        onPress={handleImprimir} 
        color="#2196F3" 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});