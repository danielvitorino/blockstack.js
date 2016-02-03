'use strict'

var test = require('tape'),
    fs = require('fs')

var PrivateKeychain = require('elliptic-keychain').PrivateKeychain,
    PublicKeychain = require('elliptic-keychain').PublicKeychain

var profileDirectory = require('./sample-data')

var signProfileTokens = require('./index').signProfileTokens,
    getProfileFromTokens = require('./index').getProfileFromTokens,
    validateTokenRecord = require('./index').validateTokenRecord,
    Zonefile = require('./index').Zonefile

var privateKeychain = new PrivateKeychain(),
    publicKeychain = privateKeychain.publicKeychain()

function testTokening(profile) {
  var tokenRecords = []

  test('profileToTokens', function(t) {
    t.plan(2)

    tokenRecords = signProfileTokens([profile], privateKeychain)
    t.ok(tokenRecords, 'Tokens should have been created')
    //console.log(JSON.stringify(tokenRecords, null, 2))

    var tokensVerified = true
    tokenRecords.map(function(tokenRecord) {
      try {
        validateTokenRecord(tokenRecord, publicKeychain)
      } catch(e) {
        throw e
      }
    })
    t.equal(tokensVerified, true, 'All tokens should be valid')
  })

  test('tokensToProfile', function(t) {
    t.plan(2)

    var recoveredProfile = getProfileFromTokens(tokenRecords, publicKeychain)
    //console.log(recoveredProfile)
    t.ok(recoveredProfile, 'Profile should have been reconstructed')
    t.equal(JSON.stringify(recoveredProfile), JSON.stringify(profile), 'Profile should equal the reference')
  })
}

testTokening(profileDirectory.naval_profile)
testTokening(profileDirectory.google_id)
testTokening(profileDirectory.balloondog_art)

/* Zonefile Tests */

var zonefileJsonReference = JSON.parse(fs.readFileSync('./test_data/zonefile_forward.json'))
var zonefileStringReference = fs.readFileSync('./test_data/zonefile_forward.txt', 'utf-8')

test('zonefileFromJson', function(t) {
  t.plan(5)

  var zonefile = new Zonefile(zonefileJsonReference)
  t.ok(zonefile, 'Zonefile object should have been created')

  var zonefileJson = zonefile.toJSON()
  t.ok(zonefileJson, 'Zonefile JSON should have been created')
  t.equal(JSON.stringify(zonefileJson), JSON.stringify(zonefileJsonReference), 'Zonefile JSON should match the reference')

  var zonefileString = zonefile.toString()
  t.ok(zonefileString, 'Zonefile text should have been created')
  t.equal(zonefileString.split('; NS Records')[1], zonefileStringReference.split('; NS Records')[1], 'Zonefile text should match the reference')
})

test('zonefileFromString', function(t) {
  t.plan(5)

  var zonefile = new Zonefile(zonefileStringReference)
  t.ok(zonefile, 'Zonefile object should have been created')

  var zonefileJson = zonefile.toJSON()
  t.ok(zonefileJson, 'Zonefile JSON should have been created')
  t.equal(JSON.stringify(zonefileJson), JSON.stringify(zonefileJsonReference), 'Zonefile JSON should match the reference')

  var zonefileString = zonefile.toString()
  t.ok(zonefileString, 'Zonefile text should have been created')
  t.equal(zonefileString.split('; NS Records')[1], zonefileStringReference.split('; NS Records')[1], 'Zonefile text should match the reference')
})

/* Other tests

var Person = require('./index').Person,
    Organization = require('./index').Organization,
    CreativeWork = require('./index').CreativeWork
*/