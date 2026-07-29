/**
 * Lista padrão de client events para chamadas ConferenciaSP
 * Todos os serviços de conferência esperam esse bloco
 */
export const CONFERENCIA_CLIENT_EVENTS = {
  clientEventList: {
    clientEvent: [
      { $: 'fila.conferencia.client.event.produtos.divergentes' },
      { $: 'client.event.produtos.escolha.unidade.mov.armazenamento' },
      { $: 'client.event.escolha.empresa.local.destino' },
      { $: 'client.event.produtos.excluidos.conferencia' },
      { $: 'client.event.volumes.produto.recontado' },
      { $: 'br.com.sankhya.mgecom.busca.identificador.produto' },
      { $: 'conferencia.lista.produtos.divergentes' },
      { $: 'client.event.escolha.etiqueta.peso' },
    ],
  },
};
