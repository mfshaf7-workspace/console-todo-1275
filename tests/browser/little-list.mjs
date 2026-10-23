// Owner browser qualification for the real Little List application.
// Serial, disposable browser contexts; fault injection is explicitly synthetic.
import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from '@playwright/test';

const appRoot=new URL('../../app/',import.meta.url);
const files=new Map([
  ['/', ['index.html','text/html; charset=utf-8']],
  ['/styles.css',['styles.css','text/css; charset=utf-8']],
  ['/app.mjs',['app.mjs','text/javascript; charset=utf-8']],
  ['/tasks.mjs',['tasks.mjs','text/javascript; charset=utf-8']],
]);
const server=http.createServer(async(request,response)=>{
  const file=files.get(new URL(request.url,'http://localhost').pathname);
  if(request.method!=='GET'||!file){response.writeHead(404).end();return;}
  try{const bytes=await readFile(new URL(file[0],appRoot));response.writeHead(200,{'Content-Type':file[1],'Cache-Control':'no-store'}).end(bytes);}
  catch{response.writeHead(500).end();}
});
let browser;
const checks=[],externalRequests=[],pageErrors=[];
try{
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  const origin=`http://127.0.0.1:${server.address().port}`;
  browser=await chromium.launch({headless:true});
  async function context(options={}){
    const value=await browser.newContext(options);
    await value.route('**/*',route=>{
      if(new URL(route.request().url()).origin!==origin){externalRequests.push(route.request().url());return route.abort();}
      return route.continue();
    });
    value.on('page',page=>page.on('pageerror',error=>pageErrors.push(error.message)));
    return value;
  }
  const normal=await context({viewport:{width:1360,height:950}});
  const page=await normal.newPage();
  await page.goto(origin);await page.locator('#task-text:enabled').waitFor();
  const input=page.getByRole('textbox',{name:'What needs doing?'});
  assert.equal(await page.locator('#tasks li').count(),0);
  await page.getByText('A clear start.',{exact:true}).waitFor();
  await input.fill('   ');await input.press('Enter');
  assert.equal(await page.locator('#tasks li').count(),0);
  await input.fill('Review today’s priorities');await input.press('Enter');
  await page.getByText('Review today’s priorities',{exact:true}).waitFor();
  assert.equal(await input.inputValue(),'');
  assert.equal(await page.evaluate(()=>document.activeElement.id),'task-text');
  checks.push('empty list, whitespace rejection, keyboard add and restored focus');

  const literal='<img src=x onerror="alert(1)">';
  await input.fill(literal);await page.getByRole('button',{name:'Add task'}).click();
  await page.getByText(literal,{exact:true}).waitFor();
  assert.equal(await page.locator('img').count(),0);
  checks.push('HTML-looking task text remains inert');

  await page.getByRole('checkbox',{name:'Review today’s priorities'}).check();
  await page.reload();await page.locator('#task-text:enabled').waitFor();
  assert.equal(await page.getByRole('checkbox',{name:'Review today’s priorities'}).isChecked(),true);
  await page.getByRole('checkbox',{name:'Review today’s priorities'}).uncheck();
  await page.reload();await page.locator('#task-text:enabled').waitFor();
  assert.equal(await page.getByRole('checkbox',{name:'Review today’s priorities'}).isChecked(),false);
  await page.getByRole('button',{name:`Delete task: ${literal}`,exact:true}).click();
  await page.reload();await page.locator('#task-text:enabled').waitFor();
  assert.equal(await page.locator('#tasks li').count(),1);
  assert.equal(await page.getByRole('checkbox',{name:'Review today’s priorities'}).isChecked(),false);
  checks.push('complete, uncomplete and exact deletion survive reload');

  await input.fill('Make room for a walk');await input.press('Enter');
  const other=await normal.newPage();await other.goto(origin);await other.locator('#task-text:enabled').waitFor();
  await other.getByRole('checkbox',{name:'Make room for a walk'}).check();
  await page.waitForFunction(()=>[...document.querySelectorAll('#tasks label')].find(n=>n.textContent==='Make room for a walk')?.previousElementSibling.checked);
  checks.push('native cross-tab storage events keep the list coherent');

  await page.setViewportSize({width:360,height:800});
  await input.fill('A'.repeat(240));await input.press('Enter');
  await page.getByText('A'.repeat(240),{exact:true}).waitFor();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  for(const button of await page.getByRole('button',{name:/^Delete task:/}).all()){
    const box=await button.boundingBox();assert.ok(box&&box.x>=0&&box.x+box.width<=360&&box.height>=44);
  }
  checks.push('360px layout, 240-character text and 44px delete targets fit');
  await normal.close();

  const denied=await context();
  await denied.addInitScript(expectedOrigin=>{
    if(location.origin!==expectedOrigin)return;
    localStorage.setItem('console-todo-1275.tasks.v1',JSON.stringify({version:1,tasks:[{id:'synthetic-prior-task',text:'Keep the stored task',completed:false}]}));
    Storage.prototype.setItem=()=>{throw new DOMException('Synthetic quota denial','QuotaExceededError');};
  },origin);
  const deniedPage=await denied.newPage();await deniedPage.goto(origin);await deniedPage.locator('#task-text:enabled').waitFor();
  await deniedPage.getByRole('textbox',{name:'What needs doing?'}).fill('Do not pretend this was saved');
  await deniedPage.getByRole('button',{name:'Add task'}).click();
  await deniedPage.getByRole('alert').filter({hasText:'could not be saved'}).waitFor();
  assert.equal(await deniedPage.locator('#tasks li').count(),1);
  assert.equal(await deniedPage.getByRole('checkbox',{name:'Keep the stored task'}).isChecked(),false);
  assert.deepEqual(await deniedPage.evaluate(()=>JSON.parse(localStorage.getItem('console-todo-1275.tasks.v1')).tasks),[{id:'synthetic-prior-task',text:'Keep the stored task',completed:false}]);
  assert.equal(await deniedPage.locator('#task-text').inputValue(),'Do not pretend this was saved');
  checks.push('synthetic write denial keeps the prior list and unsaved draft');
  await denied.close();

  const corrupt=await context();
  await corrupt.addInitScript(expectedOrigin=>{if(location.origin===expectedOrigin)localStorage.setItem('console-todo-1275.tasks.v1','not-json');},origin);
  const corruptPage=await corrupt.newPage();await corruptPage.goto(origin);
  await corruptPage.getByRole('alert').filter({hasText:'Editing is paused'}).waitFor();
  assert.equal(await corruptPage.locator('#task-text').isDisabled(),true);
  assert.equal(await corruptPage.getByRole('button',{name:'Add task'}).isDisabled(),true);
  assert.equal(await corruptPage.evaluate(()=>localStorage.getItem('console-todo-1275.tasks.v1')),'not-json');
  checks.push('synthetic corrupt storage is preserved and editing visibly pauses');
  await corrupt.close();
  assert.deepEqual(externalRequests,[]);assert.deepEqual(pageErrors,[]);assert.equal(checks.length,7);
  console.log(JSON.stringify({outcome:'PASS',fidelity:'sandbox-runtime',scope:'application browser behavior in serial disposable Chromium contexts; no lifecycle or hosting acceptance',application_root:fileURLToPath(appRoot),checks,external_requests:externalRequests,local_model_invoked:false}));
}finally{
  await browser?.close();
  if(server.listening)await new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()));
}
