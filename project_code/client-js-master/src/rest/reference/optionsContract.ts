// CF: https://polygon.io/docs/options/get_v3_reference_options_contracts__options_ticker

import { IGet, IPolygonQuery, IRequestOptions } from "../transport/request.js";

export interface IOptionsContractQuery extends IPolygonQuery {
  as_of?: string;
}

export interface IAdditionalUnderlyings {
  amount: number;
  type: string;
  underlying: string;
}

export interface IOptionsContractResults {
  additional_underlyings: IAdditionalUnderlyings[];
  cfi?: string;
  contract_type?: string;
  correction?: string;
  exercise_style?: string;
  expiration_date?: string;
  primary_exchange?: string;
  shares_per_contract?: number;
  strike_price?: number;
  ticker?: string;
  underlying_ticker?: string;
}

export interface IOptionsContract {
  request_id?: string;
  results?: IOptionsContractResults;
  status?: string;
}

export const optionsContract = (
  get: IGet,
  optionsTicker: string,
  query?: IOptionsContractQuery,
  options?: IRequestOptions
): Promise<IOptionsContract> =>
  get(
    `/v3/reference/options/contracts/${optionsTicker}`,
    query,
    options
  );
