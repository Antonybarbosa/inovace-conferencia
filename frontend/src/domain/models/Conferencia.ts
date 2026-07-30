export interface PedidoConferencia {
  nunota: number;
  codEmp: number;
  dtFaturamento: string | null;
  dtInicioConferencia: string | null;
  nuConf: number | null;
  usuarioConferente: string | null;
  nroUnico: number;
  statusConferencia: string;
  rotaEntrega: string | null;
  transportadora: string | null;
  ordemCarga: number | null;
  numNota: number;
  parceiro: string | null;
  obsPedido: string | null;
  qtdVolumes: number | null;
  qtdProdutosDistintos: number;
}

export interface ItemPedido {
  codProd: string;
  sequencia: string;
  descrProd: string | null;
  codBarra: string | null;
  referencia: string | null;
  qtdPed: string;
  qtdConf: string;
  controle: string | null;
}

export interface ConferenciaIniciada {
  numConf: string;
  numNota: string;
  tipMov: string;
  vendedor: string;
  parceiro: string;
  configuracoes: Record<string, string>;
}

export interface ProdutoConferencia {
  codProd: string;
  descrProd: string;
  tipoContagem: string;
  aferidoPelaBalanca: string;
  ignoraLote: string;
  decQtd: string;
}

export interface ItemConferidoResponse {
  codProd: string;
  descrProd: string;
  codVol: string;
  seqConf: string;
  referencia?: string;
}
