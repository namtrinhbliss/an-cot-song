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
 Products:['id','name','price','currency','image_url','video_url','buy_url','description','published','sort_order','button_label','button_class','video_button_label','video_button_class','display_layout','badge_label','gallery_urls'],
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
  ADMIN_SCHEMA[name].filter(k=>!['button_label','button_class','video_button_label','video_button_class','display_layout','badge_label','gallery_urls'].includes(k)).forEach(k=>{if(!headers.includes(k))throw Error('Thiếu cột '+name+'.'+k);});
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
