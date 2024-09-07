const fs = require('fs');

function addResponProduk(kode, nama, harga, deskripsi, isImage, image_url, _db) {
  var obj_add = {
    kode: kode,
    name: nama,
    price: harga,
    desc: deskripsi,
    isImage: isImage,
    image_url: image_url
  }
  _db.push(obj_add)
  fs.writeFileSync('./database/list-produk.json', JSON.stringify(_db, null, 3))
}

function getDataResponProduk(kode, _db) {
  let position = null
  Object.keys(_db).forEach((x) => {
    if (_db[x].kode === kode) {
      position = x
    }
  })
  if (position !== null) {
    return _db[position]
  }
}

function isAlreadyResponProduk(kode, _db) {
  let found = false
  Object.keys(_db).forEach((x) => {
    if (_db[x].kode === kode) {
      found = true
    }
  })
  return found
}

function getDeskripsiProduk(kode, _dir) {
  let position = null
  Object.keys(_dir).forEach((x) => {
    if (_dir[x].kode === kode) {
      position = x
    }
  })
  if (position !== null) {
    return _dir[position].desc
  }
}

function getHargaProduk(kode, _dir) {
  let position = null
  Object.keys(_dir).forEach((x) => {
    if (_dir[x].kode === kode) {
      position = x
    }
  })
  if (position !== null) {
    return _dir[position].price
  }
}

function getNamaProduk(kode, _dir) {
  let position = null
  Object.keys(_dir).forEach((x) => {
    if (_dir[x].kode === kode) {
      position = x
    }
  })
  if (position !== null) {
    return _dir[position].name
  }
}

function resetProdukAll(_db) {
  _db.splice(position, 1)
  fs.writeFileSync('./database/list-produk.json', JSON.stringify(_db, null, 3))
}

function delResponProduk(kode, _db) {
  let position = null
  Object.keys(_db).forEach((i) => {
    if (_db[i].kode === kode) {
      position = i
    }
  })
  if (position !== null) {
    _db.splice(position, 1)
    fs.writeFileSync('./database/list-produk.json', JSON.stringify(_db, null, 3))
  }
}

function updateResponProduk(kode, nama, harga, deskripsi, isImage, image_url, _db) {
  let position = null
  Object.keys(_db).forEach((x) => {
    if (_db[x].kode === kode) {
      position = x
    }
  })
  if (position !== null) {
    _db[position].name = nama
    _db[position].price = harga
    _db[position].desc = deskripsi
    _db[position].isImage = isImage
    _db[position].image_url = image_url
    fs.writeFileSync('./database/list-produk.json', JSON.stringify(_db, null, 3))
  }
}
module.exports = {
  addResponProduk,
  delResponProduk,
  resetProdukAll,
  isAlreadyResponProduk,
  getDeskripsiProduk,
  getHargaProduk,
  getNamaProduk,
  updateResponProduk,
  getDataResponProduk
}
