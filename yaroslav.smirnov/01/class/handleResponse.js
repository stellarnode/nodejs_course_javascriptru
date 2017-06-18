let i = 0;

module.exports = (req, res) => {
  i++;
  res.end(i.toString()); // (!!! toString)
};
