// CF: https://polygon.io/docs/forex/get_v1_conversion__from___to

import { IGet, IRequestOptions, IPolygonQuery } from "../transport/request.js";

export interface IConversionQuery extends IPolygonQuery {
  amount?: number;
  precision?: number;
}

export interface IConversion {
  status?: string;
  converted?: number;
  initialAmmount?: number;
  last?: {
    ask?: number;
    bid?: number;
    exchange?: number;
    timestamp?: number;
  };
  to?: string;
}

export const conversion = async (
  get: IGet,
  from: string,
  to: string,
  query?: IConversionQuery,
  options?: IRequestOptions
): Promise<IConversion> =>
  get(`/v1/conversion/${from}/${to}`, query, options);
