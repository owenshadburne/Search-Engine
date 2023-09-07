const htmlScore = require('../htmlScore.js');
let scoreHTML = htmlScore.scoreHTML.bind(htmlScore);

let str = `
<!DOCTYPE html>
<html>
    <head>
        <title> This is a title </title>
    </head>
    <body>
        <h1> This is a header </h1>
        <p> This is a paragraph </p>
        <h3> This is not a paragraph </h3>
    </body>
</html>
`;

runTest("Basic Test 1", scoreHTML, str, "This", 19);
runTest("Basic Test 2", scoreHTML, str, "title", 10);
runTest("Basic Test 3", scoreHTML, str, "paragraph", 4);

function runTest(title, method, input1, input2, expected) {
    test(title, () => { expect(method(input1, input2)).toBe(expected) });
}