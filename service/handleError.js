const handleError = (res, err) => {
  let message = '';
  if (err) {
    message = err.message;
  } else {
    message = '欄位未填寫正確或無此 id';
  }
  res.status(400).send({
    status: 'false',
    message,
  });
  res.end();
};
module.exports = handleError;
