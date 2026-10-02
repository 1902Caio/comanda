import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { styles } from '../styles/styles';

const botaoAcao = {
  backgroundColor: '#1976D2',
  borderRadius: 6,
  marginTop: 8,
  padding: 10
};

export default function CardapioScreen({
  cardapio,
  secoesCardapio,
  validarSenhaGestao,
  adicionarSecaoCardapio,
  renomearSecaoCardapio,
  removerSecaoCardapio,
  adicionarProdutoCardapio,
  atualizarProdutoCardapio,
  removerProdutoCardapio
}) {
  const [senha, setSenha] = useState('');
  const [gestaoAutorizada, setGestaoAutorizada] = useState(false);
  const [nomeSecao, setNomeSecao] = useState('');
  const [secaoEmEdicao, setSecaoEmEdicao] = useState(null);
  const [nomeProduto, setNomeProduto] = useState('');
  const [precoProduto, setPrecoProduto] = useState('');
  const [secaoProdutoId, setSecaoProdutoId] = useState('');
  const [produtoEmEdicao, setProdutoEmEdicao] = useState(null);

  const entrarNaGestao = () => {
    if (validarSenhaGestao(senha)) {
      setGestaoAutorizada(true);
      setSenha('');
      return;
    }

    Alert.alert('Acesso negado', 'Senha incorreta.');
    setSenha('');
  };

  const limparFormularioProduto = () => {
    setProdutoEmEdicao(null);
    setNomeProduto('');
    setPrecoProduto('');
    setSecaoProdutoId('');
  };

  const salvarSecao = async () => {
    const sucesso = secaoEmEdicao
      ? await renomearSecaoCardapio(secaoEmEdicao.id, nomeSecao)
      : await adicionarSecaoCardapio(nomeSecao);

    if (sucesso) {
      setNomeSecao('');
      setSecaoEmEdicao(null);
    }
  };

  const salvarProduto = async () => {
    const sucesso = produtoEmEdicao
      ? await atualizarProdutoCardapio(
          produtoEmEdicao.id,
          nomeProduto,
          precoProduto,
          secaoProdutoId
        )
      : await adicionarProdutoCardapio(nomeProduto, precoProduto, secaoProdutoId);

    if (sucesso) limparFormularioProduto();
  };

  const iniciarEdicaoProduto = (produto) => {
    setProdutoEmEdicao(produto);
    setNomeProduto(produto.nome);
    setPrecoProduto(String(produto.preco));
    setSecaoProdutoId(produto.secaoId || '');
  };

  if (!gestaoAutorizada) {
    return (
      <View style={[styles.conteudoAba, { justifyContent: 'center' }]}>
        <Text style={styles.titulo}>🔒 Gerenciar Cardápio</Text>
        <Text style={styles.textoVazio}>Digite a senha do gerente para continuar.</Text>
        <TextInput
          style={styles.inputMesa}
          placeholder="Senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
          onSubmitEditing={entrarNaGestao}
        />
        <TouchableOpacity style={botaoAcao} onPress={entrarNaGestao}>
          <Text style={styles.textoBotao}>Entrar no gerenciamento</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.conteudoAba} contentContainerStyle={{ paddingBottom: 24 }}>
      <Text style={styles.titulo}>📋 Gerenciar Cardápio</Text>

      <View style={styles.form}>
        <Text style={styles.subtitulo}>Seções</Text>
        <Text style={styles.label}>{secaoEmEdicao ? 'Renomear seção:' : 'Nova seção:'}</Text>
        <TextInput
          style={styles.inputMesa}
          placeholder="Ex: Refrigerantes"
          value={nomeSecao}
          onChangeText={setNomeSecao}
        />
        <TouchableOpacity style={botaoAcao} onPress={salvarSecao}>
          <Text style={styles.textoBotao}>{secaoEmEdicao ? 'Salvar nome da seção' : 'Criar seção'}</Text>
        </TouchableOpacity>
        {secaoEmEdicao && (
          <TouchableOpacity
            style={[botaoAcao, { backgroundColor: '#666' }]}
            onPress={() => {
              setSecaoEmEdicao(null);
              setNomeSecao('');
            }}
          >
            <Text style={styles.textoBotao}>Cancelar edição da seção</Text>
          </TouchableOpacity>
        )}

        {secoesCardapio.length === 0 ? (
          <Text style={styles.textoVazio}>Ainda não há seções. Crie uma para cadastrar produtos.</Text>
        ) : (
          secoesCardapio.map((secao) => (
            <View key={secao.id} style={[styles.linhaItemComanda, { marginTop: 8 }]}>
              <Text style={[styles.nomeProduto, { flex: 1 }]}>{secao.nome}</Text>
              <TouchableOpacity
                style={{ padding: 8 }}
                accessibilityLabel={`Renomear seção ${secao.nome}`}
                onPress={() => {
                  setSecaoEmEdicao(secao);
                  setNomeSecao(secao.nome);
                }}
              >
                <Text>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ padding: 8 }}
                accessibilityLabel={`Excluir seção ${secao.nome}`}
                onPress={() => removerSecaoCardapio(secao.id)}
              >
                <Text>❌</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      <View style={styles.form}>
        <Text style={styles.subtitulo}>{produtoEmEdicao ? 'Editar produto' : 'Cadastrar produto'}</Text>
        <Text style={styles.label}>Nome do produto:</Text>
        <TextInput
          style={styles.inputMesa}
          placeholder="Ex: Suco de laranja"
          value={nomeProduto}
          onChangeText={setNomeProduto}
        />

        <Text style={styles.label}>Preço (R$):</Text>
        <TextInput
          style={styles.inputMesa}
          placeholder="Ex: 8,50"
          value={precoProduto}
          onChangeText={setPrecoProduto}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Seção do produto:</Text>
        {secoesCardapio.length === 0 ? (
          <Text style={styles.textoVazio}>Crie uma seção antes de cadastrar produtos.</Text>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {secoesCardapio.map((secao) => {
              const selecionada = secaoProdutoId === secao.id;
              return (
                <TouchableOpacity
                  key={secao.id}
                  style={{
                    backgroundColor: selecionada ? '#1976D2' : '#E5E5E5',
                    borderRadius: 16,
                    margin: 4,
                    paddingHorizontal: 12,
                    paddingVertical: 8
                  }}
                  onPress={() => setSecaoProdutoId(secao.id)}
                >
                  <Text style={{ color: selecionada ? '#fff' : '#222' }}>{secao.nome}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <TouchableOpacity style={botaoAcao} onPress={salvarProduto}>
          <Text style={styles.textoBotao}>{produtoEmEdicao ? 'Salvar alterações' : 'Cadastrar produto'}</Text>
        </TouchableOpacity>
        {produtoEmEdicao && (
          <TouchableOpacity
            style={[botaoAcao, { backgroundColor: '#666' }]}
            onPress={limparFormularioProduto}
          >
            <Text style={styles.textoBotao}>Cancelar edição do produto</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.subtitulo}>Produtos cadastrados</Text>
      {cardapio.length === 0 ? (
        <Text style={styles.textoVazio}>Nenhum produto cadastrado.</Text>
      ) : (
        cardapio.map((produto) => {
          const secao = secoesCardapio.find((item) => item.id === produto.secaoId);
          return (
            <View key={produto.id} style={[styles.linhaItemComanda, { marginBottom: 8 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.nomeProduto}>{produto.nome}</Text>
                <Text style={styles.precoVerde}>R$ {Number(produto.preco).toFixed(2)}</Text>
                <Text style={styles.textoItem}>
                  {secao ? `Seção: ${secao.nome}` : 'Sem seção — atribua uma seção para liberar nos pedidos.'}
                </Text>
              </View>
              <TouchableOpacity
                style={{ padding: 8 }}
                accessibilityLabel={`Editar produto ${produto.nome}`}
                onPress={() => iniciarEdicaoProduto(produto)}
              >
                <Text>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.botaoRemover}
                accessibilityLabel={`Excluir produto ${produto.nome}`}
                onPress={() => removerProdutoCardapio(produto.id)}
              >
                <Text style={styles.textoRemover}>❌</Text>
              </TouchableOpacity>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}
