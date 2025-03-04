import{g as j,d as z,u as y,c as H}from"./menu-YiF2EqA-.js";import{d as J,r as p,a as K,m as W,b as i,G as X,o as V,c as Y,f as k,e as l,w as n,p as Z,x as I,i as x,y as ee,t as te,g as D,P as le,Q as ae,O as ne,C as oe,E as m}from"./index-D2BneEQd.js";import{_ as re}from"./_plugin-vue_export-helper-DlAUqK2U.js";const se={class:"app-container"},ie={class:"toolbar"},de={class:"sort-column"},ue={class:"sort-buttons"},ce=J({__name:"index",setup(pe){const w=p(!1),u=p([]),f=p(!1),h=p(""),C=p(!1),v=p(),o=p({name:"",path:"",icon:"",sort:0,parent_id:null}),S={name:[{required:!0,message:"请输入菜单名称",trigger:"blur"}],path:[{required:!0,message:"请输入路由路径",trigger:"blur"}],icon:[{required:!0,message:"请输入图标名称",trigger:"blur"}]},_=K(),b=async()=>{try{w.value=!0;const{data:t}=await j();u.value=t}catch(t){console.error("获取菜单列表失败:",t)}finally{w.value=!1}},A=()=>{h.value="新增菜单",f.value=!0},B=t=>{h.value="编辑菜单",o.value={...t},f.value=!0},E=async t=>{try{await oe.confirm("确认删除该菜单吗？","提示",{type:"warning"}),await z(t.id),m.success("删除成功"),await _.getUserInfoAction(),b()}catch(e){console.error("Delete menu error:",e)}},$=async()=>{if(v.value){await v.value.validate();try{if(C.value=!0,o.value.id){const t={name:o.value.name,icon:o.value.icon,sort:o.value.sort};await y(o.value.id,t),m.success("更新成功"),await _.getUserInfoAction()}else await H(o.value),m.success("创建成功"),await _.getUserInfoAction();f.value=!1,b()}catch(t){console.error("Submit menu error:",t)}finally{C.value=!1}}},N=()=>{v.value&&v.value.resetFields(),o.value={name:"",path:"",icon:"",sort:0,parent_id:null}},q=t=>u.value.filter(r=>r.parent_id===t.parent_id).findIndex(r=>r.id===t.id)>0,F=t=>{const e=u.value.filter(r=>r.parent_id===t.parent_id);return e.findIndex(r=>r.id===t.id)<e.length-1},R=async t=>{try{const e=u.value.filter(d=>d.parent_id===t.parent_id),s=e.findIndex(d=>d.id===t.id),r=e[s-1],c=t.sort;await y(t.id,{sort:r.sort}),await y(r.id,{sort:c}),await b(),await _.getUserInfoAction(),m.success("排序更新成功")}catch(e){console.error("Move menu error:",e),m.error("排序更新失败")}},T=async t=>{try{const e=u.value.filter(d=>d.parent_id===t.parent_id),s=e.findIndex(d=>d.id===t.id),r=e[s+1],c=t.sort;await y(t.id,{sort:r.sort}),await y(r.id,{sort:c}),await b(),await _.getUserInfoAction(),m.success("排序更新成功")}catch(e){console.error("Move menu error:",e),m.error("排序更新失败")}};return W(()=>{b()}),(t,e)=>{const s=i("el-button"),r=i("el-table-column"),c=i("el-icon"),d=i("el-table"),G=i("el-tree-select"),g=i("el-form-item"),M=i("el-input"),L=i("el-input-number"),O=i("el-form"),P=i("el-dialog"),Q=X("loading");return V(),Y("div",se,[k("div",ie,[l(s,{type:"primary",onClick:A},{default:n(()=>e[7]||(e[7]=[x("新增菜单")])),_:1})]),Z((V(),I(d,{data:u.value,"row-key":"id","tree-props":{children:"children"},style:{width:"100%","margin-top":"20px"}},{default:n(()=>[l(r,{prop:"name",label:"菜单名称"}),l(r,{prop:"path",label:"路由路径"}),l(r,{prop:"icon",label:"图标",width:"100"},{default:n(({row:a})=>[l(c,null,{default:n(()=>[(V(),I(ee(a.icon)))]),_:2},1024)]),_:1}),l(r,{prop:"sort",label:"排序",width:"120"},{default:n(({row:a})=>[k("div",de,[k("span",null,te(a.sort),1),k("div",ue,[l(s,{type:"primary",link:"",disabled:!q(a),onClick:U=>R(a)},{default:n(()=>[l(c,null,{default:n(()=>[l(D(le))]),_:1})]),_:2},1032,["disabled","onClick"]),l(s,{type:"primary",link:"",disabled:!F(a),onClick:U=>T(a)},{default:n(()=>[l(c,null,{default:n(()=>[l(D(ae))]),_:1})]),_:2},1032,["disabled","onClick"])])])]),_:1}),l(r,{label:"操作",width:"200",fixed:"right"},{default:n(({row:a})=>[l(s,{type:"primary",link:"",onClick:U=>B(a)},{default:n(()=>e[8]||(e[8]=[x("编辑")])),_:2},1032,["onClick"]),l(s,{type:"danger",link:"",onClick:U=>E(a)},{default:n(()=>e[9]||(e[9]=[x("删除")])),_:2},1032,["onClick"])]),_:1})]),_:1},8,["data"])),[[Q,w.value]]),l(P,{title:h.value,modelValue:f.value,"onUpdate:modelValue":e[6]||(e[6]=a=>f.value=a),width:"500px",onClose:N},{footer:n(()=>[l(s,{onClick:e[5]||(e[5]=a=>f.value=!1)},{default:n(()=>e[10]||(e[10]=[x("取消")])),_:1}),l(s,{type:"primary",onClick:$,loading:C.value},{default:n(()=>e[11]||(e[11]=[x(" 确定 ")])),_:1},8,["loading"])]),default:n(()=>[l(O,{ref_key:"formRef",ref:v,model:o.value,rules:S,"label-width":"80px"},{default:n(()=>[o.value.id?ne("",!0):(V(),I(g,{key:0,label:"上级菜单"},{default:n(()=>[l(G,{modelValue:o.value.parent_id,"onUpdate:modelValue":e[0]||(e[0]=a=>o.value.parent_id=a),data:u.value,props:{label:"name",value:"id",children:"children"},placeholder:"请选择上级菜单",clearable:""},null,8,["modelValue","data"])]),_:1})),l(g,{label:"菜单名称",prop:"name"},{default:n(()=>[l(M,{modelValue:o.value.name,"onUpdate:modelValue":e[1]||(e[1]=a=>o.value.name=a),placeholder:"请输入菜单名称"},null,8,["modelValue"])]),_:1}),l(g,{label:"路由路径",prop:"path"},{default:n(()=>[l(M,{modelValue:o.value.path,"onUpdate:modelValue":e[2]||(e[2]=a=>o.value.path=a),placeholder:"请输入路由路径",disabled:!!o.value.id},null,8,["modelValue","disabled"])]),_:1}),l(g,{label:"图标",prop:"icon"},{default:n(()=>[l(M,{modelValue:o.value.icon,"onUpdate:modelValue":e[3]||(e[3]=a=>o.value.icon=a),placeholder:"请输入图标名称"},null,8,["modelValue"])]),_:1}),l(g,{label:"排序",prop:"sort"},{default:n(()=>[l(L,{modelValue:o.value.sort,"onUpdate:modelValue":e[4]||(e[4]=a=>o.value.sort=a),min:0,max:99},null,8,["modelValue"])]),_:1})]),_:1},8,["model"])]),_:1},8,["title","modelValue"])])}}}),_e=re(ce,[["__scopeId","data-v-b9fa2474"]]);export{_e as default};
//# sourceMappingURL=index-kIfvGm6z.js.map
