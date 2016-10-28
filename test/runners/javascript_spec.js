var expect = require('chai').expect,
    runner = require('../runner');

describe( 'javascript runner', function(){
    describe( '.run', function(){
        runner.assertCodeExamples('javascript');

        it( 'should handle basic code evaluation', function(done){
            runner.run({language: 'javascript', code: 'console.log(42)'}, function(buffer) {
                expect(buffer.stdout).to.equal('42\n');
                done();
            });
        });
        it( 'should handle JSON.stringify ', function(done){
            runner.run({language: 'javascript', code: 'console.log(JSON.stringify({a: 1}))'}, function(buffer) {
                console.log(buffer.stderr);
                expect(buffer.stdout).to.contain('{"a":1}');
                done();
            });
        });

        it( 'should handle unicode characters', function(done) {
            runner.run({language: 'javascript', code: 'console.log("✓")'}, function(buffer) {
                expect(buffer.stdout).to.include("✓");
                done();
            });
        });

        it( 'should be able to access solution.txt', function(done) {
            runner.run({
                language: 'javascript',
                code: `
                    console.log(1+4);
                    console.log(require('fs').readFileSync('/home/codewarrior/solution.txt', 'utf8'));
                `
            }, function(buffer) {
                expect(buffer.stdout).to.contain("5");
                expect(buffer.stdout).to.contain("1+4");
                done();
            });
        });
        it( 'should allow a shell script to be ran', function(done) {
            runner.run({
                language: 'javascript',
                shell: 'echo "test 123" >> /home/codewarrior/test.txt ; ls',
                code: `
                    console.log(require('fs').readFileSync('/home/codewarrior/test.txt', 'utf8'));
                `
            }, function(buffer) {
                expect(buffer.stdout).to.contain("test 123");
                expect(buffer.shellResult.stdout.length).to.be.gt(0);
                done();
            });
        });

        it( 'should be able to handle large output data', function(done) {
            runner.run({
                language: 'javascript',
                code: `
                    for(i = 0;i < 9999; i++){
                        console.log(i * 10);
                    }
                `
            }, function(buffer) {
                expect(buffer.stderr).to.equal('');
                done();
            });
        });

        it( 'should handle es6 code evaluation', function(done){
            runner.run({language: 'javascript', code: 'let a = 42; console.log(42);'}, function(buffer) {
                expect(buffer.stdout).to.equal('42\n');
                done();
            });
        });

        it( 'should handle bad babel syntax', function(done){
            runner.run({language: 'javascript', languageVersion: '6.x/babel', code: 'var a = function(){returns 42;};\na();'}, function(buffer) {
                //expect(buffer.stderr).to.contain('kata: Unexpected token:27');
                expect(buffer.stderr).to.contain('kata: Unexpected token, expected ;:27\nvar a = function(){returns 42;};\n                         ^');
                done();
            });
        });

        it( 'should handle react syntax', function(done){
            runner.run({
                language: 'javascript',
                languageVersion: '6.0.0/babel',
                code: `
                    var React = require("react");
                    var ReactDOM = require("react-dom/server");
                    let render = (el) => ReactDOM.renderToStaticMarkup(el);
                    var div = <div><h3>Test</h3></div>;
                    console.log(render(div));
                `
            },
            function(buffer) {
                expect(buffer.stdout).to.contain('<div><h3>Test</h3></div>');
                done();
            });
        });

        it( 'should handle react syntax using 0.10.x', function(done){
            runner.run({
                language: 'javascript',
                languageVersion: '0.10.x/babel',
                code: `
                    var React = require("react");
                    var ReactDOM = require("react-dom/server");
                    let render = (el) => ReactDOM.renderToStaticMarkup(el);
                    var div = <div><h3>Test</h3></div>;
                    console.log(render(div));
                `
            },
            function(buffer) {
                expect(buffer.stdout).to.contain('<div><h3>Test</h3></div>');
                done();
            });
        });

        it( 'should load libraries', function(done){
            runner.run({language: 'javascript', code: 'var _ = require("lodash");console.log(_.map([1], n => n * 2));'}, function(buffer) {
                expect(buffer.stdout).to.contain('[ 2 ]');
                done();
            });
        });
        it( 'should work with SQLite', function(done){
            runner.run({
                language: 'javascript',
                code: `
var sqlite3 = require('sqlite3');
var db = new sqlite3.Database(':memory:');
db.serialize(function() {
  db.run("CREATE TABLE lorem (info TEXT)");
  var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
  for (var i = 0; i < 10; i++) {
      stmt.run("Ipsum " + i);
  }
  stmt.finalize();
  db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
      console.log(row.id + ": " + row.info);
  });
});

db.close();
`
            }, function(buffer) {
                expect(buffer.stdout).to.contain('Ipsum 0');
                expect(buffer.stdout).to.contain('Ipsum 9');
                done();
            });
        });
        it( 'should handle stderr', function(done){
            runner.run({language: 'javascript', code: 'console.error("404 Not Found")'}, function(buffer) {
                expect(buffer.stderr).to.equal('404 Not Found\n');
                done();
            });
        });
        it( 'should handle stdout and stderr', function(done){
            runner.run({language: 'javascript', code: 'console.log("stdout"); console.error("stderr")'}, function(buffer) {
                expect(buffer.stdout).to.equal('stdout\n');
                expect(buffer.stderr).to.equal('stderr\n');
                done();
            });
        });

        describe('mocha bdd', function() {
            it( 'should handle outputting objects', function(done){
                runner.run({
                    language: 'javascript',
                    code: 'var a = {b: 2};console.log(this);',
                    fixture: 'var assert = require("chai").assert;describe("test", function(){it("should be 2", function(){assert.equal(2, a.b);})});',
                    testFramework: 'mocha_bdd'},
                    function(buffer) {
                        expect(buffer.stdout).to.contain('<PASSED::>');
                        done();
                    });
            });
            it( 'should handle no trailing semicolons', function(done){
                runner.run({
                    language: 'javascript',
                    code: 'var a = 2',
                    fixture: 'var assert = require("chai").assert;describe("test", function(){it("should be 2", function(){assert.equal(2, a);})});',
                    testFramework: 'mocha_bdd'},
                    function(buffer) {
                        expect(buffer.stdout).to.contain('<PASSED::>');
                        done();
                    });
            });
            it( 'should handle failures', function(done){
                runner.run({
                    language: 'javascript',
                    code: 'var a = {b: 2};',
                    fixture: 'var assert = require("chai").assert;describe("test", function(){describe("failures", function(){it("should be 1", function(){assert.equal(1, a.b);})})});',
                    testFramework: 'mocha_bdd'},
                    function(buffer) {
                        expect(buffer.stdout).to.contain('<FAILED::>');
                        done();
                    });
            });
            it( 'should handle errors', function(done){
                runner.run({
                    language: 'javascript',
                    code: 'var a = {b: 2};',
                    fixture: 'describe("test", function(){describe("failures", function(){it("should be 1", function(){throw new Error("test error");})})});',
                    testFramework: 'mocha_bdd'},
                    function(buffer) {
                        expect(buffer.stdout).to.contain('<ERROR::>');
                        done();
                    });
            });
        });

        describe('mocha tdd', function() {
            it( 'should handle outputting objects', function(done){
                runner.run({
                        language: 'javascript',
                        code: 'var a = {b: 2};console.log(this);',
                        fixture: 'var assert = require("chai").assert;suite("test", function(){test("should be 2", function(){assert.equal(2, a.b);})});',
                        testFramework: 'mocha_tdd'},
                    function(buffer) {
                        expect(buffer.stdout).to.contain('<PASSED::>');
                        done();
                    });
            });
            it( 'should handle failures', function(done){
                runner.run({
                        language: 'javascript',
                        code: 'var a = {b: 2};',
                        fixture: 'var assert = require("assert"); suite("test", function(){suite("failures", function(){test("should be 1", function(){assert.equal(1, a.b);})})});',
                        testFramework: 'mocha_tdd'},
                    function(buffer) {
                        expect(buffer.stdout).to.contain('<FAILED::>');
                        done();
                    });
            });
            it( 'should handle chai failures', function(done){
                runner.run({
                        language: 'javascript',
                        code: 'var a = {b: 2};',
                        fixture: 'var assert = require("chai").assert; suite("test", function(){suite("failures", function(){test("should be 1", function(){assert.equal(1, a.b);})})});',
                        testFramework: 'mocha_tdd'},
                    function(buffer) {
                        expect(buffer.stdout).to.contain('<FAILED::>');
                        done();
                    });
            });
            it( 'should handle errors', function(done){
                runner.run({
                        language: 'javascript',
                        code: 'var a = {b: 2};',
                        fixture: 'suite("test", function(){suite("failures", function(){test("should be 1", function(){throw new Error("test error");})})});',
                        testFramework: 'mocha_tdd'},
                    function(buffer) {
                        expect(buffer.stdout).to.contain('<ERROR::>');
                        done();
                    });
            });
        });

        describe('cw-2', function() {
            it( 'should handle outputting objects', function(done){
                runner.run({
                    language: 'javascript',
                    code: 'var a = {b: 2};',
                    fixture: 'Test.expect(false, a);',
                    testFramework: 'cw-2'
                }, function(buffer) {
                    expect(buffer.stdout).to.contain('{ b: 2 }');
                    expect(buffer.stdout).to.contain('<FAILED::>');
                    done();
                });
            });
            it( 'should handle outputting objects with 0.10.33', function(done){
                // only 0.10.33 allows us to declare a without var
                runner.run({
                    language: 'javascript',
                    languageVersion: '0.10.33',
                    code: 'a = {b: 2};',
                    fixture: 'Test.expect(false, a);',
                    testFramework: 'cw-2'
                }, function(buffer) {
                    expect(buffer.stdout).to.contain('{ b: 2 }');
                    expect(buffer.stdout).to.contain('<FAILED::>');
                    done();
                });
            });

            it('should handle a basic assertion', function(done){
                runner.run({language: 'javascript', code: 'var a = 1', fixture: 'Test.expect(a == 1);', testFramework: 'cw-2'}, function(buffer) {
                    expect(buffer.stdout).to.equal('<PASSED::>Test Passed\n');
                    done();
                });
            });

            it('should handle comments as fixture', function(done){
                runner.run({language: 'javascript', code: 'console.log(42)', fixture: '//', testFramework: 'cw-2'}, function(buffer) {
                    expect(buffer.stdout).to.equal('42\n');
                    done();
                });
            });

            it('should handle a basic failed test', function(done){
                runner.run({language: 'javascript', code: 'var a = 1', fixture: 'Test.expect(a == 2)', testFramework: 'cw-2'}, function(buffer) {
                    expect(buffer.stdout).to.equal('<FAILED::>Value is not what was expected\n');
                    done();
                });
            });

            it('should handle logging objects', function(done){
                runner.run({language: 'javascript', code:'console.log({a: 1});', testFramework: 'cw-2'}, function(buffer) {
                    expect(buffer.stdout).to.equal('{ a: 1 }\n');
                    done();
                });
            });

            describe("async handling", function() {
                it( 'should throw a timeout if code runs too long', function(done) {
                    runner.run({
                        language: 'javascript',
                        code: 'function solution() {}',
                        fixture: `
                            describe("test", 2, function(){
                                it("should do something", function(done){
                                });
                            });
                        `,
                        testFramework: 'cw-2'
                    },
                    function(buffer) {
                        expect(buffer.stdout).to.include("<ERROR::>`it` function timed out. Function ran longer than 2ms\n<COMPLETEDIN::>")
                        done();
                    });
                });

                it( 'should render in proper order', function(done) {
                    runner.run({
                        language: 'javascript',
                        code: 'function solution(cb) {setTimeout(() => cb("ok"), 0)}',
                        fixture: `
                            describe("test", true, function(){
                                it("should do something", function(done){
                                    solution((msg) => {
                                        Test.assertEquals(msg, "ok");
                                        done();
                                    });
                                    console.log("ran solution");
                                });
                            });
                        `,
                        testFramework: 'cw-2'
                    },
                    function(buffer) {
                        expect(buffer.stdout).to.include("<IT::>should do something\nran solution\n<PASSED::>Test Passed: Value == ok\n<COMPLETEDIN::>")
                        done();
                    });
                });
            });

            describe('error handling', function() {
                it( 'should handle a mix of failures and successes', function(done) {
                    runner.run({language: 'javascript',
                                code:'var a = 1',
                                fixture: 'describe("test", function(){\n' +
                                'it("test1", function(){ Test.expect(false) });' +
                                'it("test2", function(){ Test.expect(true)});})',
                                testFramework: 'cw-2'}, function(buffer) {
                                    expect(buffer.stdout).to.contain('<FAILED::>Value is not what was expected');
                                    expect(buffer.stdout).to.contain('<PASSED::>Test Passed');
                                    done();
                                });
                });
                it('should gracefully handle custom errors', function(done) {
                    runner.run({language: 'javascript',
                                code:'var a = 1',
                                fixture: 'describe("test", function(){\n' +
                                'it("test1", function(){ throw "boom!" });' +
                                'it("test2", function(){ Test.expect(true)});})',
                                testFramework: 'cw-2'}, function(buffer) {
                                    expect(buffer.stdout).to.contain('<ERROR::>');
                                    expect(buffer.stdout).to.contain('boom!');
                                    expect(buffer.stdout).to.contain('<PASSED::>Test Passed');
                                    done();
                                });
                });
                it('should gracefully handle reference errors', function(done) {
                    runner.run({language: 'javascript',
                                code:'var a = 1',
                                fixture: 'describe("test", function(){\n' +
                                'it("test1", function(){ b.test() });' +
                                'it("test2", function(){ Test.expect(true)});})',
                                testFramework: 'cw-2'}, function(buffer) {
                                    expect(buffer.stdout).to.contain('<ERROR::>');
                                    expect(buffer.stdout).to.contain('<:LF:>');
                                    expect(buffer.stdout).to.contain('ReferenceError:');
                                    expect(buffer.stdout).to.not.contain('[eval]');
                                    expect(buffer.stdout).to.contain('<PASSED::>Test Passed');
                                    done();
                                });
                });
                it('should gracefully top level handle reference errors', function(done) {
                    runner.run({language: 'javascript',
                                code:'b.test()',
                                fixture: 'describe("test", function(){\n' +
                                'it("test2", function(){ Test.expect(true)});})',
                                testFramework: 'cw-2'}, function(buffer) {
                                    expect(buffer.stdout).to.contain('<ERROR::>');
                                    expect(buffer.stdout).to.contain('<:LF:>');
                                    expect(buffer.stdout).to.contain('ReferenceError:');
                                    expect(buffer.stdout).to.not.contain('[eval]');
                                    expect(buffer.stdout).to.not.contain('Object.Test.handleError');
                                    done();
                                });
                });
            });
        });
    });
});
