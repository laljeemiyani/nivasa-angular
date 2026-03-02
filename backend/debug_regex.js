const regex = /^[A-F]-([1-9]|1[0-4])(0[1-4])-P[1-2]$/;
const testStr = 'B-202-P1';
console.log(`Testing '${testStr}' against ${regex}`);
console.log('Match:', regex.test(testStr));

const regexOld = /^[A-F]-([1-9]|1[0-9])[1-9]-P[1-2]$/;
console.log(`Testing '${testStr}' against OLD ${regexOld}`);
console.log('Match OLD:', regexOld.test(testStr));
