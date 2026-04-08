import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';
import { ApiService } from '../../../services/api.service';

/* ================= TREE LEVEL ================= */

type InventoryLevel = 'TYPE' | 'CATEGORY' | 'SUBCATEGORY';

/* ================= TREE NODE ================= */

interface InventoryTreeNode {

  id:number;
  code:string;
  name:string;
  level:InventoryLevel;

  parentId?:number;
  parent?:InventoryTreeNode;

  hasChildren:boolean;
  nodeKey:string;

  expanded?:boolean;
  loading?:boolean;
  children?:InventoryTreeNode[];

}

@Component({
  selector:'app-chart-of-inventory',
  standalone:true,
  imports:[CommonModule, PageSubHeaderComponent],
  templateUrl:'./chart-of-inventory.html',
  styleUrl:'./chart-of-inventory.css'
})
export class ChartOfInventoryComponent implements OnInit {

  constructor(
    private api:ApiService,
    private router:Router
  ){}

  /* ================= STATE ================= */

  treeData:InventoryTreeNode[]=[];
  selectedNode?:InventoryTreeNode;

  mode:'categoryList' | 'subCategoryList' | 'productList' = 'categoryList';

  categoryList:any[]=[];
  subCategoryList:any[]=[];
  productList:any[]=[];

  selectedProduct:any=null;

  /* ================= INIT ================= */

  ngOnInit(){

    this.loadTypes();

    // ⭐ Refresh ONLY when navigated back to this page
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(()=>{
        this.resetScreen();
        this.loadTypes();
      });

  }

  resetScreen(){

    this.selectedNode = undefined;
    this.categoryList=[];
    this.subCategoryList=[];
    this.productList=[];
    this.selectedProduct=null;

  }

  /* ================= ROOT LOAD ================= */

  loadTypes(){

    this.api.getProductTypes()
    .subscribe((res:any[])=>{

      this.treeData = res
        .sort((a,b)=> a.typeCode.localeCompare(b.typeCode))
        .map(x => ({
          id:x.id,
          code:x.typeCode,
          name:x.typeName,
          level:'TYPE',
          hasChildren:true,
          parent:undefined,
          nodeKey:'TYPE-'+x.id,
          expanded:false
        }));

    });

  }

  /* ================= ENTERPRISE ACCORDION ================= */

  toggleNode(node:InventoryTreeNode){

    if(!node.hasChildren) return;

    const siblings = node.parent ? node.parent.children : this.treeData;

    siblings?.forEach(s=>{
      if(s !== node) s.expanded = false;
    });

    node.expanded = !node.expanded;

    if(node.expanded){
      this.loadChildren(node);
    }

  }

  /* ================= LOAD CHILDREN ================= */

  loadChildren(node:InventoryTreeNode){

    node.loading = true;

    /* ===== CATEGORY ===== */

    if(node.level === 'TYPE'){

      this.api.getCategories()
      .subscribe((res:any[])=>{

        node.children = res
          .filter(x => x.productTypeId === node.id)
          .sort((a,b)=> a.categoryCode.localeCompare(b.categoryCode))
          .map(x => ({
            id:x.id,
            code:x.categoryCode,
            name:x.categoryName,
            level:'CATEGORY',
            parentId:node.id,
            parent:node,
            hasChildren:true,
            nodeKey:'CATEGORY-'+x.id,
            expanded:false
          }));

        node.loading = false;

      });

    }

    /* ===== SUBCATEGORY ===== */

    else if(node.level === 'CATEGORY'){

      this.api.getSubCategoriesByCategory(node.id)
      .subscribe((res:any[])=>{

        node.children = res
          .sort((a,b)=> a.subCategoryCode.localeCompare(b.subCategoryCode))
          .map(x => ({
            id:x.id,
            code:x.subCategoryCode,
            name:x.subCategoryName,
            level:'SUBCATEGORY',
            parentId:node.id,
            parent:node,
            hasChildren:false,
            nodeKey:'SUBCATEGORY-'+x.id
          }));

        node.loading = false;

      });

    }

  }

  /* ================= NODE SELECT ================= */

  selectNode(node:InventoryTreeNode){

    this.selectedNode = node;
    this.selectedProduct = null;

    this.categoryList=[];
    this.subCategoryList=[];
    this.productList=[];

    if(node.level === 'TYPE'){
      this.mode='categoryList';
      this.loadCategoryGrid(node.id);
    }
    else if(node.level === 'CATEGORY'){
      this.mode='subCategoryList';
      this.loadSubCategoryGrid(node.id);
    }
    else if(node.level === 'SUBCATEGORY'){
      this.mode='productList';
      this.loadProductGrid(node.id);
    }

  }

  /* ================= GRID LOAD ================= */

  loadCategoryGrid(typeId:number){

    this.api.getCategories()
    .subscribe((res:any[])=>{

      this.categoryList = res
        .filter(x => x.productTypeId === typeId)
        .sort((a,b)=> a.categoryCode.localeCompare(b.categoryCode));

    });

  }

  loadSubCategoryGrid(categoryId:number){

    this.api.getSubCategoriesByCategory(categoryId)
    .subscribe((res:any[])=>{

      this.subCategoryList = res
        .sort((a,b)=> a.subCategoryCode.localeCompare(b.subCategoryCode));

    });

  }

  loadProductGrid(subCategoryId:number){

    this.api.getProductsBySubCategory(subCategoryId)
    .subscribe((res:any[])=>{

      this.productList = res
        .sort((a,b)=> a.productCode.localeCompare(b.productCode));

    });

  }

  /* ================= ROW SELECT ================= */

  selectProductRow(p:any){
    this.selectedProduct = p;
  }

  /* ================= ACTION BUTTONS ================= */

  onAddCategory(){
    if(!this.selectedNode || this.selectedNode.level !== 'TYPE') return;

    this.router.navigate(['/product-category/form'],{
      queryParams:{ mode:'add', typeId:this.selectedNode.id }
    });
  }

  onAddSubCategory(){
    if(!this.selectedNode || this.selectedNode.level !== 'CATEGORY') return;

    this.router.navigate(['/product/sub-category/form'],{
      queryParams:{ mode:'add', categoryId:this.selectedNode.id }
    });
  }

  onAddProduct(){
    if(!this.selectedNode || this.selectedNode.level !== 'SUBCATEGORY') return;

    this.router.navigate(['/product/form'],{
      queryParams:{ mode:'add', subCategoryId:this.selectedNode.id }
    });
  }

}