let isRequestCompleted = false;
// Under testing phase....
const startRequestTimer = () =>
  setTimeout(() => {
    if (!isRequestCompleted) {
      console.log("Running TIMER !");
      alert(
        "Após um certo período de inatividade, o servidor pode demorar até 50 segundos para voltar rodar normalmente, por favor aguarde... "
      );
    }
  }, 5000); // 5-second delay before showing the alert

const cancelRequestTimer = () => {
  isRequestCompleted = true;
  clearTimeout(startRequestTimer());
};

export const timer = {
  startRequestTimer,
  cancelRequestTimer,
};
