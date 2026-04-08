import {
Component,
OnInit,
AfterViewInit,
HostListener,
ElementRef,
OnDestroy
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import { ApiService } from '../../../services/api.service';
import { PurchaseInvoiceService } from '../../../services/purchase-invoice.service';

@Component({
selector: 'app-print-engine',
standalone: true,
imports: [CommonModule],
templateUrl: './print-engine.html',
styleUrls: ['./print-engine.css']
})
export class PrintEngine implements OnInit, AfterViewInit, OnDestroy {

module!: string;
id!: number;

documentData: any = null;
loading = true;

preparedBy = '';
amountInWords = '';

zoom = 100;
minZoom = 60;
maxZoom = 150;

itemsPerPage = 18;
pagedItems: any[][] = [];
pages: number[] = [];
currentPage = 1;

private observer!: IntersectionObserver;

constructor(
private route: ActivatedRoute,
private api: ApiService,
private purchaseInvoiceService: PurchaseInvoiceService,
private elRef: ElementRef
){}

// ================= INIT =================

ngOnInit(): void {

this.preparedBy = localStorage.getItem('userName') || '';

this.route.paramMap.subscribe(params=>{
this.module = params.get('module')!;
this.id = Number(params.get('id'));

if(!this.module || !this.id){
console.error('Invalid print params');
return;
}

this.loadDocument();
});

}

ngAfterViewInit(): void {}

ngOnDestroy(): void {
if(this.observer) this.observer.disconnect();
}

// ================= LOAD =================

loadDocument(): void {

this.loading = true;

const success = (res:any)=>{

this.documentData = res;

const items = this.resolveItems(res);

this.buildPages(items);

this.setAmountWords(res.totalAmount || 0);

this.loading = false;

setTimeout(()=>{
this.goToPage(1);
this.initObserver();
this.renderThumbnails();
},700);

};

const error = (err:any)=>{
console.error('Print load failed',err);
this.loading = false;
};

switch(this.module){

case 'purchase-order':
this.api.getPurchaseOrderById(this.id).subscribe({next:success,error});
break;

case 'purchase-invoice':
this.purchaseInvoiceService.getById(this.id).subscribe({next:success,error});
break;

default:
console.error('Unknown module');
}

}

// ================= ITEMS =================

resolveItems(res:any):any[]{

if(!res) return [];

if(this.module==='purchase-order')
return res.items || res.purchaseOrderItems || [];

if(this.module==='purchase-invoice')
return res.items || res.purchaseInvoiceItems || res.invoiceItems || res.details || [];

return [];

}

// ================= PAGINATION =================

buildPages(items:any[]):void{

this.pagedItems = [];

if(!items?.length){
this.pages = [1];
this.currentPage = 1;
return;
}

for(let i=0;i<items.length;i+=this.itemsPerPage){
this.pagedItems.push(items.slice(i,i+this.itemsPerPage));
}

this.pages = this.pagedItems.map((_,i)=>i+1);
this.currentPage = 1;

}

// ⭐ THIS METHOD WAS MISSING (HTML USES IT)

getPageTotal(items:any[]):number{
return items.reduce((s,i)=>s+(i.amount||0),0);
}

// ================= OBSERVER =================

initObserver(): void {

if(this.observer) this.observer.disconnect();

const pages = document.querySelectorAll('.invoice-page');

this.observer = new IntersectionObserver(entries=>{
entries.forEach(e=>{
if(e.isIntersecting){
const id = e.target.getAttribute('id');
if(id) this.currentPage = Number(id.split('-')[1]);
}
});
},{threshold:0.65});

pages.forEach(p=>this.observer.observe(p));

}

// ================= THUMB =================

renderThumbnails(): void {

this.pages.forEach(p=>{

const page = document.getElementById('page-'+p);
const thumb = document.getElementById('thumb-'+p);

if(!page || !thumb) return;

thumb.innerHTML = '';

const clone = page.cloneNode(true) as HTMLElement;

clone.style.transform = 'scale(0.17)';
clone.style.transformOrigin = 'top left';
clone.style.pointerEvents = 'none';
clone.style.margin = '0';
clone.style.boxShadow = 'none';
clone.style.width = '794px';
clone.style.minHeight = '1123px';

thumb.appendChild(clone);

});

}

// ================= NAV =================

goToPage(p:number):void{

this.currentPage = p;

document.getElementById('page-'+p)
?.scrollIntoView({behavior:'smooth',block:'start'});

}

previousPage(){ if(this.currentPage>1) this.goToPage(this.currentPage-1); }
nextPage(){ if(this.currentPage<this.pages.length) this.goToPage(this.currentPage+1); }

// ================= ZOOM =================

zoomIn(){ if(this.zoom<this.maxZoom) this.zoom+=10; }
zoomOut(){ if(this.zoom>this.minZoom) this.zoom-=10; }

@HostListener('wheel',['$event'])
ctrlZoom(e:WheelEvent){
if(e.ctrlKey){
e.preventDefault();
e.deltaY<0?this.zoomIn():this.zoomOut();
}
}

// ================= WORDS =================

setAmountWords(amount:number){

if(!amount){ this.amountInWords=''; return; }

this.amountInWords =
this.numberToWords(Math.floor(amount)) + ' Taka Only';

}

numberToWords(num:number):string{

const ones=['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten',
'Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];

const tens=['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];

const h=(n:number)=>{
let s='';
if(n>99){ s+=ones[Math.floor(n/100)]+' Hundred '; n%=100; }
if(n>19){ s+=tens[Math.floor(n/10)]+' '; n%=10; }
if(n>0) s+=ones[n]+' ';
return s;
};

if(num===0) return 'Zero';

let out='';

if(num>=10000000){ out+=h(Math.floor(num/10000000))+' Crore '; num%=10000000; }
if(num>=100000){ out+=h(Math.floor(num/100000))+' Lakh '; num%=100000; }
if(num>=1000){ out+=h(Math.floor(num/1000))+' Thousand '; num%=1000; }

out+=h(num);

return out.trim();

}

// ================= EXPORT =================

print(){ window.print(); }

downloadPdf(){

const wrapper=document.querySelector('.page-wrapper') as HTMLElement;
if(!wrapper) return;

html2pdf().set({
margin:0,
filename:`${this.module}-${this.id}.pdf`,
html2canvas:{scale:2,useCORS:true},
jsPDF:{unit:'mm',format:'a4',orientation:'portrait'}
}).from(wrapper).save();

}

downloadExcel(){

if(!this.documentData) return;

const items=this.resolveItems(this.documentData);

const data:any[]=[['SL','Product','Qty','Rate','Amount']];

items.forEach((i:any,idx:number)=>{
data.push([idx+1,i.productName||('Product '+i.productId),i.quantity||i.qty,i.rate,i.amount]);
});

const ws=XLSX.utils.aoa_to_sheet(data);

ws['!cols']=[{wch:8},{wch:30},{wch:12},{wch:14},{wch:18}];

const wb={Sheets:{Sheet1:ws},SheetNames:['Sheet1']};

const buffer=XLSX.write(wb,{bookType:'xlsx',type:'array'});

saveAs(new Blob([buffer]),`${this.module}-${this.id}.xlsx`);

}

goBack(){
window.close();
setTimeout(()=>window.history.back(),100);
}

}