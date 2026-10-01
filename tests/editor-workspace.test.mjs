import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../tools/Collection_Editor.html',import.meta.url),'utf8');
const condition=source.match(/if \((!\(window\.parent[^\n]+)\) \{/)[1];
function hasWorkspace(framed,search=''){
 const window={};window.parent=framed?{}:window;
 return vm.runInNewContext(condition,{window,location:{search},URLSearchParams});
}
test('full controls appear in standalone and preview frames; only Studio child hides them',()=>{
 assert.equal(hasWorkspace(false),true);
 assert.equal(hasWorkspace(true),true);
 assert.equal(hasWorkspace(true,'?studioChild=1'),false);
 assert.equal(hasWorkspace(false,'?studioChild=1'),true);
});
test('numbered downloadable release matches the hosted editor source',()=>{
 assert.equal(readFileSync(new URL('../tools/Collection_Editor_v003.html',import.meta.url),'utf8'),source);
 assert.match(source,/<h1>Collection &amp; Studio Editor · v003<\/h1>/);
});
