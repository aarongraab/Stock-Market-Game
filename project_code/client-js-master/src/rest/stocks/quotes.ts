// CF: https://polygon.io/docs/stocks/get_v2_ticks_stocks_nbbo__ticker___date

import { IGet, IRequestOptions } from "../transport/request.js";
import { ITradesQuotesQuery } from "./trades";

export interface IQuotesInfo {
  ask_exchange: number;
  ask_price: number;
  ask_size: number;
  bid_exchange: number;
  bid_price: number;
  bid_size: number;
  conditions: number[];
  indicators: number[];
  participant_timestamp: number;
  sequence_number: number;
  sip_timestamp: number;
  tape: number;
  trf_timestamp: number;
}

export interface IQuotes {
  next_url?: string;
  request_id?: string;
  results?: IQuotesInfo[];
  status?: string;
}

export const quotes = async (
  get: IGet,
  stockTicker: string,
  query?: ITradesQuotesQuery,
  options?: IRequestOptions
): Promise<IQuotes> => get(`/v3/quotes/${stockTicker}`, query, options);
