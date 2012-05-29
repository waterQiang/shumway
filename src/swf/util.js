/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

var create = Object.create;
var defineProperty = Object.defineProperty;
var keys = Object.keys;
var isArray = Array.isArray;
var fromCharCode = String.fromCharCode;
var log = Math.log;
var max = Math.max;
var min = Math.min;
var pow = Math.pow;
var push = [].push;
var slice = [].slice;
var splice = [].splice;

function fail(msg, context) {
  throw new Error((context ? context + ': ' : '') + msg);
}
function assert(cond, msg, context) {
  if (!cond)
    fail(msg, context);
}
function defer(func, startTime) {
  if (!startTime)
    startTime = +new Date;
  assert(+new Date - startTime < 1000, 'timeout', 'defer');
  if (func())
    setTimeout(defer, 0, func, startTime);
}

function toStringRgba(color) {
  return 'rgba(' + [color.red, color.green, color.blue, color.alpha / 255].join(',') + ')';
}
function toString16(val) {
  return fromCharCode((val >> 8) & 0xff, val & 0xff);
}
function toString16Le(val) {
  return fromCharCode(val & 0xff, (val >> 8) & 0xff);
}
function toString32(val) {
  return toString16(val >> 16) + toString16(val);
}

var crcTable = [];
for (var i = 0; i < 256; i++) {
  var c = i;
  for (var h = 0; h < 8; h++) {
    if (c & 1)
      c = 0xedB88320 ^ ((c >> 1) & 0x7fffffff);
    else
      c = (c >> 1) & 0x7fffffff;
  }
  crcTable[i] = c;
}  

function crc32(data){
  var crc = -1;
  for (var i = 0, n = data.length; i < n; ++i) {
    var a = (crc ^ data.charCodeAt(i)) & 0xff;
    var b = crcTable[a]; 
    crc = (crc >>> 8) ^ b;
  } 
  return crc ^ -1;
}

function createPngChunk(type, data) {
  var body = type + data;
  return toString32(data.length) + body + toString32(crc32(body));
}
 
function adler32(data) {
  var a = 1;
  var b = 0;
  for (var i = 0, n = data.length; i < n; ++i) {
    a = (a + (data.charCodeAt(i) & 0xff)) % 65521;
    b = (b + a) % 65521;
  }
  return (b << 16) | a;
}
