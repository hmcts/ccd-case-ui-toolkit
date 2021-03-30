import { ConditionParser } from "./condition-parser.service";

describe('ConditionParser', () => {

    describe('parse', () => {
        describe('should parse simple, single fomulas', () => {
            const testCases = [
                {
                    input: 'a = "B"',
                    expected: [
                        { "fieldReference": "a", "comparator": "=", "value": "B" }
                    ]
                },
                {
                    input: 'a="B"',
                    expected: [
                        { "fieldReference": "a", "comparator": "=", "value": "B" }
                    ]
                },
                {
                    input: 'a!="B"',
                    expected: [
                        { "fieldReference": "a", "comparator": "!=", "value": "B" }
                    ]
                },
                {
                    input: 'a CONTAINS"B"',
                    expected: [
                        { "fieldReference": "a", "comparator": "CONTAINS", "value": "B" }
                    ]
                },
                {
                    input: 'a= "B"',
                    expected: [
                        { "fieldReference": "a", "comparator": "=", "value": "B" }
                    ]
                },
                {
                    input: 'a != "B"',
                    expected: [
                        { "fieldReference": "a", "comparator": "!=", "value": "B" }
                    ]
                },
                {
                    input: 'a CONTAINS "B"',
                    expected: [
                        { "fieldReference": "a", "comparator": "CONTAINS", "value": "B" }
                    ]
                },
                {
                    input: 'a="NoSpacesTest"',
                    expected: [
                        { "fieldReference": "a", "comparator": "=", "value": "NoSpacesTest" }
                    ]
                },
                {
                    input: 'a="TooManySpaces"    ',
                    expected: [
                        { "fieldReference": "a", "comparator": "=", "value": "TooManySpaces" }
                    ]
                },
                {
                    input: '   a="ThisTextNeedsTrimming"    ',
                    expected: [
                        { "fieldReference": "a", "comparator": "=", "value": "ThisTextNeedsTrimming" }
                    ]
                },
            ];

            testCases.forEach(test => {
                it(`should convert "${test.input}" to the correct output`, () => {
                    const result = ConditionParser.parse(test.input);

                    expect(result).toBeDefined();
                    expect(result).toEqual(test.expected);
                });
            });
        });

        describe('should NOT parse invalid simple fomulas', () => {
            const testCases = [
                { input: 'a === "B"' },
                { input: '"a " = a' },
                { input: 'a = b' },
                { input: 'a "B"' },
                { input: '= "B"' },
                { input: 'a !== "B"' },
                { input: 'a != "B' },
                { input: 'a CONTAIN "B"' },
                { input: 'a != CONTAIN "B"' },
                { input: 'a ! = "B"' },
                { input: 'a = ! "B"' },
                { input: 'a =! "B"' },
                { input: 'aCONTAINS"B"' }
            ];

            testCases.forEach(test => {
                it(`should NOT parse and throw error for invalid input: "${test.input}"`, () => {
                    expect(() => {
                        ConditionParser.parse(test.input);
                    }).toThrowError();
                });
            });
        });

        describe('parse complex value comparisons', () => {
            const testCases = [
                {
                    input: 'a = "Variable with spaces"',
                    expected: [
                        { "fieldReference": "a", "comparator": "=", "value": "Variable with spaces" }
                    ]
                },
                {
                    input: 'a="No spaces formula"',
                    expected: [
                        { "fieldReference": "a", "comparator": "=", "value": "No spaces formula" }
                    ]
                },
                {
                    input: 'a = "Variable*"',
                    expected: [
                        { "fieldReference": "a", "comparator": "=", "value": "Variable*" }
                    ]
                },
                {
                    input: 'a = "Variable123"',
                    expected: [
                        { "fieldReference": "a", "comparator": "=", "value": "Variable123" }
                    ]
                },
                {
                    input: 'a = "Variable.Hello"',
                    expected: [
                        { "fieldReference": "a", "comparator": "=", "value": "Variable.Hello" }
                    ]
                },
            ];

            testCases.forEach(test => {
                it(`should convert "${test.input}" to the correct output`, () => {
                    const result = ConditionParser.parse(test.input);

                    expect(result).toBeDefined();
                    expect(result).toEqual(test.expected);
                });
            });
        });

        describe('parse complex fieldReference comparisons', () => {
            const testCases = [
                {
                    input: 'a_p = "Hello World"',
                    expected: [
                        { "fieldReference": "a_p", "comparator": "=", "value": "Hello World" }
                    ]
                },
                {
                    input: 'a_p="No spaces test"',
                    expected: [
                        { "fieldReference": "a_p", "comparator": "=", "value": "No spaces test" }
                    ]
                },
                {
                    input: 'HELLO_WORLD = "Hello World"',
                    expected: [
                        { "fieldReference": "HELLO_WORLD", "comparator": "=", "value": "Hello World" }
                    ]
                },
                {
                    input: 'Hello_World1 = "Hello World"',
                    expected: [
                        { "fieldReference": "Hello_World1", "comparator": "=", "value": "Hello World" }
                    ]
                },
                {
                    input: 'H1 = "Hello World"',
                    expected: [
                        { "fieldReference": "H1", "comparator": "=", "value": "Hello World" }
                    ]
                },
            ];

            testCases.forEach(test => {
                it(`should convert "${test.input}" to the correct output`, () => {
                    const result = ConditionParser.parse(test.input);

                    expect(result).toBeDefined();
                    expect(result).toEqual(test.expected);
                });
            });
        });

        describe('parse simple, compound formulas', () => {
            const testCases = [
                {
                    input: 'a = "b" AND x = "y"',
                    expected: [
                        { "fieldReference": "a", "comparator": "=", "value": "b" },
                        "AND",
                        { "fieldReference": "x", "comparator": "=", "value": "y" }
                    ]
                },
                {
                    input: 'a = "b"ANDx = "y"',
                    expected: [
                        { "fieldReference": "a", "comparator": "=", "value": "b" },
                        "AND",
                        { "fieldReference": "x", "comparator": "=", "value": "y" }
                    ]
                },
                {
                    input: 'a="b"ANDx="No spaces test"',
                    expected: [
                        { "fieldReference": "a", "comparator": "=", "value": "b" },
                        "AND",
                        { "fieldReference": "x", "comparator": "=", "value": "No spaces test" }
                    ]
                },
                {
                    input: 'a = "b" OR x = "y"',
                    expected: [
                        { "fieldReference": "a", "comparator": "=", "value": "b" },
                        "OR",
                        { "fieldReference": "x", "comparator": "=", "value": "y" }
                    ]
                },
                {
                    input: 'a = "b" OR a = "y" AND x = "z"',
                    expected: [
                        { "fieldReference": "a", "comparator": "=", "value": "b" },
                        "OR",
                        { "fieldReference": "a", "comparator": "=", "value": "y" },
                        "AND",
                        { "fieldReference": "x", "comparator": "=", "value": "z" },
                    ]
                },
                {
                    input: 'a = "b" OR a = "y" AND x = "z" AND a = "b" OR a = "y"',
                    expected: [
                        { "fieldReference": "a", "comparator": "=", "value": "b" },
                        "OR",
                        { "fieldReference": "a", "comparator": "=", "value": "y" },
                        "AND",
                        { "fieldReference": "x", "comparator": "=", "value": "z" },
                        "AND",
                        { "fieldReference": "a", "comparator": "=", "value": "b" },
                        "OR",
                        { "fieldReference": "a", "comparator": "=", "value": "y" }
                    ]
                },
            ];

            testCases.forEach(test => {
                it(`should convert "${test.input}" to the correct output`, () => {
                    const result = ConditionParser.parse(test.input);

                    expect(result).toBeDefined();
                    expect(result).toEqual(test.expected);
                });
            });
        });

        describe('should NOT parse invalid compound fomulas', () => {
            const testCases = [
                { input: 'a = "b" ANDS x = "y"' },
                { input: 'a = "b" ORS x = "y"' },
                { input: 'a = "b" = x = "y"' },
                { input: 'a = "b" CONTAINS x = "y"' },
                { input: 'a = "b" !== x = "y"' },
                { input: 'a = "bAND x = "y"' },
                { input: 'a = "b ORS x = "y"' },
                { input: 'a =b" = x = "y"' },
                { input: 'a = "bCONTAINSx = "y"' },
                { input: 'a = "b" AND x = "y' },
            ];

            testCases.forEach(test => {
                it(`should NOT parse and throw error for invalid input: "${test.input}"`, () => {
                    expect(() => {
                        ConditionParser.parse(test.input);
                    }).toThrowError();
                });
            });
        });

        describe('parse simple, enclosed compound formulas', () => {
            const testCases = [
                {
                    input: '(a = "b" AND x = "y") OR x = "x"',
                    expected: [
                        [{ "fieldReference": "a", "comparator": "=", "value": "b" },
                            "AND",
                        { "fieldReference": "x", "comparator": "=", "value": "y" }],
                        "OR",
                        { "fieldReference": "x", "comparator": "=", "value": "x" }
                    ]
                },
                {
                    input: '(a="b"ANDx="y")ORx="TEST WITH NO SPACES"',
                    expected: [
                        [{ "fieldReference": "a", "comparator": "=", "value": "b" },
                            "AND",
                        { "fieldReference": "x", "comparator": "=", "value": "y" }],
                        "OR",
                        { "fieldReference": "x", "comparator": "=", "value": "TEST WITH NO SPACES" }
                    ]
                },
                {
                    input: '(a = "b" OR x = "y") OR x = "x"',
                    expected: [
                        [{ "fieldReference": "a", "comparator": "=", "value": "b" },
                            "OR",
                        { "fieldReference": "x", "comparator": "=", "value": "y" }],
                        "OR",
                        { "fieldReference": "x", "comparator": "=", "value": "x" }
                    ]
                },
                {
                    input: 'a = "b" OR (x = "y" OR x = "x")',
                    expected: [
                        { "fieldReference": "a", "comparator": "=", "value": "b" },
                        "OR",
                        [
                            { "fieldReference": "x", "comparator": "=", "value": "y" },
                            "OR",
                            { "fieldReference": "x", "comparator": "=", "value": "x" }
                        ]
                    ]
                },
                {
                    input: '(x = "x" AND a = "b") OR (x = "y" OR x = "x")',
                    expected: [
                        [
                            { "fieldReference": "x", "comparator": "=", "value": "x" },
                            "AND",
                            { "fieldReference": "a", "comparator": "=", "value": "b" }
                        ],
                        "OR",
                        [
                            { "fieldReference": "x", "comparator": "=", "value": "y" },
                            "OR",
                            { "fieldReference": "x", "comparator": "=", "value": "x" }
                        ]
                    ]
                }
            ];

            testCases.forEach(test => {
                it(`should convert "${test.input}" to the correct output`, () => {
                    const result = ConditionParser.parse(test.input);

                    expect(result).toBeDefined();
                    expect(result).toEqual(test.expected);
                });
            });
        });

        describe('should NOT parse invalid enclosed compound fomulas', () => {
            const testCases = [
                { input: '(x = "x" AND a = "b") OR (x = "y" OR x = ("x" AND z = "WE DONT SUPPORT NESTED ENCLOSURES"))' },
                { input: '(x = "x" AND a = "b" OR (x = "NOT CLOSED BRACKET")' },
                { input: '(x = "x" AND a = "b"() OR x = "RANDOM BRACKETS")' },
                { input: '(x = "x" AND a = "b")(OR x = "OPENING BRACKET IN WRONG PLACE")' },
                { input: 'x = "x" AND a = "b" OR x = "TRAILING BRACKET")' },
                { input: '(x = "x" AND a = "b") ORS (x = "y" OR x = ("x" AND z = "INVALID JOIN CHARACTER"))' },
                { input: '(x = "x" AND a = "b" (x = "NO JOIN")' },
                { input: '(x = "x" AND a = "b OR x = "UNCLOSED QUOTED VALUE")' },
            ];

            testCases.forEach(test => {
                it(`should NOT parse and throw error for invalid input: "${test.input}"`, () => {
                    expect(() => {
                        ConditionParser.parse(test.input);
                    }).toThrowError();
                });
            });
        });
    });

    describe('evaluate', () => {
        describe('should evaluate simple, single fomulas', () => {
            const conditions = [
                { "fieldReference": "TextField", "comparator": "=", "value": "hello" }
            ];

            const testCases = [
                {
                    input: { "TextField": "hello" },
                    expected: true
                },
                {
                    input: { "TextField": "hellos" },
                    expected: false
                },
                {
                    input: { "TextField": "hell" },
                    expected: false
                },
            ];

            testCases.forEach(test => {
                it(`should evaluate = conditions correctly`, () => {
                    const result = ConditionParser.evaluate(test.input, conditions);
                    expect(result).toEqual(test.expected);
                });
            });
        });

        describe('should evaluate simple, compound fomulas with equals', () => {
            const conditions = [
                { "fieldReference": "TextField0", "comparator": "=", "value": "hello" },
                "AND",
                { "fieldReference": "TextField1", "comparator": "=", "value": "bye" },
            ];

            const testCases = [
                {
                    input: { "TextField0": "hello", "TextField1": "bye" },
                    expected: true
                },
                {
                    input: { "TextField0": "hello", "TextField1": "hello" },
                    expected: false
                },
                {
                    input: { "TextField0": "bye", "TextField1": "hello" },
                    expected: false
                },
                {
                    input: { "TextField0": "bye", "TextField1": "bye" },
                    expected: false
                },
            ];

            testCases.forEach(test => {
                it(`should evaluate two AND conditions correctly - ${JSON.stringify(test.input)}`, () => {
                    const result = ConditionParser.evaluate(test.input, conditions);
                    expect(result).toEqual(test.expected);
                });
            });
        });

        describe('should evaluate simple, compound fomulas with does not equal', () => {
            const conditions = [
                { "fieldReference": "TextField0", "comparator": "!=", "value": "hello" },
                "AND",
                { "fieldReference": "TextField1", "comparator": "!=", "value": "bye" },
            ];

            const testCases = [
                {
                    input: { "TextField0": "hello", "TextField1": "bye" },
                    expected: false
                },
                {
                    input: { "TextField0": "hello", "TextField1": "hello" },
                    expected: false
                },
                {
                    input: { "TextField0": "bye", "TextField1": "hello" },
                    expected: true
                },
                {
                    input: { "TextField0": "bye", "TextField1": "bye" },
                    expected: false
                },
            ];

            testCases.forEach(test => {
                it(`should evaluate two AND conditions correctly - ${JSON.stringify(test.input)}`, () => {
                    const result = ConditionParser.evaluate(test.input, conditions);
                    expect(result).toEqual(test.expected);
                });
            });
        });

        describe('should evaluate simple, compound fomulas with CONTAINS', () => {
            const conditions = [
                { "fieldReference": "TextField0", "comparator": "CONTAINS", "value": "hello" },
                "AND",
                { "fieldReference": "TextField1", "comparator": "CONTAINS", "value": "bye" },
            ];

            const testCases = [
                {
                    input: { "TextField0": ['hello', 'world'], "TextField1": ['bye'] },
                    expected: true
                },
                {
                    input: { "TextField0": ['hello'], "TextField1": ['hello'] },
                    expected: false
                },
                {
                    input: { "TextField0": ['bye', 'hello'], "TextField1": ['bye', 'hello'] },
                    expected: true
                },
                {
                    input: { "TextField0": ['bye'], "TextField1": ['bye'] },
                    expected: false
                },
            ];

            testCases.forEach(test => {
                it(`should evaluate two AND conditions correctly - ${JSON.stringify(test.input)}`, () => {
                    const result = ConditionParser.evaluate(test.input, conditions);
                    expect(result).toEqual(test.expected);
                });
            });
        });

        describe('should evaluate simple, compound fomulas with equals', () => {
            const conditions = [
                { "fieldReference": "TextField0", "comparator": "=", "value": "hello" },
                "OR",
                { "fieldReference": "TextField1", "comparator": "=", "value": "bye" },
            ];

            const testCases = [
                {
                    input: { "TextField0": "hello", "TextField1": "bye" },
                    expected: true
                },
                {
                    input: { "TextField0": "hello", "TextField1": "hello" },
                    expected: true
                },
                {
                    input: { "TextField0": "bye", "TextField1": "hello" },
                    expected: false
                },
                {
                    input: { "TextField0": "bye", "TextField1": "bye" },
                    expected: true
                },
            ];

            testCases.forEach(test => {
                it(`should evaluate two OR conditions correctly - ${JSON.stringify(test.input)}`, () => {
                    const result = ConditionParser.evaluate(test.input, conditions);
                    expect(result).toEqual(test.expected);
                });
            });
        });

        describe('should evaluate simple, compound enclosed fomulas - left', () => {
            const conditions = [
                [
                    { "fieldReference": "TextField0", "comparator": "CONTAINS", "value": "hello" },
                    "AND",
                    { "fieldReference": "TextField0", "comparator": "CONTAINS", "value": "bye" }
                ],
                "OR",
                { "fieldReference": "TextField1", "comparator": "=", "value": "nope" },
            ];

            const testCases = [
                {
                    input: { "TextField0": ['hello', 'bye'], "TextField1": ['nope'] },
                    expected: true
                },
                {
                    input: { "TextField0": ['hello', 'bye'], "TextField1": ['nope'] },
                    expected: true
                },
                {
                    input: { "TextField0": ['bye'], "TextField1": ['nope'] },
                    expected: true
                },
                {
                    input: { "TextField0": ['bye'], "TextField1": ['bye'] },
                    expected: false
                },
            ];

            testCases.forEach(test => {
                it(`should evaluate two OR conditions correctly - ${JSON.stringify(test.input)}`, () => {
                    const result = ConditionParser.evaluate(test.input, conditions);
                    expect(result).toEqual(test.expected);
                });
            });
        });

        describe('should evaluate simple, compound enclosed fomulas - with OR inner join', () => {
            const conditions = [
                [
                    { "fieldReference": "TextField0", "comparator": "CONTAINS", "value": "hello" },
                    "OR",
                    { "fieldReference": "TextField1", "comparator": "=", "value": "show" }
                ],
                "AND",
                { "fieldReference": "TextField2", "comparator": "=", "value": "must" },
            ];

            const testCases = [
                {
                    input: { "TextField0": [''], "TextField1": ['show'], "TextField2": ['must'] },
                    expected: true
                },
                {
                    input: { "TextField0": ['hello'], "TextField1": [''], "TextField2": ['must'] },
                    expected: true
                },
                {
                    input: { "TextField0": ['hellow'], "TextField1": ['show'], "TextField2": [''] },
                    expected: false
                },
                {
                    input: { "TextField0": ['he'], "TextField1": ['sho'], "TextField2": ['must'] },
                    expected: false
                },
            ];

            testCases.forEach(test => {
                it(`should evaluate two OR conditions correctly - ${JSON.stringify(test.input)}`, () => {
                    const result = ConditionParser.evaluate(test.input, conditions);
                    expect(result).toEqual(test.expected);
                });
            });
        });

        describe('should evaluate simple, compound enclosed fomulas - right', () => {
            const conditions = [
                { "fieldReference": "TextField1", "comparator": "=", "value": "nope" },
                "OR",
                [
                    { "fieldReference": "TextField0", "comparator": "CONTAINS", "value": "hello" },
                    "AND",
                    { "fieldReference": "TextField0", "comparator": "CONTAINS", "value": "bye" }
                ],
            ];

            const testCases = [
                {
                    input: { "TextField0": ['hello', 'bye'], "TextField1": ['nope'] },
                    expected: true
                },
                {
                    input: { "TextField0": ['hello', 'bye'], "TextField1": ['hello'] },
                    expected: true
                },
                {
                    input: { "TextField0": ['bye'], "TextField1": ['nope'] },
                    expected: true
                },
                {
                    input: { "TextField0": ['bye'], "TextField1": ['bye'] },
                    expected: false
                },
            ];

            testCases.forEach(test => {
                it(`should evaluate two OR conditions correctly - ${JSON.stringify(test.input)}`, () => {
                    const result = ConditionParser.evaluate(test.input, conditions);
                    expect(result).toEqual(test.expected);
                });
            });
        });

        describe('should evaluate simple, compound enclosed fomulas - both', () => {
            const conditions = [
                [
                    { "fieldReference": "TextField0", "comparator": "CONTAINS", "value": "hello" },
                    "AND",
                    { "fieldReference": "TextField0", "comparator": "CONTAINS", "value": "bye" }
                ],
                "OR",
                [
                    { "fieldReference": "TextField1", "comparator": "CONTAINS", "value": "night" },
                    "AND",
                    { "fieldReference": "TextField1", "comparator": "CONTAINS", "value": "day" }
                ],
            ];

            const testCases = [
                {
                    input: { "TextField0": ['hello', 'bye'], "TextField1": ['night', 'day'] },
                    expected: true
                },
                {
                    input: { "TextField0": ['hello', 'bye'], "TextField1": ['night'] },
                    expected: true
                },
                {
                    input: { "TextField0": ['hello'], "TextField1": ['night', 'day'] },
                    expected: true
                },
                {
                    input: { "TextField0": ['hello'], "TextField1": ['night'] },
                    expected: false
                },
            ];

            testCases.forEach(test => {
                it(`should evaluate two compound conditions with OR correctly - ${JSON.stringify(test.input)}`, () => {
                    const result = ConditionParser.evaluate(test.input, conditions);
                    expect(result).toEqual(test.expected);
                });
            });
        });

        describe('should evaluate simple, compound enclosed fomulas - both', () => {
            const conditions = [
                [
                    { "fieldReference": "TextField0", "comparator": "CONTAINS", "value": "hello" },
                    "AND",
                    { "fieldReference": "TextField0", "comparator": "CONTAINS", "value": "bye" }
                ],
                "AND",
                [
                    { "fieldReference": "TextField1", "comparator": "CONTAINS", "value": "night" },
                    "AND",
                    { "fieldReference": "TextField1", "comparator": "CONTAINS", "value": "day" }
                ],
            ];

            const testCases = [
                {
                    input: { "TextField0": ['hello', 'bye'], "TextField1": ['night', 'day'] },
                    expected: true
                },
                {
                    input: { "TextField0": ['hello', 'bye'], "TextField1": ['night'] },
                    expected: false
                },
                {
                    input: { "TextField0": ['hello'], "TextField1": ['night day']},
                    expected: false
                },
                {
                    input: { "TextField0": ['hello'], "TextField1": ['night'] },
                    expected: false
                },
            ];

            testCases.forEach(test => {
                it(`should evaluate two compound conditions with AND correctly - ${JSON.stringify(test.input)}`, () => {
                    const result = ConditionParser.evaluate(test.input, conditions);
                    expect(result).toEqual(test.expected);
                });
            });
        });
    });
});