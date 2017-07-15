// Что выведет?

const promise = new Promise((resolve, reject) => {
  // try {
  throw new Error("WOPS");
  // reject(new Error("WOPS"));
  // } catch(err) { reject(err); }
});


promise.then( function(result) {
  console.log("Result", result);
}, function(err) {
  console.log("Caught", err);
});
