/* Markup bootstrap for Tilda: CSS stays inside T123. */
(function(){
  function build(){
    document.querySelectorAll('section[data-clinic-reviews]').forEach(function(root){
      if(root.querySelector('.cr-grid'))return;
      root.setAttribute('aria-label',root.getAttribute('aria-label') || 'Отзывы о клинике');
      var header=document.createElement('header');header.className='cr-header';
      var heading=document.createElement('div');
      var label=document.createElement('p');label.className='cr-label';label.textContent='Спасибо за ваше доверие';
      var title=document.createElement('h2');title.textContent='ОТЗЫВЫ НАШИХ ПАЦИЕНТОВ';
      heading.append(label,title);
      var link=document.createElement('a');link.className='cr-link';
      link.href='https://2gis.kz/';link.target='_blank';link.rel='noopener noreferrer';link.textContent='Все отзывы в 2ГИС ↗';
      header.append(heading,link);
      var summary=document.createElement('p');summary.className='cr-summary';summary.setAttribute('aria-live','polite');summary.textContent='Загружаем рейтинг…';
      var grid=document.createElement('div');grid.className='cr-grid';grid.setAttribute('aria-label','Последние отзывы');grid.tabIndex=0;
      var actions=document.createElement('div');actions.className='cr-actions';
      var more=document.createElement('button');more.className='cr-load-more';more.type='button';more.hidden=true;more.textContent='Загрузить еще';
      actions.append(more);
      var status=document.createElement('p');status.className='cr-status';status.setAttribute('role','status');status.textContent='Загружаем отзывы из 2ГИС…';
      var note=document.createElement('p');note.className='cr-note';note.textContent='Отзывы из 2ГИС · последние доступные отзывы с оценкой';
      root.append(header,summary,grid,actions,status,note);
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build,{once:true});
  else build();
})();

(function(){
'use strict';
function init(){
document.querySelectorAll('[data-clinic-reviews]').forEach(function(root){
if(root.dataset.initialized)return;
root.dataset.initialized='1';
var grid=root.querySelector('.cr-grid'),status=root.querySelector('.cr-status'),summary=root.querySelector('.cr-summary');
var iconUrl='https://cdn.jsdelivr.net/gh/DiasMazhenov/2GIS-tilda-reviews@main/assets/2gis-icon.webp';
var branch=root.dataset.branchId,key=(root.dataset.apiKey || '86fa3d7f-3448-4eb9-860b-09a67b00615e').trim(),link=root.querySelector('.cr-link');
var limit=num(root.dataset.displayLimit,6,1,30),searchLimit=num(root.dataset.searchLimit,200,1,500),min=num(root.dataset.positiveMin,4,1,5);
// Doctor mode: a marker is optional when the doctor's name has class .doctor.
// Tilda Zero Block often puts the class on a wrapper with text inside .tn-atom.
var marker=document.querySelector('[data-gis-doctor-reviews], [data-cr-doctor-reviews]');
var selector=marker?.dataset.doctorSelector || '.doctor';
var doctorNode=document.querySelector(selector);
var doctorName=(marker?.dataset.doctorName || doctorNode?.querySelector('.tn-atom')?.textContent || doctorNode?.textContent || '').replace(/\s+/g,' ').trim();
var doctorMode=Boolean(doctorName && (marker || doctorNode)),busy=false;
if(marker&&!doctorMode)console.warn('[2GIS Reviews] Маркер врача найден, но ФИО не определено. Проверьте класс .doctor или data-doctor-name.');
if(doctorMode)console.info('[2GIS Reviews] Включён поиск упоминаний врача:',doctorName);
var moreButton=root.querySelector('.cr-load-more'), step=3, shown=limit;
var loaded=[], seen=new Set(), cursor=0, exhausted=false, partial=false, fallback=false, meta=null;
var pageSize=doctorMode?50:Math.max(12,limit,step);
if(root.dataset.title)root.querySelector('.cr-header h2').textContent=root.dataset.title;
if(root.dataset.subtitle)root.querySelector('.cr-label').textContent=root.dataset.subtitle;
if(/^\d+$/.test(branch||''))link.href='https://2gis.kz/firm/'+encodeURIComponent(branch)+'/tab/reviews';else link.hidden=true;
if(!/^\d+$/.test(branch||'')){
summary.textContent='Отзывы в 2ГИС';status.textContent='Укажите числовой ID филиала в data-branch-id.';return;
}
function num(s,d,lo,hi){var x=Number(s);return Number.isInteger(x)&&x>=lo&&x<=hi?x:d;}
function words(s){return String(s||'').toLocaleLowerCase('ru').replace(/ё/g,'е').replace(/[^\p{L}\p{N}]+/gu,' ').trim().split(' ').filter(Boolean);}
function tokens(){var p=words(doctorName);if(p.length<3)return p;
return /(вич|вна|ична|оглы|кызы)$/.test(p[1])?[p[0],p[2]]:[p[1],p[0]];}
var doctorTokens=tokens();
function syncDoctor(){
  var el=document.querySelector('.doctor');
  var name=(document.querySelector('[data-gis-doctor-reviews]')?.dataset.doctorName || el?.querySelector('.tn-atom')?.textContent || el?.textContent || '').trim();
  if(!name || name===doctorName)return false;
  doctorName=name;doctorMode=true;doctorTokens=tokens();pageSize=50;
  return true;
}
function same(a,b){if(a===b)return true;if(b.length<5)return false;var stem=b.slice(0,-(b.length>=7?2:1));return a.startsWith(stem)&&Math.abs(a.length-b.length)<=2;}
// Не считаем одно имя доказательством, что отзыв относится к врачу.
// Для ФИО: фамилия сама по себе, либо имя + отчество рядом.
// Для двух слов: нужны обе части рядом.
function matches(r){
  var w=words(r.text),p=words(doctorName);
  if(!p.length)return false;
  var patron=function(x){return /(вич|вна|ична|оглы|кызы|улы|улы|қызы)$/.test(x);};
  var surname='',name='',middle='';
  if(p.length>=3){
    if(patron(p[1])){name=p[0];middle=p[1];surname=p[2];}
    else{surname=p[0];name=p[1];middle=p[2];}
  }else if(p.length===2){surname=p[0];name=p[1];}
  else{surname=p[0];}
  var hasSurname=Boolean(surname)&&w.some(function(x){return same(x,surname);});
  var near=function(a,b){
    if(!a||!b)return false;
    for(var i=0;i<w.length;i++){
      if(!same(w[i],a))continue;
      for(var j=Math.max(0,i-2);j<=Math.min(w.length-1,i+2);j++){
        if(i!==j&&same(w[j],b))return true;
      }
    }
    return false;
  };
  if(p.length===1)return false; // одно имя неоднозначно
  if(p.length===2)return near(surname,name);
  return hasSurname || near(name,middle);
}
function highlightDoctor(textNode, reviewText){
  // Only highlight the doctor's name on doctor pages.
  if(!doctorMode || !doctorTokens.length)return;
  var pattern=/[\p{L}\p{N}]+/gu,match,last=0,parts=[],found=false;
  while((match=pattern.exec(reviewText))!==null){
    var word=match[0].toLocaleLowerCase('ru').replace(/ё/g,'е');
    if(!doctorTokens.some(function(token){return same(word,token);}))continue;
    if(match.index>last)parts.push(document.createTextNode(reviewText.slice(last,match.index)));
    var strong=document.createElement('strong');
    strong.textContent=match[0];
    parts.push(strong);
    last=match.index+match[0].length;
    found=true;
  }
  if(found){
    if(last<reviewText.length)parts.push(document.createTextNode(reviewText.slice(last)));
    textNode.replaceChildren(...parts);
  }
}
function valid(r){return r&&!r.is_hidden&&!r.hiding_reason&&typeof r.text==='string'&&Boolean(r.text.trim());}
function positive(r){return valid(r)&&Number(r.rating)>=min;}
function el(tag,cls,txt){var n=document.createElement(tag);n.className=cls;n.textContent=txt||'';return n;}
function card(r){
var c=el('article','cr-card');c.append(el('div','cr-author',(r.user&&r.user.name)||'Пользователь 2ГИС'));
var date=new Date(r.date_created);
if(!Number.isNaN(date.getTime())){var t=el('time','cr-date',date.toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'}));t.dateTime=date.toISOString();c.append(t);}
var rating=Number(r.rating);
if(Number.isInteger(rating)&&rating>=1&&rating<=5){var s=el('p','cr-stars','★'.repeat(rating)+'☆'.repeat(5-rating));s.setAttribute('aria-label',rating+' из 5');c.append(s);}
var p=el('p','cr-text cr-short',r.text);highlightDoctor(p,r.text);c.append(p);
var button=el('button','cr-more','Читать полностью');button.type='button';button.hidden=true;button.setAttribute('aria-expanded','false');
button.addEventListener('click',function(){var short=p.classList.toggle('cr-short');button.textContent=short?'Читать полностью':'Свернуть';button.setAttribute('aria-expanded',String(!short));});c.append(button);return c;
}
function resize(){grid.querySelectorAll('.cr-card').forEach(function(c){var p=c.querySelector('.cr-text'),b=c.querySelector('.cr-more');if(p.classList.contains('cr-short'))b.hidden=p.scrollHeight<=p.clientHeight+1;});}
async function fetchPage(offset,count){
var qs=new URLSearchParams({key:key,rated:'true',limit:String(count),offset:String(offset),sort_by:'date_created',fields:'meta.branch_rating,meta.branch_reviews_count'});
var controller=new AbortController(),timer=setTimeout(function(){controller.abort();},15000);
try{var response=await fetch('https://public-api.reviews.2gis.com/2.0/branches/'+branch+'/reviews?'+qs,{signal:controller.signal,credentials:'omit'});
if(!response.ok)throw Error('HTTP '+response.status);var data=await response.json();if(!Array.isArray(data.reviews)||data.meta?.code!==200)throw Error('Invalid response');return data;
}finally{clearTimeout(timer);}
}
function reviewId(r){return String(r.id||(r.date_created+':'+(r.user?.name||'')+':'+r.text));}
function selectedReviews(){
  var relevant=doctorMode?loaded.filter(matches):loaded.filter(valid);
  fallback=doctorMode&&relevant.length===0;
  return fallback?loaded.filter(positive):relevant;
}
async function fill(minWanted){
  // Для страниц врача сканируем до searchLimit, чтобы найти упоминания.
  var maximum=doctorMode?searchLimit:Math.max(searchLimit,minWanted);
  while(!exhausted&&cursor<maximum){
    var requested=Math.min(pageSize,maximum-cursor),data;
    try{data=await fetchPage(cursor,requested);}
    catch(error){
      if(!meta)throw error;
      partial=true;exhausted=true;
      console.warn('[2GIS Reviews] Частичная загрузка',error);
      break;
    }
    if(!meta)meta=data.meta;
    cursor+=requested;
    var newIds=0;
    data.reviews.forEach(function(r){
      if(!valid(r))return;
      var id=reviewId(r);
      if(seen.has(id))return;
      seen.add(id);loaded.push(r);newIds++;
    });
    if(data.reviews.length<requested||newIds===0)exhausted=true;
    // В режиме врача дочитываем заданный лимит (включая ситуацию
    // когда пока нет упоминаний). На обычных страницах подгружаем по мере кликов.
    if(!doctorMode&&selectedReviews().length>=minWanted)break;
  }
}
function draw(){
  var available=selectedReviews(),visible=available.slice(0,shown);
  grid.replaceChildren(...visible.map(card));
  requestAnimationFrame(resize);
  if(meta){
    var rating=Number(meta.branch_rating),count=meta.branch_reviews_count;
    var icon=document.createElement('img');icon.className='dg-icon';icon.src=iconUrl;icon.alt='2ГИС';
    var ratingText=Number.isFinite(rating)&&meta.branch_rating!=null
      ? ' '+rating.toLocaleString('ru-RU')+' из 5'+(Number.isInteger(count)?' · Отзывов: '+count:'')+' · 2ГИС'
      : ' Отзывы в 2ГИС';
    summary.replaceChildren(icon,document.createTextNode(ratingText));
  }
  // Не обещаем дополнительную порцию, когда данных больше нет.
  moreButton.hidden=!(available.length>shown||(!exhausted&&!doctorMode));
  status.textContent=fallback ? '' :
    doctorMode&&visible.length ? 'Отзывы с упоминанием: '+doctorName :
    visible.length ? '' : 'Текстовых отзывов не найдено.';
}
async function load(initial){
  if(busy||!root.isConnected)return;
  busy=true;
  moreButton.disabled=true;
  moreButton.textContent='Загружаем…';
  if(!grid.children.length)status.textContent='Загружаем отзывы…';
  try{
    if(initial){
      // При периодическом обновлении сохраняем число раскрытых карточек.
      loaded=[];seen=new Set();cursor=0;exhausted=false;partial=false;meta=null;
    }
    await fill(shown+(doctorMode?0:1));
    draw();
  }catch(error){
    console.error('[2GIS Reviews]',error);
    if(!grid.children.length)summary.textContent='Отзывы в 2ГИС';
    status.textContent=(/HTTP (401|403)/.test(String(error)) ? '2ГИС отклонил запрос. Возможно, ключ виджета больше не действует для этого сайта. Укажите разрешённый ключ через data-api-key. ' : 'Не удалось загрузить отзывы. ') + 'Посмотрите их по ссылке на 2ГИС.';
    if(!grid.children.length)moreButton.hidden=true;
  }finally{
    busy=false;
    moreButton.disabled=false;
    moreButton.innerHTML='Загрузить еще <span aria-hidden="true">↓</span>';
  }
}
moreButton.addEventListener('click',async function(){
  if(busy)return;
  // Кнопка добавляет ровно до 3 карточек к уже показанным.
  shown+=step;
  await load(false);
});
load(true);
var attempts=0,doctorTimer=setInterval(function(){
  if(!root.isConnected || ++attempts>20){clearInterval(doctorTimer);return;}
  if(syncDoctor()){clearInterval(doctorTimer);load(true);}
},500);
window.addEventListener('resize',resize);
var refresh=setInterval(function(){if(!root.isConnected){clearInterval(refresh);return;}if(!document.hidden&&!root.contains(document.activeElement))load(true);},300000);
});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
