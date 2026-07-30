declare module "bcryptjs" {
  export function compare(data: string, encrypted: string, cb?: (err: Error | null, same: boolean) => void): Promise<boolean>;
  export function hash(data: string, salt: number | string, cb?: (err: Error | null, encrypted: string) => void): Promise<string>;
  export function genSalt(rounds: number, cb?: (err: Error | null, salt: string) => void): Promise<string>;
  export function genSaltSync(rounds: number): string;
  export function hashSync(data: string, salt: number | string): string;
  export function compareSync(data: string, encrypted: string): boolean;
  export function getRounds(encrypted: string): number;
  export function getSalt(encrypted: string): string;

  const bcrypt: {
    compare: typeof compare;
    hash: typeof hash;
    genSalt: typeof genSalt;
    genSaltSync: typeof genSaltSync;
    hashSync: typeof hashSync;
    compareSync: typeof compareSync;
    getRounds: typeof getRounds;
    getSalt: typeof getSalt;
  };

  export default bcrypt;
}
