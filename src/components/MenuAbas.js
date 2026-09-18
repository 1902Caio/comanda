import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Certifique-se de que usa o expo/vector-icons para os ícones
import { styles } from '../styles/styles';

export default function MenuAbas({ abaAtiva, setAbaAtiva, totalMesasAtivas }) {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <View style={styles.containerMenuSuperior}>
      {/* 1. Abas principais visíveis na barra superior */}
      <View style={styles.abasPrincipais}>
        <TouchableOpacity
          style={[styles.botaoAba, abaAtiva === 'comanda' && styles.abaAtiva]}
          onPress={() => setAbaAtiva('comanda')}
        >
          <Text style={[styles.textoAba, abaAtiva === 'comanda' && styles.textoAbaAtivo]}>📝 Lançar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botaoAba, abaAtiva === 'ativas' && styles.abaAtiva]}
          onPress={() => setAbaAtiva('ativas')}
        >
          <Text style={[styles.textoAba, abaAtiva === 'ativas' && styles.textoAbaAtivo]}>
            📋 Mesas ({totalMesasAtivas})
          </Text>
        </TouchableOpacity>

        {/* Botão do Hambúrguer que abre o Drawer */}
        <TouchableOpacity
          style={styles.botaoHamburger}
          onPress={() => setMenuAberto(true)}
        >
          <Ionicons name="menu" size={26} color="#333" />
        </TouchableOpacity>
      </View>

      {/* 2. Modal da Gaveta Lateral (Drawer) */}
      <Modal
        visible={menuAberto}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuAberto(false)}
      >
        <View style={styles.overlayModal}>
          {/* Fundo escuro que fecha o menu ao tocar */}
          <TouchableOpacity 
            style={styles.fundoInvisivel} 
            activeOpacity={1} 
            onPress={() => setMenuAberto(false)} 
          />

          <View style={styles.gavetaLateral}>
            <View style={styles.headerGaveta}>
              <Text style={styles.tituloGaveta}>Menu</Text>
              <TouchableOpacity onPress={() => setMenuAberto(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Opção Balcão */}
            <TouchableOpacity
              style={styles.itemGaveta}
              onPress={() => {
                setAbaAtiva('balcao');
                setMenuAberto(false);
              }}
            >
              <Text style={styles.textoItemGaveta}>🖨️ Balcão</Text>
            </TouchableOpacity>

            {/* Opção Histórico */}
            <TouchableOpacity
              style={styles.itemGaveta}
              onPress={() => {
                setAbaAtiva('historico');
                setMenuAberto(false);
              }}
            >
              <Text style={styles.textoItemGaveta}>🔒 Histórico</Text>
            </TouchableOpacity>

            {/* Opção Cardápio */}
            <TouchableOpacity
              style={styles.itemGaveta}
              onPress={() => {
                setAbaAtiva('cardapio');
                setMenuAberto(false);
              }}
            >
              <Text style={styles.textoItemGaveta}>🍔 Cardápio</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}