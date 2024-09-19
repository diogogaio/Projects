//Accepts only async functions!
const asyncErroHandler = (func: any) => {
  return (req, res, next) => {
    func(req, res, next).catch((err) => next(err));
  };
};
export default asyncErroHandler;
