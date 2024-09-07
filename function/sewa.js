const fs = require('fs')
const toMs = require('ms')

const addSewaGroup = (groupId, expired, _dir) => {
  const obj = {
    id: groupId,
    expired: Date.now() + toMs(expired)
  }
  _dir.push(obj)
  fs.writeFileSync('./database/sewa.json', JSON.stringify(_dir))
}

const getSewaPosition = (groupId, _dir) => {
  let position = null
  Object.keys(_dir).forEach((i) => {
    if (_dir[i].id === groupId) {
      position = i
    }
  })
  if (position !== null) {
    return position
  }
}

const getSewaExpired = (groupId, _dir) => {
  let position = null
  Object.keys(_dir).forEach((i) => {
    if (_dir[i].id === groupId) {
      position = i
    }
  })
  if (position !== null) {
    return _dir[position].expired
  }
}

const checkSewa = (groupId, _dir) => {
  let status = false
  Object.keys(_dir).forEach((i) => {
    if (_dir[i].id === groupId) {
      status = true
    }
  })
  return status
}

const expiredCheck = (_dir, ronzz, msg, groupId) => {
  setInterval(() => {
    const { groupLeave, sendMessage } = ronzz
    let position = null
    Object.keys(_dir).forEach((i) => {
      if (Date.now() >= _dir[i].expired) {
        position = i
      }
    })
    if (position !== null) {
      _dir.splice(position, 1)
      fs.writeFileSync('./database/sewa.json', JSON.stringify(_dir))
      groupLeave(groupId)
    }
  }, 1000)
}

const getAllSewa = (_dir) => {
  const array = []
  Object.keys(_dir).forEach((i) => {
    array.push(_dir[i].id)
  })
  return array
}

module.exports = {
  addSewaGroup,
  getSewaExpired,
  getSewaPosition,
  expiredCheck,
  checkSewa,
  getAllSewa
}