import { test } from 'node:test'
import assert from 'node:assert/strict'
import { reviewUrl, parseReviewLinks } from '../src/review-links.ts'
test('accepts Google and Yelp HTTPS review links',()=>{
 for(const url of ['https://g.page/r/example/review','https://maps.app.goo.gl/example','https://search.google.com/local/writereview?placeid=123']) assert.equal(reviewUrl(url,'google'),url)
 assert.equal(reviewUrl('https://www.yelp.com/biz/test','yelp'),'https://www.yelp.com/biz/test')
 assert.deepEqual(parseReviewLinks({google:'  ',yelp:''}),{})
})
test('rejects unsafe schemes, lookalike hosts, credentials, and mismatched providers',()=>{
 for(const url of ['javascript:alert(1)','http://google.com','https://google.com.evil.test','https://evil.test/google.com','https://user:pass@google.com','https://yelp.com']) assert.equal(reviewUrl(url,'google'),undefined)
 assert.throws(()=>parseReviewLinks({yelp:'https://google.com'}),/valid HTTPS/)
})
