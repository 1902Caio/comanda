import { StyleSheet, Platform, StatusBar } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    // Reserva a altura da status bar no Android, já que SafeAreaView
    // sozinho não empurra o conteúdo para baixo nessa plataforma.
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  menuAbas: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    elevation: 3,
    zIndex: 10 // garante que o menu fique acima de outros elementos e receba o toque
  },
  botaoAba: {
    flex: 1,
    paddingVertical: 16, // área de toque um pouco maior, mais fácil de acertar o dedo
    alignItems: 'center',
    justifyContent: 'center'
  },
  abaAtiva: { borderBottomWidth: 3, borderBottomColor: '#1976D2' },
  textoAba: { fontSize: 11, color: '#777' },
  textoAbaAtivo: { color: '#1976D2', fontWeight: 'bold' },
  conteudoAba: { flex: 1, padding: 16 },
  titulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  subtitulo: { fontSize: 15, fontWeight: '600', marginTop: 12, marginBottom: 6 },
  areaMesa: { marginBottom: 10 },
  label: { fontSize: 13, color: '#555', marginBottom: 4 },
  inputMesa: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
    marginBottom: 10
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
    marginBottom: 10
  },
  form: { backgroundColor: '#fff', borderRadius: 10, padding: 12, elevation: 1 },
  cardCardapioComanda: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginRight: 8,
    minWidth: 110,
    justifyContent: 'center'
  },
  nomeProduto: { fontWeight: '600' },
  precoVerde: { color: '#2E7D32', marginTop: 4 },
  areaResumo: { flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 10 },
  textoVazio: { color: '#999', fontStyle: 'italic' },
  linhaItemComanda: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  textoItem: { fontSize: 14 },
  botaoRemover: { padding: 4 },
  botaoRemoverMesa: { padding: 4 },
  textoRemover: { fontSize: 14 },
  rodape: { marginTop: 10 },
  linhaTotal: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  labelTotal: { fontSize: 15, fontWeight: '600' },
  valorTotal: { fontSize: 18, fontWeight: 'bold', color: '#1976D2' },
  botaoAzul: {
    backgroundColor: '#1976D2',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center'
  },
  botaoVerde: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center'
  },
  botaoCinza: {
    backgroundColor: '#757575',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center'
  },
  badgeFechada: {
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#FB8C00',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3
  },
  badgeFechadaTexto: {
    color: '#EF6C00',
    fontSize: 11,
    fontWeight: 'bold'
  },
  formContaFechada: {
    borderWidth: 1.5,
    borderColor: '#FB8C00'
  },
  textoBotao: { color: '#fff', fontWeight: 'bold' },

  // --- NOVOS ESTILOS PARA O MENU HAMBÚRGUER E DRAWER ---
  containerMenuSuperior: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff', // Mantém a cor de fundo padrão
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  abasPrincipais: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  botaoHamburger: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayModal: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Fundo escuro translúcido
  },
  fundoInvisivel: {
    flex: 1, // Ocupa o resto da tela para permitir fechar ao tocar fora
  },
  gavetaLateral: {
    width: '75%', // Ocupa 75% da largura da tela pela lateral direita/esquerda
    height: '100%',
    backgroundColor: '#ffffff', // Cor de fundo da gaveta
    paddingTop: 50,
    paddingHorizontal: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  headerGaveta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 15,
  },
  tituloGaveta: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  itemGaveta: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  textoItemGaveta: {
    fontSize: 16,
    color: '#4b5563',
    fontWeight: '500',
  },
});