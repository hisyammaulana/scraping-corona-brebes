'use strict';

exports.ok = (values, res) => {
  const data = {
      'message': 'success',
      'status': true,
      'data': values
  };
  res.json(data);
  res.end();
};

exports.failed = (message, errors, res) => {
  const data = {
      'message': message,
      'status': false,
      'errors': errors
  };
  res.json(data);
  res.end();
}
