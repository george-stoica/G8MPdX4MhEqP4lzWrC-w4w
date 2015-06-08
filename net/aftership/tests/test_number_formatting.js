var nf = require ( 'accounting' );

//console.log ('7.1234', nf.format (7.1234, 2, ' ') );

console.log ('Format with 2 decinals');
console.log ('7.1234 -> ', nf.format (7.1234, 2) );
console.log ('7.1249 -> ', nf.format (7.1249, 2) );
console.log ('7.1250 -> ', nf.format (7.1250, 2) );
console.log ('7.1251 -> ', nf.format (7.1251, 2) );
console.log ('7.1278 -> ', nf.format (7.1278, 2) );