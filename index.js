require("./setting.js")
const { default: generateWAMessageFromContent, prepareWAMessageMedia, proto } = require("@whiskeysockets/baileys")
const { downloadContentFromMessage } = require('@adiwajshing/baileys');
const fs = require("fs");
const moment = require("moment-timezone");
const fetch = require('node-fetch');
const toMs = require('ms');
const ms = require('parse-ms');
const os = require('os');
const speed = require("performance-now");
const util = require('util');
const { ocrSpace } = require('ocr-space-api-wrapper')
const { exec, execSync, spawn } = require("child_process");
const { sizeFormatter } = require('human-readable');

let db_sewa = JSON.parse(fs.readFileSync('./database/sewa.json'));
let db_saldo = JSON.parse(fs.readFileSync("./database/saldo.json"));
let db_antilink = JSON.parse(fs.readFileSync('./database/antilink.json'));
let db_antilink2 = JSON.parse(fs.readFileSync('./database/antilink2.json'));
let db_welcome = JSON.parse(fs.readFileSync('./database/welcome.json'));
let db_done = JSON.parse(fs.readFileSync('./database/set-done.json'));
let db_proses = JSON.parse(fs.readFileSync('./database/set-proses.json'));
let db_respon_list = JSON.parse(fs.readFileSync('./database/list-message.json'));
let db_respon_testi = JSON.parse(fs.readFileSync('./database/list-testi.json'));
let db_respon_produk = JSON.parse(fs.readFileSync('./database/list-produk.json'));
let db_order = JSON.parse(fs.readFileSync('./database/order.json'));
let idTrx = JSON.parse(fs.readFileSync('./database/idtrx.json'))
let depositPath = "./options/deposit/"
let topupPath = "./options/topup/"

const { addSaldo, minSaldo, cekSaldo } = require("./function/deposit");
const { getBuffer, getGroupAdmins, runtime, sleep } = require("./function/myfunc");
const { isSetDone, addSetDone, delSetDone, changeSetDone, getTextSetDone } = require('./function/setdone');
const { isSetProses, addSetProses, delSetProses, changeSetProses, getTextSetProses } = require('./function/setproses');
const { addResponList, delResponList, isAlreadyResponList, isAlreadyResponListGroup, sendResponList, updateResponList, getDataResponList } = require('./function/respon-list');
const { addResponTesti, delResponTesti, isAlreadyResponTesti, sendResponTesti, updateResponTesti, getDataResponTesti } = require('./function/respon-testi');
const { addResponProduk, delResponProduk, isAlreadyResponProduk, getDeskripsiProduk, getHargaProduk, getNamaProduk, updateResponProduk, getDataResponProduk } = require('./function/respon-produk');
const { stalkff, stalkml } = require('./function/stalker');
const { color } = require('./function/console');
const { TelegraPh } = require('./function/uploader');
const { addSewaGroup, getSewaExpired, getSewaPosition, expiredCheck, checkSewa, getAllSewa } = require("./function/sewa");
global.prefa = ['','.']

moment.tz.setDefault("Asia/Jakarta").locale("id");
const d = new Date 
const tanggal = d.toLocaleDateString('id', { 
day: 'numeric', 
month: 'long', 
year: 'numeric' 
})
const dnew = new Date(new Date + 3600000)
const dateIslamic = Intl.DateTimeFormat('id' + '-TN-u-ca-islamic', {
day: 'numeric',
month: 'long',
year: 'numeric'
}).format(dnew)

module.exports = async(ronzz, msg, m, store) => {
try {
const { type, quotedMsg, mentioned, now, fromMe, isBaileys } = msg
if (msg.isBaileys) return
const jamwib = moment.tz('asia/jakarta').format('HH:mm:ss')
const jamwita = moment.tz('asia/makassar').format('HH:mm:ss')
const jamwit = moment.tz('asia/jayapura').format('HH:mm:ss')
const dt = moment.tz('Asia/Jakarta').format('HH')
const content = JSON.stringify(msg.message)
const from = msg.key.remoteJid
const chats = (type === 'conversation' && msg.message.conversation) ? msg.message.conversation : (type === 'imageMessage') && msg.message.imageMessage.caption ? msg.message.imageMessage.caption : (type === 'videoMessage') && msg.message.videoMessage.caption ? msg.message.videoMessage.caption : (type === 'extendedTextMessage') && msg.message.extendedTextMessage.text ? msg.message.extendedTextMessage.text : (type === 'buttonsResponseMessage') && quotedMsg.fromMe && msg.message.buttonsResponseMessage.selectedButtonId ? msg.message.buttonsResponseMessage.selectedButtonId : (type === 'templateButtonReplyMessage') && quotedMsg.fromMe && msg.message.templateButtonReplyMessage.selectedId ? msg.message.templateButtonReplyMessage.selectedId : (type === 'messageContextInfo') ? (msg.message.buttonsResponseMessage?.selectedButtonId || msg.message.listResponseMessage?.singleSelectReply.selectedRowId) : (type == 'listResponseMessage') && quotedMsg.fromMe && msg.message.listResponseMessage.singleSelectReply.selectedRowId ? msg.message.listResponseMessage.singleSelectReply.selectedRowId : ""
const toJSON = j => JSON.stringify(j, null,'\t')
const prefix = prefa ? /^[°•π÷×¶∆£¢€¥®=????+✓_=|~!?@#%^&.©^]/gi.test(chats) ? chats.match(/^[°•π÷×¶∆£¢€¥®=????+✓_=|~!?@#%^&.©^]/gi)[0] : "" : prefa ?? '#'
const isGroup = msg.key.remoteJid.endsWith('@g.us')
const sender = isGroup ? (msg.key.participant ? msg.key.participant : msg.participant) : msg.key.remoteJid
const isOwner = [ronzz.user.id, ...owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(sender) ? true : false
const pushname = msg.pushName
const body = chats.startsWith(prefix) ? chats : ''
const budy = (type === 'conversation') ? msg.message.conversation : (type === 'extendedTextMessage') ? msg.message.extendedTextMessage.text : ''
const args = chats.trim().split(/ +/).slice(1);
const q = args.join(" ");
const isCommand = chats.startsWith(prefix);
const command = chats.replace(prefix, '').trim().split(/ +/).shift().toLowerCase()
const isCmd = isCommand ? chats.slice(1).trim().split(/ +/).shift().toLowerCase() : null;
const botNumber = ronzz.user.id.split(':')[0] + '@s.whatsapp.net'
const groupMetadata = isGroup ? await ronzz.groupMetadata(from) : ''
const groupName = isGroup ? groupMetadata.subject : ''
const groupId = isGroup ? groupMetadata.id : ''
const groupMembers = isGroup ? groupMetadata.participants : ''
const groupAdmins = isGroup ? getGroupAdmins(groupMembers) : ''
const isBotGroupAdmins = groupAdmins.includes(botNumber) || false
const isGroupAdmins = groupAdmins.includes(sender)
const participants = isGroup ? await groupMetadata.participants : ''

const quoted = msg.quoted ? msg.quoted : msg
const mime = (quoted.msg || quoted).mimetype || ''
const isImage = (type == 'imageMessage')
const isQuotedMsg = msg.isQuotedMsg
const isMedia = (type === 'imageMessage' || type === 'videoMessage');
const isQuotedImage = isQuotedMsg ? content.includes('imageMessage') ? true : false : false
const isVideo = (type == 'videoMessage')
const isQuotedVideo = isQuotedMsg ? content.includes('videoMessage') ? true : false : false
const isSticker = (type == 'stickerMessage')
const isQuotedSticker = isQuotedMsg ? content.includes('stickerMessage') ? true : false : false 
const isQuotedAudio = isQuotedMsg ? content.includes('audioMessage') ? true : false : false
const dataGroup = (type === 'buttonsResponseMessage') ? msg.message.buttonsResponseMessage.selectedButtonId : ''
const dataPrivate = (type === "messageContextInfo") ? (msg.message.buttonsResponseMessage?.selectedButtonId || msg.message.listResponseMessage?.singleSelectReply.selectedRowId) : ''
const isButton = dataGroup.length !== 0 ? dataGroup : dataPrivate
const dataListG = (type === "listResponseMessage") ? msg.message.listResponseMessage.singleSelectReply.selectedRowId : ''
const dataList = (type === 'messageContextInfo') ? (msg.message.buttonsResponseMessage?.selectedButtonId || msg.message.listResponseMessage?.singleSelectReply.selectedRowId) : ''
const isListMessage = dataListG.length !== 0 ? dataListG : dataList
const isSewa = checkSewa(from, db_sewa)

const reply = (teks, options = {}) => {ronzz.sendMessage(from, { text: teks, ...options }, { quoted: msg })}
const textImg = (teks) => {return ronzz.sendMessage(from, { text: teks, jpegThumbnail: fs.readFileSync(thumbnail) }, { quoted: msg })}
const sendMess = (hehe, teks) => {ronzz.sendMessage(hehe, { text, teks })}
const fkontak = { key: {fromMe: false,participant: `0@s.whatsapp.net`, ...(from ? { remoteJid: "status@broadcast" } : {}) }, message: { 'contactMessage': { 'displayName': `Bot Created By Ronzz YT\n`, 'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:XL;VelzzyBot,;;;\nFN:${pushname},\nitem1.TEL;waid=${sender.split('@')[0]}:${sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`, 'jpegThumbnail': { url: 'https://telegra.ph/file/3c485ff201d9337be14ef.jpg' }}}}
function parseMention(text = '') {
return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
}
const sendContact = (jid, numbers, name, quoted, mn) => {
let number = numbers.replace(/[^0-9]/g, '')
const vcard = 'BEGIN:VCARD\n' 
+ 'VERSION:3.0\n' 
+ 'FN:' + name + '\n'
+ 'ORG:;\n'
+ 'TEL;type=CELL;type=VOICE;waid=' + number + ':+' + number + '\n'
+ 'END:VCARD'
return ronzz.sendMessage(jid, { contacts: { displayName: name, contacts: [{ vcard }] }, mentions : mn ? mn : []},{ quoted: quoted })
}

const mentionByTag = type == "extendedTextMessage" && msg.message.extendedTextMessage.contextInfo != null ? msg.message.extendedTextMessage.contextInfo.mentionedJid : []
const mentionByReply = type == "extendedTextMessage" && msg.message.extendedTextMessage.contextInfo != null ? msg.message.extendedTextMessage.contextInfo.participant || "" : ""
const mention = typeof(mentionByTag) == 'string' ? [mentionByTag] : mentionByTag
mention != undefined ? mention.push(mentionByReply) : []
const mentionUser = mention != undefined ? mention.filter(n => n) : []

const isEmoji = (emo) => {
let emoji_ranges = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
let regexEmoji = new RegExp(emoji_ranges, 'gi');
return emo.match(regexEmoji)
}

async function downloadAndSaveMediaMessage (type_file, path_file) {
if (type_file === 'image') {
var stream = await downloadContentFromMessage(msg.message.imageMessage || msg.message.extendedTextMessage?.contextInfo.quotedMessage.imageMessage, 'image')
let buffer = Buffer.from([])
for await(const chunk of stream) {
buffer = Buffer.concat([buffer, chunk]) }
fs.writeFileSync(path_file, buffer)
return path_file } 
else if (type_file === 'video') {
var stream = await downloadContentFromMessage(msg.message.videoMessage || msg.message.extendedTextMessage?.contextInfo.quotedMessage.videoMessage, 'video')
let buffer = Buffer.from([])
for await(const chunk of stream) {
buffer = Buffer.concat([buffer, chunk])}
fs.writeFileSync(path_file, buffer)
return path_file
} else if (type_file === 'sticker') {
var stream = await downloadContentFromMessage(msg.message.stickerMessage || msg.message.extendedTextMessage?.contextInfo.quotedMessage.stickerMessage, 'sticker')
let buffer = Buffer.from([])
for await(const chunk of stream) {
buffer = Buffer.concat([buffer, chunk])}
fs.writeFileSync(path_file, buffer)
return path_file
} else if (type_file === 'audio') {
var stream = await downloadContentFromMessage(msg.message.audioMessage || msg.message.extendedTextMessage?.contextInfo.quotedMessage.audioMessage, 'audio')
let buffer = Buffer.from([])
for await(const chunk of stream) {
buffer = Buffer.concat([buffer, chunk])}
fs.writeFileSync(path_file, buffer)
return path_file}
}

//Ucapan waktu
  if (dt >= 0) {
    var ucapanWaktu = ('Selamat Malam🌃')
  }
  if (dt >= 4) {
    var ucapanWaktu = ('Selamat Pagi🌄')
  }
  if (dt >= 12) {
    var ucapanWaktu = ('Selamat Siang☀️')
  }
  if (dt >= 16) {
    var ucapanWaktu = ('️ Selamat Sore🌇')
  }
  if (dt >= 23) {
    var ucapanWaktu = ('Selamat Malam🌙')
  }

function mentions(teks, mems = [], id) {
if (id == null || id == undefined || id == false) {
let res = ronzz.sendMessage(from, { text: teks, mentions: mems }, { quoted: msg })
return res
} else {
let res = ronzz.sendMessage(from, { text: teks, mentions: mems }, { quoted: msg })
return res
}
}

function toRupiah(angka) {
var saldo = '';
var angkarev = angka.toString().split('').reverse().join('');
for (var i = 0; i < angkarev.length; i++)
if (i % 3 == 0) saldo += angkarev.substr(i, 3) + '.';
return '' + saldo.split('', saldo.length - 1).reverse().join('');
}

const pickRandom = (arr) => {
return arr[Math.floor(Math.random() * arr.length)]
}

function randomNomor(min, max = null) {
if (max !== null) {
min = Math.ceil(min);
max = Math.floor(max);
return Math.floor(Math.random() * (max - min + 1)) + min;
} else {
return Math.floor(Math.random() * min) + 1
}
}

const formatp = sizeFormatter({
std: 'JEDEC', 
decimalPlaces: 2,
keepTrailingZeroes: false,
render: (literal, symbol) => `${literal} ${symbol}B`,
})

expiredCheck(db_sewa, ronzz, msg, groupId)

if (command === "payqris") {
if (!fs.existsSync(depositPath + sender.split("@")[0] + ".json")) {
var deposit_object = {
ID: require("crypto").randomBytes(5).toString("hex").toUpperCase(),
session: "amount",
name: pushname,
date: moment.tz('Asia/Jakarta').format('DD MMMM YYYY'),
number: sender,
payment: "QRIS",
data: {
amount_deposit: ""
}
}
fs.writeFileSync(depositPath + sender.split("@")[0] + ".json", JSON.stringify(deposit_object, null, 2))
reply("Oke kak mau deposit berapa?\n\nContoh: 15000")
} else {
reply("Proses deposit kamu masih ada yang belum terselesaikan.\n\nKetik *batal* untuk membatalkan.")
}
} else if (command === "paydana") {
if (!fs.existsSync(depositPath + sender.split("@")[0] + ".json")) {
var deposit_object = {
ID: require("crypto").randomBytes(5).toString("hex").toUpperCase(),
session: "amount",
name: pushname,
date: moment.tz('Asia/Jakarta').format('DD MMMM YYYY'),
number: sender,
payment: "DANA",
data: {
amount_deposit: ""
}
}
fs.writeFileSync(depositPath + sender.split("@")[0] + ".json", JSON.stringify(deposit_object, null, 2))
reply("Oke kak mau deposit berapa?\n\nContoh: 15000")
} else {
reply("Proses deposit kamu masih ada yang belum terselesaikan.\n\nKetik *batal* untuk membatalkan.")
}
}

if (fs.existsSync(depositPath + sender.split("@")[0] + ".json")) {
if (!msg.key.fromMe) {
let data_deposit = JSON.parse(fs.readFileSync(depositPath + sender.split("@")[0] + ".json"))
if (data_deposit.session === "amount") {
if (isNaN(chats)) return reply("Masukan hanya angka ya")
data_deposit.data.amount_deposit = Number(chats);
data_deposit.session = "konfirmasi_deposit";
fs.writeFileSync(depositPath + sender.split("@")[0] + ".json", JSON.stringify(data_deposit, null, 3));
let pajakny = (pajak / 100) * data_deposit.data.amount_deposit
reply(`*KONFIRMASI DEPOSIT*\n\n*ID:* ${data_deposit.ID}\n*Nomer:* ${data_deposit.number.split('@')[0]}\n*Payment:* ${data_deposit.payment}\n*Jumlah Deposit:* Rp${toRupiah(data_deposit.data.amount_deposit)}\n*Pajak:* Rp${toRupiah(Number(Math.ceil(pajakny)))}\n*Total Pembayaran:* Rp${toRupiah(data_deposit.data.amount_deposit+Number(Math.ceil(pajakny)))}\n\n_Deposit akan dibatalkan otomatis apabila terdapat kesalahan input._\n\n_Ketik *lanjut* untuk melanjutkan_\n_Ketik *batal* untuk membatalkan_`)
} else if (data_deposit.session === "konfirmasi_deposit") {
if (chats.toLowerCase() === "lanjut") {
if (data_deposit.payment === "QRIS") {
var pyqrs =`*PAYMENT QRIS*
 
*URL:* ${payment.qris.link}
*A/N:* ${payment.qris.an}

_Silahkan transfer dengan nomor yang sudah tertera,_
_jika sudah harap kirim bukti foto dengan caption *bukti* untuk di acc otomatis oleh bot._

*NOTE*
_Kirim bukti transaksi dengan benar dan diwajibkan id transaksi terlihat jika tidak deposit akan dibatalkan otomatis._
_Jika anda tf selain dari dana silahkan hubungi wa.me/${ownerNomer}_

*CONTOH BUKTI TRANSAKSI DENGAN BENAR*
https://telegra.ph/file/c14c75c7b7c4534bdb015.jpg`
ronzz.sendMessage(from, { image: { url: payment.qris.link }, caption: pyqrs }, { quoted: msg })
} else if (data_deposit.payment === "DANA") {
var py_dana =`*PAYMENT DANA*
 
*NOMER:* ${payment.dana.nope}
*A/N:* ${payment.dana.an}

_Silahkan transfer dengan nomor yang sudah tertera,_
_jika sudah harap kirim bukti foto dengan caption *bukti* untuk di acc oleh admin_`
reply(py_dana)
}} else if (chats.toLowerCase() === "batal") {
reply(`Baik kak, deposit dengan ID: ${data_deposit.ID} dibatalkan`)
fs.unlinkSync(depositPath + sender.split('@')[0] + '.json')
}}}}

if (fs.existsSync(topupPath + sender.split("@")[0] + ".json")) {
let data_topup = JSON.parse(fs.readFileSync(topupPath + sender.split("@")[0] + ".json"))
if (data_topup.data.code.startsWith('DML')) {
var intervals = setInterval(function() {
fetch(`https://b2b.okeconnect.com/trx-v2?product=${data_topup.data.code}&dest=${data_topup.data.idgame+data_topup.data.zone}&refID=${data_topup.data.id}&memberID=${memberId}&pin=${pin}&password=${pw}`)
.then(response => response.json())
.then(res => {
console.log(res); // For Debugging
console.log(color("[CHECKING]", "green"), `-> ${sender}`) // For Debugging
if (res.status === "SUKSES") {
let user = stalkml(data_topup.data.idgame, data_topup.data.zone)
reply(`*TOPUP SUKSES*\n*Status:* success\n*ID Order:* ${res.refid}\n*Jam:* ${res.time} WIB\n*Game ID:* ${data_topup.data.idgame}\n*Zone ID:* ${data_topup.data.zone}\n*Nickname:* ${user.nickname}\n*Price:* Rp${toRupiah(data_topup.data.price)}\n\n*SN:*\n${res.sn}\n\n_Terimakasih kak sudah order.️_`)
minSaldo(sender, Number(data_topup.data.price), db_saldo)
fs.unlinkSync(topupPath + sender.split("@")[0] + ".json")
clearInterval(intervals);
return;
} else if (res.status === 'GAGAL') {
console.log(res)
reply(`Pesanan dibatalkan!\nAlasan: ${res.message}`)
fs.unlinkSync(topupPath + sender.split("@")[0] + ".json")
clearInterval(intervals);
return;
}
})
}, 3000)
} else if (data_topup.data.code.startsWith('FF')) {
var intervals = setInterval(function() {
fetch(`https://b2b.okeconnect.com/trx-v2?product=${data_topup.data.code}&dest=${data_topup.data.idgame}&refID=${data_topup.data.id}&memberID=${memberId}&pin=${pin}&password=${pw}`)
.then(response => response.json())
.then(res => {
console.log(res); // For Debugging
console.log(color("[CHECKING]", "green"), `-> ${sender}`) // For Debugging
if (res.status === "SUKSES") {
let user = stalkff(data_topup.data.idgame)
reply(`*TOPUP SUKSES*\n*Status:* success\n*ID Order:* ${res.refid}\n*Jam:* ${res.time} WIB\n*Game ID:* ${data_topup.data.idgame}\n*Nickname:* ${user.nickname}\n*Price:* Rp${toRupiah(data_topup.data.price)}\n\n*SN:*\n${res.sn}\n\n_Terimakasih kak sudah order.️_`)
minSaldo(sender, Number(data_topup.data.price), db_saldo)
fs.unlinkSync(topupPath + sender.split("@")[0] + ".json")
clearInterval(intervals);
return;
} else if (res.status === 'GAGAL') {
console.log(res)
reply(`Pesanan dibatalkan!\nAlasan: ${res.message}`)
fs.unlinkSync(topupPath + sender.split("@")[0] + ".json")
clearInterval(intervals);
return;
}
})
}, 3000)
} else {
var intervals = setInterval(function() {
fetch(`https://b2b.okeconnect.com/trx-v2?product=${data_topup.data.code}&dest=${data_topup.data.idgame}&refID=${data_topup.data.id}&memberID=${memberId}&pin=${pin}&password=${pw}`)
.then(response => response.json())
.then(res => {
console.log(res); // For Debugging
console.log(color("[CHECKING]", "green"), `-> ${sender}`) // For Debugging
if (res.status === "SUKSES") {
reply(`*TOPUP SUKSES*\n*Status:* success\n*ID Order:* ${res.refid}\n*Jam:* ${res.time} WIB\n*Nomor Tujuan:* ${data_topup.data.idgame}\n*Price:* Rp${toRupiah(data_topup.data.price)}\n\n*SN:*\n${res.sn}\n\n_Terimakasih kak sudah order.️_`)
minSaldo(sender, Number(data_topup.data.price), db_saldo)
fs.unlinkSync(topupPath + sender.split("@")[0] + ".json")
clearInterval(intervals);
return;
} else if (res.status === 'GAGAL') {
console.log(res)
reply(`Pesanan dibatalkan!\nAlasan: ${res.message}`)
fs.unlinkSync(topupPath + sender.split("@")[0] + ".json")
clearInterval(intervals);
return;
}
})
}, 3000)
}
}

if (isGroup && isAlreadyResponList(from, chats, db_respon_list)) {
let get_data_respon = getDataResponList(from, chats, db_respon_list)
if (get_data_respon.isImage === false) {
ronzz.sendMessage(from, { text: sendResponList(from, chats, db_respon_list) }, {
quoted: msg
})
} else {
ronzz.sendMessage(from, { image: { url: get_data_respon.image_url }, caption: get_data_respon.response }, {
quoted: msg
})
}
}

if (isAlreadyResponTesti(chats, db_respon_testi)) {
var get_data_respon = getDataResponTesti(chats, db_respon_testi)
ronzz.sendMessage(from, { image: { url: get_data_respon.image_url }, caption: get_data_respon.response }, { quoted: msg })
}

if (isAlreadyResponProduk(chats, db_respon_produk)) {
var get_data_respon = getDataResponProduk(chats, db_respon_produk)
ronzz.sendMessage(from, { image: { url: get_data_respon.image_url }, caption: get_data_respon.response }, { quoted: msg })
}

if (isGroup && db_antilink.includes(from)) {
if (!isBotGroupAdmins) return
if (chats.match(/(`https:\/\/chat.whatsapp.com\/${ronzz.groupInviteCode(from)}`)/gi)) {
reply(`*GROUP LINK DETECTOR*\n\nAnda tidak akan dikick oleh bot, karena yang anda kirim adalah link group ini.`)
} else if (chats.match(/(https:\/\/chat.whatsapp.com)/gi) && !chats.match(/(`https:\/\/chat.whatsapp.com\/${ronzz.groupInviteCode(from)}`)/gi)) {
if (isOwner) return
if (isGroupAdmins) return
await ronzz.sendMessage(from, { delete: msg.key })
ronzz.sendMessage(from, { text: `*GROUP LINK DETECTOR*\n\nMaaf @${sender.split('@')[0]}, sepertinya kamu mengirimkan link grup, maaf kamu akan di kick.`, mentions: [sender]})
await sleep(500)
ronzz.groupParticipantsUpdate(from, [sender], "remove")
}
}

if (isGroup && db_antilink2.includes(from)) {
if (!isBotGroupAdmins) return
if (chats.match(/(https:\/\/chat.whatsapp.com)/gi) && !chats.match(/(`https:\/\/chat.whatsapp.com\/${ronzz.groupInviteCode(from)}`)/gi)) {
if (isOwner) return
if (isGroupAdmins) return
await ronzz.sendMessage(from, { delete: msg.key })
ronzz.sendMessage(from, { text: `*GROUP LINK DETECTOR*\n\nMaaf @${sender.split('@')[0]}, sepertinya kamu mengirimkan link grup, lain kali jangan kirim link grup yaa.`, mentions: [sender]})
}
}

if (ronzz.autoRead) {
ronzz.readMessages([msg.key])
}
if (ronzz.autoKetik) {
ronzz.sendPresenceUpdate('composing', from)
}

if (msg) {
console.log('->[\x1b[1;32mCMD\x1b[1;37m]', color(moment(msg.messageTimestamp * 1000).format('DD/MM/YYYY HH:mm:ss'), 'yellow'), color(`${prefix+command} [${args.length}]`), 'from', color(pushname), isGroup ? 'in ' + color(groupName) : '')
}

switch(command) {
case 'menu':{
let more = String.fromCharCode(8206)
let readmore = more.repeat(4001)
let teks = `▬▭▬▭▬ ✦✧✦ ▬▭▬▭▬
                     𝗠𝗘𝗡𝗨
▬▭▬▭▬ ✦✧✦ ▬▭▬▭▬
*BOT NAME:* ${botName}
*RUNTIME:* ${runtime(process.uptime())}
*OWNER:* @${ownerNomer}

_SILAHKAN PILIH FITUR DIBAWAH_

*CREDIT:* ${ownerName}
▬▭▬▭▬ ✦✧✦ ▬▭▬▭▬
${readmore}
*INFO BOT*

• ${prefix}creator
• ${prefix}runtime
• ${prefix}ping
• ${prefix}owner

*TOPUP MENU*

• ${prefix}deposit
• ${prefix}topup
• ${prefix}listharga
• ${prefix}saldo

*STORE MENU*

• ${prefix}produk
• ${prefix}order
• ${prefix}testi
• ${prefix}kalkulator

*GROUP MENU*

• ${prefix}group
• ${prefix}list
• ${prefix}kick
• ${prefix}promote
• ${prefix}demote
• ${prefix}delete
• ${prefix}revoke
• ${prefix}linkgc
• ${prefix}hidetag
• ${prefix}on
• ${prefix}off

*OWNER MENU*

• ${prefix}addtesti
• ${prefix}deltesti
• ${prefix}settesti
• ${prefix}addproduk
• ${prefix}delproduk
• ${prefix}setproduk
• ${prefix}listorder
• ${prefix}orderp
• ${prefix}orders
• ${prefix}orderc
• ${prefix}block
• ${prefix}unblock
• ${prefix}kirim
• ${prefix}tarik
• ${prefix}untung
• ${prefix}cekip
• ${prefix}ceksaldo

▬▭▬▭▬ ✦✧✦ ▬▭▬▭▬
        2024 © FlayPedia
▬▭▬▭▬ ✦✧✦ ▬▭▬▭▬`
ronzz.sendMessage(from, { text: teks, mentions: [ownerNomer+'@s.whatsapp.net']}, { quoted: msg })
}
break

case 'deposit': case 'depo':{
ronzz.sendMessage(from, { text: `Hai *@${sender.split('@')[0]}*\nIngin melakukan deposit? silahkan pilih payment yang tersedia\n\n*PAYMENT:* QRIS\n*SISTEM:* Manual\n*ID:* payqris\n\n*PAYMENT:* DANA\n*SISTEM:* Manual\n*ID:* paydana\n\n_Ingin pilih payment? ketik id payment_\nContoh : *payqris*`, mentions: [sender] })
}
break

case 'bukti':{
if (!fs.existsSync(depositPath + sender.split("@")[0] + ".json")) return ronzz.sendMessage(from, { text: `Maaf *@${sender.split('@')[0]}* sepertinya kamu belum pernah melakukan deposit`, mentions: [sender]}, { quoted: msg })
if (!isImage && !isQuotedImage) return reply(`Kirim gambar dengan caption *${prefix}bukti* atau reply gambar yang sudah dikirim dengan caption *${prefix}bukti*`)
let data_depo = JSON.parse(fs.readFileSync(depositPath + sender.split("@")[0] + ".json"))
let media = await downloadAndSaveMediaMessage('image', `./options/deposit/${sender.split('@')[0]}.jpg`)
let pajakny = (pajak / 100) * data_depo.data.amount_deposit
let caption_bukti =`*DEPOSIT USER*
*ID:* ${data_depo.ID}
*Nomer:* @${data_depo.number.split('@')[0]}
*Payment:* ${data_depo.payment}
*Tanggal:* ${data_depo.date}
*Jumlah Deposit:* Rp${toRupiah(data_depo.data.amount_deposit)}
*Pajak:* Rp${toRupiah(Number(Math.ceil(pajakny)))}
*Total Bayar:* Rp${toRupiah(data_depo.data.amount_deposit+Number(Math.ceil(pajakny)))}

Ada yang deposit nih kak, coba dicek saldonya,
Jika sudah masuk konfirmasi dengan cara ketik *#accdepo*
Jika belum masuk batalkan dengan cara ketik *#rejectdepo*`
await ronzz.sendMessage(`${ownerNomer}@s.whatsapp.net`, { image: fs.readFileSync(media), caption: caption_bukti, mentions: [data_depo.number], title: 'BUKTI PEMBAYARAN' })
await reply(`Mohon tunggu yaa kak, sampai di acc oleh owner`)
fs.unlinkSync(`./options/deposit/${sender.split('@')[0]}.jpg`)
}
break

case 'accdepo':{
if (!isOwner) return 
if (!q) return reply(`Contoh: ${prefix+command} 628xxx`)
let orang = q.split(",")[0].replace(/[^0-9]/g, '')
let data_depo = JSON.parse(fs.readFileSync(depositPath + orang + '.json'))
let pajakny = (pajak / 100) * data_depo.data.amount_deposit
addSaldo(data_depo.number, Number(data_depo.data.amount_deposit), db_saldo)
var text_sukses = `*DEPOSIT SUKSES*
*ID:* ${data_depo.ID}
*Nomer:* @${data_depo.number.split('@')[0]}
*Payment:* ${data_depo.payment}
*Tanggal:* ${data_depo.date.split(' ')[0]}
*Jumlah Deposit:* Rp${toRupiah(data_depo.data.amount_deposit)}
*Pajak:* Rp${toRupiah(Number(Math.ceil(pajakny)))}
*Total Bayar:* Rp${toRupiah(data_depo.data.amount_deposit+Number(Math.ceil(pajakny)))}`
await reply(text_sukses)
await ronzz.sendMessage(data_depo.number, { text: `${text_sukses}\n\n_Deposit kamu telah dikonfirmasi oleh admin, silahkan cek saldo dengan cara ketik *#saldo*_`})
fs.unlinkSync(depositPath + data_depo.number.split('@')[0] + ".json")
}
break

case 'rejectdepo':{
if (!isOwner) return 
if (!q) return reply(`Contoh: ${prefix+command} 628xxx`)
let orang = q.split(",")[0].replace(/[^0-9]/g, '')
let data_deposit = JSON.parse(fs.readFileSync(depositPath + orang + '.json'))
await reply(`Sukses reject deposit dengan ID: ${data_deposit.ID}`)
await ronzz.sendMessage(data_deposit.number, { text: `Maaf deposit dengan ID: *${data_deposit.ID}* ditolak, Jika ada kendala hubungin owner bot.\nwa.me/${ownerNomer}`})
fs.unlinkSync(depositPath + data_deposit.number.split('@')[0] + ".json")
}
break

case 'saldo':{
reply(`*CHECK YOUR INFO*

 _• *Name:* ${pushname}_
 _• *Nomer:* ${sender.split('@')[0]}_
 _• *Saldo:* Rp${toRupiah(cekSaldo(sender, db_saldo))}_

*Note :*
_Saldo hanya bisa untuk topup_
_Tidak bisa ditarik atau transfer_!`)
}
break

case 'kirim':{
if (!isOwner) reply(mess.owner)
if (!q) return reply(`Contoh: ${prefix+command} 628xx,20000`)
if (!q.split(",")[0]) return reply(`Contoh: ${prefix+command} 628xx,20000`)
if (!q.split(",")[1]) return reply(`Contoh: ${prefix+command} 628xx,20000`)
let nomorNya = q.split(",")[0].replace(/[^0-9]/g, '')+"@s.whatsapp.net"
addSaldo(nomorNya, Number(q.split(",")[1]), db_saldo)
await sleep(50)
ronzz.sendMessage(from, { text: `*SALDO USER*\nID: ${nomorNya.split('@')[0]}\nNomer: @${nomorNya.split('@')[0]}\nSaldo: Rp${toRupiah(cekSaldo(nomorNya, db_saldo))}`, mentions: [nomorNya]}, { quoted: msg })
}
break

case 'tarik':{
if (!isOwner) reply(mess.owner)
if (!q) return reply(`Contoh: ${prefix+command} 628xx,20000`)
if (!q.split(",")[0]) return reply(`Contoh: ${prefix+command} 628xx,20000`)
if (!q.split(",")[1]) return reply(`Contoh: ${prefix+command} 628xx,20000`)
let nomorNya = q.split(",")[0].replace(/[^0-9]/g, '')+"@s.whatsapp.net"
if (cekSaldo(nomorNya, db_saldo) == 0) return reply("Dia belum terdaftar di database saldo.")
if (cekSaldo(nomorNya, db_saldo) < q.split(",")[1] && cekSaldo(nomorNya, db_saldo) !== 0) return reply(`Dia saldonya ${cekSaldo(nomorNya, db_saldo)}, jadi jangan melebihi ${cekSaldo(nomorNya, db_saldo)} yah kak??`)
minSaldo(nomorNya, Number(q.split(",")[1]), db_saldo)
await sleep(50)
ronzz.sendMessage(from, { text: `*SALDO USER*\nID: ${nomorNya.split('@')[0]}\nNomer: @${nomorNya.split('@')[0]}\nSaldo: Rp${toRupiah(cekSaldo(nomorNya, db_saldo))}`, mentions: [nomorNya]}, { quoted: msg })
}
break

case 'topup':{
if (cekSaldo(sender, db_saldo) < 1) return reply(`Maaf *${pushname}*, sepertinya saldo kamu Rp${toRupiah(cekSaldo(sender, db_saldo))}, silahkan melakukan deposit terlebih dahulu sebelum melakukan topup.`)
if (!fs.existsSync(topupPath + sender.split("@")[0] + ".json")) {
if (!q) return reply(`*FORMAT TOPUP*\n\n*FORMAT ML*\n${prefix+command} kodeproduk,id(zone)\nContoh: ${prefix+command} ML1500,123456789(1234)\n\n*FORMAT LAINNYA*\n${prefix+command} kodeproduk,no/id\n\nUntuk mendapatkan kode produk ketik *${prefix}listharga*`)
if (!q.split(",")[1]) return reply(`*FORMAT TOPUP*\n\n*FORMAT ML*\n${prefix+command} kodeproduk,id(zone)\nContoh: ${prefix+command} ML1500,123456789(1234)\n\n*FORMAT LAINNYA*\n${prefix+command} kodeproduk,no/id\n\nUntuk mendapatkan kode produk ketik *${prefix}listharga*`)
if (q.split(",")[0].startsWith("DML") && !q.split("(")[1]) return reply(`*FORMAT TOPUP*\n\n*FORMAT ML*\n${prefix+command} kodeproduk,id(zone)\nContoh: ${prefix+command} ML1500,123456789(1234)\n\n*FORMAT LAINNYA*\n${prefix+command} kodeproduk,no/id\n\nUntuk mendapatkan kode produk ketik *${prefix}listharga*`)
fetch(okeUrl)
.then(responsee => responsee.json())
.then(ress => {
let listproduk
for (let x of ress) {
if (x.kode == q.split(",")[0]) {
listproduk = x ? x : false
}
}
if (!listproduk) return reply(`Untuk kode produk *${q.split(",")[0]}* tidak ada`)
let kntungan = (untung / 100) * listproduk.harga.replace(/[^0-9]/g, '')
if (cekSaldo(sender, db_saldo) < Number(listproduk.harga.replace(/[^0-9]/g, '')) + Number(Math.ceil(kntungan))) return reply(`Maaf *${pushname},* sepertinya saldo anda kurang dari Rp${toRupiah(Number(listproduk.harga.replace(/[^0-9]/g, '')) + Number(Math.ceil(kntungan)))}, silahkan melakukan deposit terlebih dahulu`)
fetch(`https://b2b.okeconnect.com/trx-v2?product=${q.split(",")[0]}&dest=${q.split(",")[1].replace(/[^0-9]/g, "")}&refID=${require("crypto").randomBytes(5).toString("hex").toUpperCase()}&memberID=${memberId}&pin=${pin}&password=${pw}`)
.then(response => response.json())
.then(res => {
if (res.status.includes('GAGAL')) return reply(res.message)
let keuntungan = (untung / 100) * res.price
var object_buy = {
number: sender,
data: {
id: res.refid,
idgame: q.split("(")[1] ? q.split(",")[1].split("(")[0].replace(/[^0-9]/g, '') : q.split(",")[1].replace(/[^0-9]/g, ''),
zone: q.split("(")[1] ? q.split("(")[1].split(")")[0].replace(/[^0-9]/g, '') : "",
code: q.split(",")[0],
price: Number(res.price) + Number(Math.ceil(keuntungan)),
time: res.time
}
}
fs.writeFile(topupPath + sender.split("@")[0] + ".json", JSON.stringify(object_buy, null, 3), () => {
reply('Transaksi diproses...\n\n*NOTE*\nKetik sesuatu agar bot bisa merespon bahwa transaksi sudah sukses.')
})
})
})
} else {
reply(`Kamu sedang melakukan topup, mohong tunggu sampai proses topup selesai.`)
}
}
break

case 'listharga':{
let teks = `▬▭▬▭▬ ✦✧✦ ▬▭▬▭▬
          *MENU LIST HARGA*
▬▭▬▭▬ ✦✧✦ ▬▭▬▭▬

*• LIST GAME :*
> KETIK *1* LIST HARGA TOPUP ML
> KETIK *2* LIST HARGA TOPUP FF
> KETIK *3* LIST HARGA TOPUP PUBG
> KETIK *4* LIST HARGA TOPUP STUMBLE GUYS
> KETIK *5* LIST HARGA TOPUP SUPER SUS
> KETIK *6* LIST HARGA TOPUP SAUSAGE MAN
> KETIK *7* LIST HARGA TOPUP GENSHIN IMPACT CRYSTALS
> KETIK *8* LIST HARGA TOPUP ARENA OF VALOR
> KETIK *9* LIST HARGA TOPUP EGGY PARTY
> KETIK *10* LIST HARGA TOPUP CALL OF DUTY
> KETIK *11* LIST HARGA TOPUP POINT BLANK ZEPETTO

*• LIST PLN TOKEN DAN TAGIHAN :*
> KETIK *12* LIST HARGA TOKEN PLN PRABAYAR
> KETIK *13* LIST HARGA TOKEN PLN PROMO 
> KETIK *14* LIST BAYAR TAGIHAN PLN


*• LIST PULSA DAN KOUTA*
> KETIK *15* LIST HARGA KUOTA SMARTFREN
> KETIK *16* LIST HARGA KUOTA TELKOMSEL
> KETIK *17* LIST HARGA KUOTA AXIS
> KETIK *18* LIST HARGA KUOTA INDOSAT
> KETIK *19* LIST HARGA KUOTA THREE
> KETIK *20* LIST HARGA KOUTA BYU
> KETIK *21* LIST HARGA KOUTA XL
> KETIK *22* LIST HARGA PULSA SMARTFREN
> KETIK *23* LIST HARGA PULSA TELKOMSEL
> KETIK *24* LIST HARGA PULSA AXIS
> KETIK *25* LIST HARGA PULSA INDOSAT
> KETIK *26* LIST HARGA PULSA THREE
> KETIK *27* LIST HARGA PULSA BYU
> KETIK *28* LIST HARGA PULSA XL

*• LIST SMS & TELEPON*
> KETIK *29* LIST SMS & TELEPON

*• LIST TOPUP E-MONEY*
> KETIK *30* LIST TOP UP SALDO BRIZZI
> KETIK *31* LIST TOP UP SALDO TAPCASH BNI
> KETIK *32* LIST TOP UP SALDO TOLL MANDIRI

*• LIST UANG ELEKTRONIK*
> KETIK *33* LIST HARGA SALDO DANA
> KETIK *34* LIST HARGA SALDO GOPAY
> KETIK *35* LIST HARGA SALDO OVO
> KETIK *36* LIST HARGA SALDO SHOPEEPAY
> KETIK *37* LIST HARGA SALDO LINKAJA
> KETIK *38* LIST HARGA SALDO I.SAKU

 *• LIST BERLANGGANAN STREAMING DAN WIFI*
> KETIK *39* LIST HARGA BERLANGGANAN VCR VIDIO
> KETIK *40* LIST HARGA BERLANGGANAN GENFLIX
> KETIK *41* LIST HARGA LANGGANAN JOOX
> KETIK *42* LIST HARGA LANGGANAN SPOTIFY PREMIUM
> KETIK *43* LIST HARGA LANGGANAN SUSHIROLL
> KETIK *44* LIST HARGA LANGGANAN VCR WIFI ID
> KETIK *45* LIST HARGA LANGGANAN VIU
  
*• LIST BAYAR TAGIHAN WIFI*

> KETIK *46* LIST HARGA TAGIHAN WIFI INDIHOME TELKOM / SPEEDY
> KETIK *47* LIST HARGA TAGIHAN WIFI INTERNET BALI FIBER
> KETIK *48* LIST HARGA TAGIHAN WIFI INTERNET BIZNET HOME
> KETIK *49* LIST HARGA TAGIHAN WIFI INTERNET CBN
> KETIK *50* LIST HARGA TAGIHAN WIFI INTERNET CENTRINE ONLINE
> KETIK *51* LIST HARGA TAGIHAN WIFI INTERNET COMMET
> KETIK *52* LIST HARGA TAGIHAN WIFI INTERNET FIRST MEDIA
> KETIK *53* LIST HARGA TAGIHAN WIFI INTERNET ICONNET
> KETIK *54* LIST HARGA TAGIHAN WIFI INTERNET MY REPUBLIC
> KETIK *55* LIST HARGA TAGIHAN WIFI INTERNET XL HOME

*• LIST BAYAR TAGIHAN*
> KETIK *56* LIST HARGA TAGIHAN BPJS KESEHATAN
> KETIK *57* LIST HARGA TAGIHAN GAS PGN
> KETIK *58* LIST HARGA TAGIHAN PEMBAYARAN PERTAGAS
> KETIK *59* LIST HARGA TOKEN PERTAGAS
> KETIK *60* LIST BAYAR AIR PDAM
> KETIK *61* LIST BAYAR TAGIHAN PBB

*• LIST BAYAR TV DAN TELEPON*
> KETIK *62* LIST BAYAR PASCABAYAR TELEPON
> KETIK *63* LIST BAYAR PASCABAYAR TV

▬▭▬▭▬ ✦✧✦ ▬▭▬▭▬

Note:
Silahkan pilih salah satu menu
dengan mengetik pilihan nomor
dibawah ini (contoh: *1*)

▬▭▬▭▬ ✦✧✦ ▬▭▬▭▬

> 2024 © DTFirst`
reply(teks)
}
break

case '1':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA TOPUP ML*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kode.startsWith('DML')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('Customer H2H ', '') : i.keterangan.replace('Customer ', '')}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '2':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA TOPUP FF*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kode.startsWith('FF')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('Customer H2H ', '') : i.keterangan.replace('Customer ', '')}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '3':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA TOPUP PUBG*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kode.startsWith('PUBG')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('Customer H2H ', '') : i.keterangan.replace('Customer ', '')}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '4':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA TOPUP STUMBLE GUYS*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kode.startsWith('STGY')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('Customer H2H ', '') : i.keterangan.replace('Customer ', '')}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '5':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA TOPUP SUPER SUS*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kode.startsWith('SUS')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('Customer H2H ', '') : i.keterangan.replace('Customer ', '')}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '6':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA TOPUP SAUSAGE MAN*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kode.startsWith('SSGM')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('Customer H2H ', '') : i.keterangan.replace('Customer ', '')}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '7':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA TOPUP GENSHIN IMPACT CRYSTALS*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kode.startsWith('GIASIA')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('Customer H2H ', '') : i.keterangan.replace('Customer ', '')}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '8':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA TOPUP ARENA OF VALOR*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kode.startsWith('AOV')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('Customer H2H ', '') : i.keterangan.replace('Customer ', '')}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '9':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA TOPUP EGGY PARTY*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kode.startsWith('EGP')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('Customer H2H ', '') : i.keterangan.replace('Customer ', '')}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '10':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA TOPUP CALL OF DUTY*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kode.startsWith('CODM')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('Customer H2H ', '') : i.keterangan.replace('Customer ', '')}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '11':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA TOPUP POINT BLANK ZEPETTO*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kode.startsWith('PB')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('Customer H2H ', '') : i.keterangan.replace('Customer ', '')}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '12':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA TOKEN PLN PRABAYAR*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kategori.includes('TOKEN PLN') && i.produk.includes('Token PLN Prabayar')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '13':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA TOKEN PLN PROMO*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kategori.includes('TOKEN PLN') && i.produk.includes('Token PLN Promo')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '14':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST BAYAR TAGIHAN PLN*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kategori.includes('TAGIHAN') && i.produk.includes('Bayar PLN Bulanan')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '15':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA KUOTA SMARTFREN*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kategori.includes('KUOTA SMARTFREN')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '16':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA KUOTA TELKOMSEL*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kategori.includes('KUOTA TELKOMSEL')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '17':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA KUOTA AXIS*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kategori.includes('KUOTA AXIS')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '18':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA KUOTA INDOSAT*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kategori.includes('KUOTA INDOSAT')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '19':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA KUOTA THREE*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kategori.includes('KUOTA TRI')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '20':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA KUOTA BYU*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kategori.includes('KUOTA BYU')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '21':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA KUOTA XL*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kategori.includes('KUOTA XL')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '22':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA PULSA SMARTFREN*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kategori.includes('PULSA') && !i.kategori.includes('PULSA TRANSFER') && i.produk.includes('Smartfren')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '23':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA PULSA TELKOMSEL*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kategori.includes('PULSA') && !i.kategori.includes('PULSA TRANSFER') && i.produk.includes('Telkomsel')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '24':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA PULSA AXIS*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kategori.includes('PULSA') && !i.kategori.includes('PULSA TRANSFER') && i.produk.includes('Axis')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '25':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA PULSA INDOSAT*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kategori.includes('PULSA') && !i.kategori.includes('PULSA TRANSFER') && i.produk.includes('Indosat')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '26':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA PULSA THREE*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kategori.includes('PULSA') && !i.kategori.includes('PULSA TRANSFER') && i.produk.includes('Three')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '27':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA PULSA BYU*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kategori.includes('PULSA') && !i.kategori.includes('PULSA TRANSFER') && i.produk.includes('By U')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '28':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA PULSA XL*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kategori.includes('PULSA') && !i.kategori.includes('PULSA TRANSFER') && i.produk.includes('XL')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '29':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA SMS & TELEPON*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kategori.includes('SMS TELEPON')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '30':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA TOP UP SALDO BRIZZI*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kategori.includes('TOKEN PLN') && i.produk.includes('Top Up Saldo BRIzzi')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '31':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA TOP UP SALDO TAPCASH BNI*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kategori.includes('TOKEN PLN') && i.produk.includes('Top Up Saldo Tapcash BNI')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '32':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA TOP UP SALDO TOL MANDIRI*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kategori.includes('TOKEN PLN') && i.produk.includes('Top Up Saldo Tol Mandiri')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '33':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA SALDO DANA*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kode.startsWith('D') && i.kategori == "DOMPET DIGITAL") {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '34':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA SALDO GOPAY*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kode.startsWith('GJK')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('Customer H2H ', '') : i.keterangan.replace('Customer ', '')}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '35':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA SALDO OVO*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kode.startsWith('OVO')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '36':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA SALDO SHOPEEPAY*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kode.startsWith('SHOPE')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '37':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA SALDO LINKAJA*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kode.startsWith('LINK')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '38':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA TOPUP SALDO I.SAKU*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kode.startsWith('ISAKU')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('Customer H2H ', '') : i.keterangan.replace('Customer ', '')}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '39':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA BERLANGGANAN VCR VIDIO*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kategori.includes('DIGITAL') && i.produk.includes('Belangganan Vcr Vidio')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '40':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA BERLANGGANAN GENFLIX*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kategori.includes('DIGITAL') && i.produk.includes('Berlangganan Genflix')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '41':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA BERLANGGANAN JOOX*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kategori.includes('DIGITAL') && i.produk.includes('Berlangganan Joox')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '42':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA BERLANGGANAN SPOTIFY PREMIUM*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kategori.includes('DIGITAL') && i.produk.includes('Berlangganan Spotify Premium')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '43':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA BERLANGGANAN SUSHIROLL*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kategori.includes('DIGITAL') && i.produk.includes('Berlangganan Sushiroll')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '44':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA BERLANGGANAN VCR WIFI ID*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kategori.includes('DIGITAL') && i.produk.includes('Berlangganan Vcr Wifi ID')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '45':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA PULSA VIU*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kategori.includes('DIGITAL') && i.produk.includes('Berlangganan VIU')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '46':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA BAYAR TAGIHAN INDIHOME TELKOM / SPEEDY*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kategori.includes('TAGIHAN') && i.produk.includes('Indihome Telkom/Speedy')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '47':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA BAYAR TAGIHAN INTERNET BALI FIBER*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kategori.includes('TAGIHAN') && i.produk.includes('Internet Bali Fiber')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '48':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA BAYAR TAGIHAN WIFI INTERNET BIZNET HOME*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kategori.includes('TAGIHAN') && i.produk.includes('Internet Biznet Home')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '49':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA BAYAR TAGIHAN WIFI INTERNET CBN*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kategori.includes('TAGIHAN') && i.produk.includes('Internet CBN')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '50':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA BAYAR TAGIHAN WIFI INTERNET CENTRINE ONLINE *\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kategori.includes('TAGIHAN') && i.produk.includes('INTERNET Centrine Online')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '51':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA BAYAR TAGIHAN WIFI INTERNET COMMET*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kategori.includes('TAGIHAN') && i.produk.includes('Internet Commet')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '52':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA BAYAR TAGIHAN WIFI INTERNET FIRST MEDIA*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kategori.includes('TAGIHAN') && i.produk.includes('Internet First Media')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '53':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA BAYAR TAGIHAN INTERNET ICONNET*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kategori.includes('TAGIHAN') && i.produk.includes('Internet Iconnet')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '54':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA BAYAR TAGIHAN INTERNET MY REPUBLIC*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kategori.includes('TAGIHAN') && i.produk.includes('Internet My Republic')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '55':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA BAYAR TAGIHAN INTERNET XL HOME*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kategori.includes('TAGIHAN') && i.produk.includes('Internet XL Home')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '56':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA BAYAR TAGIHAN BPJS KESEHATAN *\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kategori.includes('TAGIHAN') && i.produk.includes('BPJS Kesehatan')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '57':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA TAGIHAN GAS PGN*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kategori.includes('TAGIHAN') && i.produk.includes('Pembayaran Gas PGN')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '58':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA BAYAR TAGIHAN PEMBAYARAN PERTAGAS*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kategori.includes('TAGIHAN') && i.produk.includes('Pembayaran Pertagas')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '59':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA TOKEN PERTAGAS*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kategori.includes('TAGIHAN') && i.produk.includes('Topup Saldo Pertagas')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '60':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST BAYAR AIR PDAM*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kategori.includes('AIR PDAM')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '61':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST BAYAR TAGIHAN PBB*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kategori.includes('TAGIHAN PBB')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '62':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST HARGA PASCABAYAR TELEPON*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kategori.includes('PASCABAYAR') && i.produk.includes('Pascabayar Telepon')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case '63':{
fetch(okeUrl)
.then(response => response.json())
.then(res => {
var regeXcomp = (a, b) => {
var aPrice = Number(a.harga.replace(/[^0-9.-]+/g,""));
var bPrice = Number(b.harga.replace(/[^0-9.-]+/g,""));
return aPrice - bPrice
}
res.sort(regeXcomp)
let teks = `*LIST BAYAR PASCABAYAR TV*\n\nIngin melakukan topup? ketik *${prefix}topup*\n\n`
for (let i of res) {
if (i.kategori.includes('PASCABAYAR') && i.produk.includes('Pascabayar Televisi')) {
let persen = (untung / 100) * i.harga
teks += `*Kode:* ${i.kode}\n*Nama:* ${i.keterangan.includes('H2H') ? i.keterangan.replace('H2H ', '') : i.keterangan}\n*Harga:* Rp${toRupiah(Number(i.harga) + Number(Math.ceil(persen)))}\n*Status:* ${i.status == "1" ? "✅" : "❎"}\n\n`
}
}
reply(teks)
})
}
break

case 'untung':{
if (!isOwner) return reply(mess.owner)
if (!q) return reply(`Contoh: ${prefix+command} 6%`)
if (q.replace(/[^0-9]/g, '') > 99) return reply('Maksimal keuntungan 99%')
untung = q.replace(/[^0-9]/g, '')
await reply(`Keuntungan telah diset menjadi ${q.replace(/[^0-9]/g, '')}%`)
}
break

case 'ceksaldo':{
if (!isOwner) return reply(mess.owner)
fetch(`https://b2b.okeconnect.com/trx-v2/balance?memberID=${memberId}&pin=${pin}&password=${pw}`)
.then(response => response.json())
.then(res => {
if (res.status.includes('GAGAL')) return reply('Silahkan sambungkan ip ('+res.message.replace(/[^0-9.]+/g, '')+') tersebut ke provider')
reply(`*SALDO ORDER KUOTA*\n\n*Sisa Saldo:* Rp${toRupiah(res.message.replace(/[^0-9]+/g, ''))}`)
})
}
break

case 'cekip':{
if (!isOwner) return reply(mess.owner)
fetch(`https://b2b.okeconnect.com/trx-v2/balance?memberID=${memberId}&pin=${pin}&password=${pw}`)
.then(response => response.json())
.then(res => {
if (res.status.includes('GAGAL')) return reply('Silahkan sambungkan ip ('+res.message.replace(/[^0-9.]+/g, '')+') tersebut ke provider')
reply('IP sudah tersambung ke server.')
})
}
break

case 'sticker': case 's': case 'stiker':{
if (isImage || isQuotedImage) {
let media = await downloadAndSaveMediaMessage('image', `./options/sticker/${tanggal}.jpg`)
reply(mess.wait)
ronzz.sendImageAsSticker(from, media, msg, { packname: `${packname}`, author: `${author}`})
fs.unlinkSync(media)
} else if (isVideo || isQuotedVideo) {
let media = await downloadAndSaveMediaMessage('video', `./options/sticker/${tanggal}.mp4`)
reply(mess.wait)
ronzz.sendVideoAsSticker(from, media, msg, { packname: `${packname}`, author: `${author}`})
fs.unlinkSync(media)
} else {
reply(`Kirim/reply gambar/vidio dengan caption *${prefix+command}*`)
}}
break

case 'addsewa':{
if (!isOwner) return reply(mess.owner)
if (!isGroup) return reply(mess.group)
if (!q) return reply(`Ex: ${prefix+command} hari\n\nContoh: ${prefix+command} 30d`)
addSewaGroup(from, q, db_sewa)
reply(`*SEWA ADDED*\n\n*ID*: ${groupId}\n*EXPIRED*: ${ms(toMs(q)).days} days ${ms(toMs(q)).hours} hours ${ms(toMs(q)).minutes} minutes\n\nBot akan keluar secara otomatis dalam waktu yang sudah di tentukan.`)
}
break

case 'delsewa':{
if (!isOwner) return reply(mess.owner)
if (!isGroup) return reply(mess.group)
db_sewa.splice(getSewaPosition(from, db_sewa), 1)
fs.writeFileSync('./database/sewa.json', JSON.stringify(db_sewa))
reply('Sukses delete sewa di group ini.')
}
break

case 'ceksewa':{
if (!isGroupAdmins && !isOwner) return reply(mess.admin)
if (!isGroup) return reply(mess.group)
if (!isSewa) return reply('Kamu belum sewa bot.')
let cekExp = ms(getSewaExpired(from, db_sewa) - Date.now())
reply(`*SEWA EXPIRED*\n\n*ID*: ${groupId}\n*SEWA EXPIRED*: ${cekExp.days} days ${cekExp.hours} hours ${cekExp.minutes} minutes`)
}
break

case 'listsewa':{
if (!isOwner) return reply(mess.owner)
if (db_sewa.length == 0) return reply('Belum ada list sewa di database')
let teks = '*LIST SEWA BOT*\n\n'
let sewaKe = 0
for (let i = 0; i < getAllSewa(db_sewa).length; i++) {
sewaKe++
teks += `${sewaKe}. ${getAllSewa(db_sewa)[i]}\n\n`
}
reply(teks)
}
break

case 'setdone':
if (!isOwner) return reply(mess.owner)
if (!q) return reply(`Gunakan dengan cara *${prefix+command} teks*\n\nList function:\n@tag : untuk tag orang\n@tanggal\n@jam\n@status`)
if (isSetDone(from, db_done)) return reply(`Set done sudah ada di group ini.`)
addSetDone(from, q, db_done)
reply(`Sukses set done`)
break

case 'deldone':
if (!isOwner) return reply(mess.owner)
if (!isSetDone(from, db_done)) return reply(`Belum ada set done di sini.`)
delSetDone(from, db_done)
reply(`Sukses delete set done`)
break

case 'changedone':
if (!isOwner) return reply(mess.owner)
if (!q) return reply(`Gunakan dengan cara *${prefix+command} teks*\n\nList function:\n@tag : untuk tag orang\n@tanggal\n@jam\n@status`)
if (isSetDone(from, db_done)) {
changeSetDone(from, q, db_done)
reply(`Sukses ganti teks set done`)
} else {
addSetDone(from, q, db_done)
reply(`Sukses ganti teks set done`)
}
break

case 'setproses':
if (!isOwner) return reply(mess.owner)
if (!q) return reply(`Gunakan dengan cara *${prefix+command} teks*\n\nList function:\n@tag : untuk tag orang\n@tanggal\n@jam\n@status`)
if (isSetProses(from, db_proses)) return reply(`Set done sudah ada di group ini.`)
addSetProses(from, q, db_proses)
reply(`Sukses set proses`)
break

case 'delproses':
if (!isOwner) return reply(mess.owner)
if (!isSetProses(from, db_proses)) return reply(`Belum ada set done di sini.`)
delSetProses(from, db_proses)
reply(`Sukses delete set proses`)
break

case 'changeproses':
if (!isOwner) return reply(mess.owner)
if (!q) return reply(`Gunakan dengan cara *${prefix+command} teks*\n\nList function:\n@tag : untuk tag orang\n@tanggal\n@jam\n@status`)
if (isSetProses(from, db_proses)) {
changeSetProses(from, q, db_proses)
reply(`Sukses ganti teks set proses`)
} else {
addSetProses(from, q, db_proses)
reply(`Sukses ganti teks set proses`)
}
break

case 'done':
if (isGroup) {
if (!isGroupAdmins && !isOwner) return (mess.admin)
if (isQuotedMsg && !q) {
if (getTextSetDone(from, db_done) !== undefined) {
let textDone = getTextSetDone(from, db_done)
ronzz.sendMessage(from, { text: textDone.replace('tag', quotedMsg.sender.split("@")[0]).replace('@jam', jamwib).replace('@tanggal', tanggal).replace('@status', 'Berhasil'), mentions: [quotedMsg.sender]})
} else {
ronzz.sendMessage(from, { text: `「 *TRANSAKSI BERHASIL* 」\n\n\`\`\`📆 TANGGAL : ${tanggal}\n⌚ JAM : ${jamwib}\n✨ STATUS: Berhasil\`\`\`\n\nTerimakasih @${quotedMsg.sender.split("@")[0]} next order yaa🙏`, mentions: [quotedMsg.sender]})
}
} else if (q && !isQuotedMsg) {
if (getTextSetDone(from, db_done) !== undefined) {
let textDone = getTextSetDone(from, db_done)
ronzz.sendMessage(from, { text: textDone.replace('tag', q.replace(/[^0-9]/g, '')).replace('@jam', jamwib).replace('@tanggal', tanggal).replace('@status', 'Berhasil'), mentions: [q.replace(/[^0-9]/g, '')+'@s.whatsapp.net']});
} else {
ronzz.sendMessage(from, { text: `「 *TRANSAKSI BERHASIL* 」\n\n\`\`\`📆 TANGGAL : ${tanggal}\n⌚ JAM : ${jamwib}\n✨ STATUS: Berhasil\`\`\`\n\nTerimakasih @${q.replace(/[^0-9]/g, '')} next order yaa🙏`, mentions: [q.replace(/[^0-9]/g, '')+'@s.whatsapp.net']});
}
} else if (!q && !isQuotedMsg) {
reply('Reply atau tag orangnya')
}
} else {
if (!isOwner) return reply(mess.owner)
if (!q) return reply(`Contoh: ${prefix+command} 628xxx`)
if (getTextSetDone(from, db_done) !== undefined) {
let textDone = getTextSetDone(from, db_done)
ronzz.sendMessage(q.replace(/[^0-9]/g, '')+'@s.whatsapp.net', { text: textDone.replace('tag', q.replace(/[^0-9]/g, '')).replace('@jam', jamwib).replace('@tanggal', tanggal).replace('@status', 'Berhasil'), mentions: [q.replace(/[^0-9]/g, '')+'@s.whatsapp.net']});
} else {
ronzz.sendMessage(q.replace(/[^0-9]/g, '')+'@s.whatsapp.net', { text: `「 *TRANSAKSI BERHASIL* 」\n\n\`\`\`📆 TANGGAL : ${tanggal}\n⌚ JAM : ${jamwib}\n✨ STATUS: Berhasil\`\`\`\n\nTerimakasih @${q.replace(/[^0-9]/g, '')} next order yaa🙏`, mentions: [q.replace(/[^0-9]/g, '')+'@s.whatsapp.net']});
}
}
break

case 'proses':
if (isGroup) {
if (!isGroupAdmins && !isOwner) return (mess.admin)
if (isQuotedMsg && !q) {
if (getTextSetProses(from, db_proses) !== undefined) {
let textProses = getTextSetProses(from, db_proses)
ronzz.sendMessage(from, { text: textProses.replace('tag', quotedMsg.sender.split("@")[0]).replace('@jam', jamwib).replace('@tanggal', tanggal).replace('@status', 'Pending'), mentions: [quotedMsg.sender]});
} else {
ronzz.sendMessage(from, { text: `「 *TRANSAKSI PENDING* 」\n\n\`\`\`📆 TANGGAL : ${tanggal}\n⌚ JAM : ${jamwib}\n✨ STATUS: Pending\`\`\`\n\nPesanan @${quotedMsg.sender.split("@")[0]} sedang diproses🙏`, mentions: [quotedMsg.sender]});
}
} else if (q && !isQuotedMsg) {
if (getTextSetProses(from, db_proses) !== undefined) {
let textProses = getTextSetProses(from, db_proses)
ronzz.sendMessage(from, { text: textProses.replace('tag', q.replace(/[^0-9]/g, '')).replace('@jam', jamwib).replace('@tanggal', tanggal).replace('@status', 'Pending'), mentions: [q.replace(/[^0-9]/g, '')+'@s.whatsapp.net']});
} else {
ronzz.sendMessage(from, { text: `「 *TRANSAKSI PENDING* 」\n\n\`\`\`📆 TANGGAL : ${tanggal}\n⌚ JAM : ${jamwib}\n✨ STATUS: Pending\`\`\`\n\nPesanan @${q.replace(/[^0-9]/g, '')} sedang diproses🙏`, mentions: [q.replace(/[^0-9]/g, '')+'@s.whatsapp.net']});
}
} else if (!q && !isQuotedMsg) {
reply('Reply atau tag orangnya')
}
} else {
if (!isOwner) return reply(mess.owner)
if (!q) return reply(`Contoh: ${prefix+command} 628xxx`)
if (getTextSetProses(from, db_proses) !== undefined) {
let textProses = getTextSetProses(from, db_proses)
ronzz.sendMessage(q.replace(/[^0-9]/g, '')+'@s.whatsapp.net', { text: textProses.replace('tag', q.replace(/[^0-9]/g, '')).replace('@jam', jamwib).replace('@tanggal', tanggal).replace('@status', 'Pending'), mentions: [q.replace(/[^0-9]/g, '')+'@s.whatsapp.net']});
} else {
ronzz.sendMessage(q.replace(/[^0-9]/g, '')+'@s.whatsapp.net', { text: `「 *TRANSAKSI PENDING* 」\n\n\`\`\`📆 TANGGAL : ${tanggal}\n⌚ JAM : ${jamwib}\n✨ STATUS: Pending\`\`\`\n\nPesanan @${q.replace(/[^0-9]/g, '')} sedang diproses🙏`, mentions: [q.replace(/[^0-9]/g, '')+'@s.whatsapp.net']});
}
}
break

case 'list':{
if (!isGroup) return reply(mess.group)
if (db_respon_list.length === 0) return reply(`Belum ada list message di database`)
if (!isAlreadyResponListGroup(from, db_respon_list)) return reply(`Belum ada list message yang terdaftar di group ini`)
let x1 = false
Object.keys(db_respon_list).forEach((i) => {
if (db_respon_list[i].id == from){x1 = i}})
var teks = `Hai @${sender.split("@")[0]}\nBerikut list message di grup ini\n\n`
for (let x of db_respon_list) {
if (x.id == from) {
teks += `*LIST KEY:* ${x.key}\n\n`
}
}
teks += `_Ingin melihat listnya?_\n_Ketik key saja_\n\n_Contoh:_\n${db_respon_list[x1].key}`
ronzz.sendMessage(from, { text: teks, mentions: [sender]}, { quoted: msg })
}
break

case 'testi':{
if (db_respon_testi.length === 0) return reply(`Belum ada list testi di database`)
var teks = `Hai @${sender.split("@")[0]}\nBerikut list testi owner saya\n\n`
for (let x of db_respon_testi) {
teks += `*LIST KEY:* ${x.key}\n\n`
}
teks += `_Ingin melihat listnya?_\n_Ketik key saja_\n\n_Contoh:_\n${db_respon_testi[0].key}`
ronzz.sendMessage(from, { text: teks, mentions: [sender]}, { quoted: msg })
}
break

case 'produk':{
if (db_respon_produk.length === 0) return reply(`Belum ada list produk di database`)
var teks = `Hai @${sender.split("@")[0]}\nBerikut list produk owner saya\n\n`
for (let x of db_respon_produk) {
teks += `*KODE:* ${x.kode}\n*NAMA:* ${x.name}\n*HARGA:* ${x.price}\n*DESKRIPSI:* ${x.desc}\n\n`
}
teks += `_Ingin membeli produk?_\n_Ketik ${prefix}order_\n\n_Ingin melihat produk?_\n_Ketik kodenya, Contoh: ${db_respon_produk[0].kode}_`
ronzz.sendMessage(from, { text: teks, mentions: [sender]}, { quoted: msg })
}
break

case 'addlist':{
if (!isGroup) return reply(mess.group)
if (!isGroupAdmins && !isOwner) return reply(mess.admin)
if (!q.includes("@")) return reply(`Gunakan dengan cara ${prefix+command} *key@response*\n\n_Contoh_\n\n${prefix+command} tes@apa`)
if (isAlreadyResponList(from, q.split("@")[0], db_respon_list)) return reply(`List respon dengan key : *${q.split("@")[0]}* sudah ada di group ini.`)
if (isImage || isQuotedImage) {
let media = await downloadAndSaveMediaMessage('image', `./options/sticker/${sender}.jpg`)
let tph = await TelegraPh(media)
addResponList(from, q.split("@")[0], q.split("@")[1], true, tph, db_respon_list)
reply(`Berhasil menambah list menu *${q.split("@")[0]}*`)
fs.unlinkSync(media)
} else {
addResponList(from, q.split("@")[0], q.split("@")[1], false, '-', db_respon_list)
reply(`Berhasil menambah list menu : *${q.split("@")[0]}*`)
}
}
break

case 'addtesti':{
if (!isOwner) return reply(mess.owner)
if (isImage || isQuotedImage) {
if (!q.includes("@")) return reply(`Gunakan dengan cara ${prefix+command} *key@response*\n\n_Contoh_\n\n${prefix+command} tes@apa`)
if (isAlreadyResponTesti(q.split("@")[0], db_respon_testi)) return reply(`List respon dengan key : *${q.split("@")[0]}* sudah ada.`)
let media = await downloadAndSaveMediaMessage('image', `./options/sticker/${sender}.jpg`)
let tph = await TelegraPh(media)
addResponTesti(q.split("@")[0], q.split("@")[1], true, tph, db_respon_testi)
reply(`Berhasil menambah list testi *${q.split("@")[0]}*`)
fs.unlinkSync(media)
} else {
reply(`Kirim gambar dengan caption ${prefix+command} *key@response* atau reply gambar yang sudah ada dengan caption ${prefix+command} *key@response*`)
}
}
break

case 'addproduk':{
if (!isOwner) return reply(mess.owner)
if (isImage || isQuotedImage) {
if (!q.includes("@")) return reply(`Gunakan dengan cara ${prefix+command} *kode@nama@harga@deskripsi*\n\n_Contoh_\n\n${prefix+command} P1@Panel 1GB@1000@Panel run bot ram 1gb`)
if (isAlreadyResponProduk(q.split("@")[0], db_respon_produk)) return reply(`List produk dengan kode: *${q.split("@")[0]}* sudah ada.`)
let media = await downloadAndSaveMediaMessage('image', `./options/sticker/${sender}.jpg`)
let tph = await TelegraPh(media)
addResponProduk(q.split("@")[0], q.split("@")[1], q.split("@")[2], q.split("@")[3], true, tph, db_respon_produk)
reply(`Berhasil menambah list produk *${q.split("@")[0]}*`)
fs.unlinkSync(media)
} else {
reply(`Kirim gambar dengan caption ${prefix+command} *kode@nama@harga@deskripsi* atau reply gambar yang sudah ada dengan caption ${prefix+command} *kode@nama@harga@deskripsi*`)
}
}
break

case 'dellist':
if (!isGroup) return reply(mess.group)
if (!isGroupAdmins && !isOwner) return reply(mess.admin)
if (db_respon_list.length === 0) return reply(`Belum ada list message di database`)
if (!q) return reply(`Gunakan dengan cara ${prefix+command} *key*\n\n_Contoh_\n\n${prefix+command} hello`)
if (!isAlreadyResponList(from, q, db_respon_list)) return reply(`List respon dengan key *${q}* tidak ada di database!`)
delResponList(from, q, db_respon_list)
reply(`Sukses delete list message dengan key *${q}*`)
break

case 'deltesti':
if (!isOwner) return reply(mess.owner)
if (db_respon_testi.length === 0) return reply(`Belum ada list testi di database`)
if (!q) return reply(`Gunakan dengan cara ${prefix+command} *key*\n\n_Contoh_\n\n${prefix+command} hello`)
if (!isAlreadyResponTesti(q, db_respon_testi)) return reply(`List testi dengan key *${q}* tidak ada di database!`)
delResponTesti(q, db_respon_testi)
reply(`Sukses delete list testi dengan key *${q}*`)
break

case 'delproduk':
if (!isOwner) return reply(mess.owner)
if (db_respon_produk.length === 0) return reply(`Belum ada list produk di database`)
if (!q) return reply(`Gunakan dengan cara ${prefix+command} *kode*\n\n_Contoh_\n\n${prefix+command} P1`)
if (!isAlreadyResponProduk(q, db_respon_produk)) return reply(`List produk dengan key *${q}* tidak ada di database!`)
delResponProduk(q, db_respon_produk)
reply(`Sukses delete list produk dengan key *${q}*`)
break

case 'setlist':{
if (!isGroup) return reply(mess.group)
if (!isGroupAdmins && !isOwner) return reply(mess.admin)
if (!q.includes("@")) return reply(`Gunakan dengan cara ${prefix+command} *key@response*\n\n_Contoh_\n\n${prefix+command} tes@apa`)
if (!isAlreadyResponList(from, q.split("@")[0], db_respon_list)) return reply(`List respon dengan key *${q.split("@")[0]}* tidak ada di group ini.`)
if (isImage || isQuotedImage) {
let media = await downloadAndSaveMediaMessage('image', `./options/sticker/${sender}.jpg`)
let tph = await TelegraPh(media)
updateResponList(from, q.split("@")[0], q.split("@")[1], true, tph, db_respon_list)
reply(`Berhasil mengganti list menu *${q.split("@")[0]}*`)
fs.unlinkSync(media)
} else {
updateResponList(from, q.split("@")[0], q.split("@")[1], false, '-', db_respon_list)
reply(`Berhasil mengganti list menu : *${q.split("@")[0]}*`)
}
}
break

case 'settesti':{
if (!isOwner) return reply(mess.owner)
if (!q.includes("@")) return reply(`Gunakan dengan cara ${prefix+command} *key@response*\n\n_Contoh_\n\n${prefix+command} tes@apa`)
if (!isAlreadyResponTesti(q.split("@")[0], db_respon_testi)) return reply(`List testi dengan key *${q.split("@")[0]}* tidak ada di group ini.`)
if (isImage || isQuotedImage) {
let media = await downloadAndSaveMediaMessage('image', `./options/sticker/${sender}.jpg`)
let tph = await TelegraPh(media)
updateResponTesti(q.split("@")[0], q.split("@")[1], true, tph, db_respon_testi)
reply(`Berhasil mengganti list testi *${q.split("@")[0]}*`)
fs.unlinkSync(media)
} else {
reply(`Kirim gambar dengan caption ${prefix+command} *key@response* atau reply gambar yang sudah ada dengan caption ${prefix+command} *key@response*`)
}
}
break

case 'setproduk':{
if (!isOwner) return reply(mess.owner)
if (!q.includes("@")) return reply(`Gunakan dengan cara ${prefix+command} *kode@nama@harga@deskripsi*\n\n_Contoh_\n\n${prefix+command} P1@Panel 1GB@1000@Panel run bot ram 1gb`)
if (!isAlreadyResponProduk(q.split("@")[0], db_respon_produk)) return reply(`List produk dengan kode *${q.split("@")[0]}* tidak ada di database.`)
if (isImage || isQuotedImage) {
let media = await downloadAndSaveMediaMessage('image', `./options/sticker/${sender}.jpg`)
let tph = await TelegraPh(media)
updateResponProduk(q.split("@")[0], q.split("@")[1], q.split("@")[2], q.split("@")[3], true, tph, db_respon_produk)
reply(`Berhasil mengganti list produk *${q.split("@")[0]}*`)
fs.unlinkSync(media)
} else {
reply(`Kirim gambar dengan caption ${prefix+command} *kode@nama@harga@deskripsi* atau reply gambar yang sudah ada dengan caption ${prefix+command} *kode@nama@harga@deskripsi*`)
}
}
break

case 'on':
if (!q) return reply(`Contoh: ${prefix+command} welcome\n\nPilihan tersedia:\nwelcome\nantilink (auto kick)\nantilink2 (no kick)\nread (auto read)\nketik (auto ketik)`)
if (q.toLowerCase() == "welcome") {
if (!isGroup) return reply(mess.group)
if (!isGroupAdmins && !isOwner) return reply(mess.admin)
if (db_welcome.includes(from)) return reply('Welcome sudah aktif di grup ini.')
db_welcome.push(from)
fs.writeFileSync('./database/welcome.json', JSON.stringify(db_welcome, null, 2))
reply('Sukses mengaktifkan welcome di grup ini.')
} else if (q.toLowerCase() == "antilink") {
if (!isGroup) return reply(mess.group)
if (!isGroupAdmins && !isOwner) return reply(mess.admin)
if (!isBotGroupAdmins) return reply(mess.botAdmin)
if (db_antilink.includes(from)) return reply('Antilink sudah aktif di grup ini.')
db_antilink.push(from)
fs.writeFileSync('./database/antilink.json', JSON.stringify(db_antilink, null, 2))
reply('Sukses mengaktifkan antilink di grup ini.')
} else if (q.toLowerCase() == "antilink2") {
if (!isGroup) return reply(mess.group)
if (!isGroupAdmins && !isOwner) return reply(mess.admin)
if (!isBotGroupAdmins) return reply(mess.botAdmin)
if (db_antilink2.includes(from)) return reply('Antilink2 sudah aktif di grup ini.')
db_antilink2.push(from)
fs.writeFileSync('./database/antilink2.json', JSON.stringify(db_antilink2, null, 2))
reply('Sukses mengaktifkan antilink2 di grup ini.')
} else if (q.toLowerCase() == "read") {
if (!isOwner) return reply(mess.owner)
if (ronzz.autoRead) return reply('Auto read sudah aktif.')
ronzz.autoRead = true
reply(`Sukses mengaktifkan auto read.`)
} else if (q.toLowerCase() == "ketik") {
if (!isOwner) return reply(mess.owner)
if (ronzz.autoKetik) return reply('Auto ketik sudah aktif.')
ronzz.autoKetik = true
reply(`Sukses mengaktifkan auto ketik.`)
}
break

case 'off':
if (!q) return reply(`Contoh: ${prefix+command} welcome\n\nPilihan tersedia:\nwelcome\nantilink (auto kick)\nantilink2 (no kick)\nread (auto read)\nketik (auto ketik)`)
if (q.toLowerCase() == "welcome") {
if (!isGroup) return reply(mess.group)
if (!isGroupAdmins && !isOwner) return reply(mess.admin)
if (!db_welcome.includes(from)) return reply('Welcome tidak aktif di grup ini.')
let delWel = db_welcome.indexOf(from)
db_welcome.splice(delWel, 1)
fs.writeFileSync('./database/welcome.json', JSON.stringify(db_welcome, null, 2))
reply(`Sukses menonaktifkan welcome di grup ini.`)
} else if (q.toLowerCase() == "antilink") {
if (!isGroup) return reply(mess.group)
if (!isGroupAdmins && !isOwner) return reply(mess.admin)
if (!db_antilink.includes(from)) return reply('Antilink tidak aktif di grup ini.')
let delAnti = db_antilink.indexOf(from)
db_antilink.splice(delAnti, 1)
fs.writeFileSync('./database/antilink.json', JSON.stringify(db_antilink, null, 2))
reply(`Sukses menonaktifkan antilink di grup ini.`)
} else if (q.toLowerCase() == "antilink2") {
if (!isGroup) return reply(mess.group)
if (!isGroupAdmins && !isOwner) return reply(mess.admin)
if (!db_antilink2.includes(from)) return reply('Antilink tidak aktif di grup ini.')
let delAnti2 = db_antilink2.indexOf(from)
db_antilink.splice(delAnti2, 1)
fs.writeFileSync('./database/antilink2.json', JSON.stringify(db_antilink2, null, 2))
reply(`Sukses menonaktifkan antilink2 di grup ini.`)
} else if (q.toLowerCase() == "read") {
if (!isOwner) return reply(mess.owner)
if (!ronzz.autoRead) return reply('Auto read sudah tidak aktif.')
ronzz.autoRead = false
reply(`Sukses menonaktifkan auto read.`)
} else if (q.toLowerCase() == "ketik") {
if (!isOwner) return reply(mess.owner)
if (!ronzz.autoKetik) return reply('Auto ketik sudah tidak aktif.')
ronzz.autoKetik = false
reply(`Sukses menonaktifkan auto ketik.`)
}
break

case 'group': case 'grup':
if (!isGroup) return reply(mess.group)
if (!isGroupAdmins && !isOwner) return reply(mess.admin)
if (!isBotGroupAdmins) return reply(mess.botAdmin)
if (!q) return reply(`Contoh: ${prefix+command} open/close`)
if (q.toLowerCase() == "open") {
await ronzz.groupSettingUpdate(from, 'not_announcement')
await reply(`Sukses mengizinkan semua peserta dapat mengirim pesan ke grup ini.`)
} else if (q.toLowerCase() == "close") {
await ronzz.groupSettingUpdate(from, 'announcement')
await reply(`Sukses mengizinkan hanya admin yang dapat mengirim pesan ke grup ini.`)
}
break

case 'hidetag': case 'ht': case 'h':{
if (!isGroup) return reply(mess.group)
if (!isGroupAdmins && !isOwner) return reply(mess.admin)
let mem = groupMembers.map(i => i.id)
ronzz.sendMessage(from, { text: q ? q : '', mentions: mem })
}
break

case 'kalkulator':{
if (!q) return reply(`Contoh: ${prefix+command} + 5 6\n\nList kalkulator:\n+\n-\n÷\n×`)
if (q.split(" ")[0] == "+") {
let q1 = Number(q.split(" ")[1])
let q2 = Number(q.split(" ")[2])
reply(`${q1 + q2}`)
} else if (q.split(" ")[0] == "-") {
let q1 = Number(q.split(" ")[1])
let q2 = Number(q.split(" ")[2])
reply(`${q1 - q2}`)
} else if (q.split(" ")[0] == "÷") {
let q1 = Number(q.split(" ")[1])
let q2 = Number(q.split(" ")[2])
reply(`${q1 / q2}`)
} else if (q.split(" ")[0] == "×") {
let q1 = Number(q.split(" ")[1])
let q2 = Number(q.split(" ")[2])
reply(`${q1 * q2}`)
}
}
break

case 'kick':{
if (!isGroup) return reply(mess.group)
if (!isGroupAdmins) return reply(mess.admin)
if (!isBotGroupAdmins) return reply(mess.botAdmin)
let number;
if (q.length !== 0) {
number = q.replace(/[^0-9]/g, '')+'@s.whatsapp.net'
ronzz.groupParticipantsUpdate(from, [number], "remove")
.then(res => reply('Sukses...'))
.catch((err) => reply(mess.error.api))
} else if (isQuotedMsg) {
number = quotedMsg.sender
ronzz.groupParticipantsUpdate(from, [number], "remove")
.then(res => reply('Sukses...'))
.catch((err) => reply(mess.error.api))
} else {
reply('Tag atau balas pesan orang yang ingin dikeluarkan dari grup.')
}
}
break

case 'promote':{
if (!isGroup) return reply(mess.group)
if (!isGroupAdmins) return reply(mess.admin)
if (!isBotGroupAdmins) return reply(mess.botAdmin)
let number;
if (q.length !== 0) {
number = q.replace(/[^0-9]/g, '')+'@s.whatsapp.net'
ronzz.groupParticipantsUpdate(from, [number], "promote")
.then(res => ronzz.sendMessage(from, { text: `Sukses menjadikan @${number.split("@")[0]} sebagai admin`, mentions: [number]}, { quoted: msg }))
.catch((err) => reply(mess.error.api))
} else if (isQuotedMsg) {
number = quotedMsg.sender
ronzz.groupParticipantsUpdate(from, [number], "promote")
.then(res => ronzz.sendMessage(from, { text: `Sukses menjadikan @${number.split("@")[0]} sebagai admin`, mentions: [number]}, { quoted: msg }))
.catch((err) => reply(mess.error.api))
} else {
reply('Tag atau balas pesan orang yang ingin dijadikan admin.')
}
}
break

case 'demote':{
if (!isGroup) return reply(mess.group)
if (!isGroupAdmins) return reply(mess.admin)
if (!isBotGroupAdmins) return reply(mess.botAdmin)
let number;
if (q.length !== 0) {
number = q.replace(/[^0-9]/g, '')+'@s.whatsapp.net'
ronzz.groupParticipantsUpdate(from, [number], "demote")
.then(res => ronzz.sendMessage(from, { text: `Sukses menjadikan @${number.split("@")[0]} sebagai anggota group`, mentions: [number]}, { quoted: msg }))
.catch((err) => reply(mess.error.api))
} else if (isQuotedMsg) {
number = quotedMsg.sender
ronzz.groupParticipantsUpdate(from, [number], "demote")
.then(res => ronzz.sendMessage(from, { text: `Sukses menjadikan @${number.split("@")[0]} sebagai anggota group`, mentions: [number]}, { quoted: msg }))
.catch((err) => reply(mess.error.api))
} else {
reply('Tag atau balas pesan orang yang ingin dijadikan anggota group.')
}
}
break

case 'revoke':
if (!isGroup) return reply(mess.group)
if (!isGroupAdmins) return reply(mess.admin)
if (!isBotGroupAdmins) return reply(mess.botAdmin)
await ronzz.groupRevokeInvite(from)
.then(res => {
reply('Sukses menyetel tautan undangan grup ini.')
}).catch(() => reply(mess.error.api))
break

case 'linkgrup': case 'linkgroup': case 'linkgc':{
if (!isGroup) return reply(mess.group)
if (!isBotGroupAdmins) return reply(mess.botAdmin)
let url = await ronzz.groupInviteCode(from).catch(() => reply(mess.errorApi))
url = 'https://chat.whatsapp.com/'+url
reply(url)
}
break

case 'delete':
if (!isGroup) return reply(mess.group)
if (!isGroupAdmins && !isOwner) return reply(mess.admin)
if (quotedMsg == null) return reply("Reply chat dari bot yang ingin dihapus")
if (quotedMsg.fromMe !== true) return reply("Chat tersebut bukan dari bot")
ronzz.sendMessage(from, { delete: { fromMe: true, id: quotedMsg.id, remoteJid: from }})
break

case 'blok': case 'block':
if (!isOwner && !fromMe) return reply(mess.owner)
if (!q) return reply(`Contoh: ${prefix+command} 628xxx`)
await ronzz.updateBlockStatus(q.replace(/[^0-9]/g, '')+'@s.whatsapp.net', "block") // Block user
reply('Sukses block nomor.')
break

case 'unblok': case 'unblock':
if (!isOwner && !fromMe) return reply(mess.owner)
if (!q) return reply(`Contoh: ${prefix+command} 628xxx`)
await ronzz.updateBlockStatus(q.replace(/[^0-9]/g, '')+'@s.whatsapp.net', "unblock") // Block user
reply('Sukses unblock nomor.')
break

case 'script': case 'sc':
reply(`*SCRIPT NO ENC*\nMau beli scriptnya?\n\n*Contact Person 📞*\nwa.me/62882000253706\n\n*Harga* 💰\nRp40.000 (40k)\nHarga terlalu mahal?\nNego tipis aja\n\n*Payment* 💳\n_Qris / Dana_\n\nSudah termasuk tutorial.\nKalau error difixs.\nPasti dapet update dari *Ronzz YT.*\nSize script ringan.\nAnti ngelag/delay.`)
break

case 'owner':
ronzz.sendContact(from, [ownerNomer], msg)
break

case 'creator':
ronzz.sendMessage(from, { text: 'Creator sc ini adalah\n@62895342712163 (RuztanXD)', mentions: ['62895342712163@s.whatsapp.net']}, { quoted: msg })
break

case 'tes': case 'runtime':
reply(`*STATUS : BOT ONLINE AYANG RUZTAN🥰*\n_Runtime : ${runtime(process.uptime())}_`)
break

case 'ping':
let timestamp = speed()
let latensi = speed() - timestamp
reply(`Kecepatan respon _${latensi.toFixed(4)} Second_\n\n*💻 INFO SERVER*\nHOSTNAME: ${os.hostname}\nRAM: ${formatp(os.totalmem() - os.freemem())} / ${formatp(os.totalmem())}`)
break

case 'listorder': {
if (!isOwner) return reply(mess.owner)
if (db_order.length === 0) return reply(`Belum ada list order di database`)
let teks = `Hai ownerku\nBerikut list order yang ada\n\n`
for (let x of db_order) {
teks += `*ID:* ${x.ID}\n*NOMOR:* ${x.number.split("@")[0]}\n*TANGGAL:* ${x.date}\n*NAMA PRODUK:* ${x.data.nama}\n*NO TUJUAN:* ${x.data.id}\n*HARGA:* ${x.data.harga}\n\n`
}
teks += `_Ingin memproses order?_\n_Ketik ${prefix}orders_\n\nPilihan tersedia:\n${prefix}orders (order sukses)\n${prefix}orderp (order proses)\n${prefix}orderc (order cancel)`
reply(teks)
}
break

case 'order':{
if (db_respon_produk.length === 0) return reply(`Belum ada list produk di database`)
if (cekSaldo(sender, db_saldo) < 1) return reply(`Maaf *${pushname}*, sepertinya saldo kamu Rp${toRupiah(cekSaldo(sender, db_saldo))}, silahkan melakukan deposit terlebih dahulu sebelum melakukan order.`)
if (!q) return reply(`Contoh: ${prefix+command} kode produk,no tujuan`)
if (!isAlreadyResponProduk(q.split(",")[0], db_respon_produk)) return reply(`Untuk kode produk *${q.split(",")[0]}* tidak ada.`)
let data_produk = await getDataResponProduk(q.split(",")[0], db_respon_produk)
if (cekSaldo(sender, db_saldo) < data_produk.price) return reply(`Maaf *${pushname},* sepertinya saldo anda kurang dari Rp${toRupiah(data_produk.price)}, silahkan melakukan deposit terlebih dahulu.`)
minSaldo(sender, Number(data_produk.price), db_saldo)
let id_order = await randomNomor(0, 999999)
let data_order = {
ID: id_order,
number: sender,
name: pushname,
date: moment.tz('Asia/Jakarta').format('DD MMMM YYYY'),
data: {
kode: q.split(",")[0],
id: q.split(",")[1],
harga: data_produk.price,
nama: data_produk.name
}
}
db_order.push(data_order)
fs.writeFileSync("./database/order.json", JSON.stringify(db_order))
await reply(`Data order kamu sudah dikirim ke owner, silahkan tunggu sampai owner memproses.`)
await ronzz.sendMessage(ownerNomer + '@s.whatsapp.net', { text: `Haii ownerku (${ownerName})\nAda yang order produk nihh!!\nBerikut detail produknya\n\n*ID: ${id_order}\n*NOMER:* @${sender.split("@")[0]}\n*KODE:* ${q.split(",")[0]}\n*NAMA PRODUK:* ${data_produk.name}\n*NO TUJUAN:* ${q.split(",")[1]}\n*HARGA:* ${data_produk.price}\n\nSegera diproses yaa kak.`, mentions: [sender]})
}
break

case 'orders':
case 'orderc':
case 'orderp':{
if (!isOwner) return reply(mess.owner)
if (db_order.length === 0) return reply(`Belum ada list order di database`)
if (command == "orderp") {
if (!q) return reply(`Ex: ${prefix+command} id order\n\nContoh: ${prefix+command} 783928`)
let data_order = false
for (let i of db_order) {
if (i.ID == q) {
data_order = i
}
}
if (!data_order) return reply(`Untuk order dengan  ID : ${q} tidak ada di database.`)
await reply(`Sukses memproses order dengan ID : ${q}`)
await ronzz.sendMessage(data_order.number, { text: `Terima kasih telah berbelanja di DTFirst. 🛍️ Pesanan Anda saat ini sedang dalam proses pengolahan dengan cermat. Mohon bersabar sejenak. ID Orderan Anda adalah [${q}]. Kami akan segera memberikan update mengenai status pesanan Anda. Terima kasih atas kesabaran dan pengertian Anda.` })
}
if (command == "orders") {
if (!q) return reply(`Ex: ${prefix+command} id order\n\nContoh: ${prefix+command} 783928`)
let data_order = false
for (let i of db_order) {
if (i.ID == q) {
data_order = i
}
}
if (!data_order) return reply(`Untuk order dengan  ID : ${q} tidak ada di database.`)
let del_order = db_order.indexOf(from)
db_order.splice(del_order, 1)
fs.writeFileSync('./database/order.json', JSON.stringify(db_order, null, 2))
await reply(`Order dengan ID : ${q} telah sukses`)
await ronzz.sendMessage(data_order.number, { text: `Selamat! 🎉 Pesanan Anda telah berhasil diproses di DTFirst. Terima kasih atas kepercayaan Anda kepada kami. ID Orderan Anda adalah [${q}]. Kami berharap produk yang Anda beli membawa kebahagiaan dan manfaat bagi Anda. Terima kasih atas dukungan Anda!` })
}
if (command == "orderc") {
if (!q) return reply(`Ex: ${prefix+command} id order\n\nContoh: ${prefix+command} 783928`)
let data_order = false
for (let i of db_order) {
if (i.ID == q) {
data_order = i
}
}
if (!data_order) return reply(`Untuk order dengan  ID : ${q} tidak ada di database.`)
addSaldo(data_order.number, Number(data_order.data.harga), db_saldo)
let del_order = db_order.indexOf(from)
db_order.splice(del_order, 1)
fs.writeFileSync('./database/order.json', JSON.stringify(db_order, null, 2))
await reply(`Sukses cancel order dengan ID : ${q} telah sukses`)
await ronzz.sendMessage(data_order.number, { text: `Maaf atas ketidaknyamanan ini. 😔 Pesanan Anda di DTFirst dengan ID Orderan [${q}] telah dibatalkan. Status pesanan: Dibatalkan. Kami berharap dapat melayani Anda dengan lebih baik di masa mendatang. Jika Anda memiliki pertanyaan lebih lanjut, jangan ragu untuk menghubungi kami. Terimakakasih` })
}
}
break

default:
if (budy.startsWith('=>')) {
if (!isOwner) return
function Return(sul) {
sat = JSON.stringify(sul, null, 2)
bang = util.format(sat)
if (sat == undefined) {
bang = util.format(sul)
}
return reply(bang)
}
try {
reply(util.format(eval(`(async () => { ${budy.slice(3)} })()`)))
} catch (e) {
reply(String(e))
}
}
if (budy.startsWith('>')) {
if (!isOwner) return
try {
let evaled = await eval(budy.slice(2))
if (typeof evaled !== 'string') evaled = require('util').inspect(evaled)
await reply(evaled)
} catch (err) {
reply(String(err))
}
}
if (budy.startsWith('$')) {
if (!isOwner) return
let qur = budy.slice(2)
exec(qur, (err, stdout) => {
if (err) return reply(err)
if (stdout) {
reply(stdout)
}
})
}
}} catch (err) {
console.log(color('[ERROR]', 'red'), err)
}}