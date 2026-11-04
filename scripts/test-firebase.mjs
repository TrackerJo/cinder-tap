// Live integration test against the explicitly configured test project. Creates only synthetic data.
import { initializeApp, deleteApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword, deleteUser } from 'firebase/auth'
import { getFirestore, doc, setDoc, getDoc, getDocs, collection, query, where, deleteDoc, updateDoc, terminate } from 'firebase/firestore'
import { randomUUID, randomBytes } from 'node:crypto'
import { writeFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
import config from '../src/firebase-config.json' with {type:'json'}
const app=initializeApp(config,'test-owner'), other=initializeApp(config,'test-other'), publicApp=initializeApp(config,'test-public')
const auth=getAuth(app), otherAuth=getAuth(other), db=getFirestore(app), otherDb=getFirestore(other), publicDb=getFirestore(publicApp)
const email=`test-${randomUUID()}@example.com`,password=randomBytes(24).toString('hex')
const a=await createUserWithEmailAndPassword(auth,email,password)
const b=await createUserWithEmailAndPassword(otherAuth,`test-${randomUUID()}@example.com`,randomBytes(24).toString('hex'))
const businessId=randomUUID(),id=randomUUID()
try {
 const receipt={id:'INTEGRATION-TEST',merchant:{name:'Integration test business'},issuedAt:new Date().toISOString(),timeZone:'America/Indiana/Indianapolis',currency:'USD',kind:'Sale',status:'Paid',items:[{name:'Test coffee',quantity:1,unitPrice:300,total:300}],subtotal:300,total:300,paid:300,original:{label:'Test text',text:'1 Test coffee 3.00\nTOTAL 3.00'}}
 await setDoc(doc(db,'businesses',businessId),{ownerId:a.user.uid,name:'Integration test business'})
 await setDoc(doc(db,'receipts',id),{ownerId:a.user.uid,businessId,receipt,published:true})
 const display = {name:'Updated test business',address:['Test address'],phone:'',website:''}
 await setDoc(doc(db,'businessProfiles',businessId),display)
 assert.equal((await getDoc(doc(publicDb,'businessProfiles',businessId))).data().name,display.name)
 assert.equal((await getDoc(doc(publicDb,'receipts',id))).data().receipt.merchant.name,'Integration test business')
 await assert.rejects(()=>getDocs(collection(publicDb,'businessProfiles')))
 await assert.rejects(()=>setDoc(doc(otherDb,'businessProfiles',businessId),display))
 await assert.rejects(()=>setDoc(doc(db,'businessProfiles',businessId),{...display,ownerId:a.user.uid}))

 await updateDoc(doc(db,'businesses',businessId),{reviewLinks:{google:'https://g.page/r/test/review',yelp:'https://www.yelp.com/biz/test'}})
 await updateDoc(doc(db,'businesses',businessId),{reviewLinks:{google:'https://g.page/r/test/review'}})
 assert.equal((await getDoc(doc(db,'businesses',businessId))).data().reviewLinks.yelp,undefined)
 await setDoc(doc(db,'businessReviews',businessId),{reviewLinks:{google:'https://g.page/r/test/review'}})
 assert.equal((await getDoc(doc(publicDb,'businessReviews',businessId))).data().reviewLinks.google,'https://g.page/r/test/review')
 await assert.rejects(()=>getDocs(collection(publicDb,'businessReviews')))
 await assert.rejects(()=>setDoc(doc(otherDb,'businessReviews',businessId),{reviewLinks:{yelp:'https://www.yelp.com/biz/test'}}))
 await assert.rejects(()=>setDoc(doc(db,'businessReviews',businessId),{reviewLinks:{},privateAddress:'not allowed'}))
 await setDoc(doc(db,'businessReviews',businessId),{reviewLinks:{}})
 assert.deepEqual((await getDoc(doc(publicDb,'businessReviews',businessId))).data().reviewLinks,{})

 assert.equal((await getDoc(doc(publicDb,'receipts',id))).data().receipt.total,300)
 assert.equal((await getDocs(query(collection(db,'receipts'),where('ownerId','==',a.user.uid)))).size,1)
 await assert.rejects(()=>getDocs(collection(publicDb,'receipts')))
 await assert.rejects(()=>getDoc(doc(otherDb,'businesses',businessId)))
 await assert.rejects(()=>setDoc(doc(otherDb,'receipts',randomUUID()),{ownerId:b.user.uid,businessId,receipt,published:true}))
 await assert.rejects(()=>setDoc(doc(publicDb,'receipts',randomUUID()),{ownerId:a.user.uid,businessId,receipt,published:true}))
 console.log('PASS: owner creation/list, public single receipt; public review-profile read/update/removal; public listing/write, extra profile fields, and cross-owner business/profile access/write denied.')
 // Keep the temporary account for browser testing; its synthetic receipt and business are removed.
 if (process.env.CINDERTAP_BROWSER_TEST) await writeFile('/tmp/cindertap-test-account.json',JSON.stringify({email,password}),{mode:0o600})
} finally {
 await deleteDoc(doc(db,'receipts',id));await deleteDoc(doc(db,'businessProfiles',businessId));await deleteDoc(doc(db,'businessReviews',businessId));await deleteDoc(doc(db,'businesses',businessId));await deleteUser(b.user); if (!process.env.CINDERTAP_BROWSER_TEST) await deleteUser(a.user)
 for(const d of [db,otherDb,publicDb]) await terminate(d)
 for(const a of [app,other,publicApp]) await deleteApp(a)
}
