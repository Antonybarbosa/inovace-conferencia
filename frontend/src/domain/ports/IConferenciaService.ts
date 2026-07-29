import {
  PedidoConferencia,
  ItemPedido,
  ConferenciaIniciada,
  ProdutoConferencia,
  ItemConferidoResponse,
} from '../models/Conferencia';

export interface IConferenciaService {
  listarPedidos(): Promise<PedidoConferencia[]>;
  iniciarConferencia(nuNota: number, codUsu?: number, nomeUsu?: string, mgeSession?: string): Promise<ConferenciaIniciada>;
  listarItensPedido(nuNota: number): Promise<{ conferenciaIniciada: boolean; itens: ItemPedido[] }>;
  getProduto(nuNota: number, codBarra: string): Promise<ProdutoConferencia>;
  conferirItem(params: {
    numConf: string;
    nuNota: number;
    codBarra: string;
    qtdConf: string;
  }): Promise<ItemConferidoResponse>;
  finalizarConferencia(nuConf: string, peso?: number, qtdVol?: number): Promise<any>;
  excluirConferencia(nuNota: number): Promise<{ qtdConferenciasExcluidas: number }>;
}
