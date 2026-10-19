// Descriptive statistics (sample SD).
function stat(nums){const n=nums.length;if(!n)return {n:0,mean:null,sd:null,min:null,max:null};const mean=nums.reduce((a,b)=>a+b,0)/n;return {n,mean,sd:n>1?Math.sqrt(nums.reduce((a,b)=>a+(b-mean)**2,0)/(n-1)):null,min:Math.min(...nums),max:Math.max(...nums)}}const fmt=(x,p=2)=>x===null||x===undefined?'—':x.toFixed(p);

