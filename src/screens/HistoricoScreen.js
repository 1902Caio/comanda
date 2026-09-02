import React from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { styles } from '../styles/styles';

export default function HistoricoScreen({
  historicoComandas,
  historicoAutorizado,
  senhaDigitada,
  setSenhaDigitada,
  verificarSenha
}) {
  return (
    <View style={styles.conteudoAba}>
      {!historicoAutorizado ? (
        <View style={styles.areaMesa}>
          <Text style={styles.label}>Digite a senha para acessar o histórico:</Text>
          <TextInput
            style={styles.inputMesa}
            placeholder="Senha"
            value={senhaDigitada}
            onChangeText={setSenhaDigitada}
            secureTextEntry
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.botaoAzul} onPress={verificarSenha}>
            <Text style={styles.textoBotao}>Entrar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={styles.titulo}>🔒 Histórico de Comandas</Text>
          {historicoComandas.length === 0 ? (
            <Text style={styles.textoVazio}>Nenhuma comanda fechada ainda.</Text>
          ) : (
            <FlatList
              data={historicoComandas}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.form}>
                  <Text style={[styles.subtitulo, { marginTop: 0 }]}>Mesa {item.mesa}</Text>
                  <Text style={styles.textoVazio}>{new Date(item.fechadaEm).toLocaleString('pt-BR')}</Text>
                  {item.itens.map((it) => (
                    <Text key={it.id} style={styles.textoItem}>
                      • {it.quantidade}x {it.nome}
                    </Text>
                  ))}
                  <View style={[styles.linhaTotal, { marginTop: 10 }]}>
                    <Text style={{ fontWeight: 'bold' }}>Total:</Text>
                    <Text style={{ fontWeight: 'bold', color: '#1976D2' }}>R$ {item.total.toFixed(2)}</Text>
                  </View>
                </View>
              )}
            />
          )}
        </>
      )}
    </View>
  );
}