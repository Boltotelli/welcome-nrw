/* Minister appointments for Bear optimizer.
 * King appointments verified independently against Lordrush appointment planner:
 * FC = +10 percentage points Squads Lethality.
 * Marshal = +5 percentage points Squads Attack, +2500 deployment.
 * High King values are deliberately user-confirmed, never guessed.
 */
(function(root){
'use strict';
const KING={fc:{attack:0,lethality:10,capacity:0},marshal:{attack:5,lethality:0,capacity:2500}};
function resolve(model){
 const m=model?.v2?.minister||{};
 const role=['fc','marshal'].includes(m.role)?m.role:'none';
 const crown=['king','highking'].includes(m.crown)?m.crown:'king';
 const alreadyInStats=m.alreadyInStats!==false;
 const alreadyInCapacity=m.alreadyInCapacity===true;
 if(role==='none')return {role,crown,attack:0,lethality:0,capacity:0,confirmed:true};
 let values=KING[role],confirmed=true;
 if(crown==='highking'){
  const n=m.confirmed||{};
  const v=key=>n[key]===null||n[key]===undefined||n[key]===''?null:Number(n[key]);
  values={attack:v('attack'),lethality:v('lethality'),capacity:v('capacity')};
  confirmed=Object.entries(values).every(([key,val])=>Number.isFinite(val)&&val>=0&&val<=10000&&
   (key!=='capacity'||Number.isInteger(val)));
 }
 if(!confirmed)return {role,crown,confirmed:false,attack:0,lethality:0,capacity:0};
 return {role,crown,confirmed:true,
  attack:alreadyInStats?0:values.attack,
  lethality:alreadyInStats?0:values.lethality,
  capacity:alreadyInCapacity?0:values.capacity,
  alreadyInStats,alreadyInCapacity,
  original:values};
}
root.NRW_BEAR_MINISTER={resolve,KING};
})(window);
