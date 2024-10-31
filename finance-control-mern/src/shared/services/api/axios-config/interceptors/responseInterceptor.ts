import { AxiosResponse } from "axios";

export const responseInterceptor = (response: AxiosResponse) => {
  const rateLimitRemaining = response.headers["rate-limit-remaining"];

  if (rateLimitRemaining) {
    const remaining = parseInt(rateLimitRemaining, 10);

    if (remaining <= 20 && remaining >= 17) {
      alert(
        "🚨 Desculpe, devido ao alto custo de servidores e este projeto rodar em nível gratuito, sofremos algumas restrições, e o seu limite máximo de utilização está bem próximo..."
      );
      console.warn(
        `Warning: Only ${remaining} requests left before rate limit is reached.`
      );
    } else if (remaining <= 1) {
      alert(
        "🚨 Sinto muito, o seu limite de utilização chegou ao fim, tente novamente mais tarde. 😔"
      );
      window.location.reload();
    }
  }
  return response;
};
