/** Password hashing bundled from @noble/hashes 1.8.0 (MIT). See AUTH-CRYPTO-LICENSE.txt. */
var ACSAuthCrypto = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // work/auth/crypto-entry.js
  var crypto_entry_exports = {};
  __export(crypto_entry_exports, {
    derive: () => derive
  });

  // work/auth/node_modules/@noble/hashes/esm/utils.js
  function isBytes(a) {
    return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
  }
  function anumber(n) {
    if (!Number.isSafeInteger(n) || n < 0)
      throw new Error("positive integer expected, got " + n);
  }
  function abytes(b, ...lengths) {
    if (!isBytes(b))
      throw new Error("Uint8Array expected");
    if (lengths.length > 0 && !lengths.includes(b.length))
      throw new Error("Uint8Array expected of length " + lengths + ", got length=" + b.length);
  }
  function ahash(h) {
    if (typeof h !== "function" || typeof h.create !== "function")
      throw new Error("Hash should be wrapped by utils.createHasher");
    anumber(h.outputLen);
    anumber(h.blockLen);
  }
  function aexists(instance, checkFinished = true) {
    if (instance.destroyed)
      throw new Error("Hash instance has been destroyed");
    if (checkFinished && instance.finished)
      throw new Error("Hash#digest() has already been called");
  }
  function aoutput(out, instance) {
    abytes(out);
    const min = instance.outputLen;
    if (out.length < min) {
      throw new Error("digestInto() expects output buffer of length at least " + min);
    }
  }
  function clean(...arrays) {
    for (let i = 0; i < arrays.length; i++) {
      arrays[i].fill(0);
    }
  }
  function createView(arr) {
    return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
  }
  function rotr(word, shift) {
    return word << 32 - shift | word >>> shift;
  }
  var hasHexBuiltin = /* @__PURE__ */ (() => (
    // @ts-ignore
    typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function"
  ))();
  var hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
  function bytesToHex(bytes) {
    abytes(bytes);
    if (hasHexBuiltin)
      return bytes.toHex();
    let hex = "";
    for (let i = 0; i < bytes.length; i++) {
      hex += hexes[bytes[i]];
    }
    return hex;
  }
  function utf8ToBytes(str) {
    if (typeof str !== "string")
      throw new Error("string expected");
    return new Uint8Array(new TextEncoder().encode(str));
  }
  function toBytes(data) {
    if (typeof data === "string")
      data = utf8ToBytes(data);
    abytes(data);
    return data;
  }
  function kdfInputToBytes(data) {
    if (typeof data === "string")
      data = utf8ToBytes(data);
    abytes(data);
    return data;
  }
  function checkOpts(defaults, opts) {
    if (opts !== void 0 && {}.toString.call(opts) !== "[object Object]")
      throw new Error("options should be object or undefined");
    const merged = Object.assign(defaults, opts);
    return merged;
  }
  var Hash = class {
  };
  function createHasher(hashCons) {
    const hashC = (msg) => hashCons().update(toBytes(msg)).digest();
    const tmp = hashCons();
    hashC.outputLen = tmp.outputLen;
    hashC.blockLen = tmp.blockLen;
    hashC.create = () => hashCons();
    return hashC;
  }

  // work/auth/node_modules/@noble/hashes/esm/hmac.js
  var HMAC = class extends Hash {
    constructor(hash, _key) {
      super();
      this.finished = false;
      this.destroyed = false;
      ahash(hash);
      const key = toBytes(_key);
      this.iHash = hash.create();
      if (typeof this.iHash.update !== "function")
        throw new Error("Expected instance of class which extends utils.Hash");
      this.blockLen = this.iHash.blockLen;
      this.outputLen = this.iHash.outputLen;
      const blockLen = this.blockLen;
      const pad = new Uint8Array(blockLen);
      pad.set(key.length > blockLen ? hash.create().update(key).digest() : key);
      for (let i = 0; i < pad.length; i++)
        pad[i] ^= 54;
      this.iHash.update(pad);
      this.oHash = hash.create();
      for (let i = 0; i < pad.length; i++)
        pad[i] ^= 54 ^ 92;
      this.oHash.update(pad);
      clean(pad);
    }
    update(buf) {
      aexists(this);
      this.iHash.update(buf);
      return this;
    }
    digestInto(out) {
      aexists(this);
      abytes(out, this.outputLen);
      this.finished = true;
      this.iHash.digestInto(out);
      this.oHash.update(out);
      this.oHash.digestInto(out);
      this.destroy();
    }
    digest() {
      const out = new Uint8Array(this.oHash.outputLen);
      this.digestInto(out);
      return out;
    }
    _cloneInto(to) {
      to || (to = Object.create(Object.getPrototypeOf(this), {}));
      const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this;
      to = to;
      to.finished = finished;
      to.destroyed = destroyed;
      to.blockLen = blockLen;
      to.outputLen = outputLen;
      to.oHash = oHash._cloneInto(to.oHash);
      to.iHash = iHash._cloneInto(to.iHash);
      return to;
    }
    clone() {
      return this._cloneInto();
    }
    destroy() {
      this.destroyed = true;
      this.oHash.destroy();
      this.iHash.destroy();
    }
  };
  var hmac = (hash, key, message) => new HMAC(hash, key).update(message).digest();
  hmac.create = (hash, key) => new HMAC(hash, key);

  // work/auth/node_modules/@noble/hashes/esm/pbkdf2.js
  function pbkdf2Init(hash, _password, _salt, _opts) {
    ahash(hash);
    const opts = checkOpts({ dkLen: 32, asyncTick: 10 }, _opts);
    const { c, dkLen, asyncTick } = opts;
    anumber(c);
    anumber(dkLen);
    anumber(asyncTick);
    if (c < 1)
      throw new Error("iterations (c) should be >= 1");
    const password = kdfInputToBytes(_password);
    const salt = kdfInputToBytes(_salt);
    const DK = new Uint8Array(dkLen);
    const PRF = hmac.create(hash, password);
    const PRFSalt = PRF._cloneInto().update(salt);
    return { c, dkLen, asyncTick, DK, PRF, PRFSalt };
  }
  function pbkdf2Output(PRF, PRFSalt, DK, prfW, u) {
    PRF.destroy();
    PRFSalt.destroy();
    if (prfW)
      prfW.destroy();
    clean(u);
    return DK;
  }
  function pbkdf2(hash, password, salt, opts) {
    const { c, dkLen, DK, PRF, PRFSalt } = pbkdf2Init(hash, password, salt, opts);
    let prfW;
    const arr = new Uint8Array(4);
    const view = createView(arr);
    const u = new Uint8Array(PRF.outputLen);
    for (let ti = 1, pos = 0; pos < dkLen; ti++, pos += PRF.outputLen) {
      const Ti = DK.subarray(pos, pos + PRF.outputLen);
      view.setInt32(0, ti, false);
      (prfW = PRFSalt._cloneInto(prfW)).update(arr).digestInto(u);
      Ti.set(u.subarray(0, Ti.length));
      for (let ui = 1; ui < c; ui++) {
        PRF._cloneInto(prfW).update(u).digestInto(u);
        for (let i = 0; i < Ti.length; i++)
          Ti[i] ^= u[i];
      }
    }
    return pbkdf2Output(PRF, PRFSalt, DK, prfW, u);
  }

  // work/auth/node_modules/@noble/hashes/esm/_md.js
  function setBigUint64(view, byteOffset, value, isLE) {
    if (typeof view.setBigUint64 === "function")
      return view.setBigUint64(byteOffset, value, isLE);
    const _32n = BigInt(32);
    const _u32_max = BigInt(4294967295);
    const wh = Number(value >> _32n & _u32_max);
    const wl = Number(value & _u32_max);
    const h = isLE ? 4 : 0;
    const l = isLE ? 0 : 4;
    view.setUint32(byteOffset + h, wh, isLE);
    view.setUint32(byteOffset + l, wl, isLE);
  }
  function Chi(a, b, c) {
    return a & b ^ ~a & c;
  }
  function Maj(a, b, c) {
    return a & b ^ a & c ^ b & c;
  }
  var HashMD = class extends Hash {
    constructor(blockLen, outputLen, padOffset, isLE) {
      super();
      this.finished = false;
      this.length = 0;
      this.pos = 0;
      this.destroyed = false;
      this.blockLen = blockLen;
      this.outputLen = outputLen;
      this.padOffset = padOffset;
      this.isLE = isLE;
      this.buffer = new Uint8Array(blockLen);
      this.view = createView(this.buffer);
    }
    update(data) {
      aexists(this);
      data = toBytes(data);
      abytes(data);
      const { view, buffer, blockLen } = this;
      const len = data.length;
      for (let pos = 0; pos < len; ) {
        const take = Math.min(blockLen - this.pos, len - pos);
        if (take === blockLen) {
          const dataView = createView(data);
          for (; blockLen <= len - pos; pos += blockLen)
            this.process(dataView, pos);
          continue;
        }
        buffer.set(data.subarray(pos, pos + take), this.pos);
        this.pos += take;
        pos += take;
        if (this.pos === blockLen) {
          this.process(view, 0);
          this.pos = 0;
        }
      }
      this.length += data.length;
      this.roundClean();
      return this;
    }
    digestInto(out) {
      aexists(this);
      aoutput(out, this);
      this.finished = true;
      const { buffer, view, blockLen, isLE } = this;
      let { pos } = this;
      buffer[pos++] = 128;
      clean(this.buffer.subarray(pos));
      if (this.padOffset > blockLen - pos) {
        this.process(view, 0);
        pos = 0;
      }
      for (let i = pos; i < blockLen; i++)
        buffer[i] = 0;
      setBigUint64(view, blockLen - 8, BigInt(this.length * 8), isLE);
      this.process(view, 0);
      const oview = createView(out);
      const len = this.outputLen;
      if (len % 4)
        throw new Error("_sha2: outputLen should be aligned to 32bit");
      const outLen = len / 4;
      const state = this.get();
      if (outLen > state.length)
        throw new Error("_sha2: outputLen bigger than state");
      for (let i = 0; i < outLen; i++)
        oview.setUint32(4 * i, state[i], isLE);
    }
    digest() {
      const { buffer, outputLen } = this;
      this.digestInto(buffer);
      const res = buffer.slice(0, outputLen);
      this.destroy();
      return res;
    }
    _cloneInto(to) {
      to || (to = new this.constructor());
      to.set(...this.get());
      const { blockLen, buffer, length, finished, destroyed, pos } = this;
      to.destroyed = destroyed;
      to.finished = finished;
      to.length = length;
      to.pos = pos;
      if (length % blockLen)
        to.buffer.set(buffer);
      return to;
    }
    clone() {
      return this._cloneInto();
    }
  };
  var SHA256_IV = /* @__PURE__ */ Uint32Array.from([
    1779033703,
    3144134277,
    1013904242,
    2773480762,
    1359893119,
    2600822924,
    528734635,
    1541459225
  ]);

  // work/auth/node_modules/@noble/hashes/esm/sha2.js
  var SHA256_K = /* @__PURE__ */ Uint32Array.from([
    1116352408,
    1899447441,
    3049323471,
    3921009573,
    961987163,
    1508970993,
    2453635748,
    2870763221,
    3624381080,
    310598401,
    607225278,
    1426881987,
    1925078388,
    2162078206,
    2614888103,
    3248222580,
    3835390401,
    4022224774,
    264347078,
    604807628,
    770255983,
    1249150122,
    1555081692,
    1996064986,
    2554220882,
    2821834349,
    2952996808,
    3210313671,
    3336571891,
    3584528711,
    113926993,
    338241895,
    666307205,
    773529912,
    1294757372,
    1396182291,
    1695183700,
    1986661051,
    2177026350,
    2456956037,
    2730485921,
    2820302411,
    3259730800,
    3345764771,
    3516065817,
    3600352804,
    4094571909,
    275423344,
    430227734,
    506948616,
    659060556,
    883997877,
    958139571,
    1322822218,
    1537002063,
    1747873779,
    1955562222,
    2024104815,
    2227730452,
    2361852424,
    2428436474,
    2756734187,
    3204031479,
    3329325298
  ]);
  var SHA256_W = /* @__PURE__ */ new Uint32Array(64);
  var SHA256 = class extends HashMD {
    constructor(outputLen = 32) {
      super(64, outputLen, 8, false);
      this.A = SHA256_IV[0] | 0;
      this.B = SHA256_IV[1] | 0;
      this.C = SHA256_IV[2] | 0;
      this.D = SHA256_IV[3] | 0;
      this.E = SHA256_IV[4] | 0;
      this.F = SHA256_IV[5] | 0;
      this.G = SHA256_IV[6] | 0;
      this.H = SHA256_IV[7] | 0;
    }
    get() {
      const { A, B, C, D, E, F, G, H } = this;
      return [A, B, C, D, E, F, G, H];
    }
    // prettier-ignore
    set(A, B, C, D, E, F, G, H) {
      this.A = A | 0;
      this.B = B | 0;
      this.C = C | 0;
      this.D = D | 0;
      this.E = E | 0;
      this.F = F | 0;
      this.G = G | 0;
      this.H = H | 0;
    }
    process(view, offset) {
      for (let i = 0; i < 16; i++, offset += 4)
        SHA256_W[i] = view.getUint32(offset, false);
      for (let i = 16; i < 64; i++) {
        const W15 = SHA256_W[i - 15];
        const W2 = SHA256_W[i - 2];
        const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
        const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ W2 >>> 10;
        SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
      }
      let { A, B, C, D, E, F, G, H } = this;
      for (let i = 0; i < 64; i++) {
        const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
        const T1 = H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
        const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
        const T2 = sigma0 + Maj(A, B, C) | 0;
        H = G;
        G = F;
        F = E;
        E = D + T1 | 0;
        D = C;
        C = B;
        B = A;
        A = T1 + T2 | 0;
      }
      A = A + this.A | 0;
      B = B + this.B | 0;
      C = C + this.C | 0;
      D = D + this.D | 0;
      E = E + this.E | 0;
      F = F + this.F | 0;
      G = G + this.G | 0;
      H = H + this.H | 0;
      this.set(A, B, C, D, E, F, G, H);
    }
    roundClean() {
      clean(SHA256_W);
    }
    destroy() {
      this.set(0, 0, 0, 0, 0, 0, 0, 0);
      clean(this.buffer);
    }
  };
  var sha256 = /* @__PURE__ */ createHasher(() => new SHA256());

  // work/auth/node_modules/@noble/hashes/esm/sha256.js
  var sha2562 = sha256;

  // work/auth/crypto-entry.js
  function derive(passwordBytes, saltBytes) {
    return bytesToHex(pbkdf2(sha2562, new Uint8Array(passwordBytes), new Uint8Array(saltBytes), { c: 6e5, dkLen: 32 }));
  }
  return __toCommonJS(crypto_entry_exports);
})();
/*! Bundled license information:

@noble/hashes/esm/utils.js:
  (*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) *)
*/

/** Dự án quản trị RIÊNG. Triển khai: chủ dự án / người có link. Mọi RPC nội dung bắt buộc phiên đăng nhập.
 * Chạy setupAdminAuth() trong trình biên tập một lần bằng tài khoản chủ Sheet.
 * Script Properties: SPREADSHEET_ID = ID Sheet hiện có. Không chạy setup CMS.
 */
const ADMIN_SCHEMA = {
 Settings:['key','value'],Articles:['id','title','icon','minutes','cover_url','cover_alt','urgent','published','sort_order'],
 ArticleBlocks:['id','article_id','heading','type','content','sort_order'],
 Products:['id','name','price','currency','image_url','video_url','buy_url','description','published','sort_order','button_label','button_class','video_button_label','video_button_class','display_layout','badge_label','gallery_urls','chat_button_label','chat_button_url','chat_button_class'],
 Topics:['id','name','icon','data_json','sort_order'],Exercises:['id','name','fig','reps','hold','sub','steps','tip','published','sort_order'],Tips:['id','content','sort_order'],Texts:['id','original','value']
};
function doGet(){
 return HtmlService.createHtmlOutputFromFile('Admin').setTitle('Đăng nhập quản trị An Cột Sống').addMetaTag('viewport','width=device-width, initial-scale=1');
}
function adminRead_(ss){
 const tables={};
 Object.keys(ADMIN_SCHEMA).forEach(name=>{
  const sh=ss.getSheetByName(name);if(!sh)throw Error('Thiếu bảng '+name);
  const values=sh.getDataRange().getValues(),headers=values.shift().map(v=>String(v).trim());
  if(new Set(headers).size!==headers.length)throw Error('Trùng tiêu đề cột trong '+name);
  ADMIN_SCHEMA[name].filter(k=>!['button_label','button_class','video_button_label','video_button_class','display_layout','badge_label','gallery_urls','chat_button_label','chat_button_url','chat_button_class'].includes(k)).forEach(k=>{if(!headers.includes(k))throw Error('Thiếu cột '+name+'.'+k);});
  const key=name==='Settings'?'key':'id',seen=new Set();
  tables[name]=values.filter(r=>headers.some((h,i)=>!['published','urgent'].includes(h)&&String(r[i]).trim()!=='')).map((r)=>{
   const o={};headers.forEach((k,i)=>{o[k]=r[i] instanceof Date?r[i].toISOString():r[i];});o[key]=String(o[key]||'').trim();
   if(!o[key]||seen.has(o[key]))throw Error('ID trống hoặc trùng trong '+name+': '+o[key]);seen.add(o[key]);if(name==='ArticleBlocks')o.article_id=String(o.article_id||'').trim();return o;
  });
 });
 return {tables:tables,revision:adminRevision_(tables),sheetUrl:ss.getUrl(),schema:ADMIN_SCHEMA};
}
function adminRevision_(tables){return Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,JSON.stringify(tables)));}
function adminLoad(request){const lock=LockService.getScriptLock();lock.waitLock(30000);try{return adminRead_(adminRequireSession_(request));}finally{lock.releaseLock();}}
function adminValidate_(name,row){
 const key=name==='Settings'?'key':'id';row[key]=String(row[key]||'').trim();
 if(!row[key]||row[key].length>120||/[\[\],\r\n]/.test(row[key]))throw Error('Mã không hợp lệ. Không dùng ngoặc, dấu phẩy hay xuống dòng.');
 Object.keys(row).forEach(k=>{if(!ADMIN_SCHEMA[name].includes(k))return;
  if(typeof row[k]==='string'&&row[k].length>45000)throw Error('Nội dung '+k+' quá dài; chia thành nhiều đoạn.');
  if(['published','urgent'].includes(k))row[k]=row[k]===true||String(row[k]).toLowerCase()==='true';
  if(['minutes','sort_order','price','reps','hold'].includes(k)&&row[k]!==''){const n=Number(row[k]);if(!Number.isFinite(n)||n<0)throw Error('Giá trị số không hợp lệ: '+k);row[k]=n;}
  if((k==='image_url'||k==='gallery_urls')&&row[k]){
   const urls=String(row[k]).split(/[\r\n,]+/).map(s=>s.trim()).filter(Boolean);
   if(urls.some(u=>!/^https:\/\/[^\s<>]+$/i.test(u)))throw Error('Mỗi link ảnh trong '+k+' phải bắt đầu bằng https://.');
  }else if(k.endsWith('_url')&&row[k]&&!/^https:\/\/[^\s<>]+$/i.test(row[k]))throw Error('Link '+k+' phải bắt đầu bằng https://.');
 });
 if(name==='Articles'&&!String(row.title||'').trim())throw Error('Nhập tiêu đề bài viết.');
 if(name==='Products'&&!String(row.name||'').trim())throw Error('Nhập tên sản phẩm.');
 if(name==='ArticleBlocks'&&!['paragraph','list'].includes(row.type))throw Error('Loại đoạn phải là paragraph hoặc list.');
 if(name==='Topics'){const d=JSON.parse(row.data_json);if(d.id!==row.id||!Array.isArray(d.spots))throw Error('Dữ liệu chuyên đề thiếu ID hoặc danh sách điểm.');}
}
function adminWriteTable_(ss,name,rows){
 const sh=ss.getSheetByName(name);let headers=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0].map(v=>String(v).trim());
 ADMIN_SCHEMA[name].forEach(k=>{if(!headers.includes(k)){headers.push(k);}});
 if(sh.getMaxColumns()<headers.length)sh.insertColumnsAfter(sh.getMaxColumns(),headers.length-sh.getMaxColumns());
 if(sh.getMaxRows()<rows.length+1)sh.insertRowsAfter(sh.getMaxRows(),rows.length+1-sh.getMaxRows());
 const count=Math.max(rows.length,sh.getLastRow()-1),grid=[headers];
 for(let i=0;i<count;i++)grid.push(headers.map(k=>{
  let v=rows[i]?rows[i][k]:'';if(v==null)v='';
  // Giữ nội dung là chữ, không biến văn bản quản trị thành công thức Sheet.
  return typeof v==='string'&&/^[=+\-@]/.test(v)?"'"+v:v;
 }));
 sh.getRange(1,1,grid.length,headers.length).setValues(grid);
}
function adminSave(request){
 const ss=adminServerSheet_(),lock=LockService.getScriptLock();lock.waitLock(30000);
 try{
  adminRequireSession_(request);
  const snapshot=adminRead_(ss);if(!request||request.revision!==snapshot.revision)throw Error('Dữ liệu đã đổi ở nơi khác. Tải lại rồi chỉnh sửa để tránh ghi đè.');
  const name=request.table;if(!Object.prototype.hasOwnProperty.call(ADMIN_SCHEMA,name)||name==='ArticleBlocks')throw Error('Bảng không được chỉnh trực tiếp.');
  const key=name==='Settings'?'key':'id',rows=snapshot.tables[name],original=String(request.originalId||''),index=rows.findIndex(r=>r[key]===original);
  if(original&&index<0)throw Error('Không còn bản ghi này.');
  const next=JSON.parse(JSON.stringify(snapshot.tables)),changed=[name];let savedId=original;
  if(request.remove){
   if(name==='Topics')throw Error('Giữ các chuyên đề chính; có thể sửa nội dung.');
   if(index<0)throw Error('Chưa chọn bản ghi.');next[name].splice(index,1);
  }else{
   const row={};ADMIN_SCHEMA[name].forEach(k=>{row[k]=request.row[k]===undefined?'':request.row[k];});
   row[key]=original||(name==='Settings'?String(request.row.key||''):'acs-'+Utilities.getUuid());
   if('sort_order' in row)row.sort_order=index>=0?rows[index].sort_order:Math.max(0,...rows.map(r=>Number(r.sort_order)||0))+1;
   if(name==='Topics'){const d=JSON.parse(row.data_json);d.id=row.id;d.name=row.name;d.icon=row.icon;row.data_json=JSON.stringify(d);}
   adminValidate_(name,row);
   savedId=row[key];
   if(index<0&&rows.some(r=>r[key]===row[key]))throw Error('Mã đã tồn tại.');
   if(index<0)next[name].push(row);else next[name][index]=Object.assign({},rows[index],row);
  }
  if(name==='Articles'){
   const id=request.remove?original:savedId;
   next.ArticleBlocks=next.ArticleBlocks.filter(b=>b.article_id!==id);
   if(!request.remove){
    if(!Array.isArray(request.blocks)||request.blocks.length>200)throw Error('Danh sách đoạn không hợp lệ.');
    const seen=new Set(next.ArticleBlocks.map(b=>b.id));
    request.blocks.forEach((b,i)=>{const row={id:snapshot.tables.ArticleBlocks.some(x=>x.article_id===id&&x.id===b.id)?b.id:'block-'+Utilities.getUuid(),article_id:id,heading:String(b.heading||''),type:b.type,content:String(b.content||''),sort_order:i+1};adminValidate_('ArticleBlocks',row);if(seen.has(row.id))throw Error('Mã đoạn trùng.');seen.add(row.id);
     adminProductIDs_(row.content).forEach(p=>{if(!next.Products.some(x=>x.id===p))throw Error('Sản phẩm đã bị xóa. Chọn lại từ danh sách.');});
     next.ArticleBlocks.push(row);
    });
   }changed.push('ArticleBlocks');
  }
  if(request.remove&&name==='Products'){
   ['ArticleBlocks','Tips','Exercises'].forEach(t=>{let any=false;next[t].forEach(r=>{['content','steps','tip','description'].forEach(k=>{if(typeof r[k]==='string'){const v=adminStripProduct_(r[k],original);if(v!==r[k]){r[k]=v;any=true;}}});});if(any)changed.push(t);});
  }
  if(ADMIN_SCHEMA[name].includes('sort_order'))next[name].sort((a,b)=>(Number(a.sort_order)||0)-(Number(b.sort_order)||0)).forEach((r,i)=>r.sort_order=i+1);
  // Rollback nếu một trong hai bảng bài viết không lưu được.
  try{changed.forEach(t=>adminWriteTable_(ss,t,next[t]));SpreadsheetApp.flush();}
  catch(e){changed.forEach(t=>adminWriteTable_(ss,t,snapshot.tables[t]));SpreadsheetApp.flush();throw e;}
  const result=adminRead_(ss);result.savedId=savedId;return result;
 }finally{lock.releaseLock();}
}
function adminBackup(request){const lock=LockService.getScriptLock();lock.waitLock(30000);try{const ss=adminRequireSession_(request);return {tables:adminRead_(ss).tables,exportedAt:new Date().toISOString()};}finally{lock.releaseLock();}}

function adminProductIDs_(value){
 let html=String(value||'');
 if(html.startsWith('@acs-rich:')){try{html=JSON.parse(html.slice(10)).html||'';}catch(e){throw Error('Nội dung định dạng không hợp lệ.');}}
 if(html.startsWith('@acs-steps:')){try{return JSON.parse(html.slice(11)).steps.flatMap(adminProductIDs_);}catch(e){throw Error('Các bước không hợp lệ.');}}
 const ids=[];for(const m of html.matchAll(/\[\[(?:product|products):([^\]]*)\]\]/gi))ids.push(...m[1].split(',').map(v=>v.trim()));
 for(const m of html.matchAll(/<acs-products\b[^>]*ids="([^"]*)"/gi))ids.push(...m[1].split(',').map(v=>v.trim()));
 return ids.filter(Boolean);
}
function adminStripProduct_(value,id){
 if(value.startsWith('@acs-rich:')){const d=JSON.parse(value.slice(10));const html=adminStripProduct_(d.html,id);if(html===d.html)return value;d.html=html;return '@acs-rich:'+JSON.stringify(d);}
 if(value.startsWith('@acs-steps:')){const d=JSON.parse(value.slice(11));const steps=d.steps.map(v=>adminStripProduct_(v,id));if(JSON.stringify(steps)===JSON.stringify(d.steps))return value;d.steps=steps;return '@acs-steps:'+JSON.stringify(d);}
 return value.replace(/\[\[(product|products):([^\]]*)\]\]/gi,(all,type,ids)=>{const a=ids.split(',').map(v=>v.trim()).filter(v=>v!==id);return a.length?'[['+(a.length===1?'product':'products')+':'+a.join(',')+']]':'';}).replace(/<acs-products\b[^>]*ids="([^"]*)"[^>]*>[\s\S]*?<\/acs-products>/gi,(all,ids)=>{const a=ids.split(',').map(v=>v.trim()).filter(v=>v!==id);return a.length?'<acs-products ids="'+a.join(',')+'"></acs-products>':'';});
}
function adminReorder(request){
 const ss=adminServerSheet_(),lock=LockService.getScriptLock();lock.waitLock(30000);
 try{adminRequireSession_(request);const snapshot=adminRead_(ss);if(request.revision!==snapshot.revision)throw Error('Dữ liệu đã đổi. Tải lại trước khi sắp xếp.');
 const name=request.table;if(!Object.prototype.hasOwnProperty.call(ADMIN_SCHEMA,name)||!ADMIN_SCHEMA[name].includes('sort_order')||name==='ArticleBlocks')throw Error('Không hỗ trợ sắp xếp mục này.');
 const ids=request.ids;if(!Array.isArray(ids)||new Set(ids).size!==ids.length||ids.length!==snapshot.tables[name].length)throw Error('Danh sách sắp xếp chưa đầy đủ.');
 const rows=ids.map((id,i)=>{const r=snapshot.tables[name].find(r=>r.id===id);if(!r)throw Error('Nội dung đã đổi.');return Object.assign({},r,{sort_order:i+1});});
 try{adminWriteTable_(ss,name,rows);SpreadsheetApp.flush();}catch(e){adminWriteTable_(ss,name,snapshot.tables[name]);throw e;}return adminRead_(ss);
 }finally{lock.releaseLock();}
}

/** Private authentication data: NEVER add these sheets to ADMIN_SCHEMA or CMS TABLE_HEADERS. */
const AUTH_ACCOUNT_HEADERS=['username','phone','password','enabled','password_hash','password_salt'];
const AUTH_DEVICE_HEADERS=['device_id','blocked','failed_attempts','device_info','first_seen','last_seen','last_username','locked_at','unlocked_at','device_hash','session_version','lock_latched'];
const AUTH_SESSION_MS=8*60*60*1000;
function adminServerSheet_(){
 const id=PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
 if(!id)throw Error('AUTH_SETUP_REQUIRED');
 const owner=DriveApp.getFileById(id).getOwner(),effective=Session.getEffectiveUser().getEmail();
 if(!owner||!effective||owner.getEmail().toLowerCase()!==effective.toLowerCase())throw Error('AUTH_SETUP_REQUIRED');
 return SpreadsheetApp.openById(id);
}
function setupAdminAuth(){
 const ss=adminServerSheet_(),owner=DriveApp.getFileById(ss.getId()).getOwner().getEmail();
 const active=Session.getActiveUser().getEmail();
 if(!active||active.toLowerCase()!==owner.toLowerCase())throw Error('Chỉ chủ Sheet được chạy setupAdminAuth trong trình biên tập Apps Script.');
 const lock=LockService.getScriptLock();lock.waitLock(30000);
 try{
  const props=PropertiesService.getScriptProperties();if(!props.getProperty('ADMIN_AUTH_SECRET'))props.setProperty('ADMIN_AUTH_SECRET',adminRandom_());
  [['AdminAccounts',AUTH_ACCOUNT_HEADERS],['AdminDevices',AUTH_DEVICE_HEADERS]].forEach(([name,headers])=>{
   let sh=ss.getSheetByName(name);if(!sh){sh=ss.insertSheet(name);sh.getRange(1,1,1,headers.length).setValues([headers]);}
   else{const present=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0].map(String);headers.forEach(h=>{if(!present.includes(h))throw Error('Bảng '+name+' thiếu cột '+h+'. Không ghi đè dữ liệu.');});}
   sh.setFrozenRows(1);sh.getRange(1,1,1,headers.length).setBackground('#24516c').setFontColor('#ffffff').setFontWeight('bold');sh.setColumnWidths(1,headers.length,180);
   if(name==='AdminAccounts'){
    sh.getRange(2,1,sh.getMaxRows()-1,3).setNumberFormat('@');sh.getRange(2,4,sh.getMaxRows()-1,1).setDataValidation(SpreadsheetApp.newDataValidation().requireCheckbox().build());sh.hideColumns(5,2);
    sh.getRange(1,3).setNote('Chủ Sheet nhập mật khẩu mới (8–128 ký tự). Khi đăng nhập, hệ thống băm mật khẩu và xóa ô này.');
   }else{sh.getRange(2,2,sh.getMaxRows()-1,1).setDataValidation(SpreadsheetApp.newDataValidation().requireCheckbox().build());sh.setColumnWidth(4,420);sh.hideColumns(10,3);sh.getRange(1,2).setNote('FALSE / bỏ tích để mở khóa. Hệ thống tự đặt lại bộ đếm sai và hủy phiên cũ. Không xóa dòng thiết bị.');}
   let protection=sh.getProtections(SpreadsheetApp.ProtectionType.SHEET)[0];if(!protection)protection=sh.protect();protection.setDescription('Tài khoản và khóa thiết bị — chỉ chủ sở hữu Sheet');
   const other=protection.getEditors().filter(u=>u.getEmail().toLowerCase()!==owner.toLowerCase());if(other.length)protection.removeEditors(other);if(protection.canDomainEdit())protection.setDomainEdit(false);
  });
  SpreadsheetApp.flush();console.log('Đã tạo AdminAccounts và AdminDevices. Chủ Sheet thêm username, phone, password và enabled=TRUE trong AdminAccounts. Không có tài khoản/mật khẩu mặc định.');
 }finally{lock.releaseLock();}
}
function adminRandom_(){return adminHex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,Utilities.getUuid()+Utilities.getUuid()+Utilities.getUuid()));}
function adminHex_(bytes){return bytes.map(v=>(v&255).toString(16).padStart(2,'0')).join('');}
function adminEqual_(a,b){a=String(a||'');b=String(b||'');let d=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)d|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return d===0;}
function adminTruth_(v){return v===true||String(v).trim().toLowerCase()==='true';}
function adminAuthSecret_(){const s=PropertiesService.getScriptProperties().getProperty('ADMIN_AUTH_SECRET');if(!s)throw Error('AUTH_SETUP_REQUIRED');return s;}
function adminMac_(value){return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(String(value),adminAuthSecret_(),Utilities.Charset.UTF_8)).replace(/=+$/,'');}
function adminUser_(v){return String(v||'').trim().toLowerCase().slice(0,80);}
function adminPhone_(v){let n=String(v||'').replace(/[^0-9]/g,'');if(n.startsWith('84')&&n.length===11)n='0'+n.slice(2);if(n.length===9&&/^[35789]/.test(n))n='0'+n;return n.slice(0,20);}
function adminAuthRows_(ss,name,required){
 const sh=ss.getSheetByName(name);if(!sh)throw Error('AUTH_SETUP_REQUIRED');
 const grid=sh.getDataRange().getValues(),headers=grid.shift().map(v=>String(v).trim());
 if(required.some(h=>!headers.includes(h))||new Set(headers).size!==headers.length)throw Error('AUTH_SETUP_REQUIRED');
 return {sh,headers,rows:grid.map((r,i)=>{const o={_line:i+2};headers.forEach((h,j)=>o[h]=r[j]);return o;})};
}
function adminAuthPatch_(table,row,patch){
 const merged=Object.assign({},row,patch);const values=table.headers.map(k=>{const v=merged[k]??'';return typeof v==='string'&&/^[=+\-@]/.test(v)?"'"+v:v;});
 if(row._line)table.sh.getRange(row._line,1,1,values.length).setValues([values]);else table.sh.appendRow(values);return merged;
}
function adminDevice_(ss,device){
 if(!device||!/^d_[a-f0-9-]{36}$/i.test(String(device.id))||! /^[a-f0-9]{64}$/i.test(String(device.secret)))throw Error('AUTH_DEVICE_INVALID');
 const table=adminAuthRows_(ss,'AdminDevices',AUTH_DEVICE_HEADERS),row=table.rows.find(r=>r.device_id===device.id);
 const hash=adminHex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(device.secret)));
 if(!row||!adminEqual_(row.device_hash,hash))throw Error('AUTH_DEVICE_INVALID');
 let current=row;
 if(adminTruth_(row.blocked)&&!adminTruth_(row.lock_latched))current=adminAuthPatch_(table,row,{lock_latched:true,locked_at:new Date().toISOString(),session_version:adminRandom_()});
 if(!adminTruth_(row.blocked)&&adminTruth_(row.lock_latched))current=adminAuthPatch_(table,row,{failed_attempts:0,lock_latched:false,unlocked_at:new Date().toISOString(),session_version:adminRandom_()});
 return {table,row:current};
}
function adminAccountVersion_(r){return adminMac_(JSON.stringify([adminUser_(r.username),adminPhone_(r.phone),String(r.password||''),String(r.password_hash||''),String(r.password_salt||''),adminTruth_(r.enabled)]));}
function adminPasswordHash_(password,salt){const pass=Utilities.newBlob(adminMac_('password:'+password)).getBytes();const saltBytes=Utilities.newBlob(String(salt)).getBytes();return ACSAuthCrypto.derive(pass.map(v=>v&255),saltBytes.map(v=>v&255));}
function adminSignSession_(account,device){
 const payload={v:1,user:adminUser_(account.username),phoneKey:adminMac_(adminPhone_(account.phone)),accountVersion:adminAccountVersion_(account),device:device.device_id,deviceVersion:device.session_version,expires:Date.now()+AUTH_SESSION_MS};
 const body=Utilities.base64EncodeWebSafe(Utilities.newBlob(JSON.stringify(payload)).getBytes()).replace(/=+$/,'');return body+'.'+adminMac_('session:'+body);
}
function adminSession_(ss,auth){
 const device=adminDevice_(ss,auth?.device);if(adminTruth_(device.row.blocked))throw Error('DEVICE_LOCKED');
 const token=String(auth?.token||'');if(token.length>2500)throw Error('AUTH_REQUIRED');const parts=token.split('.');
 if(parts.length!==2||!adminEqual_(parts[1],adminMac_('session:'+parts[0])))throw Error('AUTH_REQUIRED');
 let data;try{data=JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[0]+'='.repeat((4-parts[0].length%4)%4))).getDataAsString('UTF-8'));}catch(e){throw Error('AUTH_REQUIRED');}
 if(data.v!==1||!Number.isFinite(data.expires)||data.expires<=Date.now()||data.device!==device.row.device_id||!adminEqual_(data.deviceVersion,device.row.session_version))throw Error('AUTH_REQUIRED');
 const accounts=adminAuthRows_(ss,'AdminAccounts',AUTH_ACCOUNT_HEADERS).rows.filter(r=>adminUser_(r.username)===data.user&&adminMac_(adminPhone_(r.phone))===data.phoneKey);
 if(accounts.length!==1||!adminTruth_(accounts[0].enabled)||!adminEqual_(data.accountVersion,adminAccountVersion_(accounts[0])))throw Error('AUTH_REQUIRED');
 return {device,account:accounts[0]};
}
function adminRequireSession_(request){const ss=adminServerSheet_();adminSession_(ss,request?.auth);return ss;}
function adminAuthBootstrap(request){
 const ss=adminServerSheet_(),lock=LockService.getScriptLock();lock.waitLock(30000);
 try{
  adminAuthSecret_();adminAuthRows_(ss,'AdminAccounts',AUTH_ACCOUNT_HEADERS);
  let device=request?.device;
  if(!device){
   device={id:'d_'+Utilities.getUuid(),secret:adminRandom_()};const table=adminAuthRows_(ss,'AdminDevices',AUTH_DEVICE_HEADERS),now=new Date().toISOString();
   adminAuthPatch_(table,{}, {device_id:device.id,blocked:false,failed_attempts:0,device_info:String(request?.info||'').slice(0,240),first_seen:now,last_seen:now,last_username:'',locked_at:'',unlocked_at:'',device_hash:adminHex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,device.secret)),session_version:adminRandom_(),lock_latched:false});
  }
  const d=adminDevice_(ss,device);if(adminTruth_(d.row.blocked))return {status:'locked',device};
  if(request?.token){try{const session=adminSession_(ss,{device,token:request.token});return {status:'authenticated',device,username:session.account.username};}catch(e){if(e.message==='DEVICE_LOCKED')return {status:'locked',device};}}
  return {status:'login',device};
 }finally{lock.releaseLock();}
}
function adminLogin(request){
 const ss=adminServerSheet_(),lock=LockService.getScriptLock();lock.waitLock(30000);
 try{
  let d=adminDevice_(ss,request?.device);if(adminTruth_(d.row.blocked))return {status:'locked'};
  const username=adminUser_(request?.username),phone=adminPhone_(request?.phone),password=String(request?.password||'').slice(0,129);
  const table=adminAuthRows_(ss,'AdminAccounts',AUTH_ACCOUNT_HEADERS),matches=table.rows.filter(r=>adminUser_(r.username)===username&&adminPhone_(r.phone)===phone&&adminTruth_(r.enabled));
  let account=matches.length===1?matches[0]:null;
  if(account&&String(account.password||'')!==''){
   const pending=String(account.password);if(pending.length<8||pending.length>128)throw Error('AUTH_ACCOUNT_SETUP');
   const salt=adminRandom_(),hash=adminPasswordHash_(pending,salt);
   // Recheck owner edits made while hashing before consuming the pending password.
   const latest=adminAuthRows_(ss,'AdminAccounts',AUTH_ACCOUNT_HEADERS).rows.find(r=>r._line===account._line);
   if(!latest||!adminEqual_(adminAccountVersion_(account),adminAccountVersion_(latest)))throw Error('AUTH_ACCOUNT_CHANGED');
   account=adminAuthPatch_(table,account,{password:'',password_hash:hash,password_salt:salt});
  }
  const salt=account&&/^[a-f0-9]{64}$/i.test(String(account.password_salt))?account.password_salt:adminMac_('dummy-salt');
  const candidate=adminPasswordHash_(password,salt);const valid=account&&password.length>=8&&password.length<=128&&/^[a-f0-9]{64}$/i.test(String(account.password_hash))&&adminEqual_(candidate,account.password_hash);
  // Respect a manual owner lock/unlock made while password derivation was running.
  d=adminDevice_(ss,request?.device);if(adminTruth_(d.row.blocked))return {status:'locked'};
  if(!valid){
   const attempts=Math.max(0,Number(d.row.failed_attempts)||0)+1,blocked=attempts>3;
   adminAuthPatch_(d.table,d.row,{failed_attempts:attempts,blocked,lock_latched:blocked,last_seen:new Date().toISOString(),last_username:username,...(blocked?{locked_at:new Date().toISOString(),session_version:adminRandom_()}:{})});SpreadsheetApp.flush();
   return blocked?{status:'locked'}:{status:'invalid',attempts};
  }
  const latest=adminAuthRows_(ss,'AdminAccounts',AUTH_ACCOUNT_HEADERS).rows.find(r=>r._line===account._line);
  if(!latest||!adminEqual_(adminAccountVersion_(account),adminAccountVersion_(latest)))throw Error('AUTH_ACCOUNT_CHANGED');
  const updated=adminAuthPatch_(d.table,d.row,{failed_attempts:0,last_seen:new Date().toISOString(),last_username:username,session_version:adminRandom_()});SpreadsheetApp.flush();
  return {status:'authenticated',token:adminSignSession_(latest,updated),username:latest.username,expiresAt:Date.now()+AUTH_SESSION_MS};
 }finally{lock.releaseLock();}
}
function adminLogout(request){const ss=adminServerSheet_(),lock=LockService.getScriptLock();lock.waitLock(30000);try{const session=adminSession_(ss,request?.auth);adminAuthPatch_(session.device.table,session.device.row,{session_version:adminRandom_()});return {status:'login'};}finally{lock.releaseLock();}}


/**
 * Module nhập dữ liệu 20 sản phẩm từ https://hongcotsong.com vào Google Sheets
 * Dự án: An Cột Sống
 *
 * CÁCH SỬ DỤNG:
 * Cách 1: Trong Google Sheet, bấm menu "An Cột Sống" -> "📥 Nhập 20 sản phẩm hongcotsong.com"
 * Cách 2: Trong Apps Script Editor, chọn hàm "importHongCotSongProducts" rồi bấm "Chạy" (Run)
 * Cách 3: Trong trang Quản trị Admin, bấm nút "📥 Nhập 20 sản phẩm hongcotsong.com"
 */

const HONG_COT_SONG_PRODUCTS = [
  {
    "id": "goi-co-doctorloan-f5",
    "name": "Gối cổ sáng chế DoctorLoan F5",
    "price": 4312000,
    "currency": "VND",
    "image_url": "https://hongcotsong.com/wp-content/uploads/2024/08/1767624348098-149351903-goi-co-doctorloan-f5-1-scaled.jpg",
    "video_url": "",
    "buy_url": "https://hongcotsong.com/san-pham/goi-co-sang-che-doctorloan-f5/",
    "description": "<p>Gối cổ sáng chế DOCTORLOAN F5 bảo vệ đường cong sinh lý và nắn chỉnh sai lệch đột sống cổ</p>\n<p>ĐẶC ĐIỂM CỦA SẢN PHẨM</p>\n<p>Đây là sản phẩm có công dụng hỗ trợ điều trị và ngăn ngừa các bệnh cột sống cổ (thoát vị đĩa đệm, cong, vẹo, trật, trượt, thoái hóa, vôi hóa, gai xương), giúp điều chỉnh cột sống cổ trở lại trạng thái khỏe mạnh bình thường.</p>\n<p>– Phần đầu thấp (9cm): Bảo vệ cấu trúc tự nhiên cột sống cổ ở cả tư thế nằm ngừa và nằm nghiêng. Với chất liệu mút có tỷ trọng rất cao nên có độ đàn hồi tốt, không bị xẹp lún, giữ đúng cấu trúc cổ trong suốt đêm khi ngủ. Phòng ngừa bệnh cột sống cổ, tạo giấc ngủ sâu, ngăn chặn bệnh mất ngủ. Dùng để ngủ, nghỉ ngơi và thư giãn</p>\n<p>– Phần đầu cao (13cm): Có chứa một lõi cứng, không bị biến dạng dưới ảnh hưởng của trọng lực đè lên của cơ thể. Gối được thiết kế với độ dốc, chiều cao, chiều rộng bảo đảm việc sử dụng chính sức nặng của cơ thể để đẩy cột sống cổ về cấu trúc uốn cong và các đột sống trở lại vị trí bình thường. Kê 15- 30 phút mỗi lần. Mỗi ngày có thể kê nhiều lần</p>\n<p>CÔNG DỤNG: Dùng đề giảm, mất dần và mất đi các triệu chứng như:</p>\n<p>– Đau đầu, mệt mỏi, làm việc thiếu tập trung.</p>\n<p>– Thiếu máu lên não, hoa mắt, chóng mặt, ù tai.</p>\n<p>– Mờ mắt, méo mặt, méo mồm, suy giảm thính lực – Đau, tê, cứng, mỏi cổ vai gáy</p>\n<p>– Đau vai, đau cánh tay; đau cổ tay, bàn tay, ngón tay.</p>\n<p>Hỗ trợ điều trị và ngăn ngừa các bệnh cột sống cổ:</p>\n<p>– Thoát vị đĩa đệm</p>\n<p>– Cong, vẹo, trật, trượt đốt sống</p>\n<p>– Thoái hóa, vôi hóa, gai xương</p>\n<p>– Giúp tạo hình lại đường cong sinh lý cổ, điều chỉnh cột sống cổ trở lại trạng thái khỏe mạnh bình thường</p>\n<p>• CHẤT LIỆU:</p>\n<p>– Ruột được làm từ PU foam.</p>\n<p>– Lõi gối làm từ EPS foam hoặc PU đặc biệt</p>\n<p>– Vỏ bọc gối được làm từ vải kate thoáng mát mềm mịn</p>\n<p>– Chịu lực lên đến 100 kg</p>\n<p>KÍCH THƯỚC</p>\n<p>– Dài x Rộng x Cao: 40 x 40 x 9/13 (cm)</p>\n<p>– Khối lượng: 1 kg</p>\n<p>BẢO HÀNH</p>\n<p>-Ruột gối: 1 năm Lõi gối: 1 năm</p>\n<p>-Vỏ gối: Không bảo hành.</p>",
    "published": true,
    "sort_order": 1,
    "button_label": "Đặt mua ngay",
    "button_class": "",
    "video_button_label": "",
    "video_button_class": "",
    "display_layout": "card",
    "badge_label": "Gối sáng chế",
    "gallery_urls": "https://hongcotsong.com/wp-content/uploads/2024/08/1768140456609-981819061-goi-co-doctorloan-f5-2-scaled.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1768140459224-381383911-goi-co-doctorloan-f5-3-scaled.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1768140464846-551561386-goi-co-doctorloan-f5-5-scaled.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1768140468875-866481899-goi-co-doctorloan-f5-6-scaled.jpg",
    "chat_button_label": "Chat tư vấn",
    "chat_button_url": "",
    "chat_button_class": "open-chat-trigger"
  },
  {
    "id": "goi-co-doctorloan-f4",
    "name": "Gối cổ sáng chế DoctorLoan F4",
    "price": 7624000,
    "currency": "VND",
    "image_url": "https://hongcotsong.com/wp-content/uploads/2024/08/1767577003250-674779022-goi-co-doctorloan-f4-1-scaled.jpg",
    "video_url": "",
    "buy_url": "https://hongcotsong.com/san-pham/goi-co-sang-che-doctorloan-f4/",
    "description": "<p>Gối cổ sáng chế DOCTORLOAN F4 bảo vệ đường cong sinh lý và nắn chỉnh sai lệch đột sống cổ</p>\n<p>ĐẶC ĐIỂM CỦA SẢN PHẨM</p>\n<p>Đây là sản phẩm có công dụng hỗ trợ điều trị và ngăn ngừa các bệnh cột sống cổ (thoát vị đĩa đệm, cong, vẹo, trật, trượt, thoái hóa, vôi hóa, gai xương), giúp điều chỉnh cột sống cổ trở lại trạng thái khỏe mạnh bình thường.</p>\n<p>– Phần đầu thấp (9cm): Bảo vệ cấu trúc tự nhiên cột sống cổ ở cả tư thế nằm ngừa và nằm nghiêng. Với chất liệu mút có tỷ trọng rất cao nên có độ đàn hồi tốt, không bị xẹp lún, giữ đúng cấu trúc cổ trong suốt đêm khi ngủ. Phòng ngừa bệnh cột sống cổ, tạo giấc ngủ sâu, ngăn chặn bệnh mất ngủ. Dùng để ngủ, nghỉ ngơi và thư giãn</p>\n<p>– Phần đầu cao (13cm): Có chứa một lõi cứng, không bị biến dạng dưới ảnh hưởng của trọng lực đè lên của cơ thể. Gối được thiết kế với độ dốc, chiều cao, chiều rộng bảo đảm việc sử dụng chính sức nặng của cơ thể để đẩy cột sống cổ về cấu trúc uốn cong và các đột sống trở lại vị trí bình thường. Kê 15- 30 phút mỗi lần. Mỗi ngày có thể kê nhiều lần</p>\n<p>CÔNG DỤNG: Dùng đề giảm, mất dần và mất đi các triệu chứng như:</p>\n<p>– Đau đầu, mệt mỏi, làm việc thiếu tập trung.</p>\n<p>– Thiếu máu lên não, hoa mắt, chóng mặt, ù tai.</p>\n<p>– Mờ mắt, méo mặt, méo mồm, suy giảm thính lực – Đau, tê, cứng, mỏi cổ vai gáy</p>\n<p>– Đau vai, đau cánh tay; đau cổ tay, bàn tay, ngón tay.</p>\n<p>Hỗ trợ điều trị và ngăn ngừa các bệnh cột sống cổ:</p>\n<p>– Thoát vị đĩa đệm</p>\n<p>– Cong, vẹo, trật, trượt đốt sống</p>\n<p>– Thoái hóa, vôi hóa, gai xương</p>\n<p>– Giúp tạo hình lại đường cong sinh lý cổ, điều chỉnh cột sống cổ trở lại trạng thái khỏe mạnh bình thường</p>\n<p>• CHẤT LIỆU:</p>\n<p>– Ruột được làm từ PU foam.</p>\n<p>– Lõi gối làm từ EPS foam hoặc PU đặc biệt</p>\n<p>– Vỏ bọc gối được làm từ vải kate thoáng mát mềm mịn</p>\n<p>– Chịu lực lên đến 100 kg</p>\n<p>KÍCH THƯỚC</p>\n<p>– Dài x Rộng x Cao: 40 x 40 x 9/13 (cm)</p>\n<p>– Khối lượng: 1 kg</p>\n<p>BẢO HÀNH</p>\n<p>-Ruột gối: 1 năm Lõi gối: 1 năm</p>\n<p>-Vỏ gối: Không bảo hành.</p>",
    "published": true,
    "sort_order": 2,
    "button_label": "Đặt mua ngay",
    "button_class": "",
    "video_button_label": "",
    "video_button_class": "",
    "display_layout": "card",
    "badge_label": "Gối sáng chế",
    "gallery_urls": "https://hongcotsong.com/wp-content/uploads/2024/08/1767577012969-211026264-goi-co-doctorloan-f4-2-scaled.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1768140497963-707220928-goi-co-doctorloan-f4-3-scaled.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1768140500895-370706163-goi-co-doctorloan-f4-4-scaled.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1768140503751-489860843-goi-co-doctorloan-f4-5-scaled.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1768140506945-505448298-goi-co-doctorloan-f4-6-scaled.jpg",
    "chat_button_label": "Chat tư vấn",
    "chat_button_url": "",
    "chat_button_class": "open-chat-trigger"
  },
  {
    "id": "goi-co-doctorloan-f6",
    "name": "Gối cổ sáng chế DoctorLoan F6",
    "price": 7049000,
    "currency": "VND",
    "image_url": "https://hongcotsong.com/wp-content/uploads/2024/08/1767624241501-394241632-goi-co-doctorloan-f6-0-scaled.jpg",
    "video_url": "",
    "buy_url": "https://hongcotsong.com/san-pham/goi-co-sang-che-doctorloan-f6/",
    "description": "<p>Gối cổ sáng chế DOCTORLOAN F6 bảo vệ đường cong sinh lý và nắn chỉnh sai lệch đột sống cổ</p>\n<p>ĐẶC ĐIỂM CỦA SẢN PHẨM</p>\n<p>Đây là sản phẩm có công dụng hỗ trợ điều trị và ngăn ngừa các bệnh cột sống cổ (thoát vị đĩa đệm, cong, vẹo, trật, trượt, thoái hóa, vôi hóa, gai xương), giúp điều chỉnh cột sống cổ trở lại trạng thái khỏe mạnh bình thường.</p>\n<p>– Phần đầu thấp (9cm): Bảo vệ cấu trúc tự nhiên cột sống cổ ở cả tư thế nằm ngừa và nằm nghiêng. Với chất liệu mút có tỷ trọng rất cao nên có độ đàn hồi tốt, không bị xẹp lún, giữ đúng cấu trúc cổ trong suốt đêm khi ngủ. Phòng ngừa bệnh cột sống cổ, tạo giấc ngủ sâu, ngăn chặn bệnh mất ngủ. Dùng để ngủ, nghỉ ngơi và thư giãn</p>\n<p>– Phần đầu cao (13cm): Có chứa một lõi cứng, không bị biến dạng dưới ảnh hưởng của trọng lực đè lên của cơ thể. Gối được thiết kế với độ dốc, chiều cao, chiều rộng bảo đảm việc sử dụng chính sức nặng của cơ thể để đẩy cột sống cổ về cấu trúc uốn cong và các đột sống trở lại vị trí bình thường. Kê 15- 30 phút mỗi lần. Mỗi ngày có thể kê nhiều lần</p>\n<p>CÔNG DỤNG: Dùng đề giảm, mất dần và mất đi các triệu chứng như:</p>\n<p>– Đau đầu, mệt mỏi, làm việc thiếu tập trung.</p>\n<p>– Thiếu máu lên não, hoa mắt, chóng mặt, ù tai.</p>\n<p>– Mờ mắt, méo mặt, méo mồm, suy giảm thính lực – Đau, tê, cứng, mỏi cổ vai gáy</p>\n<p>– Đau vai, đau cánh tay; đau cổ tay, bàn tay, ngón tay.</p>\n<p>Hỗ trợ điều trị và ngăn ngừa các bệnh cột sống cổ:</p>\n<p>– Thoát vị đĩa đệm</p>\n<p>– Cong, vẹo, trật, trượt đốt sống</p>\n<p>– Thoái hóa, vôi hóa, gai xương</p>\n<p>– Giúp tạo hình lại đường cong sinh lý cổ, điều chỉnh cột sống cổ trở lại trạng thái khỏe mạnh bình thường</p>\n<p>• CHẤT LIỆU:</p>\n<p>– Ruột được làm từ PU foam.</p>\n<p>– Lõi gối làm từ EPS foam hoặc PU đặc biệt</p>\n<p>– Vỏ bọc gối được làm từ vải kate thoáng mát mềm mịn</p>\n<p>– Chịu lực lên đến 100 kg</p>\n<p>KÍCH THƯỚC</p>\n<p>– Dài x Rộng x Cao: 40 x 40 x 9/13 (cm)</p>\n<p>– Khối lượng: 1 kg</p>\n<p>BẢO HÀNH</p>\n<p>-Ruột gối: 1 năm Lõi gối: 1 năm</p>\n<p>-Vỏ gối: Không bảo hành.</p>",
    "published": true,
    "sort_order": 3,
    "button_label": "Đặt mua ngay",
    "button_class": "",
    "video_button_label": "",
    "video_button_class": "",
    "display_layout": "card",
    "badge_label": "Gối sáng chế",
    "gallery_urls": "https://hongcotsong.com/wp-content/uploads/2024/08/1768140476127-803637101-goi-co-doctorloan-f6-2-scaled.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1768140478988-600179260-goi-co-doctorloan-f6-3-scaled.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1768140482313-129339749-goi-co-doctorloan-f6-4-scaled.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1768140485758-827880909-goi-co-doctorloan-f6-5-scaled.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1768140488169-266575898-goi-co-doctorloan-f6-6-scaled.jpg",
    "chat_button_label": "Chat tư vấn",
    "chat_button_url": "",
    "chat_button_class": "open-chat-trigger"
  },
  {
    "id": "goi-lung-doctorloan-f1",
    "name": "Gối lưng sáng chế DoctorLoan F1 (Gối Dài)",
    "price": 1868000,
    "currency": "VND",
    "image_url": "https://hongcotsong.com/wp-content/uploads/2024/08/1767624564646-522408653-goi-lung-doctorloan-f1-1-scaled.jpg",
    "video_url": "",
    "buy_url": "https://hongcotsong.com/san-pham/goi-lung-sang-che-doctorloan-f1-goi-dai/",
    "description": "<p>Gối lưng sáng chế DoctorLoan F1 giúp bảo vệ và nắn chỉnh lại các sai lệch đốt sống lưng, ngực</p>\n<p>ĐẶC ĐIỂM</p>\n<p>– Đây là sản phẩm có công dụng hỗ trợ điều trị và ngăn ngừa các bệnh cột sống lưng (thoát vị đĩa đệm, cong, vẹo, trật, trượt, thoái hóa, vôi hóa, gai xương, mất đường cong sinh lý), giúp điều chỉnh cột sống lưng, cột sống ngực trở lại trạng thái khỏe mạnh bình thường.</p>\n<p>– Phần lõi của gối có tính chịu sức ép cao, không biến đổi hình dạng dưới lực đè mạnh. Khi nằm lên gối sẽ sử dụng chính sức nặng cơ thể để nắn chỉnh, tạo hình lại đường cong sinh lý lưng và ngực, nắn chỉnh các đốt sống lưng, ngực trở về vị trí bình thường.</p>\n<p>– Gối giúp giảm các triệu chứng đau, nhức, mỏi, tê vùng ngực – lưng. Cải thiện hiệu quả với những người bị thoái hoá đốt sống lưng, thoát vị đĩa đệm, cong vẹo cột sống, mất đường cong sinh lý đốt sống lưng.</p>\n<p>CÔNG DỤNG: Giúp giảm nhanh các triệu chứng</p>\n<p>– Đau cấp tính thắt lưng, mông, chân khi vận động sai tư thế</p>\n<p>– Đau lưng dữ dội hoặc âm ỉ kéo dài do: đau thần kinh toạ, đau thoát vị đĩa đệm cột sống lưng, trật vẹo cột sống thắt lưng</p>\n<p>– Đau/ nhói ngực, khó thở do biến đổi cấu trúc cột sống ngực</p>\n<p>– Đau do xương chậu và xương cùng bị biến dạng do nằm sai tư thế trong sinh hoạt hằng ngày</p>\n<p>– Tê / buốt/ mất cảm giác chân, ngón chân</p>\n<p>ĐỐI TƯỢNG SỬ DỤNG Gối lưng sáng chế DOCTORLOAN F1 dành cho mọi đối tượng từ trẻ em đến người già. Gối có chiều cao thấp nên nắn chỉnh chậm và an toàn. Phù hợp với cả những người đã từng phẫu thuật.</p>\n<p>CÁCH SỬ DỤNG</p>\n<p>– Kê lưng qua đêm khi ngủ.</p>\n<p>– Kê lưng khi tập thể hình. Kê lưng khi đi tàu xe, máy bay.</p>\n<p>CHẤT LIỆU</p>\n<p>– Ruột được làm từ PU foam</p>\n<p>– Lõi gối làm từ EPS foam hoặc PU đặc biệt</p>\n<p>– Vỏ bọc gối được làm từ vải kate thoáng mát mềm mịn</p>\n<p>– Chịu lực lên đến 100 kg KÍCH THƯỚC</p>\n<p>– Gối ngắn (Size S): 40 x 15 x 7 (cm). Khối lượng: 0,3 kg</p>\n<p>– Gối dài dài (Size L): 50 x 15 x 7 (cm). Khối lượng: 0,3 kg</p>\n<p>BẢO HÀNH</p>\n<p>– Ruột gối và lõi gối: 1 năm</p>\n<p>– Vỏ gối: Không bảo hành</p>",
    "published": true,
    "sort_order": 4,
    "button_label": "Đặt mua ngay",
    "button_class": "",
    "video_button_label": "",
    "video_button_class": "",
    "display_layout": "card",
    "badge_label": "Gối sáng chế",
    "gallery_urls": "https://hongcotsong.com/wp-content/uploads/2024/08/1768140380180-979017498-goi-lung-doctorloan-f1-2-scaled.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1768140382557-153705806-goi-lung-doctorloan-f1-3-scaled.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1768140389731-278672171-goi-lung-doctorloan-f1-4-1-scaled.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1768833493819-989924893-goi-lung-doctorloan-f1-5-scaled.jpg",
    "chat_button_label": "Chat tư vấn",
    "chat_button_url": "",
    "chat_button_class": "open-chat-trigger"
  },
  {
    "id": "goi-lung-doctorloan-f3",
    "name": "Gối lưng sáng chế DoctorLoan F3",
    "price": 3737000,
    "currency": "VND",
    "image_url": "https://hongcotsong.com/wp-content/uploads/2024/08/1767624380299-768343988-goi-lung-doctorloan-f3-1-scaled.jpg",
    "video_url": "",
    "buy_url": "https://hongcotsong.com/san-pham/goi-lung-sang-che-doctorloan-f3/",
    "description": "<p>Gối lưng sáng chế DoctorLoan F3 giúp bảo vệ và nắn chỉnh lại các sai lệch đốt sống lưng, ngực</p>\n<p>ĐẶC ĐIỂM</p>\n<p>– Đây là sản phẩm có công dụng hỗ trợ điều trị và ngăn ngừa các bệnh cột sống lưng (thoát vị đĩa đệm, cong, vẹo, trật, trượt, thoái hóa, vôi hóa, gai xương, mất đường cong sinh lý), giúp điều chỉnh cột sống lưng, cột sống ngực trở lại trạng thái khỏe mạnh bình thường.</p>\n<p>– Phần lõi của gối có tính chịu sức ép cao, không biến đổi hình dạng dưới lực đè mạnh. Khi nằm lên gối sẽ sử dụng chính sức nặng cơ thể để nắn chỉnh, tạo hình lại đường cong sinh lý lưng và ngực, nắn chỉnh các đốt sống lưng, ngực trở về vị trí bình thường.</p>\n<p>– Gối giúp giảm các triệu chứng đau, nhức, mỏi, tê vùng ngực – lưng. Cải thiện hiệu quả với những người bị thoái hoá đốt sống lưng, thoát vị đĩa đệm, cong vẹo cột sống, mất đường cong sinh lý đốt sống lưng.</p>\n<p>CÔNG DỤNG: Giúp giảm nhanh các triệu chứng</p>\n<p>– Đau cấp tính thắt lưng, mông, chân khi vận động sai tư thế</p>\n<p>– Đau lưng dữ dội hoặc âm ỉ kéo dài do: đau thần kinh toạ, đau thoát vị đĩa đệm cột sống lưng, trật vẹo cột sống thắt lưng</p>\n<p>– Đau/ nhói ngực, khó thở do biến đổi cấu trúc cột sống ngực</p>\n<p>– Đau do xương chậu và xương cùng bị biến dạng do nằm sai tư thế trong sinh hoạt hằng ngày</p>\n<p>– Tê / buốt/ mất cảm giác chân, ngón chân</p>\n<p>ĐỐI TƯỢNG SỬ DỤNG</p>\n<p>Gối lưng sáng chế DOCTORLOAN F4 dành cho mọi đối tượng ngoại trừ người già bị loãng xương. Những trường hợp đặc biệt (đã từng mổ thay đĩa đệm, bắt vít cột sống) phải có chỉ định của bác sĩ.</p>\n<p>CÁCH SỬ DỤNG Kê lưng 20 phút mỗi lần, một ngày 3-4 lần.</p>\n<p>CHẤT LIỆU</p>\n<p>– Ruột được làm từ PU foam</p>\n<p>– Lõi gối làm từ EPS foam hoặc PU đặc biệt</p>\n<p>– Vỏ bọc gối được làm từ vải kate thoáng mát mềm mịn</p>\n<p>– Chịu lực lên đến 100 kg</p>\n<p>KÍCH THƯỚC</p>\n<p>– Dài x rộng x cao: 48 x 25 x 10,5 (cm)</p>\n<p>– Khối lượng: 0,5 kg</p>\n<p>BẢO HÀNH</p>\n<p>– Ruột gối và lõi gối: 1 năm</p>\n<p>– Vỏ gối: Không bảo hành</p>",
    "published": true,
    "sort_order": 5,
    "button_label": "Đặt mua ngay",
    "button_class": "",
    "video_button_label": "",
    "video_button_class": "",
    "display_layout": "card",
    "badge_label": "Gối sáng chế",
    "gallery_urls": "https://hongcotsong.com/wp-content/uploads/2024/08/1768140445042-521234568-goi-lung-doctorloan-f3-5-scaled.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1768140438213-336026561-goi-lung-doctorloan-f3-2-scaled.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1768140440646-713627241-goi-lung-doctorloan-f3-3-scaled.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1768140443068-271317917-goi-lung-doctorloan-f3-4-scaled.jpg",
    "chat_button_label": "Chat tư vấn",
    "chat_button_url": "",
    "chat_button_class": "open-chat-trigger"
  },
  {
    "id": "goi-lung-doctorloan-f4",
    "name": "Gối lưng sáng chế DoctorLoan F4",
    "price": 3737000,
    "currency": "VND",
    "image_url": "https://hongcotsong.com/wp-content/uploads/2024/08/1768140408734-365136374-goi-lung-doctorloan-f4-1-scaled.jpg",
    "video_url": "",
    "buy_url": "https://hongcotsong.com/san-pham/goi-lung-sang-che-doctorloan-f4/",
    "description": "<p>Gối lưng sáng chế DoctorLoan F4 giúp bảo vệ và nắn chỉnh lại các sai lệch đốt sống lưng, ngực</p>\n<p>ĐẶC ĐIỂM</p>\n<p>– Đây là sản phẩm có công dụng hỗ trợ điều trị và ngăn ngừa các bệnh cột sống lưng (thoát vị đĩa đệm, cong, vẹo, trật, trượt, thoái hóa, vôi hóa, gai xương, mất đường cong sinh lý), giúp điều chỉnh cột sống lưng, cột sống ngực trở lại trạng thái khỏe mạnh bình thường.</p>\n<p>– Phần lõi của gối có tính chịu sức ép cao, không biến đổi hình dạng dưới lực đè mạnh. Khi nằm lên gối sẽ sử dụng chính sức nặng cơ thể để nắn chỉnh, tạo hình lại đường cong sinh lý lưng và ngực, nắn chỉnh các đốt sống lưng, ngực trở về vị trí bình thường.</p>\n<p>– Gối giúp giảm các triệu chứng đau, nhức, mỏi, tê vùng ngực – lưng. Cải thiện hiệu quả với những người bị thoái hoá đốt sống lưng, thoát vị đĩa đệm, cong vẹo cột sống, mất đường cong sinh lý đốt sống lưng.</p>\n<p>CÔNG DỤNG: Giúp giảm nhanh các triệu chứng</p>\n<p>– Đau cấp tính thắt lưng, mông, chân khi vận động sai tư thế</p>\n<p>– Đau lưng dữ dội hoặc âm ỉ kéo dài do: đau thần kinh toạ, đau thoát vị đĩa đệm cột sống lưng, trật vẹo cột sống thắt lưng</p>\n<p>– Đau/ nhói ngực, khó thở do biến đổi cấu trúc cột sống ngực</p>\n<p>– Đau do xương chậu và xương cùng bị biến dạng do nằm sai tư thế trong sinh hoạt hằng ngày</p>\n<p>– Tê / buốt/ mất cảm giác chân, ngón chân</p>\n<p>ĐỐI TƯỢNG SỬ DỤNG</p>\n<p>Gối lưng sáng chế DOCTORLOAN F4 dành cho mọi đối tượng ngoại trừ người già bị loãng xương. Những trường hợp đặc biệt (đã từng mổ thay đĩa đệm, bắt vít cột sống) phải có chỉ định của bác sĩ.</p>\n<p>CÁCH SỬ DỤNG Kê lưng 20 phút mỗi lần, một ngày 3-4 lần.</p>\n<p>CHẤT LIỆU</p>\n<p>– Ruột được làm từ PU foam</p>\n<p>– Lõi gối làm từ EPS foam hoặc PU đặc biệt</p>\n<p>– Vỏ bọc gối được làm từ vải kate thoáng mát mềm mịn</p>\n<p>– Chịu lực lên đến 100 kg</p>\n<p>KÍCH THƯỚC</p>\n<p>– Dài x rộng x cao: 48 x 25 x 10,5 (cm)</p>\n<p>– Khối lượng: 0,5 kg</p>\n<p>BẢO HÀNH</p>\n<p>– Ruột gối và lõi gối: 1 năm</p>\n<p>– Vỏ gối: Không bảo hành</p>",
    "published": true,
    "sort_order": 6,
    "button_label": "Đặt mua ngay",
    "button_class": "",
    "video_button_label": "",
    "video_button_class": "",
    "display_layout": "card",
    "badge_label": "Gối sáng chế",
    "gallery_urls": "https://hongcotsong.com/wp-content/uploads/2024/08/1768140419864-514756467-goi-lung-doctorloan-f4-4-scaled.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1768140411610-502332487-goi-lung-doctorloan-f4-2-1-scaled.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1768140414551-726188349-goi-lung-doctorloan-f4-2-scaled.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1768140417023-50306941-goi-lung-doctorloan-f4-3-scaled.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1768140422559-802203686-goi-lung-doctorloan-f4-5-scaled.jpg",
    "chat_button_label": "Chat tư vấn",
    "chat_button_url": "",
    "chat_button_class": "open-chat-trigger"
  },
  {
    "id": "ghe-doctorloan-n85-chan-ngan",
    "name": "Ghế sáng chế DoctorLoan N85 (Chân Ngắn)",
    "price": 2127000,
    "currency": "VND",
    "image_url": "https://hongcotsong.com/wp-content/uploads/2024/08/1767625485274-276617036-ghe-doctorloan-N85-1-scaled.jpg",
    "video_url": "",
    "buy_url": "https://hongcotsong.com/san-pham/ghe-sang-che-doctorloan-n85-chan-ngan/",
    "description": "<p>Ghế sáng chế DoctorLoan N85 giữ dáng ngồi chuẩn, bảo vệ cấu trúc cột sống</p>\n<p>ĐẶC ĐIỂM:</p>\n<p>-Ghế Sáng chế DOCTORLOAN N85 là giải pháp điều chỉnh xương chậu luôn ở tư thế thẳng và cân xứng khi ngồi, từ đó bảo vệ cột sống trong hình dạng tốt nhất cho nhiều đối tượng khác nhau.</p>\n<p>-Với những người đã bị biến dạng cột sống hoặc bệnh vẹo cột sống bẩm sinh thì ghế sáng chế DOCTORLOAN N85 ngăn chặn yêu tố gây tiến triển nặng của bệnh bởi cơ chế ÔM CHẶT</p>\n<p>-GIỮ CHUẨN</p>\n<p>– CHỐNG TRƯỢT. THIẾT KẾ VƯỢT TRỘI</p>\n<p>-Thiết kế lưng ghế: Độ ngả của lưng ghế theo đường cong tự nhiên của cột sống, giúp người ngồi đúng tư thế thẳng mà vẫn có điểm tựa thoải mái. Trụ lưng ghế vững chắc nhờ những đường gân gia cường giúp ghế bền chắc với thời gian.</p>\n<p>-Thiết kế mặt ghế: “Phần lồi phía trước mặt ghế” giữ cho xương chậu thẳng đứng, không bị trượt đổ nghiêng (hiện tượng ngồi trượt mông ra trước). Xương chậu được ví như móng nhà trong cơ thể, khi xương chậu bị đổ nghiêng sẽ gây ra biến dạng cột sống, tăng sức ép trên đĩa đệm gây thoát vị đĩa đệm.</p>\n<p>-Thiết kế lồi ở phần lưng, lõm ở phần mông và phần lồi ở mặt ghế tạo ra khối cấu trúc LOCK – HOLD ÔM CHẶT – GIỮ CHUẨN – CHỐNG TRƯỢT.</p>\n<p>-Kích thước mặt ghế là 35cm, ngắn hơn ghế thông thường: đây là một điểm khác biệt có ưu thế giúp áp chặt lưng vào khối ÔM CHẶT – GIỮ CHUẢN – CHỐNG TRƯỢT. Thích hợp với chiều cao khác nhau của nhiều người, giúp hai chân đặt vững trên mặt đất.</p>\n<p>TÁC DỤNG SẢN PHẨM</p>\n<p>-Dùng để ngồi làm việc, học tập, sinh hoạt hàng ngày. Đồng thời có tác dụng ĐIỀU CHỈNH XƯƠNG CHẬU, XƯƠNG CÙNG, XƯƠNG SỐNG VỀ HÌNH DẠNG BÌNH THƯỜNG.</p>\n<p>-Hiệu quả khi sử dụng: Phòng ngừa LỆCH VẸO và các bệnh cột sống phát sinh do ngồi sai tư thế.</p>\n<p>-Ghế ngồi sáng chế DOCTORLOAN N85 cần thiết cho mọi người, mọi lúc, mọi nơi, trong sinh hoạt hằng ngày nhằm phòng ngừa bệnh cột sống do ngồi sai tư thế.</p>\n<p>-Sản phẩm phù hợp sử dụng ở mọi nơi như trong gia đình, bệnh viện, phòng khám, trường học, sân bay, văn phòng làm việc và ngoài trời (sân vận động, trạm xe buýt, ). CHẤT LIỆU: -Nhựa PP nguyên sinh 100%</p>\n<p>-Khả năng chịu lực lên đến 150 kg</p>\n<p>BẢO HÀNH:</p>\n<p>-Chân ghế: 3 năm</p>\n<p>-Thân ghế: 3 năm -Màu sắc: 1 năm theo tiêu chuẩn nhà sản xuất CÁCH CHỌN CHÂN GHẾ N85</p>\n<p>– Ghế chân ngắn: dành cho người cao 1m45-1m75 ngồi với bàn 75cm. Nếu cao dưới 1m45 cần có bàn nâng hạ chiều cao</p>\n<p>– Ghế chân dài: dành cho người cao trên 1m75 và cao dưới 1m45 ngồi với bàn cố định 75cm.</p>",
    "published": true,
    "sort_order": 7,
    "button_label": "Đặt mua ngay",
    "button_class": "",
    "video_button_label": "",
    "video_button_class": "",
    "display_layout": "card",
    "badge_label": "Ghế sáng chế",
    "gallery_urls": "https://hongcotsong.com/wp-content/uploads/2024/08/1768140196380-790395769-ghe-doctorloan-N85-2-scaled.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1768140199100-761249413-ghe-doctorloan-N85-3-scaled.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1768140202131-796146365-ghe-doctorloan-N85-4-scaled.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1768140204796-669319825-ghe-doctorloan-N85-5-scaled.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1768140207980-580567712-ghe-doctorloan-N85-6-scaled.jpg",
    "chat_button_label": "Chat tư vấn",
    "chat_button_url": "",
    "chat_button_class": "open-chat-trigger"
  },
  {
    "id": "ghe-doctorloan-n85-chan-dai",
    "name": "Ghế sáng chế DoctorLoan N85 (Chân Dài)",
    "price": 2300000,
    "currency": "VND",
    "image_url": "https://hongcotsong.com/wp-content/uploads/2024/08/1768818007231-277978911-ghe-doctorloan-N85-1-scaled.jpg",
    "video_url": "",
    "buy_url": "https://hongcotsong.com/san-pham/dong-xuan-1ghe-sang-che-doctorloan-n85-chan-dai/",
    "description": "<p>Ghế sáng chế DoctorLoan N85 giữ dáng ngồi chuẩn, bảo vệ cấu trúc cột sống</p>\n<p>ĐẶC ĐIỂM:</p>\n<p>-Ghế Sáng chế DOCTORLOAN N85 là giải pháp điều chỉnh xương chậu luôn ở tư thế thẳng và cân xứng khi ngồi, từ đó bảo vệ cột sống trong hình dạng tốt nhất cho nhiều đối tượng khác nhau.</p>\n<p>-Với những người đã bị biến dạng cột sống hoặc bệnh vẹo cột sống bẩm sinh thì ghế sáng chế DOCTORLOAN N85 ngăn chặn yêu tố gây tiến triển nặng của bệnh bởi cơ chế ÔM CHẶT -GIỮ CHUẨN – CHỐNG TRƯỢT.</p>\n<p>THIẾT KẾ VƯỢT TRỘI</p>\n<p>-Thiết kế lưng ghế: Độ ngả của lưng ghế theo đường cong tự nhiên của cột sống, giúp người ngồi đúng tư thế thẳng mà vẫn có điểm tựa thoải mái. Trụ lưng ghế vững chắc nhờ những đường gân gia cường giúp ghế bền chắc với thời gian.</p>\n<p>-Thiết kế mặt ghế: “Phần lồi phía trước mặt ghế” giữ cho xương chậu thẳng đứng, không bị trượt đổ nghiêng (hiện tượng ngồi trượt mông ra trước). Xương chậu được ví như móng nhà trong cơ thể, khi xương chậu bị đổ nghiêng sẽ gây ra biến dạng cột sống, tăng sức ép trên đĩa đệm gây thoát vị đĩa đệm.</p>\n<p>-Thiết kế lồi ở phần lưng, lõm ở phần mông và phần lồi ở mặt ghế tạo ra khối cấu trúc LOCK – HOLD ÔM CHẶT – GIỮ CHUẨN – CHỐNG TRƯỢT.</p>\n<p>-Kích thước mặt ghế là 35cm, ngắn hơn ghế thông thường: đây là một điểm khác biệt có ưu thế giúp áp chặt lưng vào khối ÔM CHẶT – GIỮ CHUẢN – CHỐNG TRƯỢT. Thích hợp với chiều cao khác nhau của nhiều người, giúp hai chân đặt vững trên mặt đất.</p>\n<p>TÁC DỤNG SẢN PHẨM</p>\n<p>-Dùng để ngồi làm việc, học tập, sinh hoạt hàng ngày. Đồng thời có tác dụng ĐIỀU CHỈNH XƯƠNG CHẬU, XƯƠNG CÙNG, XƯƠNG SỐNG VỀ HÌNH DẠNG BÌNH THƯỜNG.</p>\n<p>-Hiệu quả khi sử dụng: Phòng ngừa LỆCH VẸO và các bệnh cột sống phát sinh do ngồi sai tư thế.</p>\n<p>-Ghế ngồi sáng chế DOCTORLOAN N85 cần thiết cho mọi người, mọi lúc, mọi nơi, trong sinh hoạt hằng ngày nhằm phòng ngừa bệnh cột sống do ngồi sai tư thế.</p>\n<p>-Sản phẩm phù hợp sử dụng ở mọi nơi như trong gia đình, bệnh viện, phòng khám, trường học, sân bay, văn phòng làm việc và ngoài trời (sân vận động, trạm xe buýt, ).</p>\n<p>CHẤT LIỆU:</p>\n<p>-Nhựa PP nguyên sinh 100%</p>\n<p>-Khả năng chịu lực lên đến 150 kg</p>\n<p>BẢO HÀNH:</p>\n<p>-Chân ghế: 3 năm</p>\n<p>-Thân ghế: 3 năm</p>\n<p>-Màu sắc: 1 năm theo tiêu chuẩn nhà sản xuất CÁCH CHỌN CHÂN GHẾ N85 – Ghế chân ngắn: dành cho người cao 1m45-1m75 ngồi với bàn 75cm. Nếu cao dưới 1m45 cần có bàn nâng hạ chiều cao</p>\n<p>– Ghế chân dài: dành cho người cao trên 1m75 và cao dưới 1m45 ngồi với bàn cố định 75cm.</p>",
    "published": true,
    "sort_order": 8,
    "button_label": "Đặt mua ngay",
    "button_class": "",
    "video_button_label": "",
    "video_button_class": "",
    "display_layout": "card",
    "badge_label": "Ghế sáng chế",
    "gallery_urls": "https://hongcotsong.com/wp-content/uploads/2024/08/1768818009691-285486739-ghe-doctorloan-N85-2-scaled.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1768818012323-28385882-ghe-doctorloan-N85-3-scaled.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1768818014879-728436465-ghe-doctorloan-N85-4-scaled.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1768818017040-468194579-ghe-doctorloan-N85-5-scaled.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1768818019761-260275311-ghe-doctorloan-N85-6-scaled.jpg",
    "chat_button_label": "Chat tư vấn",
    "chat_button_url": "",
    "chat_button_class": "open-chat-trigger"
  },
  {
    "id": "ghe-doctorloan-90t",
    "name": "Ghế sáng chế DoctorLoan 90T (Đệm Mỏng)",
    "price": 19699000,
    "currency": "VND",
    "image_url": "https://hongcotsong.com/wp-content/uploads/2024/08/1767625421018-411885121-ghe-doctorloan-90T-1-scaled.jpg",
    "video_url": "",
    "buy_url": "https://hongcotsong.com/san-pham/ghe-sang-che-doctorloan-90t-dem-mong/",
    "description": "<p>Dựa trên mô phỏng đường cong cột sống sống, ghế sáng chế DOCTORLOAN 90T được thiết kế với cấu trúc đặc biệt “LỒI TRƯỚC – LÕM SAU” tạo nên chức năng “ÔM CHẶT – GIỮ CHUẨN – CHỐNG TRƯỢT”. Lõi ghế làm từ chất liệu composite (sợi thuỷ tinh) dùng đóng vỏ tảu, máy bay nên siêu cứng giúp tạo ra lực phản hồi mang đến khả năng tự điều chỉnh cột sống dưới tác động của trọng lực cơ thể. Tạo giải pháp tối ưu để duy trì đường cong sinh lý cột sống lưng, xương cùng cụt, giữ xương chậu ở tư thế thẳng và cân đối, bảo vệ cột sống trong tình trạng tốt nhất.</p>\n<p>THIẾT KẾ</p>\n<p>“Vùng gờ thắt lưng” giúp nâng đỡ và tạo lực đẩy giúp cho cột sống có độ cong tự nhiên giảm áp lực trên đĩa đệm. Đồng thời lõi cứng giúp tạo lực phản hồi để nắn chỉnh các đốt sống trật/ trượt về vị trí đúng, nắn chỉnh tạo hình đường cong sinh lý tự nhiên của cột sống lưng.</p>\n<p>“Vùng hõm mặt ghế” giúp giữ vững cân đối khung chậu và xương cùng ở tư thế ngay ngắn khi ngồi. Đồng thời nắn chỉnh xương cùng cụt, cải thiện hiệu quả với tình trạng thoát vị đĩa đệm L5/S1 và thần kinh toạ.</p>\n<p>“Vùng gờ lồi trung tâm” giúp chống trượt mông khi ngồi. Đồng thời giữ cho xương chậu luôn được thẳng đứng. Xương chậu được ví như móng nhà. Khi xương chậu thẳng sẽ giúp giữ chuẩn toàn bộ cấu trúc cột sống bên trên.</p>\n<p>Ghế ngồi sáng chế DOCTORLOAN 90T giống như một khuôn ép sử dụng chính lực ép do trọng lượng cơ thể sinh ra để tác động lên toàn bộ khung xương cột sống, giữ chuẩn và điều chỉnh các chi tiết trượt/ trật về cấu trúc cân xứng.</p>\n<p>• CÔNG DỤNG: Giúp giảm nhanh các triệu chứng</p>\n<p>– Đau cấp tính thắt lưng, mông, chân khi vận động sai tư thế</p>\n<p>– Đau lưng dữ dội hoặc âm ỉ kéo dài do: đau thần kinh toạ, đau thoát vị đĩa đệm cột sống lưng, trật vẹo cột sống thắt lưng</p>\n<p>– Đau/ nhói ngực, khó thở do biến đổi cấu trúc cột sống ngực</p>\n<p>– Đau do xương chậu và xương cùng bị biến dạng do nằm sai tư thế trong sinh hoạt hằng ngày</p>\n<p>– Tê / buốt/ mất cảm giác chân, ngón chân Hỗ trợ điều trị và ngăn ngừa các bệnh cột sống cho mọi lứa tuổi</p>\n<p>– Gù lưng – Thoát vị đĩa đệm – Thoái hóa cột sống</p>\n<p>– Cong vẹo cột sống</p>\n<p>– Trượt đốt sống</p>\n<p>– Liệt tay, chân Hỗ trợ trong các trường hợp cột sống thắt lưng bị biến dạng, đang ở giai đoạn tiền phẫu hoặc hậu phẫu thuật</p>\n<p>• ĐỐI TƯỢNG SỬ DỤNG: Ghế sáng chế 90D phù hợp với tất cả mọi người, ưu tiên để ngồi làm việc văn phòng, máy tính, viết, ngồi nghỉ ngơi, thư giãn, đọc sách, xem tivi.</p>\n<p>CHẤT LIỆU</p>\n<p>– Vỏ ghế được bọc bởi da Simili</p>\n<p>– Lõi ghế làm từ Composite</p>\n<p>– Chân ghế cấu tạo từ hợp kim nhôm</p>\n<p>– Khả năng chịu lực lên đến 150kg</p>\n<p>• KÍCH THƯỚC: – Dài – rộng – cao: 50 x 46 x [103-108] (cm)</p>\n<p>– Khối lượng: 8,5 kg</p>\n<p>• BẢO HÀNH:</p>\n<p>– Phôi ghế Composite: 10 năm</p>\n<p>– Vỏ bọc Simili: 6 tháng</p>\n<p>– Ben ghế/ mâm ống: 6 tháng</p>",
    "published": true,
    "sort_order": 9,
    "button_label": "Đặt mua ngay",
    "button_class": "",
    "video_button_label": "",
    "video_button_class": "",
    "display_layout": "card",
    "badge_label": "Ghế sáng chế",
    "gallery_urls": "https://hongcotsong.com/wp-content/uploads/2024/08/1768140223955-98262924-ghe-doctorloan-90T-2-scaled.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1768140227095-167738158-ghe-doctorloan-90T-3-scaled.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1768140237216-700907529-ghe-doctorloan-90T-4-scaled.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1768140240481-443563212-ghe-doctorloan-90T-5-scaled.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1768140243895-443544352-ghe-doctorloan-90T-6-scaled.jpg",
    "chat_button_label": "Chat tư vấn",
    "chat_button_url": "",
    "chat_button_class": "open-chat-trigger"
  },
  {
    "id": "ghe-doctorloan-90d",
    "name": "Ghế sáng chế DoctorLoan 90D (Đệm Dày)",
    "price": 34937000,
    "currency": "VND",
    "image_url": "https://hongcotsong.com/wp-content/uploads/2024/08/1767625347313-807103995-ghe-doctorloan-90D-1-scaled.jpg",
    "video_url": "",
    "buy_url": "https://hongcotsong.com/san-pham/4469/",
    "description": "<p>Dựa trên mô phỏng đường cong cột sống sống, ghế sáng chế DOCTORLOAN 90D được thiết kế với cấu trúc “LỐI TRƯỚC – LÕM SAU” tạo nên chức năng “ÔM CHẶT – GIỮ CHUẨN – CHỐNG TRƯỢT”. Lõi ghế làm từ chất liệu composite (sợi thuỷ tinh) dùng đóng vỏ tảu, máy bay nên siêu cứng giúp tạo ra lực phản hồi mang đến khả năng tự điều chỉnh cột sống dưới tác động của trọng lực cơ thể. Tạo giải pháp tối ưu để duy trì đường cong sinh lý cột sống lưng, xương cùng cụt, giữ xương chậu ở tư thế thẳng và cân đối, bảo vệ cột sống trong tình trạng tốt nhất.</p>\n<p>THIẾT KẾ</p>\n<p>“Vùng gờ thắt lưng” giúp nâng đỡ và tạo lực đẩy giúp cho cột sống có độ cong tự nhiên giảm áp lực trên đĩa đệm. Đồng thời lõi cứng giúp tạo lực phản hồi để nắn chỉnh các đốt sống trật/ trượt về vị trí đúng, nắn chỉnh tạo hình đường cong sinh lý tự nhiên của cột sống lưng.</p>\n<p>“Vùng hõm mặt ghế” giúp giữ vững cân đối khung chậu và xương cùng ở tư thế ngay ngắn khi ngồi. Đồng thời nắn chỉnh xương cùng cụt, cải thiện hiệu quả với tình trạng thoát vị đĩa đệm L5/S1 và thần kinh toạ.</p>\n<p>“Vùng gờ lồi trung tâm” giúp chống trượt mông khi ngồi. Đồng thời giữ cho xương chậu luôn được thẳng đứng. Xương chậu được ví như móng nhà. Khi xương chậu thẳng sẽ giúp giữ chuẩn toàn bộ cấu trúc cột sống bên trên.</p>\n<p>Ghế ngồi sáng chế DOCTORLOAN 90T giống như một khuôn ép sử dụng chính lực ép do trọng lượng cơ thể sinh ra để tác động lên toàn bộ khung xương cột sống, giữ chuẩn và điều chỉnh các chi tiết trượt/ trật về cấu trúc cân xứng.</p>\n<p>• CÔNG DỤNG: Giúp giảm nhanh các triệu chứng</p>\n<p>– Đau cấp tính thắt lưng, mông, chân khi vận động sai tư thế</p>\n<p>– Đau lưng dữ dội hoặc âm ỉ kéo dài do: đau thần kinh toạ, đau thoát vị đĩa đệm cột sống lưng, trật vẹo cột sống thắt lưng</p>\n<p>– Đau/ nhói ngực, khó thở do biến đổi cấu trúc cột sống ngực</p>\n<p>– Đau do xương chậu và xương cùng bị biến dạng do nằm sai tư thế trong sinh hoạt hằng ngày</p>\n<p>– Tê / buốt/ mất cảm giác chân, ngón chân Hỗ trợ điều trị và ngăn ngừa các bệnh cột sống cho mọi lứa tuổi</p>\n<p>– Gù lưng – Thoát vị đĩa đệm – Thoái hóa cột sống</p>\n<p>– Cong vẹo cột sống</p>\n<p>– Trượt đốt sống</p>\n<p>– Liệt tay, chân Hỗ trợ trong các trường hợp cột sống thắt lưng bị biến dạng, đang ở giai đoạn tiền phẫu hoặc hậu phẫu thuật</p>\n<p>• ĐỐI TƯỢNG SỬ DỤNG: Ghế sáng chế 90D phù hợp với tất cả mọi người, ưu tiên để ngồi làm việc văn phòng, máy tính, viết, ngồi nghỉ ngơi, thư giãn, đọc sách, xem tivi.</p>\n<p>CHẤT LIỆU</p>\n<p>– Vỏ ghế được bọc bởi da Simili</p>\n<p>– Lõi ghế làm từ Composite</p>\n<p>– Chân ghế cấu tạo từ hợp kim nhôm</p>\n<p>– Khả năng chịu lực lên đến 150kg</p>\n<p>• KÍCH THƯỚC: – Dài – rộng – cao: 50 x 46 x [103-108] (cm)</p>\n<p>– Khối lượng: 8,5 kg</p>\n<p>• BẢO HÀNH:</p>\n<p>– Phôi ghế Composite: 10 năm</p>\n<p>– Vỏ bọc Simili: 6 tháng</p>\n<p>– Ben ghế/ mâm ống: 6 tháng</p>",
    "published": true,
    "sort_order": 10,
    "button_label": "Đặt mua ngay",
    "button_class": "",
    "video_button_label": "",
    "video_button_class": "",
    "display_layout": "card",
    "badge_label": "Ghế sáng chế",
    "gallery_urls": "https://hongcotsong.com/wp-content/uploads/2024/08/1768140309895-247593817-ghe-doctorloan-90D-2-scaled.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1768140312983-105642804-ghe-doctorloan-90D-3-scaled.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1768140315535-147315026-ghe-doctorloan-90D-4-scaled.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1768140318449-902680379-ghe-doctorloan-90D-5-scaled.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1768140320747-389093713-ghe-doctorloan-90D-6-scaled.jpg",
    "chat_button_label": "Chat tư vấn",
    "chat_button_url": "",
    "chat_button_class": "open-chat-trigger"
  },
  {
    "id": "ghe-doctorloan-95",
    "name": "Ghế sáng chế DoctorLoan 95",
    "price": 39249000,
    "currency": "VND",
    "image_url": "https://hongcotsong.com/wp-content/uploads/2024/08/1767625245640-463910034-ghe-doctorloan-95-1-scaled.jpg",
    "video_url": "",
    "buy_url": "https://hongcotsong.com/san-pham/ghe-sang-che-doctorloan-95/",
    "description": "<p>Dựa trên mô phỏng đường cong cột sống sống, ghế sáng chế DOCTORLOAN 95 được thiết kế với cấu trúc “LỒI TRƯỚC – LÕM SAU” tạo nên chức năng “ÔM CHẶT – GIỮ CHUẨN – CHỐNG TRƯỢT”. Lõi ghế làm từ chất liệu composite (sợi thuỷ tinh) dùng đóng vỏ tảu, máy bay nên siêu cứng giúp tạo ra lực phản hồi mang đến khả năng tự điều chỉnh cột sống dưới tác động của trọng lực cơ thể. Tạo giải pháp tối ưu để duy trì đường cong sinh lý cột sống lưng, xương cùng cụt, giữ xương chậu ở tư thế thẳng và cân đối, bảo vệ cột sống trong tình trạng tốt nhất.</p>\n<p>THIẾT KẾ</p>\n<p>“Vùng gờ thắt lưng” giúp nâng đỡ và tạo lực đẩy giúp cho cột sống có độ cong tự nhiên giảm áp lực trên đĩa đệm. Đồng thời lõi cứng giúp tạo lực phản hồi để nắn chỉnh các đốt sống trật/ trượt về vị trí đúng, nắn chỉnh tạo hình đường cong sinh lý tự nhiên của cột sống lưng.</p>\n<p>“Vùng hõm mặt ghế” giúp giữ vững cân đối khung chậu và xương cùng ở tư thế ngay ngắn khi ngồi. Đồng thời nắn chỉnh xương cùng cụt, cải thiện hiệu quả với tình trạng thoát vị đĩa đệm L5/S1 và thần kinh toạ.</p>\n<p>“Vùng gờ lồi trung tâm” giúp chống trượt mông khi ngồi. Đồng thời giữ cho xương chậu luôn được thẳng đứng. Xương chậu được ví như móng nhà. Khi xương chậu thẳng sẽ giúp giữ chuẩn toàn bộ cấu trúc cột sống bên trên.</p>\n<p>Ghế ngồi sáng chế DOCTORLOAN 90T giống như một khuôn ép sử dụng chính lực ép do trọng lượng cơ thể sinh ra để tác động lên toàn bộ khung xương cột sống, giữ chuẩn và điều chỉnh các chi tiết trượt/ trật về cấu trúc cân xứng.</p>\n<p>• CÔNG DỤNG: Giúp giảm nhanh các triệu chứng</p>\n<p>– Đau cấp tính thắt lưng, mông, chân khi vận động sai tư thế</p>\n<p>– Đau lưng dữ dội hoặc âm ỉ kéo dài do: đau thần kinh toạ, đau thoát vị đĩa đệm cột sống lưng, trật vẹo cột sống thắt lưng</p>\n<p>– Đau/ nhói ngực, khó thở do biến đổi cấu trúc cột sống ngực</p>\n<p>– Đau do xương chậu và xương cùng bị biến dạng do nằm sai tư thế trong sinh hoạt hằng ngày</p>\n<p>– Tê / buốt/ mất cảm giác chân, ngón chân Hỗ trợ điều trị và ngăn ngừa các bệnh cột sống cho mọi lứa tuổi</p>\n<p>– Gù lưng – Thoát vị đĩa đệm – Thoái hóa cột sống</p>\n<p>– Cong vẹo cột sống</p>\n<p>– Trượt đốt sống</p>\n<p>– Liệt tay, chân Hỗ trợ trong các trường hợp cột sống thắt lưng bị biến dạng, đang ở giai đoạn tiền phẫu hoặc hậu phẫu thuật</p>\n<p>• ĐỐI TƯỢNG SỬ DỤNG: Ghế sáng chế 90D phù hợp với tất cả mọi người, ưu tiên để ngồi làm việc văn phòng, máy tính, viết, ngồi nghỉ ngơi, thư giãn, đọc sách, xem tivi.</p>\n<p>CHẤT LIỆU</p>\n<p>– Vỏ ghế được bọc bởi da Simili</p>\n<p>– Lõi ghế làm từ Composite</p>\n<p>– Chân ghế cấu tạo từ hợp kim nhôm</p>\n<p>– Khả năng chịu lực lên đến 150kg</p>\n<p>• KÍCH THƯỚC: – Dài – rộng – cao: 50 x 46 x [103-108] (cm)</p>\n<p>– Khối lượng: 8,5 kg</p>\n<p>• BẢO HÀNH:</p>\n<p>– Phôi ghế Composite: 10 năm</p>\n<p>– Vỏ bọc Simili: 6 tháng</p>\n<p>– Ben ghế/ mâm ống: 6 tháng</p>",
    "published": true,
    "sort_order": 11,
    "button_label": "Đặt mua ngay",
    "button_class": "",
    "video_button_label": "",
    "video_button_class": "",
    "display_layout": "card",
    "badge_label": "Ghế sáng chế",
    "gallery_urls": "https://hongcotsong.com/wp-content/uploads/2024/08/1769510059222-392818248-ghe-doctorloan-95-2-scaled.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1769510062134-944276652-ghe-doctorloan-95-3-scaled.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1769510064920-292094931-ghe-doctorloan-95-4-scaled.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1769510067303-500229386-ghe-doctorloan-95-5-scaled.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1769510069675-267535634-ghe-doctorloan-95-6-scaled.jpg",
    "chat_button_label": "Chat tư vấn",
    "chat_button_url": "",
    "chat_button_class": "open-chat-trigger"
  },
  {
    "id": "ghe-doctorloan-135",
    "name": "Ghế sáng chế DoctorLoan 135",
    "price": 53762000,
    "currency": "VND",
    "image_url": "https://hongcotsong.com/wp-content/uploads/2024/08/1767625106166-637783990-ghe-doctorloan-135-1-scaled.jpg",
    "video_url": "",
    "buy_url": "https://hongcotsong.com/san-pham/ghe-sang-che-doctorloan-135/",
    "description": "<p>Dựa trên mô phỏng đường cong cột sống sống, ghế sáng chế DOCTORLOAN 150 được thiết kế với phần lồi phía trước, lõm phía sau và gờ lồi trung tâm tạo nên chức năng “ÔM CHẶT – GIỮ CHUẨN – CHỐNG TRƯỢT”. Lõi ghế làm từ chất liệu composite (sợi thuỷ tinh) dùng đóng vỏ tảu, máy bay nên siêu cứng giúp tạo ra lực phản hồi mang đến khả năng tự điều chỉnh cột sống dưới tác động của trọng lực cơ thể. Tạo giải pháp tối ưu để duy trì đường cong sinh lý cột sống cổ, ngực, lưng, xương cùng cụt và xương chậu. Giúp bảo vệ cột sống trong tình trạng tốt nhất.</p>\n<p>THIẾT KẾ:</p>\n<p>Ghế sáng chế DOCTORLOAN 150 được thiết kế đặc biệt với độ ngả 150˚, kết hợp với các đường cong LỒI TRƯỚC LÕM SAU uốn theo cấu trúc cong tự nhiên của cột sống giúp giảm sâu áp lực trên cột sống, đĩa đệm, khung xương. Đồng thời giúp nắn chỉnh các sai lệch đốt sống, tạo hình lại đường cong sinh lý. “Vùng đầu” lồi ra trước giúp nâng đỡ và nắn chỉnh Cột Sống Cổ ” Vùng ngực” lõm ra sau đúng theo cấu trúc cột sống ngực “Vùng gờ thắt lưng” giúp nâng đỡ và tạo lực đẩy giúp cho cột sống có độ cong tự nhiên giảm áp lực trên đĩa đệm. Đồng thời lõi cứng giúp tạo lực phản hồi để nắn chỉnh các đốt sống trật/ trượt về vị trí đúng, nắn chỉnh tạo hình đường cong sinh lý tự nhiên của cột sống lưng. “Vùng hõm mặt ghế” giúp giữ chuẩn cấu trúc khung chậu và xương cùng cụt ở tư thế ngay ngắn khi nằm. “Gờ lồi trung tâm” giúp chống trượt mông khi nằm.</p>\n<p>CÔNG DỤNG: Giúp giảm nhanh các triệu chứng</p>\n<p>– Đau cấp tính thắt lưng, mông, chân khi vận động sai tư thế</p>\n<p>– Đau lưng dữ dội hoặc âm ỉ kéo dài do: đau thần kinh toạ, đau thoát vị đĩa đệm cột sống lưng, trật vẹo cột sống thắt lưng</p>\n<p>– Đau/ nhói ngực, khó thở do biến đổi cấu trúc cột sống ngực</p>\n<p>– Đau do xương chậu và xương cùng bị biến dạng do nằm sai tư thế trong sinh hoạt hằng ngày</p>\n<p>– Tê / buốt/ mất cảm giác chân, ngón chân</p>\n<p>Hỗ trợ điều trị và ngăn ngừa các bệnh cột sống cho mọi lứa tuổi</p>\n<p>– Gù lưng</p>\n<p>– Thoát vị đĩa đệm</p>\n<p>– Thoái hóa cột sống</p>\n<p>– Cong vẹo cột sống</p>\n<p>– Trượt đốt sống</p>\n<p>– Liệt tay, chân</p>\n<p>– Hỗ trợ trong các trường hợp cột sống thắt lưng bị biến dạng, đang ở giai đoạn tiền phẫu hoặc hậu phẫu thuật</p>\n<p>• ĐỐI TƯỢNG SỬ DỤNG: Ghế sáng chế 150 phù hợp nằm nghỉ ngơi, thư giãn, đọc sách, xem tivi và ngủ trưa. Cả gia đình có thể cùng sử dụng</p>\n<p>• CHẤT LIỆU</p>\n<p>– Phôi ghế làm từ Composite, bọc Da smili</p>\n<p>– Phần đệm mặt ghế & lưng ghế được cấu tạo từ mút</p>\n<p>– Chân ghế làm từ Inox 304 – Tay vịn ghế: bên trong làm bằng gỗ được bọc Da simili</p>\n<p>– Đôn ghế: ruột đôn ghế bằng mút được bọc Da simili</p>\n<p>– Khả năng chịu lực lên đến 200kg</p>\n<p>• KÍCH THƯỚC</p>\n<p>– Dài x rộng x cao: 143 x 68 x 102 (cm)</p>\n<p>– Khối lượng: 17,8 kg</p>\n<p>• BẢO HÀNH:</p>\n<p>– Phôi ghế Composite: 10 năm</p>\n<p>– Vỏ bọc Simili: 6 tháng</p>\n<p>– Chân ghế/ ben ghế/ mâm ống: 6 tháng</p>",
    "published": true,
    "sort_order": 12,
    "button_label": "Đặt mua ngay",
    "button_class": "",
    "video_button_label": "",
    "video_button_class": "",
    "display_layout": "card",
    "badge_label": "Ghế sáng chế",
    "gallery_urls": "https://hongcotsong.com/wp-content/uploads/2024/08/1768140346486-368327387-ghe-doctorloan-135-5-scaled.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1768140344247-642771782-ghe-doctorloan-135-4-scaled.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1768140341927-915795478-ghe-doctorloan-135-3-scaled.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1768140348679-896385088-ghe-doctorloan-135-6-scaled.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1768140338441-797966276-ghe-doctorloan-135-2-scaled.jpg",
    "chat_button_label": "Chat tư vấn",
    "chat_button_url": "",
    "chat_button_class": "open-chat-trigger"
  },
  {
    "id": "ghe-doctorloan-150",
    "name": "Ghế sáng chế DoctorLoan 150",
    "price": 53762000,
    "currency": "VND",
    "image_url": "https://hongcotsong.com/wp-content/uploads/2024/08/1767625218826-745244216-z571322856284909e27ff18e338012c913dff5f1193f0f.jpg",
    "video_url": "",
    "buy_url": "https://hongcotsong.com/san-pham/ghe-sang-che-doctorloan-150/",
    "description": "<p>Dựa trên mô phỏng đường cong cột sống sống, ghế sáng chế DOCTORLOAN 150 được thiết kế với phần lồi phía trước, lõm phía sau và gờ lồi trung tâm tạo nên chức năng “ÔM CHẶT – GIỮ CHUẨN – CHỐNG TRƯỢT”. Lõi ghế làm từ chất liệu composite (sợi thuỷ tinh) dùng đóng vỏ tảu, máy bay nên siêu cứng giúp tạo ra lực phản hồi mang đến khả năng tự điều chỉnh cột sống dưới tác động của trọng lực cơ thể. Tạo giải pháp tối ưu để duy trì đường cong sinh lý cột sống cổ, ngực, lưng, xương cùng cụt và xương chậu. Giúp bảo vệ cột sống trong tình trạng tốt nhất.</p>\n<p>THIẾT KẾ:</p>\n<p>Ghế sáng chế DOCTORLOAN 150 được thiết kế đặc biệt với độ ngả 150˚, kết hợp với các đường cong LỒI TRƯỚC LÕM SAU uốn theo cấu trúc cong tự nhiên của cột sống giúp giảm sâu áp lực trên cột sống, đĩa đệm, khung xương. Đồng thời giúp nắn chỉnh các sai lệch đốt sống, tạo hình lại đường cong sinh lý. “Vùng đầu” lồi ra trước giúp nâng đỡ và nắn chỉnh Cột Sống Cổ ” Vùng ngực” lõm ra sau đúng theo cấu trúc cột sống ngực “Vùng gờ thắt lưng” giúp nâng đỡ và tạo lực đẩy giúp cho cột sống có độ cong tự nhiên giảm áp lực trên đĩa đệm. Đồng thời lõi cứng giúp tạo lực phản hồi để nắn chỉnh các đốt sống trật/ trượt về vị trí đúng, nắn chỉnh tạo hình đường cong sinh lý tự nhiên của cột sống lưng. “Vùng hõm mặt ghế” giúp giữ chuẩn cấu trúc khung chậu và xương cùng cụt ở tư thế ngay ngắn khi nằm. “Gờ lồi trung tâm” giúp chống trượt mông khi nằm.</p>\n<p>CÔNG DỤNG: Giúp giảm nhanh các triệu chứng</p>\n<p>– Đau cấp tính thắt lưng, mông, chân khi vận động sai tư thế</p>\n<p>– Đau lưng dữ dội hoặc âm ỉ kéo dài do: đau thần kinh toạ, đau thoát vị đĩa đệm cột sống lưng, trật vẹo cột sống thắt lưng</p>\n<p>– Đau/ nhói ngực, khó thở do biến đổi cấu trúc cột sống ngực</p>\n<p>– Đau do xương chậu và xương cùng bị biến dạng do nằm sai tư thế trong sinh hoạt hằng ngày</p>\n<p>– Tê / buốt/ mất cảm giác chân, ngón chân</p>\n<p>Hỗ trợ điều trị và ngăn ngừa các bệnh cột sống cho mọi lứa tuổi</p>\n<p>– Gù lưng</p>\n<p>– Thoát vị đĩa đệm</p>\n<p>– Thoái hóa cột sống</p>\n<p>– Cong vẹo cột sống</p>\n<p>– Trượt đốt sống</p>\n<p>– Liệt tay, chân</p>\n<p>– Hỗ trợ trong các trường hợp cột sống thắt lưng bị biến dạng, đang ở giai đoạn tiền phẫu hoặc hậu phẫu thuật</p>\n<p>• ĐỐI TƯỢNG SỬ DỤNG: Ghế sáng chế 150 phù hợp nằm nghỉ ngơi, thư giãn, đọc sách, xem tivi và ngủ trưa. Cả gia đình có thể cùng sử dụng</p>\n<p>• CHẤT LIỆU</p>\n<p>– Phôi ghế làm từ Composite, bọc Da smili</p>\n<p>– Phần đệm mặt ghế & lưng ghế được cấu tạo từ mút</p>\n<p>– Chân ghế làm từ Inox 304 – Tay vịn ghế: bên trong làm bằng gỗ được bọc Da simili</p>\n<p>– Đôn ghế: ruột đôn ghế bằng mút được bọc Da simili</p>\n<p>– Khả năng chịu lực lên đến 200kg</p>\n<p>• KÍCH THƯỚC</p>\n<p>– Dài x rộng x cao: 143 x 68 x 102 (cm)</p>\n<p>– Khối lượng: 17,8 kg</p>\n<p>• BẢO HÀNH:</p>\n<p>– Phôi ghế Composite: 10 năm</p>\n<p>– Vỏ bọc Simili: 6 tháng</p>\n<p>– Chân ghế/ ben ghế/ mâm ống: 6 tháng</p>",
    "published": true,
    "sort_order": 13,
    "button_label": "Đặt mua ngay",
    "button_class": "",
    "video_button_label": "",
    "video_button_class": "",
    "display_layout": "card",
    "badge_label": "Ghế sáng chế",
    "gallery_urls": "https://hongcotsong.com/wp-content/uploads/2024/08/1769510102794-214988345-z571322856776408a8de1a8c2640793c3bb97a929f5780.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1769510107425-363350771-z5713228576163eb7d3123f64d26ea0788d28a003c9fc7.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1769510110677-460947288-z5713228579373c4d4cd3066f4066b2d42f42a26ecd1e9copy.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1769510115069-219723353-z5713228587328ea7a48cdd76df79780935f33e3ed8140.jpg\nhttps://hongcotsong.com/wp-content/uploads/2024/08/1769510122156-203832683-z5713228589452e6721a95f346077fd1d0ef8d40d965d3.jpg",
    "chat_button_label": "Chat tư vấn",
    "chat_button_url": "",
    "chat_button_class": "open-chat-trigger"
  },
  {
    "id": "dem-doctorloan",
    "name": "Đệm sáng chế DoctorLoan",
    "price": 6000000,
    "currency": "VND",
    "image_url": "https://hongcotsong.com/wp-content/uploads/2024/08/1768818488781-178345811-dem-doctorloan-0-scaled.jpg",
    "video_url": "",
    "buy_url": "https://hongcotsong.com/san-pham/dem-sang-che-doctorloan/",
    "description": "<p>ĐẶC ĐIỂM CỦA SẢN PHẨM</p>\n<p>Đây là sản phẩm có công dụng hỗ trợ điều trị và ngăn ngừa các bệnh cột sống lưng, giúp cột sống khỏe mạnh. Giữ cho xương chậu được thẳng và cấu trúc cột sống bình thường khi ngồi trên sàn. Điều chỉnh trật, lệch, vẹo của xương cùng khung chậu về cấu trúc bình thường</p>\n<p>KIỂU DÁNG VÀ Ý TƯỞNG</p>\n<p>Đệm ngồi được thiết kế với các bậc uốn cong theo cấu trúc xương chậu – xương cùng – xương cụt. Đệm ngồi sáng chế DOCTORLOAN – giải pháp chăm sóc khung xương chậu và xương sống an toàn và hiệu quả. Sử dụng công nghệ sáng chế vượt trội tạo kết cấu đặc biệt (đã được bảo hộ độc quyền).<br />\nCHẤT LIỆU</p>\n<p>– Ruột đệm làm từ mút PU FOAM có tỷ trọng cao, độ bền tốt được kiểm định chất lượng, độ an toàn tại cơ quan kiểm định chất lượng TP Hồ Chí Minh. – Phần lõi được làm từ chất liệu EPS siêu cứng có khả năng chịu lực rất tốt – Vỏ bọc da Simili cao cấp tạo độ sang trọng và được kiểm định về chất lượng</p>\n<p>ỨNG DỤNG</p>\n<p>– Giữ cho xương chậu được thẳng và cấu trúc cột sống bình thường khi ngồi trên sàn – Phòng và điều chỉnh trật, lệch, vẹo của xương cùng, khung xương chậu do thói quen ngồi bệt dưới sàn về cấu trúc bình thường – Nhanh chóng giảm áp lực lên đĩa đệm và cột sống. Hết đau đầu gối, đau mông khi ngồi trên sàn – Thích hợp dùng làm đệm ngồi bệt, nệm ngồi bàn thấp, nệm ngồi trà đạo, nệm ngồi bàn trà kiểu Nhật, nệm lót ngồi thiền, ngồi thư giãn, hay nệm lót ngồi trang trí trên ghế tựa, ghế mây, ghế gỗ.</p>\n<p>BẢO HÀNH:</p>\n<p>– Ruột đệm: bảo hành 01 tháng</p>\n<p>– Lõi đệm: bảo hành 01 năm</p>\n<p>– Vỏ đệm simili: bảo hành 06 tháng</p>",
    "published": true,
    "sort_order": 14,
    "button_label": "Đặt mua ngay",
    "button_class": "",
    "video_button_label": "",
    "video_button_class": "",
    "display_layout": "card",
    "badge_label": "Đệm sáng chế",
    "gallery_urls": "https://hongcotsong.com/wp-content/uploads/2024/08/1768818496310-801838474-dem-doctorloan-2-scaled.jpg",
    "chat_button_label": "Chat tư vấn",
    "chat_button_url": "",
    "chat_button_class": "open-chat-trigger"
  },
  {
    "id": "combo-co-ban-1",
    "name": "COMBO Nắn Chỉnh Cơ Bản 1",
    "price": 8307000,
    "currency": "VND",
    "image_url": "https://hongcotsong.com/wp-content/uploads/2024/08/1768833282105-976548564-Combocoban3.webp",
    "video_url": "",
    "buy_url": "https://hongcotsong.com/san-pham/combo-co-ban-1/",
    "description": "<p>Bảo vệ cơ bản cột sống với giải pháp DoctorLoan – Gối sáng chế DoctorLoan: Nắn chỉnh chuyên sâu cột sống cổ và cột sống lưng – Ghế sáng chế DoctorLoan N85: Giữ dáng ngồi chuẩn trong các sinh hoạt hằng ngày</p>\n<p class=\"isSelectedEnd\"><strong>DoctorLoan</strong> mang đến giải pháp hỗ trợ tư thế và chăm sóc cột sống thông qua các sản phẩm được thiết kế chuyên biệt, giúp người dùng chủ động bảo vệ cột sống trong sinh hoạt hằng ngày.</p>\n<h3><strong>Gối sáng chế DoctorLoan</strong></h3>\n<figure id=\"attachment_4945-2\" aria-describedby=\"caption-attachment-4945-2\" style=\"width: 800px\" class=\"wp-caption aligncenter\"><img class=\"wp-image-4945 size-large\" src=\"https://bsthaocotsong.com/wp-content/uploads/2026/08/1767577012969-211026264-goi-co-doctorloan-f4-2-1000x1000-1-800x800.jpg\" alt=\"Gối sáng chế DoctorLoan\" width=\"800\" height=\"800\" /><figcaption id=\"caption-attachment-4945-2\" class=\"wp-caption-text\">Gối sáng chế DoctorLoan</figcaption></figure>\n<p class=\"isSelectedEnd\">Hỗ trợ <strong>nắn chỉnh chuyên sâu cột sống cổ và cột sống lưng</strong>, giúp định hướng tư thế phù hợp trong quá trình nghỉ ngơi và sinh hoạt.</p>\n<h3 class=\"product-title product_title entry-title\"><strong>Gối lưng sáng chế DoctorLoan F4</strong></h3>\n<figure id=\"attachment_4944-2\" aria-describedby=\"caption-attachment-4944-2\" style=\"width: 800px\" class=\"wp-caption aligncenter\"><img class=\"wp-image-4944 size-large\" src=\"https://bsthaocotsong.com/wp-content/uploads/2026/08/1768140445042-521234568-goi-lung-doctorloan-f3-5-1000x1000-1-800x800.jpg\" alt=\"Gối lưng sáng chế DoctorLoan F4\" width=\"800\" height=\"800\" /><figcaption id=\"caption-attachment-4944-2\" class=\"wp-caption-text\">Gối lưng sáng chế DoctorLoan F4</figcaption></figure>\n<div class=\"product-short-description\">\n<p>Gối lưng sáng chế DoctorLoan F4 giúp bảo vệ và nắn chỉnh lại các sai lệch đốt sống lưng, ngực</p>\n</div>\n<h3><strong>Ghế sáng chế DoctorLoan N85</strong></h3>\n<figure id=\"attachment_4950-4\" aria-describedby=\"caption-attachment-4950-4\" style=\"width: 800px\" class=\"wp-caption aligncenter\"><img class=\"wp-image-4950 size-large\" src=\"https://bsthaocotsong.com/wp-content/uploads/2026/08/1768140199100-761249413-ghe-doctorloan-N85-3-1000x1000-1-800x800.jpg\" alt=\"Ghế sáng chế DoctorLoan N85 CHÂN NGẮN\" width=\"800\" height=\"800\" /><figcaption id=\"caption-attachment-4950-4\" class=\"wp-caption-text\">Ghế sáng chế DoctorLoan N85 CHÂN NGẮN</figcaption></figure>\n<p class=\"isSelectedEnd\">Hỗ trợ <strong>duy trì dáng ngồi chuẩn trong các hoạt động hằng ngày</strong>, góp phần hình thành thói quen ngồi khoa học và giảm áp lực không cần thiết lên cột sống.</p>\n<p>DoctorLoan – đồng hành cùng bạn xây dựng tư thế khoa học và chủ động chăm sóc cột sống mỗi ngày.</p>\n<h1 class=\"text-2xl md:text-3xl font-bold text-gray-900 leading-tight break-words\">SẢN PHẨM TRONG COMBO</h1>\n<h1 class=\"text-2xl md:text-3xl font-bold text-gray-900 leading-tight break-words\"><a href=\"https://bsthaocotsong.com/san-pham/goi-co-sang-che-doctorloan-f5/\">– Gối cổ sáng chế DoctorLoan F5 : 4.312.000vnđ</a></h1>\n<h1 class=\"text-2xl md:text-3xl font-bold text-gray-900 leading-tight break-words\"><a href=\"https://bsthaocotsong.com/san-pham/goi-lung-sang-che-doctorloan-f1-goi-dai/\">– Gối lưng sáng chế DoctorLoan F1 GỐI DÀI: 1.868.000vnđ</a></h1>\n<h1 class=\"text-2xl md:text-3xl font-bold text-gray-900 leading-tight break-words\"><a href=\"https://bsthaocotsong.com/san-pham/ghe-sang-che-doctorloan-n85-chan-ngan/\">– Ghế sáng chế DoctorLoan N85 CHÂN NGẮN: 2.127.000 vnđ</a></h1>",
    "published": true,
    "sort_order": 15,
    "button_label": "Đặt mua ngay",
    "button_class": "",
    "video_button_label": "",
    "video_button_class": "",
    "display_layout": "card",
    "badge_label": "Gói Combo",
    "gallery_urls": "",
    "chat_button_label": "Chat tư vấn",
    "chat_button_url": "",
    "chat_button_class": "open-chat-trigger"
  },
  {
    "id": "combo-co-ban-2",
    "name": "COMBO Nắn Chỉnh Cơ Bản 2",
    "price": 12913000,
    "currency": "VND",
    "image_url": "https://hongcotsong.com/wp-content/uploads/2024/08/1768833303409-131369072-Combocoban2.webp",
    "video_url": "",
    "buy_url": "https://hongcotsong.com/san-pham/combo-co-ban-2/",
    "description": "<p>Bảo vệ cơ bản cột sống với giải pháp DoctorLoan – Gối sáng chế DoctorLoan: Nắn chỉnh chuyên sâu cột sống cổ và cột sống lưng – Ghế sáng chế DoctorLoan N85: Giữ dáng ngồi chuẩn trong các sinh hoạt hằng ngày</p>\n<p class=\"isSelectedEnd\"><strong>DoctorLoan</strong> mang đến giải pháp hỗ trợ tư thế và chăm sóc cột sống thông qua các sản phẩm được thiết kế chuyên biệt, giúp người dùng chủ động bảo vệ cột sống trong sinh hoạt hằng ngày.</p>\n<h3><strong>Gối sáng chế DoctorLoan</strong></h3>\n<figure id=\"attachment_4845\" aria-describedby=\"caption-attachment-4845\" style=\"width: 800px\" class=\"wp-caption aligncenter\"><img class=\"wp-image-4845 size-large\" src=\"https://bsthaocotsong.com/wp-content/uploads/2024/08/1768140488169-266575898-goi-co-doctorloan-f6-6-800x800.jpg\" alt=\"Gối cổ sáng chế DoctorLoan F6\" width=\"800\" height=\"800\" /><figcaption id=\"caption-attachment-4845\" class=\"wp-caption-text\">Gối cổ sáng chế DoctorLoan F6</figcaption></figure>\n<p class=\"isSelectedEnd\">Hỗ trợ <strong>nắn chỉnh chuyên sâu cột sống cổ và cột sống lưng</strong>, giúp định hướng tư thế phù hợp trong quá trình nghỉ ngơi và sinh hoạt.</p>\n<h3 class=\"product-title product_title entry-title\"><strong>Gối lưng sáng chế DoctorLoan F4</strong></h3>\n<figure id=\"attachment_4819-2\" aria-describedby=\"caption-attachment-4819-2\" style=\"width: 800px\" class=\"wp-caption aligncenter\"><img class=\"wp-image-4819 size-large\" src=\"https://bsthaocotsong.com/wp-content/uploads/2024/08/1768140422559-802203686-goi-lung-doctorloan-f4-5-800x800.jpg\" alt=\"Gối lưng sáng chế DoctorLoan F4\" width=\"800\" height=\"800\" /><figcaption id=\"caption-attachment-4819-2\" class=\"wp-caption-text\">Gối lưng sáng chế DoctorLoan F4</figcaption></figure>\n<div class=\"product-short-description\">\n<p>Gối lưng sáng chế DoctorLoan F4 giúp bảo vệ và nắn chỉnh lại các sai lệch đốt sống lưng, ngực</p>\n</div>\n<h3><strong>Ghế sáng chế DoctorLoan N85</strong></h3>\n<figure id=\"attachment_4950-3\" aria-describedby=\"caption-attachment-4950-3\" style=\"width: 800px\" class=\"wp-caption aligncenter\"><img class=\"wp-image-4950 size-large\" src=\"https://bsthaocotsong.com/wp-content/uploads/2026/08/1768140199100-761249413-ghe-doctorloan-N85-3-1000x1000-1-800x800.jpg\" alt=\"Ghế sáng chế DoctorLoan N85 CHÂN NGẮN\" width=\"800\" height=\"800\" /><figcaption id=\"caption-attachment-4950-3\" class=\"wp-caption-text\">Ghế sáng chế DoctorLoan N85 CHÂN NGẮN</figcaption></figure>\n<p class=\"isSelectedEnd\">Hỗ trợ <strong>duy trì dáng ngồi chuẩn trong các hoạt động hằng ngày</strong>, góp phần hình thành thói quen ngồi khoa học và giảm áp lực không cần thiết lên cột sống.</p>\n<p>DoctorLoan – đồng hành cùng bạn xây dựng tư thế khoa học và chủ động chăm sóc cột sống mỗi ngày.</p>\n<h1 class=\"text-2xl md:text-3xl font-bold text-gray-900 leading-tight break-words\">\nSẢN PHẨM TRONG COMBO</h1>\n<h1 class=\"text-2xl md:text-3xl font-bold text-gray-900 leading-tight break-words\"><a href=\"https://bsthaocotsong.com/san-pham/goi-co-sang-che-doctorloan-f6/\">– Gối cổ sáng chế DoctorLoan F6: 7.049.000 vnđ</a></h1>\n<h1 class=\"text-2xl md:text-3xl font-bold text-gray-900 leading-tight break-words\"><a href=\"https://bsthaocotsong.com/san-pham/goi-lung-sang-che-doctorloan-f4/\">– Gối lưng sáng chế DoctorLoan F4: 3.737.000 vnđ</a></h1>\n<h1 class=\"text-2xl md:text-3xl font-bold text-gray-900 leading-tight break-words\"><a href=\"https://bsthaocotsong.com/san-pham/ghe-sang-che-doctorloan-n85-chan-ngan/\">-Ghế sáng chế DoctorLoan N85 CHÂN NGẮN: 2.127.000 vnđ</a></h1>\n<p> </p>\n<p> </p>",
    "published": true,
    "sort_order": 16,
    "button_label": "Đặt mua ngay",
    "button_class": "",
    "video_button_label": "",
    "video_button_class": "",
    "display_layout": "card",
    "badge_label": "Gói Combo",
    "gallery_urls": "",
    "chat_button_label": "Chat tư vấn",
    "chat_button_url": "",
    "chat_button_class": "open-chat-trigger"
  },
  {
    "id": "combo-co-ban-3",
    "name": "COMBO Nắn Chỉnh Cơ Bản 3",
    "price": 13488000,
    "currency": "VND",
    "image_url": "https://hongcotsong.com/wp-content/uploads/2024/08/1768833282105-976548564-Combocoban3-1.webp",
    "video_url": "",
    "buy_url": "https://hongcotsong.com/san-pham/hang-gai-pho-4/",
    "description": "<p>Bảo vệ cơ bản cột sống với giải pháp DoctorLoan – Gối sáng chế DoctorLoan: Nắn chỉnh chuyên sâu cột sống cổ và cột sống lưng – Ghế sáng chế DoctorLoan N85: Giữ dáng ngồi chuẩn trong các sinh hoạt hằng ngày</p>\n<p class=\"isSelectedEnd\"><strong>DoctorLoan</strong> mang đến giải pháp hỗ trợ tư thế và chăm sóc cột sống thông qua các sản phẩm được thiết kế chuyên biệt, giúp người dùng chủ động bảo vệ cột sống trong sinh hoạt hằng ngày.</p>\n<h3><strong>Gối sáng chế DoctorLoan F4</strong></h3>\n<figure id=\"attachment_4948-3\" aria-describedby=\"caption-attachment-4948-3\" style=\"width: 800px\" class=\"wp-caption aligncenter\"><img class=\"wp-image-4948 size-large\" src=\"https://bsthaocotsong.com/wp-content/uploads/2026/08/1768140497963-707220928-goi-co-doctorloan-f4-3-1000x1000-1-800x800.jpg\" alt=\"Gối cổ sáng chế DoctorLoan F4\" width=\"800\" height=\"800\" /><figcaption id=\"caption-attachment-4948-3\" class=\"wp-caption-text\">Gối cổ sáng chế DoctorLoan F4</figcaption></figure>\n<p class=\"isSelectedEnd\">Hỗ trợ <strong>nắn chỉnh chuyên sâu cột sống cổ và cột sống lưng</strong>, giúp định hướng tư thế phù hợp trong quá trình nghỉ ngơi và sinh hoạt.</p>\n<h3 class=\"product-title product_title entry-title\"><strong>Gối lưng sáng chế DoctorLoan F4</strong></h3>\n<figure id=\"attachment_4819\" aria-describedby=\"caption-attachment-4819\" style=\"width: 800px\" class=\"wp-caption aligncenter\"><img class=\"wp-image-4819 size-large\" src=\"https://bsthaocotsong.com/wp-content/uploads/2024/08/1768140422559-802203686-goi-lung-doctorloan-f4-5-800x800.jpg\" alt=\"Gối lưng sáng chế DoctorLoan F4\" width=\"800\" height=\"800\" /><figcaption id=\"caption-attachment-4819\" class=\"wp-caption-text\">Gối lưng sáng chế DoctorLoan F4</figcaption></figure>\n<div class=\"product-short-description\">\n<p>Gối lưng sáng chế DoctorLoan F4 giúp bảo vệ và nắn chỉnh lại các sai lệch đốt sống lưng, ngực</p>\n</div>\n<h3><strong>Ghế sáng chế DoctorLoan N85</strong></h3>\n<figure id=\"attachment_4950-2\" aria-describedby=\"caption-attachment-4950-2\" style=\"width: 800px\" class=\"wp-caption aligncenter\"><img class=\"wp-image-4950 size-large\" src=\"https://bsthaocotsong.com/wp-content/uploads/2026/08/1768140199100-761249413-ghe-doctorloan-N85-3-1000x1000-1-800x800.jpg\" alt=\"Ghế sáng chế DoctorLoan N85 CHÂN NGẮN\" width=\"800\" height=\"800\" /><figcaption id=\"caption-attachment-4950-2\" class=\"wp-caption-text\">Ghế sáng chế DoctorLoan N85 CHÂN NGẮN</figcaption></figure>\n<p class=\"isSelectedEnd\">Hỗ trợ <strong>duy trì dáng ngồi chuẩn trong các hoạt động hằng ngày</strong>, góp phần hình thành thói quen ngồi khoa học và giảm áp lực không cần thiết lên cột sống.</p>\n<p>DoctorLoan – đồng hành cùng bạn xây dựng tư thế khoa học và chủ động chăm sóc cột sống mỗi ngày.</p>\n<h1 class=\"text-2xl md:text-3xl font-bold text-gray-900 leading-tight break-words\">\nSẢN PHẨM TRONG COMBO</h1>\n<h1 class=\"text-2xl md:text-3xl font-bold text-gray-900 leading-tight break-words\"><a href=\"https://bsthaocotsong.com/san-pham/goi-co-sang-che-doctorloan-f4/\">– Gối cổ sáng chế DoctorLoan F4: 7.624.000 vnđ</a></h1>\n<h1 class=\"text-2xl md:text-3xl font-bold text-gray-900 leading-tight break-words\"><a href=\"https://bsthaocotsong.com/san-pham/goi-lung-sang-che-doctorloan-f3/\">– Gối lưng sáng chế DoctorLoan F3: 3.737.000 vnđ</a></h1>\n<h1 class=\"text-2xl md:text-3xl font-bold text-gray-900 leading-tight break-words\"><a href=\"https://bsthaocotsong.com/san-pham/dong-xuan-1ghe-sang-che-doctorloan-n85-chan-dai/\">-Ghế sáng chế DoctorLoan N85 CHÂN NGẮN: 2.127.000 vnđ</a></h1>",
    "published": true,
    "sort_order": 17,
    "button_label": "Đặt mua ngay",
    "button_class": "",
    "video_button_label": "",
    "video_button_class": "",
    "display_layout": "card",
    "badge_label": "Gói Combo",
    "gallery_urls": "",
    "chat_button_label": "Chat tư vấn",
    "chat_button_url": "",
    "chat_button_class": "open-chat-trigger"
  },
  {
    "id": "combo-nan-chinh-co-ban",
    "name": "COMBO Nắn Chỉnh Cơ Bản (Toàn Diện)",
    "price": 19488000,
    "currency": "VND",
    "image_url": "https://hongcotsong.com/wp-content/uploads/2026/08/1769501593394-77631817-Combonanchinhcoban1.webp",
    "video_url": "",
    "buy_url": "https://hongcotsong.com/san-pham/combo-nan-chinh-co-ban/",
    "description": "<p>Nắn chỉnh cơ bản với giải pháp DoctorLoan – Gối sáng chế DoctorLoan: Nắn chỉnh chuyên sâu cột sống cổ và cột sống lưng – Đệm ngồi sáng chế DoctorLoan: nắn chỉnh chuyên sâu xương cùng, xương cụt, xương chậu. – Ghế sáng chế DoctorLoan N85: Giữ dáng ngồi chuẩn trong các sinh hoạt hằng ngày</p>\n<p class=\"isSelectedEnd\"><strong>DoctorLoan</strong> mang đến giải pháp hỗ trợ tư thế và chăm sóc cột sống thông qua hệ thống sản phẩm được thiết kế chuyên biệt cho từng vùng cơ thể.</p>\n<h3>Gối sáng chế DoctorLoan</h3>\n<figure id=\"attachment_4948-2\" aria-describedby=\"caption-attachment-4948-2\" style=\"width: 800px\" class=\"wp-caption aligncenter\"><img class=\"wp-image-4948 size-large\" src=\"https://bsthaocotsong.com/wp-content/uploads/2026/08/1768140497963-707220928-goi-co-doctorloan-f4-3-1000x1000-1-800x800.jpg\" alt=\"Gối cổ sáng chế DoctorLoan F4\" width=\"800\" height=\"800\" /><figcaption id=\"caption-attachment-4948-2\" class=\"wp-caption-text\">Gối cổ sáng chế DoctorLoan F4</figcaption></figure>\n<p class=\"isSelectedEnd\">Hỗ trợ <strong>nắn chỉnh chuyên sâu cột sống cổ và cột sống lưng</strong>, giúp định hướng tư thế phù hợp trong quá trình nghỉ ngơi và sinh hoạt.</p>\n<h3>Đệm ngồi sáng chế DoctorLoan</h3>\n<figure id=\"attachment_4957\" aria-describedby=\"caption-attachment-4957\" style=\"width: 800px\" class=\"wp-caption aligncenter\"><img class=\"wp-image-4957 size-large\" src=\"https://bsthaocotsong.com/wp-content/uploads/2026/08/1768818488781-178345811-dem-doctorloan-0-1000x1000-1-800x800.jpg\" alt=\"Đệm ngồi sáng chế DoctorLoan\" width=\"800\" height=\"800\" /><figcaption id=\"caption-attachment-4957\" class=\"wp-caption-text\">Đệm ngồi sáng chế DoctorLoan</figcaption></figure>\n<p class=\"isSelectedEnd\">Tập trung hỗ trợ <strong>xương cùng, xương cụt và xương chậu</strong>, giúp duy trì tư thế ngồi phù hợp, đặc biệt với những người thường xuyên phải ngồi lâu.</p>\n<h3>Ghế sáng chế DoctorLoan N85</h3>\n<figure id=\"attachment_4943\" aria-describedby=\"caption-attachment-4943\" style=\"width: 800px\" class=\"wp-caption aligncenter\"><img class=\"wp-image-4943 size-large\" src=\"https://bsthaocotsong.com/wp-content/uploads/2026/08/1768140202131-796146365-ghe-doctorloan-N85-4-1000x1000-1-800x800.jpg\" alt=\"Ghế sáng chế DoctorLoan N85\" width=\"800\" height=\"800\" /><figcaption id=\"caption-attachment-4943\" class=\"wp-caption-text\">Ghế sáng chế DoctorLoan N85</figcaption></figure>\n<p class=\"isSelectedEnd\">Hỗ trợ <strong>giữ dáng ngồi chuẩn trong các hoạt động sinh hoạt hằng ngày</strong>, góp phần hình thành thói quen ngồi khoa học và chủ động chăm sóc cột sống.</p>\n<p><strong>DoctorLoan – giải pháp hỗ trợ tư thế, đồng hành cùng bạn chăm sóc cột sống mỗi ngày.</strong></p>\n<h3><strong>Link chi tiết về sản phẩm trong Combo Văn Phòng 1</strong></h3>\n<h1 class=\"text-2xl md:text-3xl font-bold text-gray-900 leading-tight break-words\">–<a href=\"https://bsthaocotsong.com/san-pham/goi-co-sang-che-doctorloan-f4/\"> Gối cổ sáng chế DoctorLoan F4: 7.624.000 vnđ</a></h1>\n<h1 class=\"text-2xl md:text-3xl font-bold text-gray-900 leading-tight break-words\"><a href=\"https://bsthaocotsong.com/san-pham/goi-lung-sang-che-doctorloan-f3/\">– Gối lưng sáng chế DoctorLoan F3: 3.737.000 vnđ</a></h1>\n<h1 class=\"text-2xl md:text-3xl font-bold text-gray-900 leading-tight break-words\"><a href=\"https://bsthaocotsong.com/san-pham/dem-sang-che-doctorloan/\">– Đệm sáng chế DoctorLoan: 6.000.000 vnđ </a></h1>\n<h1 class=\"text-2xl md:text-3xl font-bold text-gray-900 leading-tight break-words\"><a href=\"https://bsthaocotsong.com/san-pham/ghe-sang-che-doctorloan-n85-chan-ngan/\">– Ghế sáng chế DoctorLoan N85 CHÂN NGẮN: 2.127.000 vnđ </a></h1>\n<p> </p>",
    "published": true,
    "sort_order": 18,
    "button_label": "Đặt mua ngay",
    "button_class": "",
    "video_button_label": "",
    "video_button_class": "",
    "display_layout": "card",
    "badge_label": "Gói Combo",
    "gallery_urls": "",
    "chat_button_label": "Chat tư vấn",
    "chat_button_url": "",
    "chat_button_class": "open-chat-trigger"
  },
  {
    "id": "combo-van-phong-1",
    "name": "COMBO Văn Phòng 1",
    "price": 33187000,
    "currency": "VND",
    "image_url": "https://hongcotsong.com/wp-content/uploads/2026/08/1768833077975-164285146-Combovanphong3.webp",
    "video_url": "",
    "buy_url": "https://hongcotsong.com/san-pham/combo-van-phong-1/",
    "description": "<p>Dành cho những người chuyên ngồi làm việc như dân văn phòng, học sinh, sinh viên, thợ may, phun xăm, nail….</p>\n<h2><strong><span style=\"color: #000000\">GIẢI PHÁP HỖ TRỢ TƯ THẾ NGỒI VÀ CHĂM SÓC CỘT SỐNG DOCTORLOAN</span></strong></h2>\n<p class=\"isSelectedEnd\"><span style=\"color: #000000\">Đối với những người phải ngồi làm việc trong thời gian dài như <strong>nhân viên văn phòng, học sinh, sinh viên, thợ may, kỹ thuật viên phun xăm, nhân viên nail</strong> và nhiều ngành nghề khác, việc duy trì tư thế ngồi phù hợp đóng vai trò quan trọng trong quá trình chăm sóc sức khỏe cột sống.</span></p>\n<p class=\"isSelectedEnd\"><span style=\"color: #000000\">Thấu hiểu nhu cầu đó, <strong>DoctorLoan</strong> phát triển các sản phẩm hỗ trợ tư thế ngồi và chăm sóc cột sống, giúp người dùng duy trì tư thế phù hợp trong công việc và sinh hoạt hằng ngày.</span></p>\n<h3><strong><span style=\"color: #000000\">1. Ghế sáng chế DoctorLoan 90 – Hỗ trợ tư thế ngồi chuẩn khi làm việc</span></strong></h3>\n<p><img class=\"aligncenter wp-image-4942 size-large\" src=\"https://bsthaocotsong.com/wp-content/uploads/2026/08/1768140315535-147315026-ghe-doctorloan-90D-4-1000x1000-1-800x800.jpg\" alt=\"\" width=\"800\" height=\"800\" /></p>\n<p class=\"isSelectedEnd\"><span style=\"color: #000000\"><strong>Ghế sáng chế DoctorLoan 90</strong> được thiết kế dành cho những người thường xuyên phải ngồi làm việc trong thời gian dài.</span></p>\n<p class=\"isSelectedEnd\"><span style=\"color: #000000\">Sản phẩm tập trung hỗ trợ người sử dụng <strong>duy trì tư thế ngồi thẳng</strong>, đồng thời tác động hỗ trợ định hướng tư thế tại các vùng <strong>cột sống lưng, xương cùng – xương cụt và xương chậu</strong>.</span></p>\n<p class=\"isSelectedEnd\"><span style=\"color: #000000\">DoctorLoan 90 phù hợp với nhiều đối tượng thường xuyên làm việc ở tư thế ngồi như:</span></p>\n<ul data-spread=\"false\">\n<li><span style=\"color: #000000\">Nhân viên văn phòng, người làm việc với máy tính.</span></li>\n<li><span style=\"color: #000000\">Học sinh, sinh viên phải ngồi học nhiều giờ.</span></li>\n<li><span style=\"color: #000000\">Thợ may, người làm việc tại bàn.</span></li>\n<li><span style=\"color: #000000\">Kỹ thuật viên phun xăm, nhân viên nail.</span></li>\n<li><span style=\"color: #000000\">Những người có đặc thù công việc phải ngồi lâu mỗi ngày.</span></li>\n</ul>\n<p class=\"isSelectedEnd\"><span style=\"color: #000000\">Việc sử dụng ghế phù hợp có thể giúp người dùng <strong>ý thức hơn về tư thế ngồi</strong>, từ đó hình thành thói quen ngồi khoa học và thoải mái hơn trong quá trình làm việc.</span></p>\n<h3><strong><span style=\"color: #000000\">2. Gối sáng chế DoctorLoan – Hỗ trợ chăm sóc cột sống cổ và lưng</span></strong></h3>\n<figure id=\"attachment_4944\" aria-describedby=\"caption-attachment-4944\" style=\"width: 800px\" class=\"wp-caption aligncenter\"><img class=\"wp-image-4944 size-large\" src=\"https://bsthaocotsong.com/wp-content/uploads/2026/08/1768140445042-521234568-goi-lung-doctorloan-f3-5-1000x1000-1-800x800.jpg\" alt=\"Gỗi lưng sáng chế\" width=\"800\" height=\"800\" /><figcaption id=\"caption-attachment-4944\" class=\"wp-caption-text\">Gỗi lưng sáng chế</figcaption></figure>\n<figure id=\"attachment_4945\" aria-describedby=\"caption-attachment-4945\" style=\"width: 800px\" class=\"wp-caption aligncenter\"><img class=\"wp-image-4945 size-large\" src=\"https://bsthaocotsong.com/wp-content/uploads/2026/08/1767577012969-211026264-goi-co-doctorloan-f4-2-1000x1000-1-800x800.jpg\" alt=\"Gỗi cổ sáng chế\" width=\"800\" height=\"800\" /><figcaption id=\"caption-attachment-4945\" class=\"wp-caption-text\">Gỗi cổ sáng chế</figcaption></figure>\n<p class=\"isSelectedEnd\"><span style=\"color: #000000\">Bên cạnh ghế ngồi, <strong>Gối sáng chế DoctorLoan</strong> được phát triển nhằm hỗ trợ tư thế và chăm sóc chuyên sâu hơn cho vùng <strong>cột sống cổ và cột sống lưng</strong>.</span></p>\n<p class=\"isSelectedEnd\"><span style=\"color: #000000\">Thiết kế của sản phẩm hướng đến việc hỗ trợ nâng đỡ và định hướng tư thế phù hợp, giúp người dùng có thêm một giải pháp chăm sóc cột sống trong quá trình nghỉ ngơi và sinh hoạt.</span></p>\n<p class=\"isSelectedEnd\"><span style=\"color: #000000\">Đây là sản phẩm có thể kết hợp cùng các giải pháp hỗ trợ tư thế khác của DoctorLoan để tạo thành một hệ thống chăm sóc cột sống toàn diện hơn.</span></p>\n<h3><strong><span style=\"color: #000000\">3. Ghế sáng chế DoctorLoan N85 – Hỗ trợ duy trì dáng ngồi chuẩn trong sinh hoạt</span></strong></h3>\n<p><img class=\"aligncenter wp-image-4943 size-large\" src=\"https://bsthaocotsong.com/wp-content/uploads/2026/08/1768140202131-796146365-ghe-doctorloan-N85-4-1000x1000-1-800x800.jpg\" alt=\"\" width=\"800\" height=\"800\" /></p>\n<p class=\"isSelectedEnd\"><span style=\"color: #000000\"><strong>DoctorLoan N85</strong> là giải pháp được thiết kế nhằm hỗ trợ người dùng <strong>duy trì dáng ngồi phù hợp trong các hoạt động sinh hoạt hằng ngày</strong>.</span></p>\n<p class=\"isSelectedEnd\"><span style=\"color: #000000\">Với thiết kế hướng đến sự tiện lợi và khả năng ứng dụng trong nhiều hoàn cảnh, N85 phù hợp với những người mong muốn chủ động xây dựng thói quen giữ tư thế đúng trong cuộc sống.</span></p>\n<p class=\"isSelectedEnd\"><span style=\"color: #000000\">Sản phẩm đặc biệt hữu ích đối với những người thường xuyên phải ngồi trong thời gian dài hoặc có thói quen ngồi chưa phù hợp.</span></p>\n<h2><strong><span style=\"color: #000000\">DoctorLoan – Chủ động chăm sóc cột sống từ tư thế hằng ngày</span></strong></h2>\n<p class=\"isSelectedEnd\"><span style=\"color: #000000\">Cột sống đồng hành cùng chúng ta trong mọi hoạt động, từ làm việc, học tập đến nghỉ ngơi và sinh hoạt. Vì vậy, <strong>chăm sóc cột sống không chỉ bắt đầu khi xuất hiện vấn đề mà nên được quan tâm từ những thói quen hằng ngày</strong>, đặc biệt là tư thế ngồi.</span></p>\n<p class=\"isSelectedEnd\"><span style=\"color: #000000\">Các sản phẩm sáng chế DoctorLoan như <strong>Ghế DoctorLoan 90, Gối DoctorLoan và Ghế DoctorLoan N85</strong> hướng đến việc hỗ trợ người dùng duy trì tư thế phù hợp, nâng cao ý thức chăm sóc cột sống và xây dựng thói quen sinh hoạt khoa học hơn.</span></p>\n<p><span style=\"color: #000000\">Nếu bạn thường xuyên phải <strong>ngồi làm việc, ngồi học hoặc thực hiện các công việc đòi hỏi tư thế ngồi trong thời gian dài</strong>, hãy tìm hiểu giải pháp phù hợp từ DoctorLoan để chủ động chăm sóc cột sống mỗi ngày.</span></p>\n<h2><strong><span style=\"color: #000000\">Link chi tiết về sản phẩm trong Combo Văn Phòng 1</span></strong></h2>\n<h1 class=\"text-2xl md:text-3xl font-bold text-gray-900 leading-tight break-words\"><span style=\"color: #000000\"><a style=\"color: #000000\" href=\"https://bsthaocotsong.com/san-pham/goi-co-sang-che-doctorloan-f4/\">– Gối cổ sáng chế DoctorLoan F4: 7.624.000 vnđ</a></span></h1>\n<h1 class=\"text-2xl md:text-3xl font-bold text-gray-900 leading-tight break-words\"><span style=\"color: #000000\"><a style=\"color: #000000\" href=\"https://bsthaocotsong.com/san-pham/goi-lung-sang-che-doctorloan-f4/\">– Gối lưng sáng chế DoctorLoan F4: 3.737.000 vnđ</a></span></h1>\n<h1 class=\"text-2xl md:text-3xl font-bold text-gray-900 leading-tight break-words\"><span style=\"color: #000000\">–<a style=\"color: #000000\" href=\"https://bsthaocotsong.com/san-pham/ghe-sang-che-doctorloan-n85-chan-ngan/\"> Ghế sáng chế DoctorLoan N85 CHÂN NGẮN: 2.127.000 vnđ</a></span></h1>\n<h1 class=\"text-2xl md:text-3xl font-bold text-gray-900 leading-tight break-words\"><span style=\"color: #000000\"><a style=\"color: #000000\" href=\"https://bsthaocotsong.com/san-pham/ghe-sang-che-doctorloan-90t-dem-mong/\">– Ghế sáng chế DoctorLoan 90T (đệm mỏng): 19.699.000 vnđ</a></span></h1>",
    "published": true,
    "sort_order": 19,
    "button_label": "Đặt mua ngay",
    "button_class": "",
    "video_button_label": "",
    "video_button_class": "",
    "display_layout": "card",
    "badge_label": "Gói Combo",
    "gallery_urls": "",
    "chat_button_label": "Chat tư vấn",
    "chat_button_url": "",
    "chat_button_class": "open-chat-trigger"
  },
  {
    "id": "combo-van-phong-2",
    "name": "COMBO Văn Phòng 2",
    "price": 48425000,
    "currency": "VND",
    "image_url": "https://hongcotsong.com/wp-content/uploads/2026/08/1768833187985-624396734-Combovanphong1.webp",
    "video_url": "",
    "buy_url": "https://hongcotsong.com/san-pham/combo-van-phong-2/",
    "description": "<p>Dành cho những người chuyên ngồi làm việc như dân văn phòng, học sinh, sinh viên, thợ may, phun xăm, nail…. – Ghế sáng chế DoctorLoan 90: giúp giữ thẳng tư thế khi ngồi làm việc đồng thời tập trung nắn chỉnh cột sống lưng, xương cùng xương cụt và xương chậu. – Gối sáng chế DoctorLoan: Nắn chỉnh chuyên sâu cột sống cổ và cột sống lưng – Ghế sáng chế DoctorLoan N85: Giữ dáng ngồi chuẩn trong các sinh hoạt hằng ngày</p>\n<h2><strong><span style=\"color: #000000\">Dành cho người thường xuyên ngồi làm việc, học tập trong thời gian dài</span></strong></h2>\n<p class=\"isSelectedEnd\"><span style=\"color: #000000\">Trong cuộc sống hiện đại, nhiều người phải duy trì tư thế ngồi trong nhiều giờ mỗi ngày. Từ <strong>nhân viên văn phòng, học sinh, sinh viên</strong> đến <strong>thợ may, kỹ thuật viên phun xăm, nhân viên nail</strong> và những công việc đặc thù khác, việc ngồi lâu và duy trì một tư thế chưa phù hợp có thể khiến cơ thể dễ rơi vào trạng thái mệt mỏi, căng cứng và khó chịu.</span></p>\n<p class=\"isSelectedEnd\"><span style=\"color: #000000\">Chính vì vậy, việc <strong>chủ động xây dựng tư thế ngồi khoa học và chăm sóc cột sống mỗi ngày</strong> ngày càng được nhiều người quan tâm.</span></p>\n<p class=\"isSelectedEnd\"><span style=\"color: #000000\">DoctorLoan mang đến hệ thống các sản phẩm hỗ trợ tư thế và chăm sóc cột sống, được thiết kế để đồng hành cùng người dùng trong công việc, học tập cũng như các hoạt động sinh hoạt hằng ngày.</span></p>\n<h3><strong><span style=\"color: #000000\">Ghế sáng chế DoctorLoan 90 – Hỗ trợ duy trì tư thế ngồi thẳng</span></strong></h3>\n<figure id=\"attachment_4951\" aria-describedby=\"caption-attachment-4951\" style=\"width: 800px\" class=\"wp-caption aligncenter\"><img class=\"wp-image-4951 size-large\" src=\"https://bsthaocotsong.com/wp-content/uploads/2026/08/1768140315535-147315026-ghe-doctorloan-90D-4-1000x1000-1-1-800x800.jpg\" alt=\"Ghế sáng chế DoctorLoan 90D (đệm dày)\" width=\"800\" height=\"800\" /><figcaption id=\"caption-attachment-4951\" class=\"wp-caption-text\">Ghế sáng chế DoctorLoan 90D (đệm dày)</figcaption></figure>\n<p class=\"isSelectedEnd\"><span style=\"color: #000000\"><strong>Ghế sáng chế DoctorLoan 90</strong> được thiết kế dành cho những người thường xuyên phải ngồi làm việc, học tập trong thời gian dài.</span></p>\n<p class=\"isSelectedEnd\"><span style=\"color: #000000\">Sản phẩm hỗ trợ người sử dụng <strong>duy trì tư thế ngồi thẳng và ổn định</strong>, đồng thời tập trung hỗ trợ định hướng tư thế tại các vùng <strong>cột sống lưng, xương cùng – xương cụt và xương chậu</strong>.</span></p>\n<p class=\"isSelectedEnd\"><span style=\"color: #000000\">Nhờ thiết kế hướng đến tư thế ngồi khoa học, DoctorLoan 90 có thể trở thành lựa chọn phù hợp cho:</span></p>\n<ul data-spread=\"false\">\n<li><span style=\"color: #000000\">Nhân viên văn phòng thường xuyên làm việc với máy tính.</span></li>\n<li><span style=\"color: #000000\">Học sinh, sinh viên ngồi học nhiều giờ mỗi ngày.</span></li>\n<li><span style=\"color: #000000\">Thợ may và những người làm việc tại bàn.</span></li>\n<li><span style=\"color: #000000\">Kỹ thuật viên phun xăm.</span></li>\n<li><span style=\"color: #000000\">Nhân viên nail.</span></li>\n<li><span style=\"color: #000000\">Người có đặc thù công việc phải ngồi lâu.</span></li>\n</ul>\n<p class=\"isSelectedEnd\"><strong><span style=\"color: #000000\">DoctorLoan 90 – hỗ trợ tư thế ngồi đúng, đồng hành cùng bạn trong từng giờ làm việc và học tập.</span></strong></p>\n<h3><strong><span style=\"color: #000000\">Gối sáng chế DoctorLoan – Hỗ trợ tư thế vùng cổ và cột sống lưng</span></strong></h3>\n<p class=\"isSelectedEnd\"><span style=\"color: #000000\">Bên cạnh giải pháp dành cho tư thế ngồi, <strong>Gối sáng chế DoctorLoan</strong> được phát triển nhằm hỗ trợ chăm sóc <strong>cột sống cổ và cột sống lưng</strong>.</span></p>\n<figure id=\"attachment_4948\" aria-describedby=\"caption-attachment-4948\" style=\"width: 800px\" class=\"wp-caption aligncenter\"><img class=\"wp-image-4948 size-large\" src=\"https://bsthaocotsong.com/wp-content/uploads/2026/08/1768140497963-707220928-goi-co-doctorloan-f4-3-1000x1000-1-800x800.jpg\" alt=\"Gối cổ sáng chế DoctorLoan F4\" width=\"800\" height=\"800\" /><figcaption id=\"caption-attachment-4948\" class=\"wp-caption-text\">Gối cổ sáng chế DoctorLoan F4</figcaption></figure>\n<p class=\"isSelectedEnd\"><span style=\"color: #000000\">Thiết kế của sản phẩm hướng đến việc hỗ trợ cơ thể duy trì tư thế phù hợp, tập trung vào các vùng cột sống quan trọng trong quá trình nghỉ ngơi và sinh hoạt.</span></p>\n<figure id=\"attachment_4949\" aria-describedby=\"caption-attachment-4949\" style=\"width: 800px\" class=\"wp-caption aligncenter\"><img class=\"wp-image-4949 size-large\" src=\"https://bsthaocotsong.com/wp-content/uploads/2026/08/1768140443068-271317917-goi-lung-doctorloan-f3-4-1000x1000-1-800x800.jpg\" alt=\"Gối lưng sáng chế DoctorLoan F3\" width=\"800\" height=\"800\" /><figcaption id=\"caption-attachment-4949\" class=\"wp-caption-text\">Gối lưng sáng chế DoctorLoan F3</figcaption></figure>\n<p class=\"isSelectedEnd\"><span style=\"color: #000000\">Với những người thường xuyên làm việc ở tư thế ngồi, sử dụng máy tính hoặc có cường độ học tập cao, việc kết hợp các giải pháp hỗ trợ tư thế trong sinh hoạt hằng ngày có thể giúp hình thành thói quen chăm sóc cột sống một cách chủ động hơn.</span></p>\n<p class=\"isSelectedEnd\"><span style=\"color: #000000\">Gối DoctorLoan – giải pháp hỗ trợ chăm sóc cột sống cổ và lưng trong cuộc sống hằng ngày.</span></p>\n<h3><strong><span style=\"color: #000000\">Ghế sáng chế DoctorLoan N85 – Hỗ trợ duy trì dáng ngồi chuẩn trong sinh hoạt</span></strong></h3>\n<figure id=\"attachment_4950\" aria-describedby=\"caption-attachment-4950\" style=\"width: 800px\" class=\"wp-caption aligncenter\"><img class=\"wp-image-4950 size-large\" src=\"https://bsthaocotsong.com/wp-content/uploads/2026/08/1768140199100-761249413-ghe-doctorloan-N85-3-1000x1000-1-800x800.jpg\" alt=\"Ghế sáng chế DoctorLoan N85 CHÂN NGẮN\" width=\"800\" height=\"800\" /><figcaption id=\"caption-attachment-4950\" class=\"wp-caption-text\">Ghế sáng chế DoctorLoan N85 CHÂN NGẮN</figcaption></figure>\n<p class=\"isSelectedEnd\"><span style=\"color: #000000\"><strong>Ghế sáng chế DoctorLoan N85</strong> được thiết kế để hỗ trợ người dùng <strong>duy trì dáng ngồi phù hợp trong các hoạt động sinh hoạt hằng ngày</strong>.</span></p>\n<p class=\"isSelectedEnd\"><span style=\"color: #000000\">Không chỉ dành cho thời gian làm việc, N85 hướng đến việc giúp người dùng chú ý hơn đến tư thế trong nhiều hoạt động khác nhau, từ ngồi nghỉ ngơi, trò chuyện đến các sinh hoạt thường nhật.</span></p>\n<p class=\"isSelectedEnd\"><span style=\"color: #000000\">Đây là lựa chọn phù hợp cho những người mong muốn xây dựng <strong>thói quen ngồi khoa học</strong>, chủ động quan tâm đến tư thế và chăm sóc cột sống lâu dài.</span></p>\n<p class=\"isSelectedEnd\"><span style=\"color: #000000\">DoctorLoan N85 – hỗ trợ duy trì dáng ngồi phù hợp trong từng hoạt động hằng ngày.</span></p>\n<h2><strong><span style=\"color: #000000\">DoctorLoan – Chủ động chăm sóc cột sống bắt đầu từ tư thế</span></strong></h2>\n<p class=\"isSelectedEnd\"><span style=\"color: #000000\">Cột sống đóng vai trò quan trọng trong khả năng vận động và các hoạt động thường ngày. Tuy nhiên, chúng ta thường chỉ quan tâm đến cột sống khi cơ thể xuất hiện cảm giác khó chịu.</span></p>\n<p class=\"isSelectedEnd\"><span style=\"color: #000000\">Thay vì chờ đến khi vấn đề xuất hiện, mỗi người có thể bắt đầu từ những điều đơn giản như <strong>chú ý tư thế khi ngồi, thay đổi tư thế sau thời gian dài và xây dựng thói quen sinh hoạt khoa học</strong>.</span></p>\n<p class=\"isSelectedEnd\"><span style=\"color: #000000\">Với hệ thống sản phẩm gồm <strong>Ghế DoctorLoan 90, Gối DoctorLoan và Ghế DoctorLoan N85</strong>, DoctorLoan hướng đến việc cung cấp các giải pháp hỗ trợ tư thế phù hợp với nhiều nhu cầu khác nhau trong cuộc sống.</span></p>\n<p class=\"isSelectedEnd\"><span style=\"color: #000000\">Dù bạn là <strong>dân văn phòng, học sinh, sinh viên, thợ may, kỹ thuật viên phun xăm, nhân viên nail</strong> hay thường xuyên phải ngồi trong thời gian dài, việc lựa chọn một giải pháp hỗ trợ tư thế phù hợp có thể là bước khởi đầu để bạn quan tâm hơn đến sức khỏe cột sống mỗi ngày.</span></p>\n<h3><strong><span style=\"color: #000000\">Lựa chọn giải pháp DoctorLoan phù hợp với nhu cầu của bạn</span></strong></h3>\n<ul data-spread=\"false\">\n<li><span style=\"color: #000000\"><strong>DoctorLoan 90:</strong> Hỗ trợ duy trì tư thế ngồi thẳng, tập trung vào vùng cột sống lưng, xương cùng – xương cụt và xương chậu.</span></li>\n<li><span style=\"color: #000000\"><strong>Gối DoctorLoan:</strong> Hỗ trợ chăm sóc và định hướng tư thế vùng cột sống cổ và cột sống lưng.</span></li>\n<li><span style=\"color: #000000\"><strong>DoctorLoan N85:</strong> Hỗ trợ duy trì dáng ngồi phù hợp trong các hoạt động sinh hoạt hằng ngày.</span></li>\n</ul>\n<p><span style=\"color: #000000\">DoctorLoan – đồng hành cùng bạn xây dựng tư thế khoa học và chủ động chăm sóc cột sống mỗi ngày.</span></p>\n<h3><strong>Link chi tiết về sản phẩm trong Combo Văn Phòng 1:</strong></h3>\n<h1 class=\"text-2xl md:text-3xl font-bold text-gray-900 leading-tight break-words\"><span style=\"color: #000000\"><a style=\"color: #000000\" href=\"https://bsthaocotsong.com/san-pham/goi-co-sang-che-doctorloan-f4/\">– Gối cổ sáng chế DoctorLoan F4: 7.624.000 vnđ</a></span></h1>\n<h1 class=\"text-2xl md:text-3xl font-bold text-gray-900 leading-tight break-words\"><span style=\"color: #000000\"><a style=\"color: #000000\" href=\"https://bsthaocotsong.com/san-pham/goi-lung-sang-che-doctorloan-f3/\">– Gối lưng sáng chế DoctorLoan F3: 3.737.000 vnđ</a></span></h1>\n<h1 class=\"text-2xl md:text-3xl font-bold text-gray-900 leading-tight break-words\"><span style=\"color: #000000\"><a style=\"color: #000000\" href=\"https://bsthaocotsong.com/san-pham/ghe-sang-che-doctorloan-n85-chan-ngan/\">– Ghế sáng chế DoctorLoan N85 CHÂN NGẮN: 2.127.000 vnđ</a></span></h1>\n<h1 class=\"text-2xl md:text-3xl font-bold text-gray-900 leading-tight break-words\"><span style=\"color: #000000\"><a style=\"color: #000000\" href=\"https://bsthaocotsong.com/san-pham/4469/\">– Ghế sáng chế DoctorLoan 90D (đệm dày): 34.937.000 vnđ</a></span></h1>",
    "published": true,
    "sort_order": 20,
    "button_label": "Đặt mua ngay",
    "button_class": "",
    "video_button_label": "",
    "video_button_class": "",
    "display_layout": "card",
    "badge_label": "Gói Combo",
    "gallery_urls": "",
    "chat_button_label": "Chat tư vấn",
    "chat_button_url": "",
    "chat_button_class": "open-chat-trigger"
  }
];

/**
 * Hàm nhập trực tiếp 20 sản phẩm vào bảng Products của Google Sheet
 */
function importHongCotSongProducts() {
  let ss = null;
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {}
  
  if (!ss) {
    const propId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
    if (propId) {
      ss = SpreadsheetApp.openById(propId);
    }
  }
  
  if (!ss) {
    throw new Error('Không tìm thấy Google Sheet. Vui lòng mở từ Sheet hoặc cấu hình Script Property SPREADSHEET_ID.');
  }

  let sh = ss.getSheetByName('Products');
  if (!sh) {
    sh = ss.insertSheet('Products');
  }

  const headers = [
    'id', 'name', 'price', 'currency', 'image_url', 'video_url', 'buy_url',
    'description', 'published', 'sort_order', 'button_label', 'button_class',
    'video_button_label', 'video_button_class', 'display_layout', 'badge_label',
    'gallery_urls', 'chat_button_label', 'chat_button_url', 'chat_button_class'
  ];

  // Đảm bảo đủ cột
  if (sh.getMaxColumns() < headers.length) {
    sh.insertColumnsAfter(sh.getMaxColumns(), headers.length - sh.getMaxColumns());
  }

  // Ghi tiêu đề ở hàng 1
  sh.getRange(1, 1, 1, headers.length)
    .setValues([headers])
    .setBackground('#2B5675')
    .setFontColor('#ffffff')
    .setFontWeight('bold');

  const rows = HONG_COT_SONG_PRODUCTS.map(p => headers.map(k => p[k] !== undefined ? p[k] : ''));

  // Đảm bảo đủ hàng
  if (sh.getMaxRows() < rows.length + 1) {
    sh.insertRowsAfter(sh.getMaxRows(), (rows.length + 1) - sh.getMaxRows());
  }

  // Xóa dữ liệu cũ nếu có
  const lastRow = sh.getLastRow();
  if (lastRow > 1) {
    sh.getRange(2, 1, lastRow - 1, sh.getLastColumn()).clearContent();
  }

  // Ghi 20 dòng sản phẩm từ dòng 2
  sh.getRange(2, 1, rows.length, headers.length).setValues(rows);

  // Tạo checkbox cho cột published
  const publishedCol = headers.indexOf('published') + 1;
  if (publishedCol > 0) {
    sh.getRange(2, publishedCol, rows.length, 1)
      .setDataValidation(SpreadsheetApp.newDataValidation().requireCheckbox().build());
  }

  // Định dạng hiển thị
  sh.setFrozenRows(1);
  sh.getDataRange().setWrap(true).setVerticalAlignment('top');

  // Đặt độ rộng cột tối ưu
  sh.setColumnWidth(1, 200); // id
  sh.setColumnWidth(2, 280); // name
  sh.setColumnWidth(3, 120); // price
  sh.setColumnWidth(4, 70);  // currency
  sh.setColumnWidth(5, 300); // image_url
  sh.setColumnWidth(7, 300); // buy_url
  sh.setColumnWidth(8, 450); // description
  sh.setColumnWidth(16, 160); // badge_label
  sh.setColumnWidth(17, 320); // gallery_urls

  SpreadsheetApp.flush();
  try {
    SpreadsheetApp.getUi()?.alert?.('✅ Thành công', 'Đã nhập đầy đủ 20 sản phẩm từ hongcotsong.com vào bảng Products!', SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (_) {}
  console.log('Đã nhập thành công ' + rows.length + ' sản phẩm vào bảng Products: ' + ss.getUrl());
  return { success: true, count: rows.length };
}

/**
 * Tự động tạo menu trong Google Sheet khi mở
 */
function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu('An Cột Sống')
      .addItem('📥 Nhập 20 sản phẩm hongcotsong.com', 'importHongCotSongProducts')
      .addToUi();
  } catch (e) {
    console.log(e);
  }
}

/**
 * RPC hỗ trợ gọi trực tiếp từ Web App Admin (Admin.html)
 */
function adminImportHongCotSongProducts(request) {
  const ss = adminRequireSession_(request);
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const headers = ADMIN_SCHEMA.Products;
    const rows = HONG_COT_SONG_PRODUCTS.map((p, idx) => {
      const r = Object.assign({}, p);
      r.sort_order = idx + 1;
      return r;
    });
    adminWriteTable_(ss, 'Products', rows);
    SpreadsheetApp.flush();
    return adminRead_(ss);
  } finally {
    lock.releaseLock();
  }
}
