/*
 * SPDX-License-Identifier: AGPL-3.0-or-later · © 2026 · github.com/sicambria/rovas-tanulas
 *
 * users.js — Multiple profiles with a simple password.
 *
 * IMPORTANT: this is NOT real security, just so a sibling can't tamper with
 * someone else's progress. The password is stored as SHA-256(salt+password)
 * (crypto.subtle, with a simple JS-hash fallback). By request there is NO
 * password recovery — deleting the profile is the only way out (with data loss).
 *
 * Each profile's game save lives under its own key: rovas-save-v1:<id>.
 */
(function (root) {
  'use strict';

  var USERS_KEY = 'rovas-users-v1';
  var SUBTLE = (root.crypto && root.crypto.subtle) ? root.crypto.subtle : null;

  function storage() { return root.localStorage || null; }

  function load() {
    try { var s = JSON.parse(storage().getItem(USERS_KEY)); if (s && Array.isArray(s.users)) return s; } catch (e) {}
    return { users: [], lastUserId: null };
  }
  function save(store) { try { storage().setItem(USERS_KEY, JSON.stringify(store)); } catch (e) {} }

  function randHex(n) {
    var bytes = new Uint8Array(n);
    if (root.crypto && root.crypto.getRandomValues) root.crypto.getRandomValues(bytes);
    else for (var i = 0; i < n; i++) bytes[i] = Math.floor(Math.random() * 256);
    return Array.prototype.map.call(bytes, function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
  }
  function hex(buf) {
    return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
  }
  // Fallback (non-cryptographic) hash when crypto.subtle is unavailable (e.g. file://).
  function fnv(str) {
    var h = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0; }
    // 64-bit output via two rounds, so it isn't trivially collision-prone
    var h2 = 0x1000193 ^ h;
    for (var j = str.length - 1; j >= 0; j--) { h2 ^= str.charCodeAt(j); h2 = Math.imul(h2, 0x01000193) >>> 0; }
    return ('00000000' + h.toString(16)).slice(-8) + ('00000000' + h2.toString(16)).slice(-8);
  }

  function hashPassword(pw, salt) {
    var msg = salt + ':' + String(pw == null ? '' : pw);
    if (SUBTLE) {
      var data = new TextEncoder().encode(msg);
      return SUBTLE.digest('SHA-256', data).then(hex);
    }
    return Promise.resolve('fnv:' + fnv(msg));
  }

  function genId(name) {
    return (String(name).toLowerCase().replace(/[^a-z0-9]+/g, '') || 'user').slice(0, 12) + '-' + randHex(3);
  }

  function publicUser(u) { return { id: u.id, name: u.name, character: u.character, createdAt: u.createdAt, protected: !!u.protected }; }

  function listUsers() { return load().users.map(publicUser); }
  function count() { return load().users.length; }
  function getLast() {
    var s = load();
    if (s.lastUserId && s.users.some(function (u) { return u.id === s.lastUserId; })) return s.lastUserId;
    return s.users.length ? s.users[0].id : null;
  }
  function setLast(id) { var s = load(); s.lastUserId = id; save(s); }
  function get(id) { var u = load().users.filter(function (x) { return x.id === id; })[0]; return u ? publicUser(u) : null; }

  function createUser(opts) {
    opts = opts || {};
    var name = (opts.name || '').trim() || 'Tanuló';
    var salt = randHex(8);
    var pw = opts.password == null ? '' : String(opts.password);
    return hashPassword(pw, salt).then(function (hash) {
      var s = load();
      var u = { id: genId(name), name: name, character: opts.character || null, salt: salt, hash: hash, protected: pw.length > 0, createdAt: opts.createdAt || Date.now() };
      s.users.push(u); s.lastUserId = u.id; save(s);
      return publicUser(u);
    });
  }

  function verify(id, password) {
    var u = load().users.filter(function (x) { return x.id === id; })[0];
    if (!u) return Promise.resolve(false);
    return hashPassword(password || '', u.salt).then(function (h) { return h === u.hash; });
  }

  function hasPassword(id) {
    // even an empty password "has" a hash; as a signal to the UI: always true here (we always ask for a password)
    return !!get(id);
  }

  function deleteUser(id) {
    var s = load();
    s.users = s.users.filter(function (x) { return x.id !== id; });
    if (s.lastUserId === id) s.lastUserId = s.users.length ? s.users[0].id : null;
    save(s);
    try { storage().removeItem('rovas-save-v1:' + id); } catch (e) {}
    return s.users.length;
  }

  function rename(id, name) {
    var s = load(); var u = s.users.filter(function (x) { return x.id === id; })[0];
    if (u) { u.name = String(name).trim() || u.name; save(s); }
    return u ? publicUser(u) : null;
  }

  var api = {
    USERS_KEY: USERS_KEY,
    hasSubtle: !!SUBTLE,
    listUsers: listUsers, count: count, get: get, getLast: getLast, setLast: setLast,
    createUser: createUser, verify: verify, deleteUser: deleteUser, rename: rename, hasPassword: hasPassword,
    _hashPassword: hashPassword
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.ROVAS_USERS = api;
})(typeof window !== 'undefined' ? window : globalThis);
