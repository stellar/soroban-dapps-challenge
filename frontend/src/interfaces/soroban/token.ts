import { Address } from 'token-a-contract';
import { AssembledTransaction as token1} from 'token-a-contract';
import { AssembledTransaction as token2} from 'token-b-contract';
import { AssembledTransaction as token3} from 'share-token-contract';
interface IToken {
    symbol: string;
    decimals: number;
    balance?: token1<bigint> | token2<bigint> | token3<bigint>;
}

interface IMintParams {
    to: Address;
    amount: bigint;
}

interface IMintOptions {
    signAndSend?: boolean;
    fee?: number;
}


interface IMintFunction {
    (params: IMintParams): Promise<void>;
}


export type { IToken, IMintFunction }