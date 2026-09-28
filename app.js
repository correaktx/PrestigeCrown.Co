const state={products:[],cart:[],search:'',brand:'all'};
const WHATSAPP='573113138879';
const $=s=>document.querySelector(s);
const money=n=>new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(n);
const unitPriceForQty=q=>q>=3?110000:q===2?115000:120000;
const cartQty=()=>state.cart.reduce((sum,item)=>sum+item.qty,0);

async function init(){
  state.products=await fetch('products.json').then(r=>r.json());
  state.products=state.products.map(p=>({...p,brand:p.brand==='M'?'MONASTERY':p.brand}));
  buildBrands(); buildBrandList(); render(); updateCart(); $('#year').textContent=new Date().getFullYear();
}
function buildBrands(){
  const brands=[...new Set(state.products.map(p=>p.brand))];
  const wrap=$('#brandPills');
  wrap.innerHTML=`<button class="pill active" data-brand="all">Todas</button>`+brands.map(b=>`<button class="pill" data-brand="${esc(b)}">${esc(b)}</button>`).join('');
  wrap.querySelectorAll('.pill').forEach(btn=>btn.onclick=()=>{state.brand=btn.dataset.brand;wrap.querySelectorAll('.pill').forEach(x=>x.classList.toggle('active',x===btn));render()});
}
function buildBrandList(){
  const brands=[...new Set(state.products.map(p=>p.brand))];
  $('#brandList').innerHTML=brands.map((b,i)=>`<a class="brand-row" href="#coleccion" data-brand-link="${esc(b)}"><span class="num">${String(i+1).padStart(2,'0')}</span><h3>${esc(b)}</h3><span>${state.products.filter(p=>p.brand===b).length} REF.</span></a>`).join('');
  $('#brandList').querySelectorAll('[data-brand-link]').forEach(row=>row.onclick=()=>{state.brand=row.dataset.brandLink;const btn=[...$('#brandPills').querySelectorAll('.pill')].find(x=>x.dataset.brand===state.brand);if(btn){$('#brandPills').querySelectorAll('.pill').forEach(x=>x.classList.toggle('active',x===btn))}render()});
}
function esc(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function filtered(){const q=state.search.trim().toLowerCase();return state.products.filter(p=>(state.brand==='all'||p.brand===state.brand)&&(!q||`${p.brand} ${p.name} ${p.id}`.toLowerCase().includes(q)))}
function render(){
  const list=filtered(),grid=$('#productGrid');
  grid.innerHTML=list.map(p=>`<article class="product-card" data-product="${p.id}"><div class="product-photo"><img loading="lazy" src="${p.image}" alt="${esc(p.brand)} ${esc(p.name)}"><span class="limited">Drop limitado</span><button class="quick" data-quick="${p.id}">Ver producto ↗</button></div><div class="product-info"><div><div class="product-brand">${esc(p.brand)}</div><div class="product-name">${esc(p.name)}</div></div><div class="product-price">${money(120000)}</div><div class="stock-line">Stock disponible · M / L / XL / XXL</div></div></article>`).join('');
  $('#empty').classList.toggle('hidden',list.length>0);
  grid.querySelectorAll('.product-card').forEach(card=>card.onclick=e=>{if(e.target.closest('button'))return;openProduct(card.dataset.product)});
  grid.querySelectorAll('[data-quick]').forEach(b=>b.onclick=e=>{e.stopPropagation();openProduct(b.dataset.quick)});
}
function addToCart(id,size='M',color='Negro'){
  const key=`${id}-${size}-${color}`,found=state.cart.find(x=>x.key===key);if(found)found.qty++;else state.cart.push({key,id,size,color,qty:1});
  updateCart();openCart();showToast();
}
function updateCart(){
  $('#cartCount').textContent=cartQty();const box=$('#cartItems');box.innerHTML='';
  if(!state.cart.length){box.innerHTML='<div class="empty">Tu selección está vacía.<br><span>Explora la colección.</span></div>';$('#cartTotal').textContent=money(0);return}
  const qty=cartQty(),unit=unitPriceForQty(qty);
  state.cart.forEach(item=>{const p=state.products.find(x=>x.id===item.id);const row=document.createElement('div');row.className='cart-row';row.innerHTML=`<img src="${p.image}" alt=""><div><h4>${esc(p.name)}</h4><small>${esc(p.brand)} · ${item.size} · ${item.color}</small><div class="qty"><button data-minus="${item.key}">−</button><b>${item.qty}</b><button data-plus="${item.key}">+</button></div><button class="remove" data-remove="${item.key}">Eliminar</button></div><strong>${money(unit*item.qty)}</strong>`;box.appendChild(row)});
  $('#cartTotal').textContent=money(qty*unit);
  box.querySelectorAll('[data-plus]').forEach(b=>b.onclick=()=>changeQty(b.dataset.plus,1));box.querySelectorAll('[data-minus]').forEach(b=>b.onclick=()=>changeQty(b.dataset.minus,-1));box.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{state.cart=state.cart.filter(x=>x.key!==b.dataset.remove);updateCart()});
}
function changeQty(key,delta){const item=state.cart.find(x=>x.key===key);if(!item)return;item.qty+=delta;if(item.qty<1)state.cart=state.cart.filter(x=>x.key!==key);updateCart()}
function openCart(){$('#cartPanel').classList.add('open');$('#backdrop').classList.add('show');document.body.classList.add('no-scroll')}
function closeCart(){$('#cartPanel').classList.remove('open');$('#backdrop').classList.remove('show');document.body.classList.remove('no-scroll')}
function openProduct(id){
  const p=state.products.find(x=>x.id===id);const modal=$('#productModal');
  modal.classList.add('show');modal.setAttribute('aria-hidden','false');document.body.classList.add('no-scroll');
  $('#modalContent').innerHTML=`<div class="product-modal"><img src="${p.image}" alt="${esc(p.brand)} ${esc(p.name)}"><div class="product-detail"><div class="product-brand">${esc(p.brand)}</div><h2>${esc(p.name)}</h2><div class="big-price">${money(120000)}</div><p class="detail-note">Precio por cantidad: <strong>$120.000</strong> por 1 prenda · <strong>$115.000 c/u</strong> por 2 · <strong>$110.000 c/u</strong> por 3 o más. El beneficio de cliente fundador se valida por WhatsApp.</p><div class="choice"><label>Talla</label><div class="choices" id="sizes">${p.sizes.map(s=>`<button data-size="${s}">${s}</button>`).join('')}</div><label>Color</label><div class="choices" id="colors">${p.colors.map(c=>`<button data-color="${c}">${c}</button>`).join('')}</div></div><div class="modal-actions"><button class="button dark-button" id="modalAdd">Agregar a mi selección ↗</button><a class="button" style="background:transparent;color:#111;border-color:#bbb" target="_blank" rel="noopener" href="https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hola Prestige Crown Co., me interesa ${p.name} de ${p.brand}. Quiero consultar mi pedido y el beneficio de cliente fundador.`)}">Consultar por WhatsApp</a></div></div></div>`;
  modal.querySelector('[data-size="M"]').classList.add('selected');modal.querySelector('[data-color="Negro"]').classList.add('selected');
  modal.querySelectorAll('[data-size]').forEach(b=>b.onclick=()=>{modal.querySelectorAll('[data-size]').forEach(x=>x.classList.remove('selected'));b.classList.add('selected')});
  modal.querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>{modal.querySelectorAll('[data-color]').forEach(x=>x.classList.remove('selected'));b.classList.add('selected')});
  $('#modalAdd').onclick=()=>{const size=modal.querySelector('[data-size].selected').dataset.size,color=modal.querySelector('[data-color].selected').dataset.color;addToCart(id,size,color);closeModal()};
}
function closeModal(){$('#productModal').classList.remove('show');$('#productModal').setAttribute('aria-hidden','true');document.body.classList.remove('no-scroll')}
function checkout(){
  if(!state.cart.length){openCart();return}
  const qty=cartQty(),unit=unitPriceForQty(qty),total=qty*unit;
  const lines=state.cart.map(i=>{const p=state.products.find(x=>x.id===i.id);return `• ${i.qty} x ${p.name} — ${p.brand} — Talla ${i.size} — ${i.color}`});
  const msg=`Hola Prestige Crown Co. 👑\n\nQuiero realizar este pedido:\n${lines.join('\n')}\n\nCantidad total: ${qty} prendas\nPrecio aplicado: ${money(unit)} c/u\nTotal: ${money(total)}\nAbono 50%: ${money(total/2)}\n\n¿Soy cliente fundador?: Sí / No\n\nQuiero confirmar el pedido, disponibilidad y recibir instrucciones de pago y envío.`;
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`,'_blank','noopener');
}
function showToast(){const t=$('#toast');t.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove('show'),1500)}

$('#search').addEventListener('input',e=>{state.search=e.target.value;render()});
$('#openCart').onclick=openCart;$('#closeCart').onclick=closeCart;$('#backdrop').onclick=closeCart;$('#closeModal').onclick=closeModal;$('#productModal').onclick=e=>{if(e.target.id==='productModal')closeModal()};$('#checkout').onclick=checkout;
$('#mobileMenu').onclick=()=>$('#mobileNav').classList.toggle('open');$('#mobileNav').querySelectorAll('a').forEach(a=>a.onclick=()=>$('#mobileNav').classList.remove('open'));
init();
