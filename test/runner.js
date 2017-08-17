const request = require('../lib/hatest')
const https = require('https')
const fs = require('fs')
const path = require('path')
const express = require('express')
const assert = require('assert')

describe('request(url)', function() {
    it('should be supported', function(done) {
        const app = express()

        app.get('/', function(req, res) {
            res.send('hello')
        })

        request(app)
            .get('/')
            .expect('hello', done)
    })

    it('expect status', function() {
        const app = express()

        app.get('/', function(req, res) {
            res.send('hello')
        })

        return request(app)
            .get('/')
            .expect(200)
            .end()
    })

    it('should default redirects to 0', function() {
        const app = express()

        app.get('/', function(req, res) {
            res.redirect('/login')
        })

        return request(app)
            .get({
                url: '/',
                maxRedirects: 0
            })
            .expect(302)
            .end()
    })

    it('should handle redirects', function() {
        const app = express()

        app.get('/login', function(req, res) {
            res.end('Login')
        })

        app.get('/', function(req, res) {
            res.redirect('/login')
        })

        return request(app)
            .get('/')
            .expect(200)
            .expect('Login')
            .end()
    })

    it('expect header', function() {
        const app = express()

        app.get('/', function(req, res) {
            res.send('hello')
        })

        return request(app)
            .get('/')
            .expect(200)
            .end()
    })

    it('expect type', function() {
        const app = express()

        app.get('/', function(req, res) {
            res.send({
                str: 'asdasd',
                num: 1,
                obj: {},
                arr: []
            })
        })

        return request(app)
            .get('/')
            .expect(200)
            .end({
                str: String,
                num: Number,
                obj: Object,
                arr: Array
            })
    })

    it('should handle socket errors', function() {
        const app = express()

        app.get('/', function(req, res) {
            res.destroy()
        })

        return request(app)
            .get('/')
            .end()
            .catch(err => {
                // console.log(err)
            })
    })

    it('should handle error returned when server goes down', function(done) {
        const app = express()
        let server

        app.get('/', function(req, res) {
            res.end()
        })

        server = app.listen(function() {
            const url = 'http://localhost:' + server.address().port
            server.close()
            request(url)
                .get('/')
                .expect(200)
                .end(function(err) {
                    assert.ok(err instanceof Error, 'handle the error')
                    done()
                })
        })
    })

    it('should assert the response text', function(done) {
        const app = express()

        app.set('json spaces', 0)

        app.get('/', function(req, res) {
            res.send("{ foo: 'bar' }")
        })

        request(app)
            .get('/')
            .expect("{ foo: 'bar' }", done)
    })

    it('should assert response body multiple times with no exception', function(done) {
        const app = express()

        app.get('/', function(req, res) {
            res.send('hey tj')
        })

        request(app)
            .get('/')
            .expect(/tj/)
            .expect(/^hey/)
            .expect('hey tj', done)
    })
})


describe('.<http verb> works as expected', function() {
    it('.delete should work', function(done) {
        var app = express()
        app.delete('/', function(req, res) {
            res.sendStatus(200)
        })

        request(app)
            .delete('/')
            .expect(200, done)
    })
    it('.del should work', function(done) {
        var app = express()
        app.delete('/', function(req, res) {
            res.sendStatus(200)
        })

        request(app)
            .del('/')
            .expect(200, done)
    })
    it('.get should work', function(done) {
        var app = express()
        app.get('/', function(req, res) {
            res.sendStatus(200)
        })

        request(app)
            .get('/')
            .expect(200, done)
    })
    it('.post should work', function(done) {
        var app = express()
        app.post('/', function(req, res) {
            res.sendStatus(200)
        })

        request(app)
            .post('/')
            .expect(200, done)
    })
    it('.put should work', function(done) {
        var app = express()
        app.put('/', function(req, res) {
            res.sendStatus(200)
        })

        request(app)
            .put('/')
            .expect(200, done)
    })
    // it('.head should work', function(done) {
    //     var app = express()
    //     app.head('/', function(req, res) {
    //         res.statusCode = 200
    //         res.set('Content-Encoding', 'gzip')
    //         res.set('Content-Length', '1024')
    //         res.set('Access-Control-Expose-Headers', 'Content-Encoding, Content-Length')
    //         res.status(200)
    //         res.end()
    //     })

    //     request(app)
    //         .head('/')
    //         .set('accept-encoding', 'gzip, deflate')
    //         .end(function(err, res) {
    //             if (err) return done(err)
    //             console.log(err, res)
    //             // res.should.have.property('statusCode', 200)
    //             // res.headers.should.have.property('content-length', '1024')
    //             done()
    //         })
    // })
})

describe('assert type and status', function() {
    it('assert status ', function () {
        const app = express()

        app.get('/', function(req, res) {
            res.status(500).json({ message: 'something went wrong' })
        })

        return request(app)
            .get('/')
            .expect(500)
            .end({
                message: String
            })
    })

    it('assert json body as string', function(done) {
        var app = express()

        app.set('json spaces', 0)

        app.get('/', function(req, res) {
            res.status(500).json({ message: 'something went wrong' })
        })

        request(app)
            .get('/')
            .expect(200)
            .expect('hey')
            .end(function(err, res) {
                assert.ok(err instanceof Error)
                done()
            })
    })

    it('assert json body as string : promise', function() {
        const app = express()

        app.get('/', function(req, res) {
            res.status(500).json({ message: 'something went wrong' })
        })

        return request(app)
            .get('/')
            .expect(500)
            .expect({
                message: String
            })
            .end()
    })

    it('assert the fields', function(done) {
        var app = express()

        app.set('json spaces', 0)

        app.get('/', function(req, res) {
            res.status(200).json({ hello: 'world' })
        })

        request(app)
            .get('/')
            .expect('content-type', /html/)
            .end(function(err, res) {
                assert.ok(err instanceof Error)
                assert.ok(err.message === 'expected content-type matching /html/, got application/json; charset=utf-8')
                done()
            })
    })

    it('expect function', function () {
        var app = express()

        app.get('/', function(req, res) {
            res.status(200).json({})
        })

        return request(app)
            .get('/')
            .expect(function(res) {
                res.data.a = 1
            })
            .expect(function(res) {
                assert.ok(res.data.a === 1, 'res.data.a === 1 should.be true')
                res.data.second = 2
            })
            .end(function (err, res) {
                if (err) return done(err)
                assert.ok(res.data.a === 1, 'res.data.first should.be 1')
                assert.ok(res.data.second === 2, 'res.data.first should.be 2')
            })
    })

    it('should call expect(fn) and expect(status, fn) in order', function () {
        var app = express()

        app.get('/', function(req, res) {
            res.status(200).json({})
        })

        return request(app)
            .get('/')
            .expect(function(res) {
                res.body.first = 1
            })
            .expect(200, function(err, res) {
                assert.ok(!!err, 'err should be null')
                assert.ok(res.body.first === 1, 'res.body.first should.be 1')
            })
    })

    it('should call expect(fn) and expect(header,value) in order', function(done) {
        var app = express()

        app.get('/', function(req, res) {
            res
                .set('X-Some-Header', 'Some value')
                .send()
        })

        request(app)
            .get('/')
            .expect('X-Some-Header', 'Some value')
            .expect(function(res) {
                res.headers['x-some-header'] = ''
            })
            .expect('X-Some-Header', '')
            .end(done)
    })

    it('should call expect(fn) and expect(body) in order', function() {
        var app = express()

        app.get('/', function(req, res) {
            res.json({ somebody: 'some body value' })
        })

        return request(app)
            .get('/')
            .expect({
                somebody: String
            })
            .expect(function (res) {
                res.data.somebody = []
            })
            .expect({
                somebody: Array
            })
            .expect(function (res) {
                res.data = 'nobody'
            })
            .expect(/nobody/)
            .expect(function (res) {
                res.data = 'somebody'
            })
            .expect(/somebody/)
            .end()
    })
})

describe('request.get(url).query(vals) works as expected', function() {
    it('normal single query string value works', function(done) {
        var app = express()
        app.get('/', function(req, res) {
            res.status(200).send(req.query.val)
        })

        request(app)
            .get('/')
            .query({ val: 'Test1' })
            .expect('Test1', done)
    })

    it('array query string value works', function () {
        var app = express()
        app.get('/', function(req, res) {
            res.status(200).send(Array.isArray(req.query.val))
        })

        return request(app)
            .get('/')
            .query({ 'val[]': ['Test1', 'Test2'] })
            .expect(200, function(err, res) {
                assert.ok(res.req.path === '/?val%5B%5D=Test1&val%5B%5D=Test2')
                assert.ok(res.data === 'true')
            })
    })

    it('array query string value work even with single value', function () {
        var app = express()
        app.get('/', function(req, res) {
            res.status(200).send(Array.isArray(req.query.val))
        })

        return request(app)
            .get('/')
            .query({ 'val[]': ['Test1'] })
            .expect(200, function (err, res) {
                assert.ok(res.path === '/?val%5B%5D=Test1', 'res.path === /?val%5B%5D=Test1 should be true')
                assert.ok(res.text === 'true', 'res.text === true')
            })
    })

    it('object query string value works', function () {
        var app = express()
        app.get('/', function (req, res) {
            res.status(200).send(req.query.val.test)
        })

        return request(app)
            .get('/')
            .query({ val: { test: 'Test1' } })
            .expect(200, function(err, res) {
                assert.ok(res.data === 'Test1')
            })
    })
})