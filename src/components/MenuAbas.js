import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../styles/styles';

const ABAS = [
  { chave: 'comanda', label: '📝 Lançar' },
  { chave: 'ativas', label: '📋 Mesas' },
  { chave: 'balcao', label: '🖨️ Balcão' },
  { chave: 'historico', label: '🔒 Histórico' },
  { chave: 'cardapio', label: '🍔 Cardápio' }
];

export default function MenuAbas({ abaAtiva, setAbaAtiva, totalMesasAtivas }) {
  return (
    <View style={styles.menuAbas}>
      {ABAS.map((aba) => {
        const ativa = abaAtiva === aba.chave;
        const label = aba.chave === 'ativas' ? `${aba.label} (${totalMesasAtivas})` : aba.label;
        return (
          <TouchableOpacity
            key={aba.chave}
            style={[styles.botaoAba, ativa && styles.abaAtiva]}
            onPress={() => setAbaAtiva(aba.chave)}
          >
            <Text style={[styles.textoAba, ativa && styles.textoAbaAtivo]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}