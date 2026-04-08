import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';
import { ApiService } from '../../../services/api.service';

interface CoaTreeNode{
  id:number;
  code:string;
  name:string;
  level:'CLASS'|'GROUP'|'SUBGROUP';
  parent?:CoaTreeNode;
  parentId?:number;
  hasChildren:boolean;
  nodeKey:string;
  expanded?:boolean;
  loading?:boolean;
  children?:CoaTreeNode[];
}

@Component({
  selector:'app-chart-of-accounts',
  standalone:true,
  imports:[CommonModule,PageSubHeaderComponent],
  templateUrl:'./chart-of-accounts.html',
  styleUrl:'./chart-of-accounts.css'
})
export class ChartOfAccountsComponent implements OnInit{

  @ViewChild('treeBody') treeBody!:ElementRef;

  constructor(private api:ApiService, private router:Router){}

  treeData:CoaTreeNode[]=[];
  selectedNode?:CoaTreeNode;

  mode:'groupList'|'subGroupList'|'ledgerList'='groupList';

  groupList:any[]=[];
  subGroupList:any[]=[];
  ledgerList:any[]=[];
  selectedLedger:any=null;

  ngOnInit(){ this.loadClasses(); }

  loadClasses(){
    this.api.getAccountClasses().subscribe((res:any[])=>{
      this.treeData=res.map(x=>({
        id:x.id,
        code:x.classCode,
        name:x.className,
        level:'CLASS',
        hasChildren:true,
        nodeKey:'CLASS-'+x.id,
        expanded:false
      }));
    });
  }

  toggleNode(node:CoaTreeNode){

    if(!node.hasChildren) return;

    const siblings=node.parent ? node.parent.children : this.treeData;

    siblings?.forEach(s=>{
      if(s!==node) s.expanded=false;
    });

    node.expanded=!node.expanded;

    if(node.expanded && !node.children){
      this.loadChildren(node);
    }

  }

  loadChildren(node:CoaTreeNode){

    node.loading=true;

    if(node.level==='CLASS'){

      this.api.getAccountGroups().subscribe(res=>{
        node.children=res
        .filter((x:any)=>x.accountClassId===node.id)
        .map((x:any)=>({
          id:x.id,
          code:x.groupCode,
          name:x.groupName,
          level:'GROUP',
          parent:node,
          parentId:node.id,
          hasChildren:true,
          nodeKey:'GROUP-'+x.id,
          expanded:false
        }));
        node.loading=false;
      });

    }

    else{

      this.api.getAccountSubGroups().subscribe(res=>{
        node.children=res
        .filter((x:any)=>x.groupId===node.id)
        .map((x:any)=>({
          id:x.id,
          code:x.subGroupCode,
          name:x.subGroupName,
          level:'SUBGROUP',
          parent:node,
          parentId:node.id,
          hasChildren:false,
          nodeKey:'SUBGROUP-'+x.id
        }));
        node.loading=false;
      });

    }

  }

  selectNode(node:CoaTreeNode){

    this.selectedNode=node;
    this.selectedLedger=null;
    this.groupList=[];
    this.subGroupList=[];
    this.ledgerList=[];

    setTimeout(()=>{
      const el=document.querySelector('.node-pill.selected');
      el?.scrollIntoView({behavior:'smooth',block:'center'});
    });

    if(node.level==='CLASS'){
      this.mode='groupList';
      this.loadGroupGrid(node.id);
    }
    else if(node.level==='GROUP'){
      this.mode='subGroupList';
      this.loadSubGroupGrid(node.id);
    }
    else{
      this.mode='ledgerList';
      this.loadLedgerGrid(node);
    }

  }

  loadGroupGrid(id:number){
    this.api.getAccountGroups().subscribe(res=>{
      this.groupList=res.filter((x:any)=>x.accountClassId===id);
    });
  }

  loadSubGroupGrid(id:number){
    this.api.getAccountSubGroups().subscribe(res=>{
      this.subGroupList=res.filter((x:any)=>x.groupId===id);
    });
  }

  loadLedgerGrid(node:CoaTreeNode){

    const code=node.code;

    if(code.startsWith('SUB-01-01')){
      this.api.getCustomers().subscribe(res=>{
        this.ledgerList=res
        .filter((x:any)=>x.subGroupCode===code)
        .map((x:any)=>({
          id:x.id,
          ledgerCode:x.customerCode,
          ledgerName:x.customerDisplayName||x.customerName,
          status:x.status
        }));
      });
      return;
    }

    if(code.startsWith('SUB-01-03')){
      this.api.getCashAccounts().subscribe(res=>{
        this.ledgerList=res.map((x:any)=>({
          id:x.id,
          ledgerCode:x.accountCode,
          ledgerName:x.accountName,
          status:x.status
        }));
      });
      return;
    }

    if(code.startsWith('SUB-01-04')){
      this.api.getBankAccounts().subscribe(res=>{
        this.ledgerList=res.map((x:any)=>({
          id:x.id,
          ledgerCode:x.accountCode,
          ledgerName:x.accountName,
          status:x.status
        }));
      });
      return;
    }

    if(code.startsWith('SUB-01-05')){
      this.api.getMfsAccounts().subscribe(res=>{
        this.ledgerList=res.map((x:any)=>({
          id:x.id,
          ledgerCode:x.accountCode,
          ledgerName:x.accountName,
          status:x.status
        }));
      });
      return;
    }

    if(code.startsWith('SUB-01-06')){
      this.api.getPosAccounts().subscribe(res=>{
        this.ledgerList=res.map((x:any)=>({
          id:x.id,
          ledgerCode:x.accountCode,
          ledgerName:x.accountName,
          status:x.status
        }));
      });
      return;
    }

    if(code.startsWith('SUB-03-01')){
      this.api.getSuppliers().subscribe(res=>{
        this.ledgerList=res
        .filter((x:any)=>x.subGroupCode===code)
        .map((x:any)=>({
          id:x.id,
          ledgerCode:x.supplierCode,
          ledgerName:x.supplierName,
          status:x.status
        }));
      });
      return;
    }

    this.api.getGeneralLedgers().subscribe(res=>{
      this.ledgerList=res.filter((x:any)=>x.subGroupId===node.id);
    });

  }

  selectLedgerRow(l:any){ this.selectedLedger=l; }

}