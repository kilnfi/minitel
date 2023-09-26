import { PROTOCOLS, type Token } from "./protocol";

export function isToken(token: string): token is Token {
  return PROTOCOLS.some((p) => p.token === token);
}

export function parseToken(token: unknown): Token {
  return typeof token === "string" && isToken(token) ? token : PROTOCOLS[0].token;
}
