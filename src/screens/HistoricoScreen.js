import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { styles } from '../styles/styles';
import { imprimirComprovante } from '../utils/imprimirComprovante';

export default function HistoricoScreen({
  historicoComandas = [],
  historicoAutorizado,
  senhaDigitada,
  setSenhaDigitada,
  verificarSenha,
  setHistoricoAutorizado
}) {
  const [dataInicio, setDataInicio] = useState(null);
  const [dataFim, setDataFim] = useState(null);

  const [mostrarPickerInicio, setMostrarPickerInicio] = useState(false);
  const [mostrarPickerFim, setMostrarPickerFim] = useState(false);

  // Formata a data para exibição (DD/MM/YYYY)
  const formatarDataExibicao = (data) => {
    if (!data) return '';
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  };

  // Botão rápido para selecionar Hoje
  const handleVerHoje = () => {
    const hoje = new Date();
    setDataInicio(hoje);
    setDataFim(hoje);
  };

  // Mudança da Data Inicial
  const onChangeDataInicio = (event, selectedDate) => {
    setMostrarPickerInicio(Platform.OS === 'ios');
    if (selectedDate) {
      setDataInicio(selectedDate);
    }
  };

  // Mudança da Data Final
  const onChangeDataFim = (event, selectedDate) => {
    setMostrarPickerFim(Platform.OS === 'ios');
    if (selectedDate) {
      setDataFim(selectedDate);
    }
  };

  // Período de busca validado com horas ajustadas (00:00:00 até 23:59:59)
  const periodoValido = useMemo(() => {
    if (!dataInicio || !dataFim) return null;

    const inicio = new Date(dataInicio);
    inicio.setHours(0, 0, 0, 0);

    const fim = new Date(dataFim);
    fim.setHours(23, 59, 59, 999);

    return { inicio, fim };
  }, [dataInicio, dataFim]);

  // Filtra as comandas do histórico que estão dentro do período selecionado
  const comandasFiltradas = useMemo(() => {
    if (!periodoValido) return [];

    return historicoComandas.filter((item) => {
      if (!item.fechadaEm) return false;
      const d = new Date(item.fechadaEm);
      return d >= periodoValido.inicio && d <= periodoValido.fim;
    });
  }, [historicoComandas, periodoValido]);

  // Soma TOTAL exata das vendas dentro do período selecionado
  const totalPeriodoSelecionado = useMemo(() => {
    return comandasFiltradas.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
  }, [comandasFiltradas]);

  // Soma TOTAL de todas as vendas já registradas no sistema
  const totalGeralHistorico = useMemo(() => {
    return historicoComandas.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
  }, [historicoComandas]);

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
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.titulo}>🔒 Histórico e Fechamento</Text>
            {setHistoricoAutorizado && (
              <TouchableOpacity onPress={() => setHistoricoAutorizado(false)}>
                <Text style={{ color: '#d32f2f', fontWeight: 'bold' }}>Sair 🔓</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Resumo Dinâmico do Período */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
            <View style={[styles.cardCardapioComanda, { flex: 1, marginRight: 5, backgroundColor: '#e3f2fd' }]}>
              <Text style={{ fontWeight: 'bold', fontSize: 12 }}>Total no Período</Text>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1976D2' }}>
                R$ {totalPeriodoSelecionado.toFixed(2)}
              </Text>
            </View>

            <View style={[styles.cardCardapioComanda, { flex: 1, marginLeft: 5, backgroundColor: '#e8f5e9' }]}>
              <Text style={{ fontWeight: 'bold', fontSize: 12 }}>Vendas Pesquisadas</Text>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2e7d32' }}>
                {comandasFiltradas.length} comanda(s)
              </Text>
            </View>
          </View>

          {/* Botão rápido Ver Vendas de Hoje */}
          <TouchableOpacity 
            style={[styles.botaoAzul, { backgroundColor: '#34495e', marginBottom: 10 }]} 
            onPress={handleVerHoje}
          >
            <Text style={styles.textoBotao}>📅 Ver Vendas de Hoje</Text>
          </TouchableOpacity>

          {/* Seletores de Data Nativa (Calendário) */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 15 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 2 }}>Data Inicial:</Text>
              <TouchableOpacity
                style={[styles.inputMesa, { justifyContent: 'center', marginBottom: 0, height: 45 }]}
                onPress={() => setMostrarPickerInicio(true)}
              >
                <Text style={{ color: dataInicio ? '#000' : '#888' }}>
                  {dataInicio ? formatarDataExibicao(dataInicio) : 'Selecionar Data'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 2 }}>Data Final:</Text>
              <TouchableOpacity
                style={[styles.inputMesa, { justifyContent: 'center', marginBottom: 0, height: 45 }]}
                onPress={() => setMostrarPickerFim(true)}
              >
                <Text style={{ color: dataFim ? '#000' : '#888' }}>
                  {dataFim ? formatarDataExibicao(dataFim) : 'Selecionar Data'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Modais de Calendário */}
          {mostrarPickerInicio && (
            <DateTimePicker
              value={dataInicio || new Date()}
              mode="date"
              display="default"
              onChange={onChangeDataInicio}
            />
          )}

          {mostrarPickerFim && (
            <DateTimePicker
              value={dataFim || new Date()}
              mode="date"
              display="default"
              onChange={onChangeDataFim}
            />
          )}

          {/* Resultado da Busca */}
          {!periodoValido ? (
            <Text style={styles.textoVazio}>Selecione a Data Inicial e Data Final nos botões acima.</Text>
          ) : comandasFiltradas.length === 0 ? (
            <Text style={styles.textoVazio}>
              Nenhuma venda encontrada de {formatarDataExibicao(dataInicio)} até {formatarDataExibicao(dataFim)}.
            </Text>
          ) : (
            <FlatList
              data={comandasFiltradas}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.form}>
                  <Text style={[styles.subtitulo, { marginTop: 0 }]}>Mesa {item.mesa}</Text>
                  <Text style={styles.textoVazio}>
                    {new Date(item.fechadaEm).toLocaleString('pt-BR')}
                  </Text>
                  {Array.isArray(item.itens) &&
                    item.itens.map((it, idx) => (
                      <Text key={it.id || idx} style={styles.textoItem}>
                        • {it.quantidade}x {it.nome}
                      </Text>
                    ))}
                  <View style={[styles.linhaTotal, { marginTop: 10 }]}>
                    <Text style={{ fontWeight: 'bold' }}>Total:</Text>
                    <Text style={{ fontWeight: 'bold', color: '#1976D2' }}>
                      R$ {(Number(item.total) || 0).toFixed(2)}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.botaoAzul, { backgroundColor: '#28a745', marginTop: 10 }]}
                    onPress={() => imprimirComprovante(item)}
                  >
                    <Text style={styles.textoBotao}>🖨️ Reimprimir Cupom</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
        </>
      )}
    </View>
  );
}